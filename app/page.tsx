'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Bot, MessageSquare, Zap, Shield, TrendingUp, CheckCircle, Star, ArrowRight, Sparkles, Menu, X, Settings, User, LogOut } from 'lucide-react'
import { useAuth } from '@/app/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebaseConfig';

export default function LandingPage() {
  const { currentUser, isLoadingAuth } = useAuth();
  const router = useRouter();
  const [showSettingsMenu, setShowSettingsMenu] = useState(false) 
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowSettingsMenu(false);
      console.log("Usuario desconectado");
      router.push('/login');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  }

  const userInitials = currentUser?.email?.substring(0, 2).toUpperCase() || 'U'

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-background-primary/80 backdrop-blur-xl border-b border-borders-default">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-lg flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold gradient-text">BexBot</span>
            </div>

            {/* Navegación de Escritorio */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-text-secondary hover:text-text-primary transition-colors">Características</a>
              <a href="#testimonials" className="text-text-secondary hover:text-text-primary transition-colors">Testimonios</a>
            </div>

            {/* Botones de Acción - Condicional según autenticación */}
            <div className="hidden md:flex items-center space-x-4">
              {isLoadingAuth ? (
                <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
              ) : currentUser ? (
                <div className="relative">
                  <button 
                    onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                    className="w-10 h-10 bg-accent-primary/20 rounded-lg flex items-center justify-center text-accent-primary font-bold hover:bg-accent-primary/30 transition-all cursor-pointer"
                  >
                    {userInitials}
                  </button>
                  
                  {showSettingsMenu && (
                    <>
                      {/* Overlay para cerrar el menú */}
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowSettingsMenu(false)}
                      />
                      
                      {/* Menú desplegable */}
                      <div className="absolute right-0 mt-2 w-56 bg-background-secondary border border-borders-default rounded-lg shadow-lg z-50 overflow-hidden">
                        <div className="px-4 py-3 border-b border-borders-default">
                          <p className="text-sm text-text-muted">Sesión iniciada</p>
                          <p className="text-sm font-semibold text-text-primary truncate">
                            {currentUser?.email}
                          </p>
                        </div>
                        
                        <Link
                          href="/dashboard"
                          onClick={() => setShowSettingsMenu(false)}
                          className="w-full px-4 py-3 text-left text-text-primary hover:bg-background-hover transition-colors flex items-center space-x-3"
                        >
                          <Bot className="w-4 h-4" />
                          <span>Dashboard</span>
                        </Link>
                        
                        <Link
                          href="/perfil"
                          onClick={() => setShowSettingsMenu(false)}
                          className="w-full px-4 py-3 text-left text-text-primary hover:bg-background-hover transition-colors flex items-center space-x-3"
                        >
                          <User className="w-4 h-4" />
                          <span>Mi Perfil</span>
                        </Link>
                        
                        <Link
                          href="/configuracion"
                          onClick={() => setShowSettingsMenu(false)}
                          className="w-full px-4 py-3 text-left text-text-primary hover:bg-background-hover transition-colors flex items-center space-x-3"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Configuración</span>
                        </Link>
                        
                        <div className="border-t border-borders-default">
                          <button
                            onClick={handleLogout}
                            className="w-full px-4 py-3 text-left text-red-400 hover:bg-background-hover transition-colors flex items-center space-x-3"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Cerrar Sesión</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <Link href="/login" className="btn-secondary">
                    <span>Iniciar Sesión</span>
                  </Link>
                  <Link href="/registro-empresa" className="btn-primary w-full flex items-center justify-center space-x-2">
                    <span>Registrar Empresa</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </>
              )}
            </div>
            {/* Botón de Menú Móvil */}
            <button className="md:hidden text-text-primary" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>
      </header>
      {/* Menú Móvil Desplegable */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-[69px] left-0 right-0 z-40 bg-background-card/95 backdrop-blur-xl border-b border-borders-default p-6 space-y-4 shadow-lg">
          <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-text-primary hover:text-accent-primary transition-colors text-lg">Características</a>
          <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="block text-text-primary hover:text-accent-primary transition-colors text-lg">Testimonios</a>
          <hr className="border-borders-default" />
          
          {/* Botones móviles condicionales */}
          {isLoadingAuth ? (
            <div className="flex justify-center py-4">
              <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : currentUser ? (
            <>
              <div className="bg-background-secondary/50 p-3 rounded-lg">
                <p className="text-xs text-text-muted">Sesión iniciada</p>
                <p className="text-sm font-semibold text-text-primary truncate">{currentUser?.email}</p>
              </div>
              <Link href="/dashboard" className="btn-primary w-full flex items-center justify-center space-x-2">
                <Bot className="w-4 h-4" />
                <span>Ir al Dashboard</span>
              </Link>
              <button onClick={handleLogout} className="btn-secondary w-full flex items-center justify-center space-x-2 text-red-400 hover:bg-red-400/10">
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-secondary w-full block text-center">
                <span>Iniciar Sesión</span>
              </Link>
              <Link href="/registro-empresa" className="btn-primary w-full flex items-center justify-center space-x-2">
                <span>Registrar Empresa</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      )}
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-primary/20 rounded-full blur-3xl animate-pulse-glow"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-secondary/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
        <div className="container mx-auto relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 bg-background-card/50 backdrop-blur-sm px-4 py-2 rounded-full border border-borders-default mb-8">
              <Sparkles className="w-4 h-4 text-accent-primary" />
              <span className="text-sm text-text-secondary">Potenciado por IA Avanzada</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Transforma tu atención al cliente con{' '}
              <span className="gradient-text">Bots Inteligentes</span>
            </h1>
            <p className="text-xl md:text-2xl text-text-secondary mb-12 max-w-3xl mx-auto leading-relaxed">
              BexBot es la plataforma SaaS líder que permite a empresas crear y desplegar bots conversacionales sin código en minutos.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
              <Link href={currentUser ? "/dashboard" : "/registro-empresa"} className="btn-primary text-lg px-8 py-4 flex items-center space-x-2 group">
                <span>{currentUser ? "Ir al Dashboard" : "Registrar Mi Empresa"}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              {!currentUser && (
                <Link href="/dashboard" className="btn-secondary text-lg px-8 py-4 flex items-center space-x-2">
                  <span>Ver Demo</span>
                </Link>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[
                { value: '10K+', label: 'Bots Activos' },
                { value: '5M+', label: 'Conversaciones' },
                { value: '98%', label: 'Satisfacción' },
                { value: '24/7', label: 'Disponibilidad' }
              ].map((stat, i) => (
                <div key={i} className="glass-card p-6">
                  <div className="text-3xl font-bold text-accent-primary mb-2">{stat.value}</div>
                  <div className="text-text-muted text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Why Choose Us */}
      <section className="py-20 px-6 bg-background-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              ¿Por qué elegir <span className="gradient-text">BexBot</span>?
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              Somos tu socio estratégico en la transformación digital de tu atención al cliente
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            {[
              {
                icon: <Zap className="w-7 h-7" />,
                title: 'Configuración en Minutos',
                description: 'Sin código, sin complicaciones. Wizard intuitivo para tener tu bot funcionando en menos de 5 minutos.'
              },
              {
                icon: <Shield className="w-7 h-7" />,
                title: 'Seguridad Empresarial',
                description: 'Cumplimiento GDPR, encriptación end-to-end. Tus datos y los de tus clientes están protegidos.'
              },
              {
                icon: <TrendingUp className="w-7 h-7" />,
                title: 'ROI Comprobado',
                description: 'Reducción del 70% en costos de soporte y aumento del 45% en satisfacción del cliente.'
              }
            ].map((item, i) => (
              <div key={i} className="glass-card p-8 hover:scale-105 transition-transform duration-300">
                <div className="w-14 h-14 bg-accent-primary/20 rounded-lg flex items-center justify-center mb-6 text-accent-primary">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                <p className="text-text-secondary leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
          <div className="glass-card p-8 md:p-12 max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold mb-6">Lo que nos hace únicos</h3>
                <div className="space-y-4">
                  {[
                    { title: 'IA Contextual Avanzada', desc: 'Comprende intenciones complejas y mantiene contexto' },
                    { title: 'Multicanal Nativo', desc: 'WhatsApp, Messenger, Web Widget - todo en una plataforma' },
                    { title: 'Integraciones Ilimitadas', desc: 'Conecta con tu CRM, ERP y herramientas favoritas' },
                    { title: 'Soporte Premium 24/7', desc: 'Equipo experto disponible siempre, en español' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-start space-x-3">
                      <CheckCircle className="w-6 h-6 text-accent-primary flex-shrink-0 mt-1" />
                      <div>
                        <div className="font-semibold mb-1">{item.title}</div>
                        <div className="text-text-muted text-sm">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-6">Resultados garantizados</h3>
                <div className="space-y-6">
                  {[
                    { label: 'Reducción de tickets', value: '-70%', color: 'accent-primary' },
                    { label: 'Tiempo de respuesta', value: '-85%', color: 'accent-secondary' },
                    { label: 'Satisfacción cliente', value: '+45%', color: 'accent-warning' }
                  ].map((metric, i) => (
                    <div key={i} className="bg-background-primary/50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-text-secondary">{metric.label}</span>
                        <span className={`text-${metric.color} font-bold`}>{metric.value}</span>
                      </div>
                      <div className="w-full bg-background-secondary rounded-full h-2">
                        <div className={`bg-${metric.color} h-2 rounded-full`} style={{ width: metric.value.replace(/[^0-9]/g, '') + '%' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Características <span className="gradient-text">Poderosas</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { icon: '🛍️', title: 'E-commerce', desc: 'Aumenta ventas con recomendaciones personalizadas' },
              { icon: '🏥', title: 'Salud', desc: 'Agenda citas y recordatorios automáticos 24/7' },
              { icon: '🎓', title: 'Educación', desc: 'Asistente virtual para estudiantes y cursos' },
              { icon: '💬', title: 'Atención al Cliente', desc: 'Respuestas instantáneas y escalamiento inteligente' },
              { icon: '🔧', title: 'Soporte Técnico', desc: 'Resolución de problemas y tickets automáticos' },
              { icon: '📊', title: 'Analytics', desc: 'Métricas en tiempo real y reportes detallados' }
            ].map((item, i) => (
              <div key={i} className="glass-card p-6 hover:scale-105 transition-all duration-300">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-text-secondary">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-6 bg-background-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Lo que dicen nuestros <span className="gradient-text">clientes</span>
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              Historias de éxito reales de empresas que crecen con BexBot.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { name: 'María González', role: 'CEO, TechShop', avatar: '👩‍💼', text: 'BexBot transformó nuestra atención al cliente. Tiempo de respuesta de horas a segundos.' },
              { name: 'Carlos Ruiz', role: 'Director, HealthCare+', avatar: '👨‍⚕️', text: 'Configuración impresionante. En una semana atendiendo citas. ROI inmediato.' },
              { name: 'Ana Martínez', role: 'Gerente, EduTech', avatar: '👩‍🎓', text: 'Soporte excepcional e integraciones perfectas. Ahora es parte esencial de nuestra operación.' }
            ].map((testimonial, i) => (
              <div key={i} className="glass-card p-8 hover:scale-105 transition-transform duration-300">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 fill-accent-warning text-accent-warning" />
                  ))}
                </div>
                <p className="text-text-secondary mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-accent-primary/20 rounded-full flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-text-muted">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* CTA Final - REVISADO PARA MEJOR COPYWRITING */}
      <section className="py-20 px-6 bg-background-secondary/30">
        <div className="container mx-auto">
          <div className="glass-card p-12 text-center max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Empieza a Ahorrar y Vender Más Hoy Mismo.
            </h2>
            <p className="text-xl text-text-secondary mb-8 font-light">
              Activa tu Demo Gratuita Ilimitada y mira cómo la IA de BexBot dispara tu eficiencia. Cero riesgo, Máximo potencial.
            </p>
            {currentUser ? (
              <Link href="/wizard" className="btn-primary text-lg px-10 py-4 inline-flex items-center space-x-2 group">
                <span>Crear Mi Primer Bot Ahora</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                <Link href="/registro-empresa" className="btn-primary text-lg px-10 py-4 inline-flex items-center space-x-2 group">
                  <span>🚀 Iniciar Transformación Gratuita</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <p className="text-sm text-text-muted mt-4">
                  Sin Tarjeta de Crédito • Despliega tu primer bot en 5 minutos • Resultados medibles.
                </p>
              </>
            )}
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="border-t border-borders-default py-12 px-6">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">BexBot</span>
          </div>
          <p className="text-text-muted text-sm">© 2025 BexBot. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}