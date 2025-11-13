'use client'
import { useState, useEffect } from 'react'
import { Bot, Search, Settings, CheckCircle, XCircle, ExternalLink, Zap, Shield, TrendingUp, Loader2, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/app/components/AuthProvider'
import Header from '@/app/components/header'
import { useRouter } from 'next/navigation'
import IntegrationConfigModal from '@/app/components/IntegrationConfigModal'
import { 
  obtenerIntegracionesPorEmpresa, 
  conectarIntegracion, 
  desconectarIntegracion,
  configurarIntegracion,
  IntegracionType 
} from '@/lib/integrationsService'
const integrationsCatalog = [
  {
    id: 'hubspot',
    name: 'HubSpot CRM',
    category: 'CRM',
    icon: '🔗',
    description: 'Sincroniza contactos y conversaciones con HubSpot CRM automáticamente',
    features: ['Sincronización de contactos', 'Historial de conversaciones', 'Automatización de tareas'],
    popularity: 'Muy Popular',
    setupTime: '5 min',
    docsUrl: 'https://developers.hubspot.com/'
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    category: 'CRM',
    icon: '☁️',
    description: 'Integra tus bots con Salesforce para gestión completa de clientes',
    features: ['Gestión de leads', 'Oportunidades de venta', 'Reportes personalizados'],
    popularity: 'Popular',
    setupTime: '10 min',
    docsUrl: 'https://developer.salesforce.com/'
  },
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    category: 'Analytics',
    icon: '📊',
    description: 'Rastrea eventos y conversiones de tus bots en Google Analytics',
    features: ['Eventos personalizados', 'Conversiones', 'Embudos de conversión'],
    popularity: 'Muy Popular',
    setupTime: '3 min',
    docsUrl: 'https://developers.google.com/analytics'
  },
  {
    id: 'zapier',
    name: 'Zapier',
    category: 'Automation',
    icon: '⚡',
    description: 'Conecta con más de 5000 aplicaciones a través de Zapier',
    features: ['5000+ apps', 'Workflows automáticos', 'Triggers personalizados'],
    popularity: 'Muy Popular',
    setupTime: '5 min',
    docsUrl: 'https://zapier.com/developer'
  },
  {
    id: 'stripe',
    name: 'Stripe',
    category: 'Payments',
    icon: '💳',
    description: 'Procesa pagos directamente desde tus conversaciones',
    features: ['Pagos seguros', 'Suscripciones', 'Facturación automática'],
    popularity: 'Popular',
    setupTime: '8 min',
    docsUrl: 'https://stripe.com/docs'
  },
  {
    id: 'slack',
    name: 'Slack',
    category: 'Communication',
    icon: '💬',
    description: 'Recibe notificaciones de conversaciones importantes en Slack',
    features: ['Notificaciones en tiempo real', 'Alertas personalizadas', 'Integración con equipos'],
    popularity: 'Popular',
    setupTime: '2 min',
    docsUrl: 'https://api.slack.com/'
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    category: 'Marketing',
    icon: '📧',
    description: 'Sincroniza contactos y automatiza campañas de email marketing',
    features: ['Listas de contactos', 'Campañas automáticas', 'Segmentación'],
    popularity: 'Popular',
    setupTime: '5 min',
    docsUrl: 'https://mailchimp.com/developer/'
  },
  {
    id: 'shopify',
    name: 'Shopify',
    category: 'E-commerce',
    icon: '🛍️',
    description: 'Integra tu tienda Shopify con tus bots de ventas',
    features: ['Catálogo de productos', 'Gestión de pedidos', 'Inventario en tiempo real'],
    popularity: 'Muy Popular',
    setupTime: '7 min',
    docsUrl: 'https://shopify.dev/'
  },
  {
    id: 'twilio',
    name: 'Twilio',
    category: 'Communication',
    icon: '📱',
    description: 'Envía SMS y realiza llamadas desde tus bots',
    features: ['SMS', 'Llamadas de voz', 'Verificación 2FA'],
    popularity: 'Popular',
    setupTime: '10 min',
    docsUrl: 'https://www.twilio.com/docs'
  },
  {
    id: 'google-sheets',
    name: 'Google Sheets',
    category: 'Productivity',
    icon: '📑',
    description: 'Exporta datos de conversaciones a Google Sheets automáticamente',
    features: ['Exportación automática', 'Reportes personalizados', 'Sincronización en tiempo real'],
    popularity: 'Muy Popular',
    setupTime: '3 min',
    docsUrl: 'https://developers.google.com/sheets'
  },
  {
    id: 'zendesk',
    name: 'Zendesk',
    category: 'Support',
    icon: '🎫',
    description: 'Crea tickets de soporte automáticamente desde conversaciones',
    features: ['Creación de tickets', 'Escalamiento automático', 'Base de conocimiento'],
    popularity: 'Popular',
    setupTime: '8 min',
    docsUrl: 'https://developer.zendesk.com/'
  },
  {
    id: 'openai',
    name: 'OpenAI',
    category: 'AI',
    icon: '🤖',
    description: 'Potencia tus bots con modelos de IA avanzados de OpenAI',
    features: ['GPT-4', 'Respuestas contextuales', 'Procesamiento de lenguaje natural'],
    popularity: 'Muy Popular',
    setupTime: '5 min',
    docsUrl: 'https://platform.openai.com/docs'
  }
]
const categories = ['Todos', 'CRM', 'Analytics', 'Automation', 'Payments', 'Communication', 'Marketing', 'E-commerce', 'Productivity', 'Support', 'AI']

