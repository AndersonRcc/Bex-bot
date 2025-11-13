'use client'
import { useEffect, useState } from 'react'
import { Bot, Building2, Upload, ShoppingBag, MessageCircle, Wrench, ArrowRight, ArrowLeft, Check, Smartphone, QrCode, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { crearBot, actualizarBot } from '@/lib/botService'
import { subirLogo } from '@/lib/storageService'
import { auth } from '@/lib/firebaseConfig'
import { onAuthStateChanged, User } from 'firebase/auth'
import { registrarBotCreado } from '@/lib/botHistoryService'
const agentTypes = [
  {
    id: 'sales',
    icon: <ShoppingBag className="w-8 h-8" />,
    title: 'Ventas',
    emoji: '🛍️',
    description: 'Impulsa conversiones, recomienda productos y cierra ventas automáticamente',
    features: ['Catálogo de productos', 'Recomendaciones IA', 'Carrito de compras', 'Seguimiento de pedidos']
  },
  {
    id: 'support',
    icon: <MessageCircle className="w-8 h-8" />,
    title: 'Atención al Cliente',
    emoji: '💬',
    description: 'Responde preguntas frecuentes y brinda soporte instantáneo 24/7',
    features: ['FAQ inteligente', 'Tickets automáticos', 'Escalamiento humano', 'Historial de conversaciones']
  },
  {
    id: 'assistance',
    icon: <Wrench className="w-8 h-8" />,
    title: 'Asistencia Técnica',
    emoji: '🔧',
    description: 'Resuelve problemas técnicos y guía a usuarios paso a paso',
    features: ['Diagnóstico automático', 'Guías interactivas', 'Base de conocimiento', 'Reportes de incidencias']
  }
]
const channels = [
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: '💚',
    description: 'Conecta con tus clientes en la app de mensajería más popular',
    users: '2B+ usuarios'
  },
  {
    id: 'messenger',
    name: 'Messenger',
    icon: '💙',
    description: 'Integra con Facebook Messenger para alcanzar tu audiencia',
    users: '1.3B+ usuarios'
  },
  {
    id: 'web',
    name: 'Widget Web',
    icon: '🌐',
    description: 'Añade un chat widget a tu sitio web con un simple código',
    users: 'Personalizable'
  }
]
export default function WizardPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    companyName: '',
    companyLogo: null as File | null,
    tone: 'friendly',
    agentType: '',
    selectedChannels: [] as string[]
  })
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [qrError, setQrError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const router = useRouter();
      useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            setCurrentUser(user);
          } else {
            router.push('/login');
          }
        });
        return () => unsubscribe();
      }, [router]);
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, companyLogo: file })
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }
  const toggleChannel = (channelId: string) => {
    const newChannels = formData.selectedChannels.includes(channelId)
      ? formData.selectedChannels.filter(id => id !== channelId)
      : [...formData.selectedChannels, channelId]
    if (channelId === 'whatsapp' && formData.selectedChannels.includes('whatsapp')) {
        setQrCodeImage(null)
        setQrError(null)
    }
    setFormData({ ...formData, selectedChannels: newChannels })
  }
