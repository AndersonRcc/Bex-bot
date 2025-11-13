'use client'

import { useAuth } from '@/app/components/AuthProvider';
import Header from '@/app/components/header';

import { db } from '@/lib/firebaseConfig'

import { useState, useEffect } from 'react'

import { 
  MoreVertical, Settings, BarChart3, Clock, CheckCircle, 
  AlertCircle, MessageSquare, Bot, TrendingUp, Users, 
  Search, Plus, Loader2, Trash2 
} from 'lucide-react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts'

import { 
  doc, getDoc, collection, query, where, getDocs, 
  Timestamp, deleteDoc 
} from 'firebase/firestore'

import { obtenerBotsPorEmpresa, Bot as BotType } from '@/lib/botService'
import { registrarBotEliminado, registrarCambioEstado } from '@/lib/botHistoryService'


// --- INTERFACES ---
interface ConversationData {
  name: string;
  conversaciones: number;
}

interface ConversionData {
  name: string;
  conversiones: number;
}

interface DashboardMetrics {
  activeBotsCount: number;
  totalConversations7d: number;
  conversionRate: number;
  uniqueUsers: number;
  percentageChangeBots: string;
  percentageChangeConversations: string;
  percentageChangeConversion: string;
  percentageChangeUsers: string;
}

interface Conversation {
  id: string;
  botId: string;
  canal: string;
  duracion?: number;
  empresaId: string;
  estado: string;
  finalizada?: any;
  iniciada?: any;
  intencion?: string;
  mensajes?: Array<{
    contenido: string;
    rol: string;
    timestamp?: any;
  }>;
  satisfaccion?: number;
  usuarioId?: string;
}

// --- CONSTANTES DE LA API EXTERNA (WhatsApp) ---
const serverUrl = "https://edgar-n8n-evolution-api.zxlh8i.easypanel.host";
const apiKey = "429683C4C977415CAAFCCE10F7D57E11";
// NOTA: La instancia debe obtenerse del bot, pero usamos este valor por defecto si no existe.
const defaultInstance = "bot_ventas"; 
// ------------------------------------------------


/**
 * Función auxiliar para llamar a la API de logout de WhatsApp.
 * El error se maneja internamente para no afectar el flujo de eliminación del bot.
 */
const handleApiLogout = async (instanceId: string) => {
  try {
    const res = await fetch(`${serverUrl}/instance/logout/${instanceId}?api_key=${apiKey}`, {
      method: "GET"
    });

    if (!res.ok) {
      console.error(`❌ Error al hacer logout en la API: ${res.status} - ${await res.text()}`);
      // Se puede añadir una notificación de advertencia aquí si es necesario.
    } else {
      const data = await res.json();
      console.log("✅ Logout exitoso en la API:", data);
    }
  } catch (error) {
    console.error("❌ Error de red/petición al hacer logout en la API:", error);
    // Se puede añadir una notificación de advertencia aquí si es necesario.
  }
};


