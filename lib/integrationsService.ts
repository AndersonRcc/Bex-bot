import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  Timestamp,
  serverTimestamp 
} from 'firebase/firestore'
import { db } from '@/lib/firebaseConfig'
export interface IntegracionType {
  id?: string
  empresaId: string
  integrationId: string
  name: string
  status: 'connected' | 'disconnected'
  connectedAt?: Date | Timestamp
  connectedBy?: string
  config?: Record<string, any>
  lastSync?: Date | Timestamp
  metadata?: Record<string, any>
}
export interface IntegrationConfig {
  name: string
  connectedBy: string
  config?: Record<string, any>
  metadata?: Record<string, any>
}
export async function obtenerIntegracionesPorEmpresa(empresaId: string): Promise<IntegracionType[]> {
  try {
    console.log(`🔍 Obteniendo integraciones para empresa: ${empresaId}`)
    const integrationsRef = collection(db, 'empresas', empresaId, 'integraciones')
    const snapshot = await getDocs(integrationsRef)
    const integrations: IntegracionType[] = []
    snapshot.forEach((doc) => {
      const data = doc.data()
      integrations.push({
        id: doc.id,
        empresaId,
        integrationId: data.integrationId || doc.id,
        name: data.name || 'Sin nombre',
        status: data.status || 'disconnected',
        connectedAt: data.connectedAt,
        connectedBy: data.connectedBy,
        config: data.config || {},
        lastSync: data.lastSync,
        metadata: data.metadata || {}
      })
    })
    console.log(`✅ ${integrations.length} integraciones encontradas`)
    return integrations
  } catch (error) {
    console.error('❌ Error al obtener integraciones:', error)
    throw new Error('No se pudieron cargar las integraciones')
  }
}
export async function obtenerIntegracion(
  empresaId: string, 
  integrationId: string
): Promise<IntegracionType | null> {
  try {
    console.log(`🔍 Obteniendo integración ${integrationId} para empresa ${empresaId}`)
    const integrationRef = doc(db, 'empresas', empresaId, 'integraciones', integrationId)
    const docSnap = await getDoc(integrationRef)
    if (!docSnap.exists()) {
      console.log('⚠️ Integración no encontrada')
      return null
    }
    const data = docSnap.data()
    return {
      id: docSnap.id,
      empresaId,
      integrationId: data.integrationId || docSnap.id,
      name: data.name,
      status: data.status,
      connectedAt: data.connectedAt,
      connectedBy: data.connectedBy,
      config: data.config || {},
      lastSync: data.lastSync,
      metadata: data.metadata || {}
    }
  } catch (error) {
    console.error('❌ Error al obtener integración:', error)
    throw new Error('No se pudo cargar la integración')
  }
}
export async function conectarIntegracion(
  empresaId: string,
  integrationId: string,
  config: IntegrationConfig
): Promise<void> {
  try {
    console.log(`🔗 Conectando integración ${integrationId} para empresa ${empresaId}`)
    const integrationRef = doc(db, 'empresas', empresaId, 'integraciones', integrationId)
    const existingDoc = await getDoc(integrationRef)
    if (existingDoc.exists() && existingDoc.data().status === 'connected') {
      throw new Error('Esta integración ya está conectada')
    }
    const integrationData: Partial<IntegracionType> = {
      empresaId,
      integrationId,
      name: config.name,
      status: 'connected',
      connectedAt: serverTimestamp() as Timestamp,
      connectedBy: config.connectedBy,
      config: config.config || {},
      metadata: config.metadata || {},
      lastSync: serverTimestamp() as Timestamp
    }
    await setDoc(integrationRef, integrationData)
    console.log(`✅ Integración ${integrationId} conectada exitosamente`)
  } catch (error: any) {
    console.error('❌ Error al conectar integración:', error)
    throw new Error(error.message || 'No se pudo conectar la integración')
  }
}
export async function desconectarIntegracion(
  empresaId: string,
  integrationId: string
): Promise<void> {
  try {
    console.log(`🔌 Desconectando integración ${integrationId} para empresa ${empresaId}`)
    const integrationRef = doc(db, 'empresas', empresaId, 'integraciones', integrationId)
    const docSnap = await getDoc(integrationRef)
    if (!docSnap.exists()) {
      throw new Error('La integración no existe')
    }
    await deleteDoc(integrationRef)
    console.log(`✅ Integración ${integrationId} desconectada exitosamente`)
  } catch (error: any) {
    console.error('❌ Error al desconectar integración:', error)
    throw new Error(error.message || 'No se pudo desconectar la integración')
  }
}
export async function configurarIntegracion(
  empresaId: string,
  integrationId: string,
  config: Record<string, any>
): Promise<void> {
  try {
    console.log(`⚙️ Configurando integración ${integrationId} para empresa ${empresaId}`)
    const integrationRef = doc(db, 'empresas', empresaId, 'integraciones', integrationId)
    const docSnap = await getDoc(integrationRef)
    if (!docSnap.exists()) {
      throw new Error('La integración no existe. Conéctala primero.')
    }
    if (docSnap.data().status !== 'connected') {
      throw new Error('La integración no está conectada')
    }
    await updateDoc(integrationRef, {
      config: config,
      lastSync: serverTimestamp()
    })
    console.log(`✅ Configuración de ${integrationId} actualizada exitosamente`)
  } catch (error: any) {
    console.error('❌ Error al configurar integración:', error)
    throw new Error(error.message || 'No se pudo actualizar la configuración')
  }
}
export async function actualizarUltimaSync(
  empresaId: string,
  integrationId: string
): Promise<void> {
  try {
    const integrationRef = doc(db, 'empresas', empresaId, 'integraciones', integrationId)
    await updateDoc(integrationRef, {
      lastSync: serverTimestamp()
    })
    console.log(`✅ Última sincronización actualizada para ${integrationId}`)
  } catch (error) {
    console.error('❌ Error al actualizar última sincronización:', error)
    throw new Error('No se pudo actualizar la sincronización')
  }
}
export async function estaIntegracionConectada(
  empresaId: string,
  integrationId: string
): Promise<boolean> {
  try {
    const integrationRef = doc(db, 'empresas', empresaId, 'integraciones', integrationId)
    const docSnap = await getDoc(integrationRef)
    return docSnap.exists() && docSnap.data().status === 'connected'
  } catch (error) {
    console.error('❌ Error al verificar estado de integración:', error)
    return false
  }
}
export async function obtenerEstadisticasIntegraciones(empresaId: string): Promise<{
  total: number
  conectadas: number
  desconectadas: number
  porCategoria: Record<string, number>
}> {
  try {
    const integrations = await obtenerIntegracionesPorEmpresa(empresaId)
    
    const stats = {
      total: integrations.length,
      conectadas: integrations.filter(i => i.status === 'connected').length,
      desconectadas: integrations.filter(i => i.status === 'disconnected').length,
      porCategoria: {} as Record<string, number>
    }
    integrations.forEach(integration => {
      const category = integration.metadata?.category || 'Otros'
      stats.porCategoria[category] = (stats.porCategoria[category] || 0) + 1
    })
    return stats
  } catch (error) {
    console.error('❌ Error al obtener estadísticas de integraciones:', error)
    throw new Error('No se pudieron cargar las estadísticas')
  }
}
export async function buscarIntegraciones(
  empresaId: string,
  searchTerm: string
): Promise<IntegracionType[]> {
  try {
    const allIntegrations = await obtenerIntegracionesPorEmpresa(empresaId)
    const term = searchTerm.toLowerCase()
    return allIntegrations.filter(integration => 
      integration.name.toLowerCase().includes(term) ||
      integration.integrationId.toLowerCase().includes(term)
    )
  } catch (error) {
    console.error('❌ Error al buscar integraciones:', error)
    throw new Error('No se pudo realizar la búsqueda')
  }
}
export async function actualizarIntegracionesMasivo(
  empresaId: string,
  updates: Array<{ integrationId: string; data: Partial<IntegracionType> }>
): Promise<void> {
  try {
    console.log(`📦 Actualizando ${updates.length} integraciones para empresa ${empresaId}`)
    const promises = updates.map(async ({ integrationId, data }) => {
      const integrationRef = doc(db, 'empresas', empresaId, 'integraciones', integrationId)
      return updateDoc(integrationRef, {
        ...data,
        lastSync: serverTimestamp()
      })
    })
    await Promise.all(promises)
    console.log(`✅ ${updates.length} integraciones actualizadas exitosamente`)
  } catch (error) {
    console.error('❌ Error en actualización masiva:', error)
    throw new Error('No se pudieron actualizar todas las integraciones')
  }
}
export async function exportarConfiguracionIntegraciones(
  empresaId: string
): Promise<IntegracionType[]> {
  try {
    console.log(`💾 Exportando configuración de integraciones para empresa ${empresaId}`)
    const integrations = await obtenerIntegracionesPorEmpresa(empresaId)
    const sanitizedIntegrations = integrations.map(integration => ({
      ...integration,
      config: {}
    }))
    console.log(`✅ Configuración exportada: ${sanitizedIntegrations.length} integraciones`)
    return sanitizedIntegrations
  } catch (error) {
    console.error('❌ Error al exportar configuración:', error)
    throw new Error('No se pudo exportar la configuración')
  }
}
export async function importarConfiguracionIntegraciones(
  empresaId: string,
  integrations: Partial<IntegracionType>[]
): Promise<void> {
  try {
    console.log(`📥 Importando ${integrations.length} integraciones para empresa ${empresaId}`)
    const promises = integrations.map(async (integration) => {
      if (!integration.integrationId) {
        console.warn('⚠️ Integración sin ID, omitiendo:', integration)
        return
      }
      const integrationRef = doc(
        db, 
        'empresas', 
        empresaId, 
        'integraciones', 
        integration.integrationId
      )
      const data: Partial<IntegracionType> = {
        empresaId,
        integrationId: integration.integrationId,
        name: integration.name || 'Sin nombre',
        status: integration.status || 'disconnected',
        connectedAt: serverTimestamp() as Timestamp,
        config: integration.config || {},
        metadata: integration.metadata || {},
        lastSync: serverTimestamp() as Timestamp
      }
      await setDoc(integrationRef, data)
    })
    await Promise.all(promises)
    console.log(`✅ ${integrations.length} integraciones importadas exitosamente`)
  } catch (error) {
    console.error('❌ Error al importar configuración:', error)
    throw new Error('No se pudo importar la configuración')
  }
}
export async function eliminarTodasLasIntegraciones(empresaId: string): Promise<void> {
  try {
    console.log(`🗑️ Eliminando todas las integraciones para empresa ${empresaId}`)
    const integrationsRef = collection(db, 'empresas', empresaId, 'integraciones')
    const snapshot = await getDocs(integrationsRef)
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref))
    await Promise.all(deletePromises)
    console.log(`✅ ${snapshot.size} integraciones eliminadas`)
  } catch (error) {
    console.error('❌ Error al eliminar integraciones:', error)
    throw new Error('No se pudieron eliminar las integraciones')
  }
}
export async function obtenerHistorialSync(
  empresaId: string,
  integrationId: string
): Promise<Date | null> {
  try {
    const integration = await obtenerIntegracion(empresaId, integrationId)
    
    if (!integration || !integration.lastSync) {
      return null
    }
    if (integration.lastSync instanceof Timestamp) {
      return integration.lastSync.toDate()
    }
    return integration.lastSync as Date
  } catch (error) {
    console.error('❌ Error al obtener historial de sync:', error)
    return null
  }
}
export function validarConfiguracion(
  integrationId: string,
  config: Record<string, any>
): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  const validations: Record<string, (config: any) => string[]> = {
    'hubspot': (cfg) => {
      const errs: string[] = []
      if (!cfg.apiKey || cfg.apiKey.length < 10) {
        errs.push('API Key de HubSpot inválida')
      }
      if (!cfg.portalId) {
        errs.push('Portal ID es requerido')
      }
      return errs
    },
    'stripe': (cfg) => {
      const errs: string[] = []
      if (!cfg.publishableKey?.startsWith('pk_')) {
        errs.push('Publishable Key de Stripe inválida')
      }
      if (!cfg.secretKey?.startsWith('sk_')) {
        errs.push('Secret Key de Stripe inválida')
      }
      return errs
    },
    'openai': (cfg) => {
      const errs: string[] = []
      if (!cfg.apiKey?.startsWith('sk-')) {
        errs.push('API Key de OpenAI inválida')
      }
      if (cfg.temperature && (cfg.temperature < 0 || cfg.temperature > 2)) {
        errs.push('Temperature debe estar entre 0 y 2')
      }
      return errs
    }
  }
  if (validations[integrationId]) {
    errors.push(...validations[integrationId](config))
  }
  return {
    valid: errors.length === 0,
    errors
  }
}