const handleGenerateQR = async () => {
    setIsConnecting(true);
    setQrCodeImage(null);
    setQrError(null);
    const server_url = "https://edgar-n8n-evolution-api.zxlh8i.easypanel.host";
    const instance = "bot_ventas";
    const api_key = "429683C4C977415CAAFCCE10F7D57E11";
    const url = `${server_url}/instance/connect/${instance}`;
    const headers = { "apikey": api_key };
    try {
        const response = await fetch(url, { method: 'GET', headers: headers });
        const result = await response.json();

        if (!response.ok) {
            const errorDetail = result.error || response.statusText || 'Error al conectar con Evolution API.';
            setQrError(errorDetail);
            console.error("Error Evolution API:", errorDetail, result);
            setIsConnecting(false);
            return;
        }
        if (result.base64) {
            let b64 = result.base64;
            if (!b64.startsWith("data:image")) {
                b64 = `data:image/png;base64,${b64}`;
            }
            setQrCodeImage(b64);
            setQrError(null);
            console.log("✅ QR Recibido.");
        } else if (result.instance?.state === "open") {
             console.log("✅ Instancia WhatsApp ya está 'open'. No se necesita QR.");
             setQrCodeImage("connected");
             setQrError(null);
        } else {
             setQrError("Respuesta inesperada de la API. No se encontró QR ni estado 'open'.");
             console.error("Respuesta inesperada de Evolution:", result);
             setQrCodeImage(null);
        }
    } catch (error) {
        console.error("Error de red/fetch:", error);
        setQrError('Error de red. No se pudo conectar con el servidor.');
        setQrCodeImage(null);
    } finally {
        setIsConnecting(false);
    }
};
  const isWhatsAppSelected = formData.selectedChannels.includes('whatsapp')
  const handleCrearBot = async () => {

    if (!currentUser) {
        setError("Usuario no autenticado.");
        return;
    }
     if (!formData.companyName.trim()) {
        setError("El nombre de la empresa es obligatorio.");
        setCurrentStep(1);
        return;
      }
      if (!formData.agentType) {
        setError("Debes seleccionar un tipo de agente.");
        setCurrentStep(2);
        return;
      }
       if (formData.selectedChannels.length === 0) {
        setError("Debes seleccionar al menos un canal.");
        setCurrentStep(3);
        return;
      }
      if (formData.selectedChannels.includes('whatsapp') && !qrCodeImage) {
           setError("Debes generar y escanear el código QR para WhatsApp antes de continuar.");
           setCurrentStep(3);
           return;
      }
    setIsLoading(true)
    setError('')
    try {
        let logoFinalUrl = ''
        if (formData.companyLogo) {
            console.log("🔄 Subiendo logo...");
            const uploadResult = await subirLogo(formData.companyLogo, currentUser.uid, 'bot');
            if (uploadResult.success && uploadResult.url) {
                logoFinalUrl = uploadResult.url;
                console.log("✅ Logo subido:", logoFinalUrl);
            } else {
                console.warn("⚠️ No se pudo subir el logo:", uploadResult.error);
                 setError("Error al subir el logo. Inténtalo de nuevo o continúa sin logo.");
            }
        }
        console.log("🔄 Creando bot en Firestore...");
         const tipoAgente = formData.agentType as 'sales' | 'support' | 'assistance';
         if (!['sales', 'support', 'assistance'].includes(tipoAgente)) {
             throw new Error("Tipo de agente inválido seleccionado.");
         }
        const botData = {
            empresaId: currentUser.uid,
            nombre: formData.companyName.trim(),
            tipo: tipoAgente,
            tono: formData.tone as 'formal' | 'friendly' | 'casual',
            canales: formData.selectedChannels,
            logoUrl: logoFinalUrl
        };
      const resultado = await crearBot(botData);
      if (resultado.success && resultado.botId) {
      console.log(`✅ Bot creado con ID: ${resultado.botId}`);
      try {
          await registrarBotCreado(
              currentUser.uid,
              resultado.botId,
              formData.companyName.trim(),
              currentUser.uid,
              currentUser.displayName || currentUser.email || "Usuario",
              { 
                  tipo: formData.agentType, 
                  canales: formData.selectedChannels,
                  tono: formData.tone,
                  conLogo: !!logoFinalUrl
              } as any
          );
          console.log("✅ Bot registrado en historial");
      } catch (historyError) {
          console.warn("⚠️ Error al registrar en historial (no crítico):", historyError);
      }
             if (formData.selectedChannels.includes('whatsapp')) {
                 await actualizarBot(resultado.botId, {
                     configuracion: {
                       whatsappConnected: true,
                       whatsappInstance: "bot_ventas",
                       tono: formData.tone,
                       logoUrl: logoFinalUrl,
                       canales: formData.selectedChannels
                     } as any
                 } as any);
                 console.log("ℹ️ Información de WhatsApp actualizada para el bot.");
             }
            router.push(`/dashboard?newBot=${resultado.botId}`);
        } else {
            console.error("❌ Falló la creación del bot:", resultado.error);
            setError(`Error al crear el bot: ${resultado.error?.message || 'Error desconocido'}`);
        }
    } catch (error: any) {
         console.error("❌ Error en el proceso de creación:", error);
         setError(`Error inesperado: ${error.message}`);
    } finally {
        setIsLoading(false)
    }
  }
