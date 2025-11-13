import { db } from '@/lib/firebaseConfig'
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore'
interface Conversacion {
    botId: string;
    empresaId: string;
    usuarioId: string;
    canal: 'whatsapp' | 'web' | 'messenger';
    estado: 'activa' | 'finalizada' | 'resuelta' | 'escalada';
    iniciada: Timestamp;
    finalizada?: Timestamp;
    duracion?: number;
    satisfaccion?: number;
}
export interface MetricasBot {
    totalConversaciones: number;
    tasaResolucion: number;
    usuariosUnicos: number;
    tiempoPromedioRespuesta?: number;
    conversacionesPorDia: { date: string; count: number }[];
    distribucionCanal: { name: string; value: number }[];
    satisfaccionPromedio?: number;
    cambioConversaciones?: number;
}
const agruparPorDia = (conversaciones: Conversacion[]): { date: string; count: number }[] => {
    const counts: { [key: string]: number } = {};
    conversaciones.forEach(c => {
        const dateStr = c.iniciada.toDate().toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
        counts[dateStr] = (counts[dateStr] || 0) + 1;
    });
    return Object.entries(counts)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => {
            // Ordenar por fecha
            const [dayA, monthA] = a.date.split(' ');
            const [dayB, monthB] = b.date.split(' ');
            const monthsMap: { [key: string]: number } = {
                'ene': 0, 'feb': 1, 'mar': 2, 'abr': 3, 'may': 4, 'jun': 5,
                'jul': 6, 'ago': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dic': 11
            };
            const dateA = new Date(new Date().getFullYear(), monthsMap[monthA.toLowerCase()], parseInt(dayA));
            const dateB = new Date(new Date().getFullYear(), monthsMap[monthB.toLowerCase()], parseInt(dayB));
            return dateA.getTime() - dateB.getTime();
        });
};
const calcularTiempoPromedioDuracion = (conversaciones: Conversacion[]): number | undefined => {
    let totalDuracion = 0;
    let count = 0;
    conversaciones.forEach(c => {
        if (c.finalizada && c.iniciada) {
            const duracion = (c.finalizada.toDate().getTime() - c.iniciada.toDate().getTime()) / 1000;
            if (duracion >= 0) {
                totalDuracion += duracion;
                count++;
            }
        } else if (c.duracion && c.duracion >= 0) {
            totalDuracion += c.duracion;
            count++;
        }
    });
    return count > 0 ? totalDuracion / count : undefined;
};
const calcularDistribucionCanal = (conversaciones: Conversacion[]): { name: string; value: number }[] => {
    const counts: { [key: string]: number } = {};
    const total = conversaciones.length;
    if (total === 0) return [];
    conversaciones.forEach(c => {
        const canal = c.canal || 'desconocido';
        counts[canal] = (counts[canal] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: Math.round((count / total) * 100)
    }));
};
const calcularSatisfaccionPromedio = (conversaciones: Conversacion[]): number | undefined => {
    const conversacionesConSatisfaccion = conversaciones.filter(c => 
        c.satisfaccion !== undefined && c.satisfaccion !== null
    );
    if (conversacionesConSatisfaccion.length === 0) return undefined;
    const totalSatisfaccion = conversacionesConSatisfaccion.reduce((sum, c) => 
        sum + (c.satisfaccion || 0), 0
    );
    return totalSatisfaccion / conversacionesConSatisfaccion.length;
};

export const obtenerMetricasPorBot = async (
    botId: string,
    rangoFechas: { inicio: Date; fin: Date }
): Promise<MetricasBot | null> => {
    try {
        console.log(`📄 Obteniendo métricas para bot ${botId} entre ${rangoFechas.inicio.toISOString()} y ${rangoFechas.fin.toISOString()}`);
        const finDelDia = new Date(rangoFechas.fin);
        finDelDia.setHours(23, 59, 59, 999);
        const q = query(
            collection(db, 'conversaciones'),
            where('botId', '==', botId),
            where('iniciada', '>=', Timestamp.fromDate(rangoFechas.inicio)),
            where('iniciada', '<=', Timestamp.fromDate(finDelDia))
        );
        const snapshot = await getDocs(q);
        const conversaciones = snapshot.docs
            .map(doc => {
                const data = doc.data();
                if (!(data.iniciada instanceof Timestamp)) {
                    console.warn(`Conversación ${doc.id} omitida: 'iniciada' no es un Timestamp válido.`);
                    return null;
                }
                if (data.finalizada && !(data.finalizada instanceof Timestamp)) {
                    console.warn(`Conversación ${doc.id}: 'finalizada' no es un Timestamp válido.`);
                    data.finalizada = undefined;
                }
                return data as Conversacion;
            })
            .filter(c => c !== null) as Conversacion[];
        console.log(`ℹ️ ${conversaciones.length} conversaciones encontradas.`);
        if (conversaciones.length === 0) {
            return {
                totalConversaciones: 0,
                tasaResolucion: 0,
                usuariosUnicos: 0,
                conversacionesPorDia: [],
                distribucionCanal: [],
                satisfaccionPromedio: undefined,
                cambioConversaciones: 0
            };
        }
        const duracionRango = rangoFechas.fin.getTime() - rangoFechas.inicio.getTime();
        const inicioPeriodoAnterior = new Date(rangoFechas.inicio.getTime() - duracionRango);
        const finPeriodoAnterior = new Date(rangoFechas.inicio.getTime() - 1);
        let cambioConversaciones: number | undefined = undefined;
        try {
            const qAnterior = query(
                collection(db, 'conversaciones'),
                where('botId', '==', botId),
                where('iniciada', '>=', Timestamp.fromDate(inicioPeriodoAnterior)),
                where('iniciada', '<=', Timestamp.fromDate(finPeriodoAnterior))
            );
            const snapshotAnterior = await getDocs(qAnterior);
            const conversacionesAnterior = snapshotAnterior.size;
            if (conversacionesAnterior > 0) {
                cambioConversaciones = ((conversaciones.length - conversacionesAnterior) / conversacionesAnterior) * 100;
            } else if (conversaciones.length > 0) {
                cambioConversaciones = 100; // 100% de aumento si antes era 0
            } else {
                cambioConversaciones = 0;
            }
        } catch (error) {
            console.warn("⚠️ No se pudo calcular el cambio de conversaciones:", error);
            cambioConversaciones = undefined;
        }
        const totalConversaciones = conversaciones.length;
        const resueltas = conversaciones.filter(c => 
            c.estado === 'resuelta' || c.estado === 'finalizada'
        ).length;
        const tasaResolucion = totalConversaciones > 0 ? Math.round((resueltas / totalConversaciones) * 100) : 0;
        const usuariosUnicos = new Set(conversaciones.map(c => c.usuarioId)).size;
        const conversacionesPorDia = agruparPorDia(conversaciones);
        const tiempoPromedioDuracion = calcularTiempoPromedioDuracion(conversaciones);
        const distribucionCanal = calcularDistribucionCanal(conversaciones);
        const satisfaccionPromedio = calcularSatisfaccionPromedio(conversaciones);
        console.log(`✅ Métricas calculadas para bot ${botId}`);
        return {
            totalConversaciones,
            tasaResolucion,
            usuariosUnicos,
            tiempoPromedioRespuesta: tiempoPromedioDuracion,
            conversacionesPorDia,
            distribucionCanal,
            satisfaccionPromedio,
            cambioConversaciones
        };
    } catch (error) {
        console.error(`❌ Error obteniendo métricas para bot ${botId}:`, error);
        return null;
    }
}