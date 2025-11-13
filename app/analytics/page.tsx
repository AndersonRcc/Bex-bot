'use client'
import { useState, useEffect } from 'react'
import { Bot, TrendingUp, TrendingDown, MessageSquare, Users, Clock, ThumbsUp, Download, Calendar, Loader2, AlertTriangle, Filter } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/app/components/AuthProvider'
import Header from '@/app/components/header'
import { useRouter } from 'next/navigation'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebaseConfig'
import { obtenerBotsPorEmpresa, Bot as BotType } from '@/lib/botService'
import { obtenerMetricasPorBot, MetricasBot } from '@/lib/analyticsService'

export default function AnalyticsPage() {
  const { currentUser, isLoadingAuth } = useAuth()
  const [userProfile, setUserProfile] = useState<any>(null)
  const [timeRange, setTimeRange] = useState('7d')
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null)
  const [bots, setBots] = useState<BotType[]>([])
  const [analyticsData, setAnalyticsData] = useState<MetricasBot | null>(null)
  const [isLoadingBots, setIsLoadingBots] = useState(true)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false)
  const [errorAnalytics, setErrorAnalytics] = useState<string | null>(null)
  const [showBotSelector, setShowBotSelector] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!isLoadingAuth && !currentUser) {
      router.push('/login')
    }
  }, [currentUser, isLoadingAuth, router])

  useEffect(() => {
    const cargarPerfil = async () => {
      if (currentUser) {
        setIsLoadingProfile(true)
        try {
          const docRef = doc(db, 'empresas', currentUser.uid)
          const docSnap = await getDoc(docRef)
          if (docSnap.exists()) {
            setUserProfile({ ...docSnap.data(), userId: currentUser.uid })
          } else {
            console.error("No se encontró el documento de empresa en Firestore.")
            router.push('/login')
          }
        } catch (error) {
          console.error("Error al cargar el perfil:", error)
          router.push('/login')
        } finally {
          setIsLoadingProfile(false)
        }
      }
    }
    if (currentUser && !isLoadingAuth) {
      cargarPerfil()
    }
  }, [currentUser, isLoadingAuth, router])
  useEffect(() => {
    const cargarBots = async () => {
      if (userProfile?.userId) {
        console.log(`📄 Cargando bots para analytics, empresa ID: ${userProfile.userId}`)
        setIsLoadingBots(true)
        try {
          const botsData = await obtenerBotsPorEmpresa(userProfile.userId)
          setBots(botsData)
          if (botsData.length > 0 && !selectedBotId) {
            const primerBotActivo = botsData.find(b => b.estado === 'active')
            setSelectedBotId(primerBotActivo?.id || botsData[0].id || null)
          }
          console.log(`✅ ${botsData.length} bots cargados para analytics.`)
        } catch (error) {
          console.error("❌ Error al cargar bots:", error)
          setBots([])
        } finally {
          setIsLoadingBots(false)
        }
      }
    }
    if (userProfile && !isLoadingAuth) {
      cargarBots()
    }
  }, [userProfile, isLoadingAuth])

  useEffect(() => {
    const cargarMetricas = async () => {
      if (!selectedBotId) {
        setAnalyticsData(null)
        return
      }
      setIsLoadingAnalytics(true)
      setErrorAnalytics(null)
      setAnalyticsData(null)
      const ahora = new Date()
      let inicio = new Date()
      const fin = new Date(ahora)
      switch (timeRange) {
        case '24h':
          inicio.setDate(ahora.getDate() - 1)
          break
        case '7d':
          inicio.setDate(ahora.getDate() - 7)
          break
        case '30d':
          inicio.setMonth(ahora.getMonth() - 1)
          break
        case '90d':
          inicio.setMonth(ahora.getMonth() - 3)
          break
        default:
          inicio.setDate(ahora.getDate() - 7)
      }
      inicio.setHours(0, 0, 0, 0)
      try {
        console.log(`🔄 Cargando métricas para bot ${selectedBotId} con rango ${timeRange}`)
        const data = await obtenerMetricasPorBot(selectedBotId, { inicio, fin })
        if (data) {
          setAnalyticsData(data)
          console.log("✅ Métricas cargadas:", data)
        } else {
          setErrorAnalytics("No se pudieron cargar las métricas. Intenta de nuevo.")
        }
      } catch (error: any) {
        console.error("❌ Error al cargar métricas:", error)
        setErrorAnalytics(`Error: ${error.message || 'Error desconocido'}`)
      } finally {
        setIsLoadingAnalytics(false)
      }
    }
    cargarMetricas()
  }, [timeRange, selectedBotId])
  const getColorForChannel = (channelName: string): string => {
    switch (channelName.toLowerCase()) {
      case 'whatsapp': return '#10B981'
      case 'web': case 'web widget': return '#22D3EE'
      case 'messenger': return '#14B8A6'
      default: return '#8884d8'
    }
  }
  const channelDataForChart = analyticsData?.distribucionCanal?.map(c => ({
    name: c.name,
    value: c.value,
    color: getColorForChannel(c.name)
  })) || []

  const selectedBot = bots.find(b => b.id === selectedBotId)
  if (isLoadingAuth || isLoadingProfile || !currentUser || !userProfile) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-accent-primary" />
        <p className="ml-4 text-text-secondary">Cargando...</p>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-background-primary">
      <Header />
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-4xl font-bold mb-2">Analytics & Reportes</h1>
            <p className="text-text-secondary">Métricas detalladas del rendimiento de tus bots</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            {/* Selector de Bot */}
            <div className="relative">
              <button
                onClick={() => setShowBotSelector(!showBotSelector)}
                className="btn-secondary flex items-center space-x-2 min-w-[200px] justify-between"
                disabled={isLoadingBots}
              >
                <div className="flex items-center space-x-2">
                  <Bot className="w-4 h-4" />
                  <span className="truncate">
                    {isLoadingBots ? 'Cargando...' : selectedBot?.nombre || 'Seleccionar bot'}
                  </span>
                </div>
                <Filter className="w-4 h-4" />
              </button>
              {/* Dropdown de bots */}
              {showBotSelector && !isLoadingBots && (
                <div className="absolute top-full mt-2 left-0 w-full min-w-[250px] bg-background-secondary border border-background-hover rounded-lg shadow-lg z-20 max-h-[300px] overflow-y-auto">
                  {bots.length === 0 ? (
                    <div className="p-4 text-center text-text-muted">
                      <p>No hay bots disponibles</p>
                      <Link href="/wizard" className="text-accent-primary hover:underline text-sm mt-2 inline-block">
                        Crear bot
                      </Link>
                    </div>
                  ) : (
                    bots.map((bot) => (
                      <button
                        key={bot.id}
                        onClick={() => {
                          setSelectedBotId(bot.id || null)
                          setShowBotSelector(false)
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-background-hover transition-colors flex items-center space-x-3 ${
                          selectedBotId === bot.id ? 'bg-accent-primary/10' : ''
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          bot.estado === 'active' ? 'bg-accent-primary/20' : 'bg-background-hover'
                        }`}>
                          <Bot className={`w-4 h-4 ${
                            bot.estado === 'active' ? 'text-accent-primary' : 'text-text-muted'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{bot.nombre}</p>
                          <p className="text-xs text-text-muted capitalize">{bot.tipo}</p>
                        </div>
                        {selectedBotId === bot.id && (
                          <div className="w-2 h-2 bg-accent-primary rounded-full"></div>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            {/* Time Range Selector */}
            <div className="flex items-center space-x-2 bg-background-secondary rounded-lg p-1">
              {['24h', '7d', '30d', '90d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  disabled={isLoadingAnalytics}
                  className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                    timeRange === range
                      ? 'bg-accent-primary text-white'
                      : 'text-text-secondary hover:text-text-primary disabled:opacity-50'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* Contenido Principal */}
        {isLoadingBots ? (
          <div className="flex justify-center items-center h-96">
            <Loader2 className="w-12 h-12 animate-spin text-accent-primary" />
            <p className="ml-4 text-text-secondary">Cargando bots...</p>
          </div>
        ) : !selectedBotId ? (
          <div className="flex flex-col justify-center items-center h-96 text-center">
            <Bot className="w-16 h-16 text-text-muted mb-4 opacity-50" />
            <h3 className="text-xl font-bold mb-2">No hay bots disponibles</h3>
            <p className="text-text-muted mb-6">Crea tu primer bot para ver analytics</p>
            <Link href="/wizard" className="btn-primary">
              Crear Bot
            </Link>
          </div>
        ) : isLoadingAnalytics ? (
          <div className="flex justify-center items-center h-96">
            <Loader2 className="w-12 h-12 animate-spin text-accent-primary" />
            <p className="ml-4 text-text-secondary">Cargando analíticas...</p>
          </div>
        ) : errorAnalytics ? (
          <div className="flex flex-col justify-center items-center h-96 text-center bg-red-500/10 p-6 rounded-lg border border-red-500/30">
            <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-red-400 font-semibold mb-2">Error al cargar datos</p>
            <p className="text-red-400/80 text-sm">{errorAnalytics}</p>
            <button 
              onClick={() => {
                setErrorAnalytics(null)
                setTimeRange(timeRange)
              }} 
              className="btn-secondary mt-6"
            >
              Reintentar
            </button>
          </div>
        ) : !analyticsData ? (
          <div className="flex justify-center items-center h-96 text-text-muted">
            <p>No hay datos de analíticas disponibles para este período.</p>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="glass-card p-6 hover:scale-105 transition-transform duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-accent-primary/20 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-accent-primary" />
                  </div>
                  {analyticsData.cambioConversaciones !== undefined && (
                    <span className={`text-sm font-semibold flex items-center space-x-1 ${
                      analyticsData.cambioConversaciones >= 0 ? 'text-accent-primary' : 'text-red-400'
                    }`}>
                      {analyticsData.cambioConversaciones >= 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      <span>{Math.abs(analyticsData.cambioConversaciones).toFixed(1)}%</span>
                    </span>
                  )}
                </div>
                <div className="text-3xl font-bold mb-1">
                  {analyticsData.totalConversaciones?.toLocaleString() ?? 0}
                </div>
                <div className="text-text-muted text-sm">Total Conversaciones</div>
              </div>

              <div className="glass-card p-6 hover:scale-105 transition-transform duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-accent-secondary/20 rounded-lg flex items-center justify-center">
                    <ThumbsUp className="w-6 h-6 text-accent-secondary" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">
                  {analyticsData.tasaResolucion?.toFixed(1) ?? 0}%
                </div>
                <div className="text-text-muted text-sm">Tasa de Resolución</div>
              </div>
              <div className="glass-card p-6 hover:scale-105 transition-transform duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-accent-warning/20 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-accent-warning" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">
                  {(() => {
                    const duracion = (analyticsData as any)?.tiempoPromedioDuracion ?? 
                                   (analyticsData as any)?.duracionPromedio ?? null
                    return duracion ? `${(duracion / 60).toFixed(1)} min` : 'N/A'
                  })()}
                </div>
                <div className="text-text-muted text-sm">Duración Promedio</div>
              </div>
              <div className="glass-card p-6 hover:scale-105 transition-transform duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-charts-line/20 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-charts-line" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">
                  {analyticsData.usuariosUnicos?.toLocaleString() ?? 0}
                </div>
                <div className="text-text-muted text-sm">Usuarios Únicos</div>
              </div>
            </div>
            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Conversation Trend */}
              <div className="lg:col-span-2 glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold mb-1">Tendencia de Conversaciones</h3>
                    <p className="text-text-muted text-sm">Conversaciones por día</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.conversacionesPorDia}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#94A3B8" 
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis stroke="#94A3B8" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1E293B', 
                        border: '1px solid #334155', 
                        borderRadius: '8px', 
                        color: '#F8FAFC' 
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#22D3EE" 
                      strokeWidth={3} 
                      name="Conversaciones" 
                      dot={{ fill: '#22D3EE', r: 4 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {/* Channel Distribution */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold mb-6">Distribución por Canal</h3>
                {channelDataForChart.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={channelDataForChart}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                          nameKey="name"
                        >
                          {channelDataForChart.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || '#8884d8'} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1E293B', 
                            border: '1px solid #334155', 
                            borderRadius: '8px' 
                          }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 mt-4">
                      {channelDataForChart.map((channel, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: channel.color || '#8884d8' }}
                            ></div>
                            <span className="capitalize">{channel.name}</span>
                          </div>
                          <span className="font-semibold">{channel.value}%</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-[250px] text-text-muted">
                    <p className="text-sm">No hay datos de canales disponibles</p>
                  </div>
                )}
              </div>
            </div>
            {/* Satisfaction Score */}
            {analyticsData.satisfaccionPromedio !== undefined && analyticsData.satisfaccionPromedio !== null && (
              <div className="glass-card p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold mb-1">Satisfacción del Usuario</h3>
                    <p className="text-text-muted text-sm">Puntuación promedio de satisfacción</p>
                  </div>
                  <div className="text-4xl font-bold text-accent-primary">
                    {analyticsData.satisfaccionPromedio.toFixed(1)}/100
                  </div>
                </div>
                <div className="w-full bg-background-secondary rounded-full h-4">
                  <div 
                    className="bg-gradient-to-r from-accent-primary to-accent-secondary h-4 rounded-full transition-all duration-500"
                    style={{ width: `${analyticsData.satisfaccionPromedio}%` }}
                  ></div>
                </div>
              </div>
            )}
            {/* Placeholder sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="glass-card p-6 opacity-60">
                <h3 className="text-xl font-bold mb-4">Actividad por Hora</h3>
                <p className="text-text-muted text-sm">
                  Análisis de actividad por hora en desarrollo.
                </p>
              </div>

              <div className="glass-card p-6 opacity-60">
                <h3 className="text-xl font-bold mb-4">Intenciones Frecuentes</h3>
                <p className="text-text-muted text-sm">
                  Análisis de intenciones en desarrollo.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}