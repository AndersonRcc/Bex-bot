'use client'
import { useState, useEffect } from 'react'
import { Bot, Search, Plus, MoreVertical, Power, Settings, MessageSquare, Clock, CheckCircle, AlertCircle, Trash2, Copy, Edit, Loader2, Pause, Play } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/app/components/AuthProvider'
import Header from '@/app/components/header'
import { useRouter } from 'next/navigation'
import { doc, getDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/lib/firebaseConfig'
import { obtenerBotsPorEmpresa, actualizarBot, Bot as BotType } from '@/lib/botService'
import { registrarBotEliminado, registrarCambioEstado } from '@/lib/botHistoryService'

export default function BotsPage() {
  const { currentUser, isLoadingAuth } = useAuth()
  const [userProfile, setUserProfile] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused' | 'inactive'>('all')
  const [bots, setBots] = useState<BotType[]>([])
  const [isLoadingBots, setIsLoadingBots] = useState(true)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [botToDelete, setBotToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [openMenuBotId, setOpenMenuBotId] = useState<string | null>(null)
  const [botToToggle, setBotToToggle] = useState<string | null>(null)
  const [isTogglingStatus, setIsTogglingStatus] = useState(false)
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

  const handleDeleteBot = async (botId: string) => {
    setIsDeleting(true)
    try {
      const botToRemove = bots.find(b => b.id === botId)
      
      if (!botToRemove) {
        throw new Error("Bot no encontrado")
      }
      await registrarBotEliminado(
        userProfile.userId,
        botId,
        botToRemove.nombre,
        userProfile.userId,
        userProfile.nombreUsuario || currentUser?.email || "Usuario",
        botToRemove.estado
      )
      await deleteDoc(doc(db, 'bots', botId))
      setBots(prevBots => prevBots.filter(bot => bot.id !== botId))
      setBotToDelete(null)
      console.log(`✅ Bot ${botId} eliminado exitosamente`)
    } catch (error) {
      console.error("❌ Error al eliminar el bot:", error)
      alert("Hubo un error al eliminar el bot. Por favor, intenta de nuevo.")
    } finally {
      setIsDeleting(false)
    }
  }
  const handleToggleBotStatus = async (botId: string) => {
    const bot = bots.find(b => b.id === botId)
    if (!bot) return
    const estadoAnterior = bot.estado
    const nuevoEstado = bot.estado === 'active' ? 'paused' : 'active'
    setIsTogglingStatus(true)
    setBotToToggle(botId)
    try {
      await actualizarBot(botId, { estado: nuevoEstado })
      await registrarCambioEstado(
        userProfile.userId,
        botId,
        bot.nombre,
        userProfile.userId,
        userProfile.nombreUsuario || currentUser?.email || "Usuario",
        estadoAnterior,
        nuevoEstado
      )
      setBots(prevBots => 
        prevBots.map(b => 
          b.id === botId ? { ...b, estado: nuevoEstado } : b
        )
      )
      console.log(`✅ Bot ${botId} cambió de ${estadoAnterior} a ${nuevoEstado}`)
    } catch (error) {
      console.error("❌ Error al cambiar estado del bot:", error)
      alert("Error al cambiar el estado del bot")
    } finally {
      setIsTogglingStatus(false)
      setBotToToggle(null)
      setOpenMenuBotId(null)
    }
  }
  const handleDuplicateBot = (botId: string) => {
    console.log("Duplicar bot:", botId)
    alert("Función de duplicar bot en desarrollo")
    setOpenMenuBotId(null)
  }
  const filteredBots = bots.filter(bot => {
    const matchesSearch = bot.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bot.tipo.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || bot.estado === filterStatus
    return matchesSearch && matchesStatus
  })
  const activeBotsCount = bots.filter(b => b.estado === 'active').length
  const totalConversations = bots.reduce((sum, b) => sum + (b.metricas?.conversaciones || 0), 0)
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Mis Bots</h1>
            <p className="text-text-secondary">Gestiona todos tus bots conversacionales</p>
          </div>
          <Link href="/wizard" className="btn-primary flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Crear Nuevo Bot</span>
          </Link>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6 hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-accent-primary/20 rounded-lg flex items-center justify-center">
                <Bot className="w-6 h-6 text-accent-primary" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">
              {isLoadingBots ? <Loader2 className="w-6 h-6 animate-spin" /> : bots.length}
            </div>
            <div className="text-text-muted text-sm">Total de Bots</div>
          </div>
          <div className="glass-card p-6 hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-accent-secondary/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-accent-secondary" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">
              {isLoadingBots ? <Loader2 className="w-6 h-6 animate-spin" /> : activeBotsCount}
            </div>
            <div className="text-text-muted text-sm">Bots Activos</div>
          </div>
          <div className="glass-card p-6 hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-charts-line/20 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-charts-line" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">
              {isLoadingBots ? <Loader2 className="w-6 h-6 animate-spin" /> : totalConversations.toLocaleString()}
            </div>
            <div className="text-text-muted text-sm">Conversaciones Totales</div>
          </div>
        </div>
        {/* Filters and Search */}
        <div className="glass-card p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type="text"
                placeholder="Buscar bots..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field w-full pl-10"
              />
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
                Todos ({bots.length})
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  filterStatus === 'active'
                    ? 'bg-accent-primary text-white'
                    : 'bg-background-secondary text-text-secondary hover:bg-background-hover'
                }`}
              >
                Activos ({activeBotsCount})
              </button>
              <button
                onClick={() => setFilterStatus('paused')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  filterStatus === 'paused'
                    ? 'bg-accent-primary text-white'
                    : 'bg-background-secondary text-text-secondary hover:bg-background-hover'
                }`}
              >
                Pausados ({bots.filter(b => b.estado === 'paused').length})
              </button>
            </div>
          </div>
        </div>
        {/* Bots Grid */}
        {isLoadingBots ? (
          <div className="text-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-accent-primary mx-auto mb-4" />
            <p className="text-text-secondary">Cargando tus bots...</p>
          </div>
        ) : filteredBots.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-background-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot className="w-10 h-10 text-text-muted" />
            </div>
            <h3 className="text-xl font-bold mb-2">
              {searchQuery || filterStatus !== 'all' ? 'No se encontraron bots' : 'Aún no has creado ningún bot'}
            </h3>
            <p className="text-text-muted mb-6">
              {searchQuery || filterStatus !== 'all' 
                ? 'Intenta con otros términos de búsqueda o filtros' 
                : '¡Crea tu primer bot conversacional ahora!'}
            </p>
            <Link href="/wizard" className="btn-primary inline-flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Crear Nuevo Bot</span>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredBots.map((bot) => (
              <div key={bot.id} className="glass-card p-6 hover:scale-[1.02] transition-transform duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${
                      bot.estado === 'active' ? 'bg-accent-primary/20' : 'bg-background-hover'
                    }`}>
                      <Bot className={`w-7 h-7 ${bot.estado === 'active' ? 'text-accent-primary' : 'text-text-muted'}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">{bot.nombre}</h3>
                      <span className="text-xs text-text-muted capitalize">{bot.tipo}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {bot.estado === 'active' ? (
                      <span className="flex items-center space-x-1 text-xs bg-accent-primary/20 text-accent-primary px-2 py-1 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        <span>Activo</span>
                      </span>
                    ) : bot.estado === 'paused' ? (
                      <span className="flex items-center space-x-1 text-xs bg-accent-warning/20 text-accent-warning px-2 py-1 rounded-full">
                        <Pause className="w-3 h-3" />
                        <span>Pausado</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 text-xs bg-background-hover text-text-muted px-2 py-1 rounded-full">
                        <AlertCircle className="w-3 h-3" />
                        <span>Inactivo</span>
                      </span>
                    )}
                  </div>
                </div>
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-borders-default">
                  <div>
                    <div className="text-2xl font-bold text-accent-primary">
                      {(bot.metricas?.conversaciones || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-text-muted">Conversaciones</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-accent-secondary">
                      {bot.metricas?.usuariosUnicos || 0}
                    </div>
                    <div className="text-xs text-text-muted">Usuarios</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-charts-line">
                      {bot.configuracion?.canales?.length || 0}
                    </div>
                    <div className="text-xs text-text-muted">Canales</div>
                  </div>
                </div>
                {/* Channels */}
                {bot.configuracion?.canales && bot.configuracion.canales.length > 0 && (
                  <div className="flex items-center space-x-2 mb-4">
                    {bot.configuracion.canales.map((channel, i) => (
                      <span key={i} className="text-xs bg-background-primary px-2 py-1 rounded capitalize">
                        {channel}
                      </span>
                    ))}
                  </div>
                )}
                {/* Meta Info */}
                <div className="flex items-center justify-between text-xs text-text-muted mb-4">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      {bot.metricas?.ultimaActividad instanceof Date
                        ? `Últ. act. ${bot.metricas.ultimaActividad.toLocaleDateString()}`
                        : 'Sin actividad'}
                    </span>
                  </span>
                  <span>
                    Creado: {bot.createdAt instanceof Date 
                      ? bot.createdAt.toLocaleDateString() 
                      : 'N/A'}
                  </span>
                </div>
                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <Link href={`/bot/${bot.id}`} className="btn-primary flex-1 text-sm py-2 text-center">
                    Ver Detalles
                  </Link>
                  <div className="relative">
                    <button 
                      onClick={() => setOpenMenuBotId(openMenuBotId === bot.id ? null : bot.id || null)}
                      className="btn-secondary px-3 py-2"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {/* Menú desplegable */}
                    {bot.id && openMenuBotId === bot.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-background-secondary border border-background-hover rounded-lg shadow-lg z-10">
                        {/* Pausar/Activar */}
                        <button
                          onClick={() => handleToggleBotStatus(bot.id!)}
                          disabled={isTogglingStatus && botToToggle === bot.id}
                          className="w-full px-4 py-3 text-left hover:bg-background-hover transition-colors flex items-center space-x-2 disabled:opacity-50"
                        >
                          {isTogglingStatus && botToToggle === bot.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : bot.estado === 'active' ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                          <span>{bot.estado === 'active' ? 'Pausar Bot' : 'Activar Bot'}</span>
                        </button>
                        {/* Duplicar */}
                        <button
                          onClick={() => handleDuplicateBot(bot.id!)}
                          className="w-full px-4 py-3 text-left hover:bg-background-hover transition-colors flex items-center space-x-2"
                        >
                          <Copy className="w-4 h-4" />
                          <span>Duplicar Bot</span>
                        </button>
                        {/* Eliminar */}
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
            ))}
          </div>
        )}
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