import { db } from '@/lib/firebaseConfig'
import { collection, addDoc, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore'
export type AccionBot = 'creado' | 'eliminado' | 'activado' | 'pausado' | 'actualizado'
export type EstadoBot = 'active' | 'paused' | 'inactive' | null
export interface HistorialBotData {
  empresaId: string
  botId: string
  botNombre: string
  accion: AccionBot
  timestamp: Timestamp
  detalles: {
    estadoAnterior?: EstadoBot
    estadoNuevo?: EstadoBot
    cambiosRealizados?: string[]
    tipo?: string
    canales?: string[]
    razonEliminacion?: string
  }
  usuarioId: string
  usuarioNombre: string
  metadata?: {
    ip?: string
    navegador?: string
    dispositivo?: string
  }
}
export interface HistorialBot extends HistorialBotData {
  id: string
}
export async function registrarHistorialBot(data: Omit<HistorialBotData, 'timestamp'>): Promise<string> {
  try {
    const historialRef = collection(db, 'historial_bots')
    const docRef = await addDoc(historialRef, {
      ...data,
      timestamp: Timestamp.now()
    })
    console.log(`✅ Historial registrado: ${data.accion} - Bot: ${data.botNombre}`)
    return docRef.id
  } catch (error) {
    console.error('❌ Error al registrar historial:', error)
    throw error
  }
}
export async function obtenerHistorialPorEmpresa(
  empresaId: string,
  limite?: number
): Promise<HistorialBot[]> {
  try {
    const historialRef = collection(db, 'historial_bots')
    let q = query(
      historialRef,
      where('empresaId', '==', empresaId),
      orderBy('timestamp', 'desc')
    )
    const snapshot = await getDocs(q)
    const historial = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as HistorialBot[]
    return limite ? historial.slice(0, limite) : historial
  } catch (error) {
    console.error('❌ Error al obtener historial:', error)
    return []
  }
}
export async function obtenerHistorialPorBot(
  botId: string
): Promise<HistorialBot[]> {
  try {
    const historialRef = collection(db, 'historial_bots')
    const q = query(
      historialRef,
      where('botId', '==', botId),
      orderBy('timestamp', 'desc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as HistorialBot[]
  } catch (error) {
    console.error('❌ Error al obtener historial del bot:', error)
    return []
  }
}
export async function obtenerEstadisticasHistorial(empresaId: string) {
  try {
    const historial = await obtenerHistorialPorEmpresa(empresaId)
    const stats = {
      totalAcciones: historial.length,
      botsCreados: historial.filter(h => h.accion === 'creado').length,
      botsEliminados: historial.filter(h => h.accion === 'eliminado').length,
      botsActivados: historial.filter(h => h.accion === 'activado').length,
      botsPausados: historial.filter(h => h.accion === 'pausado').length,
      botsActualizados: historial.filter(h => h.accion === 'actualizado').length,
      ultimaActividad: historial[0]?.timestamp || null
    }
    return stats
  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error)
    return null
  }
}
export async function registrarBotCreado(
  empresaId: string,
  botId: string,
  botNombre: string,
  usuarioId: string,
  usuarioNombre: string,
  detalles: { tipo?: string; canales?: string[] }
) {
  return registrarHistorialBot({
    empresaId,
    botId,
    botNombre,
    accion: 'creado',
    detalles: {
      estadoAnterior: null,
      estadoNuevo: 'active',
      ...detalles
    },
    usuarioId,
    usuarioNombre
  })
}
export async function registrarBotEliminado(
  empresaId: string,
  botId: string,
  botNombre: string,
  usuarioId: string,
  usuarioNombre: string,
  estadoAnterior: EstadoBot
) {
  return registrarHistorialBot({
    empresaId,
    botId,
    botNombre,
    accion: 'eliminado',
    detalles: {
      estadoAnterior,
      estadoNuevo: null,
      razonEliminacion: 'Eliminado por usuario'
    },
    usuarioId,
    usuarioNombre
  })
}
export async function registrarCambioEstado(
  empresaId: string,
  botId: string,
  botNombre: string,
  usuarioId: string,
  usuarioNombre: string,
  estadoAnterior: EstadoBot,
  estadoNuevo: EstadoBot
) {
  const accion = estadoNuevo === 'active' ? 'activado' : 'pausado'
  return registrarHistorialBot({
    empresaId,
    botId,
    botNombre,
    accion,
    detalles: {
      estadoAnterior,
      estadoNuevo
    },
    usuarioId,
    usuarioNombre
  })
}
export async function registrarBotActualizado(
  empresaId: string,
  botId: string,
  botNombre: string,
  usuarioId: string,
  usuarioNombre: string,
  cambiosRealizados: string[]
) {
  return registrarHistorialBot({
    empresaId,
    botId,
    botNombre,
    accion: 'actualizado',
    detalles: {
      cambiosRealizados
    },
    usuarioId,
    usuarioNombre
  })
}