const canProceed = () => {
    if (isLoading || !currentUser) return false;
    if (currentStep === 1) return formData.companyName.trim() !== '';
    if (currentStep === 2) return !!formData.agentType;
    if (currentStep === 3) {
      if (formData.selectedChannels.length === 0) return false;
      if (formData.selectedChannels.includes('whatsapp')) {
        return (qrCodeImage !== null && qrCodeImage !== '') && qrError === null;
      }
      return true;
    }
    return false;
};
  if (!currentUser) {
     return (
       <div className="min-h-screen bg-background-primary flex items-center justify-center">
         <Loader2 className="w-10 h-10 animate-spin text-accent-primary" />
         <p className="ml-4 text-text-secondary">Verificando sesión...</p>
       </div>
     );
  }
  return (
    <div className="min-h-screen bg-background-primary">
      {/* Header (Mantenido el estilo anterior) */}
      <header className="bg-background-secondary border-b border-borders-default">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between max-w-5xl mx-auto">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-lg flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold gradient-text">BexBot</span>
            </Link>
            <Link href="/dashboard" className="text-text-secondary hover:text-text-primary transition-colors text-sm">
              Salir del wizard
            </Link>
          </div>
        </div>
      </header>
      <div className="p-6 max-w-5xl mx-auto">
        {/* Progress Bar (Mantenido el estilo anterior) */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                  currentStep >= step 
                    ? 'bg-accent-primary border-accent-primary text-white' 
                    : 'bg-background-secondary border-borders-default text-text-muted'
                }`}>
                  {currentStep > step ? <Check className="w-6 h-6" /> : step}
                </div>
                {step < 3 && (
                  <div className={`flex-1 h-1 mx-4 rounded-full transition-all ${
                    currentStep > step ? 'bg-accent-primary' : 'bg-borders-default'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className={currentStep >= 1 ? 'text-text-primary font-semibold' : 'text-text-muted'}>Empresa</span>
            <span className={currentStep >= 2 ? 'text-text-primary font-semibold' : 'text-text-muted'}>Tipo de Agente</span>
            <span className={currentStep >= 3 ? 'text-text-primary font-semibold' : 'text-text-muted'}>Canales</span>
          </div>
        </div>
        {/* Step 1: Company Info (Mantenido el estilo anterior) */}
        {currentStep === 1 && (
          <div className="glass-card p-8 md:p-12 animate-fade-in">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-accent-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-accent-primary" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Información de tu Empresa</h2>
                <p className="text-text-secondary">Personaliza tu bot con la identidad de tu marca</p>
              </div>
              <div className="space-y-6">
                {/* Company Name */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Nombre de la Empresa *</label>
                  <input
                    type="text"
                    placeholder="Ej: TechShop México"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="input-field w-full"
                  />
                </div>
                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Logo de la Empresa (Opcional)</label>
                  <div className="flex items-center space-x-4">
                    <div className="w-24 h-24 bg-background-secondary rounded-lg border-2 border-dashed border-borders-default flex items-center justify-center overflow-hidden">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                      ) : (
                        <Upload className="w-8 h-8 text-text-muted" />
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        id="logo-upload"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <label htmlFor="logo-upload" className="btn-secondary cursor-pointer inline-block">
                        Subir Logo
                      </label>
                      <p className="text-xs text-text-muted mt-2">PNG, JPG o SVG (máx. 2MB)</p>
                    </div>
                  </div>
                </div>
                {/* Tone Selection */}
                <div>
                  <label className="block text-sm font-semibold mb-3">Tono de Conversación *</label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { value: 'formal', label: 'Formal', emoji: '👔', desc: 'Profesional y corporativo' },
                      { value: 'friendly', label: 'Amigable', emoji: '😊', desc: 'Cercano y conversacional' },
                      { value: 'casual', label: 'Casual', emoji: '🤙', desc: 'Relajado e informal' }
                    ].map((tone) => (
                      <button
                        key={tone.value}
                        onClick={() => setFormData({ ...formData, tone: tone.value })}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          formData.tone === tone.value
                            ? 'border-accent-primary bg-accent-primary/10'
                            : 'border-borders-default bg-background-secondary hover:border-accent-primary/50'
                        }`}
                      >
                        <div className="text-2xl mb-2">{tone.emoji}</div>
                        <div className="font-semibold mb-1">{tone.label}</div>
                        <div className="text-xs text-text-muted">{tone.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Step 2: Agent Type (Mantenido el estilo anterior) */}
        {currentStep === 2 && (
          <div className="glass-card p-8 md:p-12 animate-fade-in">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-accent-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-8 h-8 text-accent-primary" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Tipo de Agente</h2>
                <p className="text-text-secondary">Selecciona el tipo de bot que mejor se adapte a tus necesidades</p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {agentTypes.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => setFormData({ ...formData, agentType: agent.id })}
                    className={`p-6 rounded-lg border-2 transition-all text-left hover:scale-105 ${
                      formData.agentType === agent.id
                        ? 'border-accent-primary bg-accent-primary/10'
                        : 'border-borders-default bg-background-secondary hover:border-accent-primary/50'
                    }`}
                  >
                    <div className="text-4xl mb-4">{agent.emoji}</div>
                    <h3 className="text-xl font-bold mb-2">{agent.title}</h3>
                    <p className="text-text-secondary text-sm mb-4">{agent.description}</p>
                    <div className="space-y-2">
                      {agent.features.map((feature, i) => (
                        <div key={i} className="flex items-center space-x-2 text-xs text-text-muted">
                          <Check className="w-3 h-3 text-accent-primary" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* Step 3: Channels (Modificado para incluir la lógica del QR, pero manteniendo estilos) */}
        {currentStep === 3 && (
          <div className="glass-card p-8 md:p-12 animate-fade-in">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-accent-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="w-8 h-8 text-accent-primary" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Canales de Comunicación</h2>
                <p className="text-text-secondary">Selecciona dónde quieres que tu bot esté disponible</p>
              </div>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {channels.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => toggleChannel(channel.id)}
                    className={`p-6 rounded-lg border-2 transition-all text-left hover:scale-105 ${
                      formData.selectedChannels.includes(channel.id)
                        ? 'border-accent-primary bg-accent-primary/10'
                        : 'border-borders-default bg-background-secondary hover:border-accent-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-4xl">{channel.icon}</div>
                      {formData.selectedChannels.includes(channel.id) && (
                        <div className="w-6 h-6 bg-accent-primary rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{channel.name}</h3>
                    <p className="text-text-secondary text-sm mb-3">{channel.description}</p>
                    <div className="text-xs text-accent-primary font-semibold">{channel.users}</div>
                  </button>
                ))}
              </div>
              {/* SECCIÓN DE CONEXIÓN DE WHATSAPP CON QR (LA SECCIÓN NUEVA) */}
              {isWhatsAppSelected && (
                <div className="bg-background-secondary/50 rounded-lg p-6 mb-8 transition-all duration-300 border border-borders-default">
                  <h3 className="font-bold mb-4 flex items-center space-x-2">
                    <QrCode className="w-5 h-5" />
                    <span>Conexión de WhatsApp (Prototipo)</span>
                  </h3>
                  {qrError && (
                    <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded-md mb-4 text-sm">
                      ⚠️ Error: **{qrError}**. Intenta de nuevo.
                    </div>
                  )}
                  {qrCodeImage ? (
                    <div className="flex flex-col items-center space-y-4">
                      <p className="text-text-secondary text-center">
                        ✅ Conexión lista. **Escanea el código** para vincular la cuenta.
                      </p>
                      <div className="p-4 bg-white rounded-lg shadow-xl w-60 h-60 flex items-center justify-center">
                        <img 
                          src={qrCodeImage} 
                          alt="WhatsApp QR Code" 
                          className="w-full h-full object-contain"
                          onError={(e) => {
                             e.currentTarget.style.display = 'none';
                             const parentDiv = e.currentTarget.parentElement;
                             if (parentDiv) {
                                 parentDiv.innerHTML = '<span class="text-text-muted text-sm">Error al cargar imagen.</span>';
                             }
                          }}
                        />
                      </div>
                      <p className="text-sm text-text-muted">Una vez escaneado, tu bot estará activo.</p>
                       <button 
                            onClick={handleGenerateQR}
                            className="text-accent-primary hover:underline text-sm mt-2 disabled:opacity-50"
                            disabled={isConnecting}
                        >
                            {isConnecting ? 'Recargando...' : 'Regenerar/Reintentar QR'}
                        </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-4">
                      <p className="text-text-secondary text-center">
                        Para activar tu bot en WhatsApp, debes **generar el código QR** y escanearlo.
                      </p>
                      <button
                        onClick={handleGenerateQR}
                        disabled={isConnecting}
                        className={`btn-primary flex items-center space-x-2 transition-all ${
                          isConnecting ? 'opacity-70 cursor-wait' : ''
                        }`}
                      >
                        {isConnecting ? (
                          <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Generando QR...</span>
                          </>
                        ) : (
                          <>
                            <span>Generar QR de Conexión</span>
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
              {/* Preview Section (Mantenido el estilo anterior) */}
              {formData.selectedChannels.length > 0 && (
                <div className="bg-background-secondary/50 rounded-lg p-6">
                  <h3 className="font-bold mb-4">Vista Previa del Chat</h3>
                  <div className="bg-background-primary rounded-lg p-4 max-w-md mx-auto">
                    <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-borders-default">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 bg-accent-primary/20 rounded-full flex items-center justify-center">
                          <Bot className="w-5 h-5 text-accent-primary" />
                        </div>
                      )}
                      <div>
                        <div className="font-semibold">{formData.companyName || 'Tu Empresa'}</div>
                        <div className="text-xs text-accent-primary">● En línea</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-background-secondary rounded-lg p-3 max-w-[80%]">
                        <p className="text-sm">¡Hola! 👋 Soy el asistente virtual de {formData.companyName || 'tu empresa'}. ¿En qué puedo ayudarte hoy?</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
{/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1 || isLoading}
            className={`btn-secondary flex items-center space-x-2 ${
              currentStep === 1 || isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Anterior</span>
          </button>
          {currentStep < 3 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!canProceed() || isLoading}
              className={`btn-primary flex items-center space-x-2 ${
                !canProceed() || isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <span>Siguiente</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
             <button
                onClick={handleCrearBot}
                disabled={!canProceed() || isLoading}
                className={`btn-primary flex items-center space-x-2 ${
                  !canProceed() || isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
               {isLoading ? (
                  <>
                     <Loader2 className="w-5 h-5 animate-spin" />
                     <span>Creando Bot...</span>
                  </>
               ) : (
                  <>
                     <span>Finalizar y Crear Bot</span>
                     <Check className="w-5 h-5" />
                  </>
               )}
             </button>
          )}
        </div>
      </div>
    </div>
  )
}