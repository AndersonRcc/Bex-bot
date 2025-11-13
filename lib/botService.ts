import { db, timestamp } from '@/lib/firebaseConfig'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore'
export interface Bot {
  id?: string
  empresaId: string
  nombre: string
  tipo: 'sales' | 'support' | 'assistance'
  estado: 'active' | 'inactive' | 'paused'
  configuracion: {
    tono: 'formal' | 'friendly' | 'casual'
    logoUrl: string
    canales: string[]
    whatsappConnected: boolean
    whatsappInstance: string
    whatsappQRCode?: string
  }
  metricas: {
    conversaciones: number
    usuariosUnicos: number
    tasaResolucion: number
    ultimaActividad: Date | Timestamp
  }
  flujos: {
    nodes: any[]
    edges: any[]
  }
  respuestasRapidas: Array<{
    id: string
    trigger: string
    response: string
  }>
  createdAt: Date | Timestamp
  updatedAt: Date | Timestamp
}
const toDateSafe = (ts: any): Date => {
  if (ts && typeof ts.toDate === 'function') {
    return ts.toDate()
  }
  return ts instanceof Date ? ts : new Date()
}
export const crearBot = async (datosBot: {
  empresaId: string
  nombre: string
  tipo: 'sales' | 'support' | 'assistance'
  tono: 'formal' | 'friendly' | 'casual'
  logoUrl: string
  canales: string[]
}): Promise<{ success: boolean; botId?: string; error?: any }> => {
  try {
    const canalesValidos = Array.isArray(datosBot.canales) ? datosBot.canales : []

    const nuevoBot = {
      empresaId: datosBot.empresaId,
      nombre: datosBot.nombre,
      tipo: datosBot.tipo,
      estado: 'active',
      configuracion: {
        tono: datosBot.tono,
        logoUrl: datosBot.logoUrl || '',
        canales: canalesValidos,
        whatsappConnected: false,
        whatsappInstance: '',
        whatsappQRCode: ''
      },
      metricas: {
        conversaciones: 0,
        usuariosUnicos: 0,
        tasaResolucion: 0,
        ultimaActividad: serverTimestamp()
      },
      flujos: {
        nodes: [
          { 
            id: '1', 
            type: 'startNode', 
            data: { label: 'Inicio' }, 
            position: { x: 100, y: 100 } 
          },
          { 
            id: '2', 
            type: 'textUpdaterNode', 
            data: { 
              label: 'Mensaje Bienvenida', 
              text: '¡Hola! ¿En qué puedo ayudarte?' 
            }, 
            position: { x: 100, y: 250 } 
          }
        ],
        edges: [{ id: 'e1-2', source: '1', target: '2' }]
      },
      respuestasRapidas: [
        { 
          id: `${Date.now()}_1`, 
          trigger: 'hola', 
          response: '¡Hola! Bienvenido. ¿En qué puedo ayudarte?' 
        },
        { 
          id: `${Date.now()}_2`, 
          trigger: 'horario', 
          response: 'Nuestro horario de atención es de lunes a viernes de 9:00 AM a 6:00 PM.' 
        }
      ],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    const botRef = await addDoc(collection(db, 'bots'), nuevoBot)

    console.log('✅ Bot creado exitosamente:', botRef.id)
    return { success: true, botId: botRef.id }
  } catch (error) {
    console.error('❌ Error creando bot:', error)
    return { success: false, error }
  }
}
export const obtenerBotsPorEmpresa = async (empresaId: string): Promise<Bot[]> => {
  try {
    const q = query(
      collection(db, 'bots'),
      where('empresaId', '==', empresaId),
      orderBy('createdAt', 'desc')
    )
    const snapshot = await getDocs(q)
    const bots = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        empresaId: data.empresaId,
        nombre: data.nombre,
        tipo: data.tipo,
        estado: data.estado,
        configuracion: {
          tono: data.configuracion?.tono || 'friendly',
          logoUrl: data.configuracion?.logoUrl || '',
          canales: data.configuracion?.canales || [],
          whatsappConnected: data.configuracion?.whatsappConnected || false,
          whatsappInstance: data.configuracion?.whatsappInstance || '',
          whatsappQRCode: data.configuracion?.whatsappQRCode || ''
        },
        metricas: {
          conversaciones: data.metricas?.conversaciones || 0,
          usuariosUnicos: data.metricas?.usuariosUnicos || 0,
          tasaResolucion: data.metricas?.tasaResolucion || 0,
          ultimaActividad: toDateSafe(data.metricas?.ultimaActividad)
        },
        flujos: data.flujos || { nodes: [], edges: [] },
        respuestasRapidas: data.respuestasRapidas || [],
        createdAt: toDateSafe(data.createdAt),
        updatedAt: toDateSafe(data.updatedAt)
      } as Bot
    })
    console.log(`✅ ${bots.length} bots obtenidos para empresa ${empresaId}`)
    return bots
  } catch (error) {
    console.error('❌ Error obteniendo bots:', error)
    return []
  }
}
export const obtenerBot = async (botId: string): Promise<Bot | null> => {
  try {
    const botRef = doc(db, 'bots', botId)
    const botSnap = await getDoc(botRef)
    if (!botSnap.exists()) {
      console.log('⚠️ Bot no encontrado:', botId)
      return null
    }
    const data = botSnap.data()
    return {
      id: botSnap.id,
      empresaId: data.empresaId,
      nombre: data.nombre,
      tipo: data.tipo,
      estado: data.estado,
      configuracion: {
        tono: data.configuracion?.tono || 'friendly',
        logoUrl: data.configuracion?.logoUrl || '',
        canales: data.configuracion?.canales || [],
        whatsappConnected: data.configuracion?.whatsappConnected || false,
        whatsappInstance: data.configuracion?.whatsappInstance || '',
        whatsappQRCode: data.configuracion?.whatsappQRCode || ''
      },
      metricas: {
        conversaciones: data.metricas?.conversaciones || 0,
        usuariosUnicos: data.metricas?.usuariosUnicos || 0,
        tasaResolucion: data.metricas?.tasaResolucion || 0,
        ultimaActividad: toDateSafe(data.metricas?.ultimaActividad)
      },
      flujos: data.flujos || { nodes: [], edges: [] },
      respuestasRapidas: data.respuestasRapidas || [],
      createdAt: toDateSafe(data.createdAt),
      updatedAt: toDateSafe(data.updatedAt)
    } as Bot
  } catch (error) {
    console.error('❌ Error obteniendo bot:', error)
    return null
  }
}
export const actualizarBot = async (
  botId: string,
  datos: Partial<Omit<Bot, 'id' | 'createdAt' | 'empresaId'>>
): Promise<{ success: boolean; error?: any }> => {
  try {
    const botRef = doc(db, 'bots', botId)
    const datosParaActualizar: any = {
      ...datos,
      updatedAt: serverTimestamp()
    }
    if (datos.metricas) {
      datosParaActualizar.metricas = {
        ...datos.metricas,
        ultimaActividad: serverTimestamp()
      }
    }
    await updateDoc(botRef, datosParaActualizar)
    console.log('✅ Bot actualizado:', botId)
    return { success: true }
  } catch (error) {
    console.error('❌ Error actualizando bot:', error)
    return { success: false, error }
  }
}
export const cambiarEstadoBot = async (
  botId: string,
  nuevoEstado: 'active' | 'inactive' | 'paused'
): Promise<{ success: boolean; error?: any }> => {
  return actualizarBot(botId, { estado: nuevoEstado })
}
export const eliminarBot = async (botId: string): Promise<{ success: boolean; error?: any }> => {
  try {
    await deleteDoc(doc(db, 'bots', botId))
    console.log('✅ Bot eliminado:', botId)
    return { success: true }
  } catch (error) {
    console.error('❌ Error eliminando bot:', error)
    return { success: false, error }
  }
}
export const actualizarMetricas = async (
  botId: string,
  metricasNuevas: Partial<Bot['metricas']>
): Promise<{ success: boolean; error?: any }> => {
  try {
    const bot = await obtenerBot(botId)
    if (!bot) {
      return { success: false, error: 'Bot no encontrado' }
    }
    const metricasActualizadas = {
      ...bot.metricas,
      ...metricasNuevas,
      ultimaActividad: Timestamp.now()
    }
    return actualizarBot(botId, { metricas: metricasActualizadas })
  } catch (error) {
    console.error('❌ Error actualizando métricas:', error)
    return { success: false, error }
  }
}
export const guardarFlujos = async (
  botId: string,
  flujos: { nodes: any[]; edges: any[] }
): Promise<{ success: boolean; error?: any }> => {
  const flujosValidos = {
    nodes: flujos.nodes || [],
    edges: flujos.edges || []
  }
  return actualizarBot(botId, { flujos: flujosValidos })
}
export const guardarRespuestasRapidas = async (
  botId: string,
  respuestas: Array<{ id: string; trigger: string; response: string }>
): Promise<{ success: boolean; error?: any }> => {
  const respuestasValidas = Array.isArray(respuestas) ? respuestas : []
  return actualizarBot(botId, { respuestasRapidas: respuestasValidas })
}