export default function IntegrationsPage() {
  const { currentUser, isLoadingAuth } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [filterStatus, setFilterStatus] = useState<'all' | 'connected' | 'disconnected'>('all')
  const [userIntegrations, setUserIntegrations] = useState<IntegracionType[]>([])
  const [isLoadingIntegrations, setIsLoadingIntegrations] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [configModalOpen, setConfigModalOpen] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<any | null>(null)

  useEffect(() => {
    if (!isLoadingAuth && !currentUser) {
      router.push('/login')
    }
  }, [currentUser, isLoadingAuth, router])

  useEffect(() => {
    const cargarIntegraciones = async () => {
      if (currentUser) {
        setIsLoadingIntegrations(true)
        setError(null)
        try {
          const integrations = await obtenerIntegracionesPorEmpresa(currentUser.uid)
          setUserIntegrations(integrations)
          console.log('✅ Integraciones cargadas:', integrations)
        } catch (error) {
          console.error('❌ Error al cargar integraciones:', error)
          setError('Error al cargar las integraciones')
        } finally {
          setIsLoadingIntegrations(false)
        }
      }
    }
    if (currentUser && !isLoadingAuth) {
      cargarIntegraciones()
    }
  }, [currentUser, isLoadingAuth])
  const integrationsWithStatus = integrationsCatalog.map(catalog => {
    const userIntegration = userIntegrations.find(ui => ui.integrationId === catalog.id)
    return {
      ...catalog,
      status: userIntegration?.status || 'disconnected',
      connectedAt: userIntegration?.connectedAt,
      config: userIntegration?.config
    }
  })
  const filteredIntegrations = integrationsWithStatus.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'Todos' || integration.category === selectedCategory
    const matchesStatus = filterStatus === 'all' || integration.status === filterStatus
    return matchesSearch && matchesCategory && matchesStatus
  })
  const connectedCount = integrationsWithStatus.filter(i => i.status === 'connected').length

  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage(null)
        setError(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage, error])

  const handleConnect = async (integrationId: string, name: string) => {
    if (!currentUser) return
    setActionLoading(integrationId)
    setError(null)
    setSuccessMessage(null)
    try {
      await conectarIntegracion(currentUser.uid, integrationId, {
        name,
        connectedBy: currentUser.email || currentUser.uid
      })
      const updatedIntegrations = await obtenerIntegracionesPorEmpresa(currentUser.uid)
      setUserIntegrations(updatedIntegrations)
      setSuccessMessage(`${name} conectado exitosamente`)
      console.log(`✅ ${name} conectado`)
    } catch (error: any) {
      console.error('❌ Error al conectar:', error)
      setError(error.message || 'Error al conectar la integración')
    } finally {
      setActionLoading(null)
    }
  }
  const handleDisconnect = async (integrationId: string, name: string) => {
    if (!currentUser) return
    if (!confirm(`¿Estás seguro de que deseas desconectar ${name}?`)) return
    setActionLoading(integrationId)
    setError(null)
    setSuccessMessage(null)
    try {
      await desconectarIntegracion(currentUser.uid, integrationId)
      const updatedIntegrations = await obtenerIntegracionesPorEmpresa(currentUser.uid)
      setUserIntegrations(updatedIntegrations)
      setSuccessMessage(`${name} desconectado exitosamente`)
      console.log(`✅ ${name} desconectado`)
    } catch (error: any) {
      console.error('❌ Error al desconectar:', error)
      setError(error.message || 'Error al desconectar la integración')
    } finally {
      setActionLoading(null)
    }
  }
  const handleConfigure = async (integration: any) => {
    setSelectedIntegration(integration)
    setConfigModalOpen(true)
  }
  const handleOpenDocs = (docsUrl: string) => {
    window.open(docsUrl, '_blank', 'noopener,noreferrer')
  }
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 border-4 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-primary">
      <Header /> 
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Integraciones</h1>
          <p className="text-text-secondary">Conecta BexBot con tus herramientas favoritas</p>
        </div>
        {/* Mensajes de éxito/error */}
        {successMessage && (
          <div className="mb-6 bg-accent-primary/20 border border-accent-primary/50 text-accent-primary px-4 py-3 rounded-lg flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span>{successMessage}</span>
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-accent-primary/20 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-accent-primary" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{integrationsCatalog.length}</div>
            <div className="text-text-muted text-sm">Integraciones Disponibles</div>
          </div>
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-accent-secondary/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-accent-secondary" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">
              {isLoadingIntegrations ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                connectedCount
              )}
            </div>
            <div className="text-text-muted text-sm">Conectadas</div>
          </div>
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-charts-line/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-charts-line" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">+5</div>
            <div className="text-text-muted text-sm">Nuevas este mes</div>
          </div>
        </div>
        {/* Search and Filters */}
        <div className="glass-card p-6 mb-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type="text"
                placeholder="Buscar integraciones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field w-full pl-10"
              />
            </div>
            {/* Category Filter */}
            <div className="flex items-center flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    selectedCategory === category
                      ? 'bg-accent-primary text-white'
                      : 'bg-background-secondary text-text-secondary hover:bg-background-hover'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  filterStatus === 'all'
                    ? 'bg-accent-primary text-white'
                    : 'bg-background-secondary text-text-secondary hover:bg-background-hover'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilterStatus('connected')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  filterStatus === 'connected'
                    ? 'bg-accent-primary text-white'
                    : 'bg-background-secondary text-text-secondary hover:bg-background-hover'
                }`}
              >
                Conectadas
              </button>
              <button
                onClick={() => setFilterStatus('disconnected')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  filterStatus === 'disconnected'
                    ? 'bg-accent-primary text-white'
                    : 'bg-background-secondary text-text-secondary hover:bg-background-hover'
                }`}
              >
                Disponibles
              </button>
            </div>
          </div>
        </div>
        {/* Loading State */}
        {isLoadingIntegrations && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-accent-primary" />
            <p className="ml-4 text-text-secondary">Cargando integraciones...</p>
          </div>
        )}
        {/* Integrations Grid */}
        {!isLoadingIntegrations && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIntegrations.map((integration) => (
              <div key={integration.id} className="glass-card p-6 hover:scale-[1.02] transition-transform duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-4xl">{integration.icon}</div>
                    <div>
                      <h3 className="font-bold text-lg">{integration.name}</h3>
                      <span className="text-xs text-text-muted">{integration.category}</span>
                    </div>
                  </div>
                  {integration.status === 'connected' ? (
                    <span className="flex items-center space-x-1 text-xs bg-accent-primary/20 text-accent-primary px-2 py-1 rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      <span>Conectado</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 text-xs bg-background-hover text-text-muted px-2 py-1 rounded-full">
                      <XCircle className="w-3 h-3" />
                      <span>Disponible</span>
                    </span>
                  )}
                </div>
                <p className="text-text-secondary text-sm mb-4">{integration.description}</p>
                {/* Features */}
                <div className="space-y-2 mb-4 pb-4 border-b border-borders-default">
                  {integration.features.map((feature, i) => (
                    <div key={i} className="flex items-center space-x-2 text-xs text-text-muted">
                      <div className="w-1.5 h-1.5 bg-accent-primary rounded-full"></div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                {/* Meta Info */}
                <div className="flex items-center justify-between text-xs text-text-muted mb-4">
                  <span className="flex items-center space-x-1">
                    <Shield className="w-3 h-3" />
                    <span>{integration.popularity}</span>
                  </span>
                  <span>Setup: {integration.setupTime}</span>
                </div>
                {/* Actions */}
                <div className="flex items-center space-x-2">
                  {integration.status === 'connected' ? (
                    <>
                      <button 
                        onClick={() => handleConfigure(integration)}
                        disabled={actionLoading === integration.id}
                        className="btn-secondary flex-1 text-sm py-2 flex items-center justify-center space-x-2"
                      >
                        {actionLoading === integration.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Settings className="w-4 h-4" />
                            <span>Configurar</span>
                          </>
                        )}
                      </button>
                      <button 
                        onClick={() => handleDisconnect(integration.id, integration.name)}
                        disabled={actionLoading === integration.id}
                        className="btn-secondary px-3 py-2 hover:bg-accent-error/20 hover:text-accent-error"
                      >
                        {actionLoading === integration.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => handleConnect(integration.id, integration.name)}
                        disabled={actionLoading === integration.id}
                        className="btn-primary flex-1 text-sm py-2 flex items-center justify-center space-x-2"
                      >
                        {actionLoading === integration.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            <span>Conectar</span>
                          </>
                        )}
                      </button>
                      <button 
                        onClick={() => handleOpenDocs(integration.docsUrl)}
                        className="btn-secondary px-3 py-2"
                        title="Ver documentación"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Empty State */}
        {!isLoadingIntegrations && filteredIntegrations.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-background-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-text-muted" />
            </div>
            <h3 className="text-xl font-bold mb-2">No se encontraron integraciones</h3>
            <p className="text-text-muted">Intenta con otros términos de búsqueda o filtros</p>
          </div>
        )}
      </div>
    </div>
  )
}