'use client'
import { useState, useEffect } from 'react'
import { Bot, ArrowLeft, Settings, Play, Pause, MessageSquare, Zap, Clock, Users, Link as LinkIcon, Code, Save, Plus, Trash2, Loader2, AlertTriangle } from 'lucide-react' // Añadir Loader2, AlertTriangle
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { obtenerBot, actualizarBot, Bot as BotType } from '@/lib/botService'
import FlowEditor from './components/FlowEditor'
import { registrarCambioEstado } from '@/lib/botHistoryService'
import { auth } from '@/lib/firebaseConfig'
export default function BotDetailPage() {
  const [activeTab, setActiveTab] = useState<'flows' | 'replies' | 'settings' | 'integrations'>('flows')
  const [botData, setBotData] = useState<BotType | null>(null);
  const [isLoadingBot, setIsLoadingBot] = useState(true);
  const [errorBot, setErrorBot] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);
  const params = useParams();
  const router = useRouter();
  const botId = params.id as string;

  useEffect(() => {
    const cargarBot = async () => {
      if (!botId) {
        setErrorBot("ID de bot no encontrado en la URL.");
        setIsLoadingBot(false);
        return;
      }
      setIsLoadingBot(true);
      setErrorBot(null);
      try {
        console.log(`🔄 Cargando datos para bot ID: ${botId}`);
        const data = await obtenerBot(botId);
        if (data) {
          setBotData(data);
          console.log("✅ Datos del bot cargados:", data);
        } else {
          setErrorBot(`Bot con ID ${botId} no encontrado.`);
          console.log(`⚠️ Bot no encontrado: ${botId}`);
        }
      } catch (error: any) {
        console.error("❌ Error cargando bot:", error);
        setErrorBot(`Error al cargar el bot: ${error.message}`);
      } finally {
        setIsLoadingBot(false);
      }
    };
    cargarBot();
  }, [botId]);
    const handleStatusChange = async () => {
      if (!botData || !botId || !currentUser) return;
      const estadoAnterior = botData.estado;
      const nuevoEstado = botData.estado === 'active' ? 'paused' : 'active';
      setIsSaving(true);
      try {
        const result = await actualizarBot(botId, { estado: nuevoEstado });
        if (result.success) {
          setBotData(prev => prev ? { ...prev, estado: nuevoEstado } : null);
          try {
            await registrarCambioEstado(
              currentUser.uid,
              botId,
              botData.nombre,
              currentUser.uid,
              currentUser.displayName || currentUser.email || "Usuario",
              estadoAnterior,
              nuevoEstado
            );
            console.log(`✅ Estado del bot cambiado de ${estadoAnterior} a ${nuevoEstado} y registrado en historial`);
          } catch (historyError) {
            console.warn("⚠️ Error al registrar cambio de estado en historial (no crítico):", historyError);
          }
        } else {
          console.error("❌ Error al cambiar estado:", result.error);
        }
      } catch (error) {
        console.error("❌ Error en handleStatusChange:", error);
      } finally {
        setIsSaving(false);
      }
    };
    const handleSaveChanges = async () => {
        if (!botData || !botId) return;
        setIsSaving(true);
        const datosActualizados = {
            nombre: botData.nombre,
             configuracion: {
                 ...botData.configuracion,
             }
        };
        const result = await actualizarBot(botId, datosActualizados);
         if (result.success) {
             console.log("✅ Cambios generales guardados.");
         } else {
              console.error("❌ Error al guardar cambios generales:", result.error);
         }
        setIsSaving(false);
    };
    const handleAddQuickReply = () => {
        if (!botData) return;
        const newReply = { id: Date.now().toString(), trigger: '', response: '' };
        const updatedReplies = [...(botData.respuestasRapidas || []), newReply];
        setBotData({ ...botData, respuestasRapidas: updatedReplies });
    };
     const handleQuickReplyChange = (id: string, field: 'trigger' | 'response', value: string) => {
         if (!botData) return;
         const updatedReplies = (botData.respuestasRapidas || []).map(reply =>
             reply.id === id ? { ...reply, [field]: value } : reply
         );
         setBotData({ ...botData, respuestasRapidas: updatedReplies });
     };
     const handleRemoveQuickReply = (id: string) => {
          if (!botData || !botData.respuestasRapidas) return;
          const updatedReplies = botData.respuestasRapidas.filter(reply => reply.id !== id);
          setBotData({ ...botData, respuestasRapidas: updatedReplies });
     };
      const handleSaveQuickReplies = async () => {
         if (!botData || !botId) return;
         setIsSaving(true);
         const result = await actualizarBot(botId, { respuestasRapidas: botData.respuestasRapidas || [] });
          if (result.success) console.log("✅ Respuestas rápidas guardadas.");
          else console.error("❌ Error al guardar respuestas rápidas:", result.error);
         setIsSaving(false);
      }
  if (isLoadingBot) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-accent-primary" />
        <p className="ml-4 text-text-secondary">Cargando bot...</p>
      </div>
    );
  }
  if (errorBot) {
     return (
        <div className="min-h-screen bg-background-primary flex flex-col items-center justify-center p-6 text-center">
             <AlertTriangle className="w-16 h-16 text-red-500 mb-6" />
             <h2 className="text-2xl font-bold mb-4">Error al Cargar el Bot</h2>
             <p className="text-red-400 mb-6">{errorBot}</p>
             <Link href="/dashboard" className="btn-secondary">
                Volver al Dashboard
             </Link>
        </div>
     );
  }
   if (!botData) {
       return (
         <div className="min-h-screen bg-background-primary flex items-center justify-center">
             <p className="text-text-muted">No se encontraron datos para este bot.</p>
         </div>
       );
   }
  return (
    <div className="min-h-screen bg-background-primary">
      {/* Header - Usar botData */}
      <header className="bg-background-secondary border-b border-borders-default sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* ... (Botón volver y logo BexBot) ... */}
              <div className="flex items-center space-x-3 pl-4 border-l border-borders-default">
                 {/* Mostrar logo del bot si existe */}
                 {botData.configuracion?.logoUrl ? (
                    <img src={botData.configuracion.logoUrl} alt="Logo Bot" className="w-12 h-12 rounded-lg object-cover bg-background-hover"/>
                 ) : (
                    <div className="w-12 h-12 bg-accent-primary/20 rounded-lg flex items-center justify-center">
                      <Bot className="w-6 h-6 text-accent-primary" />
                    </div>
                 )}
                <div>
                  {/* Usar nombre real del bot */}
                  <h1 className="text-xl font-bold">{botData.nombre}</h1>
                  <div className="flex items-center space-x-2 text-sm text-text-muted">
                    {/* Usar estado real del bot */}
                    <span className={`w-2 h-2 rounded-full ${botData.estado === 'active' ? 'bg-accent-primary' : 'bg-text-muted'}`}></span>
                    <span>{botData.estado === 'active' ? 'Activo' : (botData.estado === 'paused' ? 'Pausado' : 'Inactivo')}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Botón Pausar/Activar */}
              <button
                 onClick={handleStatusChange}
                 disabled={isSaving} // Deshabilitar mientras guarda
                 className={`btn-secondary flex items-center space-x-2 ${
                   botData.estado === 'active' ? 'bg-accent-warning/20 text-accent-warning hover:bg-accent-warning/30' : 'bg-accent-primary/20 text-accent-primary hover:bg-accent-primary/30'
                 } ${isSaving ? 'opacity-50 cursor-wait' : ''}`}
               >
                 {isSaving && botData.estado === 'active' && <Loader2 className="w-4 h-4 animate-spin"/>}
                 {isSaving && botData.estado !== 'active' && <Loader2 className="w-4 h-4 animate-spin"/>}
                 {!isSaving && botData.estado === 'active' && <Pause className="w-4 h-4" />}
                 {!isSaving && botData.estado !== 'active' && <Play className="w-4 h-4" />}
                 <span>{isSaving ? '...' : (botData.estado === 'active' ? 'Pausar' : 'Activar')}</span>
               </button>
              {/* Botón Guardar Cambios (para Settings principalmente) */}
              <button
                 onClick={handleSaveChanges}
                 disabled={isSaving}
                 className={`btn-primary flex items-center space-x-2 ${isSaving ? 'opacity-50 cursor-wait' : ''}`}
               >
                 {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4" />}
                 <span>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-background-secondary border-r border-borders-default min-h-[calc(100vh-73px)] p-4">
             {/* ... (Navegación de tabs sin cambios) ... */}
            <nav className="space-y-2">
                 {/* Botones de tabs */}
            </nav>
            {/* Quick Stats - Usar botData.metricas */}
             <div className="mt-8 space-y-4">
               <div className="glass-card p-4">
                 <div className="flex items-center justify-between mb-2">
                   <MessageSquare className="w-5 h-5 text-accent-primary" />
                   {/* Podrías añadir lógica de % cambio si comparas con período anterior */}
                 </div>
                 <div className="text-2xl font-bold">{botData.metricas?.conversaciones?.toLocaleString() ?? 0}</div>
                 <div className="text-xs text-text-muted">Conversaciones</div> {/* Podría ser total o de un período */}
               </div>
               <div className="glass-card p-4">
                  <div className="flex items-center justify-between mb-2">
                     <Users className="w-5 h-5 text-accent-secondary" />
                  </div>
                  <div className="text-2xl font-bold">{botData.metricas?.usuariosUnicos?.toLocaleString() ?? 0}</div>
                  <div className="text-xs text-text-muted">Usuarios Únicos</div>
               </div>
             </div>
        </aside>
        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Flow Editor Tab */}
          {activeTab === 'flows' && (
             <div>
                 <div className="flex items-center justify-between mb-6">
                    <div>
                         <h2 className="text-2xl font-bold mb-1">Editor de Flujos</h2>
                         <p className="text-text-muted">Diseña la conversación de tu bot</p>
                    </div>
                     {/* El botón "Agregar Nodo" ahora sería parte de ReactFlow o su UI */}
                 </div>
                 {/* --- INTEGRACIÓN REACTFLOW --- */}
                 {botData.flujos ? (
                    <FlowEditor
                        botId={botId}
                        initialFlowData={botData.flujos} // Pasar los flujos cargados
                        onSaveSuccess={() => console.log("Callback: Flujo guardado")} // Ejemplo callback
                    />
                 ) : (
                     <p className="text-text-muted">Cargando datos del flujo...</p> // O estado de carga específico
                 )}
                 {/* --- FIN INTEGRACIÓN --- */}

                  {/* La Vista Previa en Vivo necesitaría un simulador real o ser eliminada/simplificada */}
                  <div className="mt-6 glass-card p-6">
                     <h3 className="font-bold mb-4">Vista Previa (Simplificada)</h3>
                      <p className="text-text-muted text-sm">La vista previa en vivo requiere un motor de ejecución.</p>
                      {/* Mostrar quizás el primer mensaje del flujo */}
                       {(botData.flujos?.nodes?.find(n => n.type === 'textUpdaterNode' || n.type === 'message')?.data?.text ||
                         botData.flujos?.nodes?.find(n => n.type === 'textUpdaterNode' || n.type === 'message')?.data?.label) && (
                         <div className="bg-background-primary rounded-lg p-4 max-w-md mt-4">
                             <div className="bg-background-secondary rounded-lg p-3 max-w-[80%]">
                                <p className="text-sm">
                                    {botData.flujos.nodes.find(n => n.type === 'textUpdaterNode' || n.type === 'message')?.data?.text ||
                                     botData.flujos.nodes.find(n => n.type === 'textUpdaterNode' || n.type === 'message')?.data?.label}
                                </p>
                             </div>
                         </div>
                       )}

                  </div>
             </div>
          )}
           {/* Quick Replies Tab - Usar botData.respuestasRapidas */}
           {activeTab === 'replies' && (
             <div>
                <div className="flex items-center justify-between mb-6">
                     <div>
                         <h2 className="text-2xl font-bold mb-1">Respuestas Rápidas</h2>
                         <p className="text-text-muted">Configura respuestas automáticas para palabras clave</p>
                     </div>
                     <button onClick={handleAddQuickReply} className="btn-primary flex items-center space-x-2">
                         <Plus className="w-4 h-4" />
                         <span>Nueva Respuesta</span>
                     </button>
                 </div>
                 <div className="space-y-4">
                      {(botData.respuestasRapidas || []).map((reply) => (
                         <div key={reply.id} className="glass-card p-6">
                           <div className="flex items-start justify-between">
                             <div className="flex-1 space-y-3">
                                <div className="flex items-center space-x-2">
                                     <span className="text-xs text-text-muted mr-1">Trigger:</span>
                                     <input
                                         type="text"
                                         value={reply.trigger}
                                         onChange={(e) => handleQuickReplyChange(reply.id, 'trigger', e.target.value)}
                                         placeholder="Palabra clave (ej: hola)"
                                         className="input-field text-sm font-mono flex-1"
                                     />

                                </div>
                                 <div className="flex items-start space-x-2">
                                      <span className="text-xs text-text-muted mr-1 mt-2">Respuesta:</span>
                                      <textarea
                                         value={reply.response}
                                         onChange={(e) => handleQuickReplyChange(reply.id, 'response', e.target.value)}
                                         placeholder="Respuesta del bot..."
                                         className="input-field text-sm flex-1"
                                         rows={2}
                                      />
                                 </div>
                             </div>
                             <div className="flex flex-col items-center space-y-2 ml-4">
                               {/* <button className="btn-secondary px-3 py-2 text-sm">Editar</button> // Ya se edita inline */}
                               <button
                                  onClick={() => handleRemoveQuickReply(reply.id)}
                                  // disabled={(botData.respuestasRapidas?.length ?? 0) <= 1} // Opcional: no permitir borrar la última
                                  className="w-8 h-8 bg-background-hover rounded-lg flex items-center justify-center hover:bg-accent-error/20 hover:text-accent-error transition-colors disabled:opacity-50"
                                >
                                 <Trash2 className="w-4 h-4" />
                               </button>
                             </div>
                           </div>
                         </div>
                       ))}
                 </div>
                  {/* Botón para guardar específicamente las respuestas rápidas */}
                  <div className="mt-6 flex justify-end">
                     <button onClick={handleSaveQuickReplies} className="btn-primary" disabled={isSaving}>
                         {isSaving ? 'Guardando...' : 'Guardar Respuestas'}
                     </button>
                  </div>
             </div>
           )}
           {/* Settings Tab - Conectar inputs a botData */}
           {activeTab === 'settings' && (
              <div>
                 <h2 className="text-2xl font-bold mb-6">Configuración del Bot</h2>
                  <div className="space-y-6">
                     {/* General Settings */}
                     <div className="glass-card p-6">
                          <h3 className="text-xl font-bold mb-4">General</h3>
                          <div className="space-y-4">
                             <div>
                                <label className="block text-sm font-semibold mb-2">Nombre del Bot</label>
                                <input
                                    type="text"
                                    className="input-field w-full"
                                    value={botData.nombre}
                                    onChange={(e) => setBotData({...botData, nombre: e.target.value })}
                                />
                             </div>
                              <div>
                                 <label className="block text-sm font-semibold mb-2">Tono</label>
                                 <select
                                     className="input-field w-full"
                                     value={botData.configuracion?.tono || 'friendly'}
                                     onChange={(e) => setBotData({...botData, configuracion: { ...botData.configuracion, tono: e.target.value as any }})}
                                  >
                                      <option value="formal">Formal 👔</option>
                                      <option value="friendly">Amigable 😊</option>
                                      <option value="casual">Casual 🤙</option>
                                  </select>
                              </div>
                               {/* Aquí podrías añadir un input para cambiar el logoUrl si lo permites */}
                          </div>
                     </div>
                      {/* Schedule Settings (Estos campos no están en el modelo Bot actual) */}
                      <div className="glass-card p-6 opacity-50"> {/* Atenuado ya que no está en el modelo */}
                           <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                             <Clock className="w-5 h-5 text-accent-primary" />
                             <span>Horarios de Atención (No implementado)</span>
                           </h3>
                           {/* ... (inputs de horarios deshabilitados o con mensaje) ... */}
                            <p className="text-text-muted text-sm">Esta funcionalidad requiere agregar campos al modelo de datos del bot.</p>
                      </div>
                       {/* Widget Settings (Estos campos no están en el modelo Bot actual) */}
                       <div className="glass-card p-6 opacity-50"> {/* Atenuado */}
                            <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                              <Code className="w-5 h-5 text-accent-primary" />
                              <span>Código de Integración (No implementado)</span>
                            </h3>
                             {/* ... (código de ejemplo deshabilitado o con mensaje) ... */}
                             <p className="text-text-muted text-sm">Esta funcionalidad requiere agregar campos al modelo de datos del bot.</p>
                       </div>
                  </div>
                   {/* El botón "Guardar Cambios" del header general guardaría estos ajustes */}
              </div>
           )}
            {/* Integrations Tab (Mantener estático por ahora) */}
            {activeTab === 'integrations' && (
               <div>
                  {/* ... (Contenido estático de integraciones como estaba) ... */}
                   <h2 className="text-2xl font-bold mb-1">Integraciones</h2>
                   <p className="text-text-muted">Funcionalidad de integraciones no implementada aún.</p>
               </div>
            )}
        </main>
      </div>
    </div>
  )
}