export default function Dashboard() {
  const { currentUser, isLoadingAuth } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [bots, setBots] = useState<BotType[]>([])
  const [isLoadingBots, setIsLoadingBots] = useState(true)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [conversationData, setConversationData] = useState<ConversationData[]>([])
  const [conversionData, setConversionData] = useState<ConversionData[]>([])
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    activeBotsCount: 0,
    totalConversations7d: 0,
    conversionRate: 0,
    uniqueUsers: 0,
    percentageChangeBots: '+0%',
    percentageChangeConversations: '+0%',
    percentageChangeConversion: '+0%',
    percentageChangeUsers: '+0%'
  })
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true)
  const [botToDelete, setBotToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [openMenuBotId, setOpenMenuBotId] = useState<string | null>(null)
  const router = useRouter()


  // Redireccionar si no hay autenticación
  useEffect(() => {
    if (!isLoadingAuth && !currentUser) {
      router.push('/login')
    }
  }, [currentUser, isLoadingAuth, router])


  // Cargar Perfil del Usuario/Empresa
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


  // Cargar Bots
  useEffect(() => {
    const cargarBots = async () => {
      if (userProfile?.userId) {
        console.log(`📄 Cargando bots para empresa ID: ${userProfile.userId}`)
        setIsLoadingBots(true)
        try {
          const botsData = await obtenerBotsPorEmpresa(userProfile.userId)
          setBots(botsData)
          console.log(`✅ ${botsData.length} bots cargados.`)
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


  // Cargar Métricas y Gráficos
  useEffect(() => {
    const cargarMetricas = async () => {
      if (!userProfile?.userId) return;
      setIsLoadingMetrics(true)
      try {
        // [Lógica de Carga de Conversaciones y Cálculo de Métricas (omito detalles por ser extenso)]
        
        const conversationsRef = collection(db, 'conversaciones')
        const q = query(conversationsRef, where('empresaId', '==', userProfile.userId))
        const conversationsSnap = await getDocs(q)
        
        const allConversations: Conversation[] = conversationsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Conversation))

        const now = new Date()
        const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const last14Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
        
        const conversations7d = allConversations.filter(conv => {
          const iniciada = conv.iniciada?.toDate ? conv.iniciada.toDate() : new Date(conv.iniciada)
          return iniciada >= last7Days
        })
        
        const conversations7to14d = allConversations.filter(conv => {
          const iniciada = conv.iniciada?.toDate ? conv.iniciada.toDate() : new Date(conv.iniciada)
          return iniciada >= last14Days && iniciada < last7Days
        })

        const uniqueUsersSet = new Set(
          conversations7d.map(conv => conv.usuarioId).filter(Boolean)
        )
        const uniqueUsers7to14Set = new Set(
          conversations7to14d.map(conv => conv.usuarioId).filter(Boolean)
        )

        const conversationsFinalized = conversations7d.filter(conv => 
          conv.estado === 'finalizada' || conv.finalizada
        )
        const conversionsSuccessful = conversationsFinalized.filter(conv => 
          (conv.satisfaccion || 0) >= 80
        )
        const conversionRate = conversationsFinalized.length > 0 
          ? (conversionsSuccessful.length / conversationsFinalized.length) * 100 
          : 0

        const conversations7to14Finalized = conversations7to14d.filter(conv => 
          conv.estado === 'finalizada' || conv.finalizada
        )
        const conversionRate7to14 = conversations7to14Finalized.length > 0 
          ? (conversations7to14Finalized.filter(conv => (conv.satisfaccion || 0) >= 80).length / conversations7to14Finalized.length) * 100 
          : 0


        const calculatePercentageChange = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? '+100%' : '+0%';
            const change = ((current - previous) / previous) * 100;
            return `${change >= 0 ? '+' : ''}${Math.round(change)}%`;
        };


        // Cálculo de porcentajes
        const percentageChangeBots = '+12%'; // Ejemplo: Mantengo el valor fijo como en tu código original, pero esto debería venir de una comparación real.
        const percentageChangeConversations = calculatePercentageChange(conversations7d.length, conversations7to14d.length);
        const percentageChangeConversion = calculatePercentageChange(conversionRate, conversionRate7to14);
        const percentageChangeUsers = calculatePercentageChange(uniqueUsersSet.size, uniqueUsers7to14Set.size);

        // Datos para el gráfico de Conversaciones (7 días)
        const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
        const conversationsByDay: { [key: string]: number } = {}
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
          conversationsByDay[daysOfWeek[date.getDay()]] = 0
        }
        conversations7d.forEach(conv => {
          const iniciada = conv.iniciada?.toDate ? conv.iniciada.toDate() : new Date(conv.iniciada)
          const dayName = daysOfWeek[iniciada.getDay()]
          if (conversationsByDay[dayName] !== undefined) {
            conversationsByDay[dayName]++
          }
        })
        const conversationChartData = Object.entries(conversationsByDay).map(([name, conversaciones]) => ({
          name,
          conversaciones
        }))

        // Datos para el gráfico de Conversiones (5 meses)
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
        const conversionsByMonth: { [key: string]: number } = {}
        for (let i = 4; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
          conversionsByMonth[monthNames[date.getMonth()]] = 0
        }
        const fiveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 4, 1)
        
        allConversations.forEach(conv => {
          const iniciada = conv.iniciada?.toDate ? conv.iniciada.toDate() : new Date(conv.iniciada)
          if (iniciada >= fiveMonthsAgo && (conv.estado === 'finalizada' || conv.finalizada) && (conv.satisfaccion || 0) >= 80) {
            const monthName = monthNames[iniciada.getMonth()]
            if (conversionsByMonth[monthName] !== undefined) {
              conversionsByMonth[monthName]++
            }
          }
        })

        const conversionChartData = Object.entries(conversionsByMonth).map(([name, conversiones]) => ({
          name,
          conversiones
        }))

        // Actualizar estados
        setMetrics({
          activeBotsCount: bots.filter(b => b.estado === 'active').length,
          totalConversations7d: conversations7d.length,
          conversionRate: Math.round(conversionRate),
          uniqueUsers: uniqueUsersSet.size,
          percentageChangeBots,
          percentageChangeConversations,
          percentageChangeConversion,
          percentageChangeUsers
        })
        setConversationData(conversationChartData)
        setConversionData(conversionChartData)

      } catch (error) {
        console.error("Error al cargar métricas:", error)
      } finally {
        setIsLoadingMetrics(false)
      }
    }
    
    // Solo cargar métricas si el perfil y la lista de bots están listos
    if (userProfile && bots.length >= 0 && !isLoadingBots) {
      cargarMetricas()
    }
  }, [userProfile, bots, isLoadingBots])


  // --- FUNCIÓN MODIFICADA: handleDeleteBot ---
  const handleDeleteBot = async (botId: string) => {
    setIsDeleting(true)
    const botToDeleteData = bots.find(bot => bot.id === botId);
    
    // Obtener la ID de instancia o usar el valor por defecto.
    const instanceId = (botToDeleteData?.configuracion as any)?.instanceId || defaultInstance; 
    
    try {
      // 1. Eliminar el bot de Firestore (la acción crítica)
      await deleteDoc(doc(db, 'bots', botId))
      setBots(prevBots => prevBots.filter(bot => bot.id !== botId))
      setBotToDelete(null)
      console.log(`✅ Bot ${botId} eliminado exitosamente de Firestore.`)
        
      // 2. Llamar a la API de Logout (importante, pero no debe bloquear el paso 1 si falla)
      // Esperamos aquí para que el indicador de carga se mantenga durante el logout de la API.
      await handleApiLogout(instanceId);

    } catch (error) {
      console.error("❌ Error al eliminar el bot de la base de datos:", error)
      alert("Hubo un error al eliminar el bot. Por favor, intenta de nuevo.")
    } finally {
      setIsDeleting(false)
    }
  }
  // ------------------------------------------


  // Carga inicial y manejo de redirección
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            ¡Hola, <span className="gradient-text">{userProfile.nombreUsuario}</span>! 👋
          </h1>
          <p className="text-text-secondary">Aquí está el resumen de tus bots conversacionales.</p>
        </div>

        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Métrica 1: Bots Activos */}
          <div className="glass-card p-6 hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-accent-primary/20 rounded-lg flex items-center justify-center">
                <Bot className="w-6 h-6 text-accent-primary" />
              </div>
              <span className="text-accent-primary text-sm font-semibold">
                {isLoadingMetrics ? '...' : metrics.percentageChangeBots}
              </span>
            </div>
            <div className="text-3xl font-bold mb-1">
              {isLoadingMetrics ? <Loader2 className="w-6 h-6 animate-spin" /> : metrics.activeBotsCount}
            </div>
            <div className="text-text-muted text-sm">Bots Activos</div>
          </div>
          
          {/* Métrica 2: Conversaciones (7d) */}
          <div className="glass-card p-6 hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-accent-secondary/20 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-accent-secondary" />
              </div>
              <span className="text-accent-primary text-sm font-semibold">
                {isLoadingMetrics ? '...' : metrics.percentageChangeConversations}
              </span>
            </div>
            <div className="text-3xl font-bold mb-1">
              {isLoadingMetrics ? <Loader2 className="w-6 h-6 animate-spin" /> : metrics.totalConversations7d.toLocaleString()}
            </div>
            <div className="text-text-muted text-sm">Conversaciones (7d)</div>
          </div>
          
          {/* Métrica 3: Tasa de Conversión */}
          <div className="glass-card p-6 hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-accent-warning/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-accent-warning" />
              </div>
              <span className="text-accent-primary text-sm font-semibold">
                {isLoadingMetrics ? '...' : metrics.percentageChangeConversion}
              </span>
            </div>
            <div className="text-3xl font-bold mb-1">
              {isLoadingMetrics ? <Loader2 className="w-6 h-6 animate-spin" /> : `${metrics.conversionRate}%`}
            </div>
            <div className="text-text-muted text-sm">Tasa de Conversión</div>
          </div>
          
          {/* Métrica 4: Usuarios Únicos */}
          <div className="glass-card p-6 hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-charts-line/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-charts-line" />
              </div>
              <span className="text-accent-primary text-sm font-semibold">
                {isLoadingMetrics ? '...' : metrics.percentageChangeUsers}
              </span>
            </div>
            <div className="text-3xl font-bold mb-1">
              {isLoadingMetrics ? <Loader2 className="w-6 h-6 animate-spin" /> : metrics.uniqueUsers.toLocaleString()}
            </div>
            <div className="text-text-muted text-sm">Usuarios Únicos</div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico de Conversaciones */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold mb-1">Conversaciones</h3>
                <p className="text-text-muted text-sm">Últimos 7 días</p>
              </div>
              <BarChart3 className="w-5 h-5 text-accent-primary" />
            </div>
            {isLoadingMetrics ? (
              <div className="flex items-center justify-center h-[250px]">
                <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={conversationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94A3B8" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#94A3B8" style={{ fontSize: '12px' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#F8FAFC' }} />
                  <Line type="monotone" dataKey="conversaciones" stroke="#22D3EE" strokeWidth={3} dot={{ fill: '#22D3EE', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Gráfico de Conversiones */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold mb-1">Conversiones</h3>
                <p className="text-text-muted text-sm">Últimos 5 meses</p>
              </div>
              <TrendingUp className="w-5 h-5 text-accent-primary" />
            </div>
            {isLoadingMetrics ? (
              <div className="flex items-center justify-center h-[250px]">
                <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={conversionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94A3B8" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#94A3B8" style={{ fontSize: '12px' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#F8FAFC' }} />
                  <Bar dataKey="conversiones" fill="#10B981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Lista de Bots */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold mb-1">Mis Bots</h3>
              <p className="text-text-muted text-sm">Gestiona y monitorea tus bots conversacionales</p>
            </div>
            <Link href="/wizard" className="btn-primary flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Crear Nuevo Bot</span>
            </Link>
          </div>
          
          {/* Barra de Búsqueda */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input 
                type="text" 
                placeholder="Buscar bots..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="input-field w-full pl-10" 
              />
            </div>
          </div>
          
          {/* Contenido de la Lista de Bots */}
          {isLoadingBots ? (
            <div className="text-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-accent-primary mx-auto mb-4" />
              <p className="text-text-secondary">Cargando tus bots...</p>
            </div>
          ) : bots.length === 0 ? (
            <div className="text-center py-10 text-text-muted">
              <Bot className="w-12 h-12 mx-auto mb-4 opacity-50"/>
              <p>Aún no has creado ningún bot.</p>
              <Link href="/wizard" className="text-accent-primary hover:underline mt-2 inline-block">
                ¡Crea tu primer bot ahora!
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bots
                .filter(bot => bot.nombre.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((bot) => (
                <div 
                  key={bot.id} 
                  className="bg-background-secondary/50 rounded-lg p-4 hover:bg-background-hover transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      {/* Ícono de Bot */}
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${bot.estado === 'active' ? 'bg-accent-primary/20' : 'bg-background-hover'}`}>
                        <Bot className={`w-6 h-6 ${bot.estado === 'active' ? 'text-accent-primary' : 'text-text-muted'}`} />
                      </div>
                      
                      {/* Información principal */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <h4 className="font-bold text-lg">{bot.nombre}</h4>
                          {/* Estado */}
                          {bot.estado === 'active' ? (
                            <span className="flex items-center space-x-1 text-xs bg-accent-primary/20 text-accent-primary px-2 py-1 rounded-full">
                              <CheckCircle className="w-3 h-3" />
                              <span>Activo</span>
                            </span>
                          ) : (
                            <span className="flex items-center space-x-1 text-xs bg-background-hover text-text-muted px-2 py-1 rounded-full">
                              <AlertCircle className="w-3 h-3" />
                              <span>{bot.estado === 'paused' ? 'Pausado' : 'Inactivo'}</span>
                            </span>
                          )}
                        </div>
                        
                        {/* Métricas rápidas */}
                        <div className="flex items-center space-x-4 text-sm text-text-muted">
                          <span className="flex items-center space-x-1">
                            <MessageSquare className="w-4 h-4" />
                            <span>{bot.metricas?.conversaciones?.toLocaleString() ?? 0} convers.</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>
                              {(() => {
                                const ua = bot.metricas?.ultimaActividad
                                if (!ua) return 'Act. N/A'
                                const date =
                                  typeof ua === 'object' && ua !== null && 'toDate' in ua && typeof (ua as any).toDate === 'function'
                                    ? (ua as any).toDate()
                                    : ua instanceof Date
                                    ? ua
                                    : new Date(ua as any)
                                return isNaN(date.getTime()) ? 'Act. N/A' : `Act. ${date.toLocaleDateString()}`
                              })()}
                            </span>
                          </span>
                        </div>
                        
                        {/* Canales */}
                        {bot.configuracion?.canales && bot.configuracion.canales.length > 0 && (
                          <div className="flex items-center space-x-2 mt-2">
                            {bot.configuracion.canales.map((channel, i) => (
                              <span key={i} className="text-xs bg-background-primary px-2 py-1 rounded capitalize">{channel}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Acciones */}
                    <div className="flex items-center space-x-2">
                      <Link href={`/bot/${bot.id}`} className="btn-secondary px-4 py-2 text-sm">Ver Detalles</Link>
                      
                      <div className="relative">
                        <button 
                          onClick={() => setOpenMenuBotId(openMenuBotId === bot.id ? null : bot.id || null)}
                          className="w-10 h-10 bg-background-hover rounded-lg flex items-center justify-center hover:bg-background-hover/80 transition-colors"
                        >
                          <MoreVertical className="w-5 h-5 text-text-secondary" />
                        </button>
                        
                        {/* Menú desplegable */}
                        {bot.id && openMenuBotId === bot.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-background-secondary border border-background-hover rounded-lg shadow-lg z-10">
                            <button
                              onClick={() => {
                                setBotToDelete(bot.id || null)
                                setOpenMenuBotId(null)
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-background-hover transition-colors flex items-center space-x-2 text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Eliminar Bot</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Diálogo de confirmación para eliminar */}
      {botToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card p-6 max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Eliminar Bot</h3>
                <p className="text-text-muted text-sm">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <p className="text-text-secondary mb-6">
              ¿Estás seguro de que deseas eliminar el bot <span className="font-bold text-white">
                "{bots.find(b => b.id === botToDelete)?.nombre}"
              </span>? Se eliminarán todos los datos asociados.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setBotToDelete(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-background-hover hover:bg-background-hover/80 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteBot(botToDelete)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Eliminar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}