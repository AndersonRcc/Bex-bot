'use client'
import { useState } from 'react'
import { CheckCircle, Plus, Trash2, Loader2, ArrowLeft, ArrowRight, Bot, Building2, Package, FileText, DollarSign, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, /* otros iconos */ } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth, db, timestamp } from '@/lib/firebaseConfig'
import Link from 'next/link'
import { serverTimestamp } from 'firebase/firestore'
const initialStep1Data = {
  nombreEmpresa: '',
  ruc: '',
  emailContacto: '',
  password: '',
  razonSocial: '',
  direccion: '',
  telefono: '',
  sitioWeb: '',
  sector: '',
  descripcion: ''
}
const initialStep4Data = {
  horarioAtencion: '',
  metodosPago: [] as string[],
  politicasDevolucion: '',
  tiempoEntrega: '',
  coberturaEntrega: '',
}
export default function RegistroEmpresa() {
  const [currentStep, setCurrentStep] = useState(1)
  const [step1Data, setStep1Data] = useState(initialStep1Data)
  const [products, setProducts] = useState([{ id: Date.now().toString(), nombre: '', descripcion: '', precio: '' }])
  const [services, setServices] = useState([{ id: Date.now().toString(), nombre: '', descripcion: '', excepciones: '' }])
  const [step4Data, setStep4Data] = useState(initialStep4Data)
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const handleStep1Change = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setStep1Data(prev => ({ ...prev, [name]: value }))
  }
  const addProduct = () => {
    setProducts([...products, { id: Date.now().toString(), nombre: '', descripcion: '', precio: '' }])
  }
  const removeProduct = (id: string) => {
    if (products.length > 1) {
      setProducts(products.filter(p => p.id !== id))
    }
  }
  const handleProductChange = (id: string, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProducts(products.map(p => p.id === id ? { ...p, [name]: value } : p))
  }
  const addService = () => {
    setServices([...services, { id: Date.now().toString(), nombre: '', descripcion: '', excepciones: '' }])
  }
  const removeService = (id: string) => {
    if (services.length > 1) {
      setServices(services.filter(s => s.id !== id))
    }
  }
  const handleServiceChange = (id: string, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setServices(services.map(s => s.id === id ? { ...s, [name]: value } : s))
  }
  const handleStep4Change = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setStep4Data(prev => ({ ...prev, [name]: value }))
  }
  const handlePagoChange = (metodo: string) => {
    setStep4Data(prev => {
      const newMetodos = prev.metodosPago.includes(metodo)
        ? prev.metodosPago.filter(m => m !== metodo)
        : [...prev.metodosPago, metodo]
      return { ...prev, metodosPago: newMetodos }
    })
  }
  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }
  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!step1Data.emailContacto || !step1Data.password || !step1Data.nombreEmpresa || !step1Data.ruc) {
    setCurrentStep(1)
    setError('Por favor, completa todos los campos obligatorios del primer paso.')
    return
  }
  setIsLoading(true)
  setError('')
  setSuccess('')
  try {
    console.log("🔵 Iniciando registro...")
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      step1Data.emailContacto,
      step1Data.password
    )
    const user = userCredential.user
    const uid = user.uid
    console.log("✅ Usuario creado en Auth:", uid)
    const empresaData = {
      nombreEmpresa: step1Data.nombreEmpresa,
      ruc: step1Data.ruc,
      emailContacto: step1Data.emailContacto,
      razonSocial: step1Data.razonSocial || '',
      direccion: step1Data.direccion || '',
      telefono: step1Data.telefono || '',
      sitioWeb: step1Data.sitioWeb || '',
      sector: step1Data.sector || '',
      descripcion: step1Data.descripcion || '',
      products: products
        .filter(p => p.nombre && p.nombre.trim() !== '')
        .map(p => ({
          id: p.id,
          nombre: p.nombre.trim(),
          descripcion: p.descripcion ? p.descripcion.trim() : '',
          precio: p.precio ? p.precio.toString() : '0'
        })),
      services: services
        .filter(s => s.nombre && s.nombre.trim() !== '')
        .map(s => ({
          id: s.id,
          nombre: s.nombre.trim(),
          descripcion: s.descripcion ? s.descripcion.trim() : '',
          excepciones: s.excepciones ? s.excepciones.trim() : ''
        })),
      horarioAtencion: step4Data.horarioAtencion || '',
      metodosPago: Array.isArray(step4Data.metodosPago) ? step4Data.metodosPago : [],
      politicasDevolucion: step4Data.politicasDevolucion || '',
      tiempoEntrega: step4Data.tiempoEntrega || '',
      coberturaEntrega: step4Data.coberturaEntrega || '',
      userId: uid,
      fechaRegistro: new Date().toISOString(),
      nombreUsuario: step1Data.nombreEmpresa,
      rol: 'admin',
      botsAsignados: [],
      preferences: {
        appearance: {
          theme: 'dark',
          language: 'es'
        }
      }
    }
    console.log("📦 Datos preparados:", empresaData)
    const docRef = doc(db, 'empresas', uid)
    await setDoc(docRef, empresaData)
    console.log("✅ Datos guardados exitosamente en Firestore")
    setSuccess('¡Registro completado! Redirigiendo al Dashboard...')
    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)

  } catch (err: any) {
    console.error('❌ Error completo:', err)
    console.error('❌ Código de error:', err.code)
    console.error('❌ Mensaje:', err.message)
    if (err.code === 'auth/email-already-in-use') {
      setError('Este correo ya está registrado.')
    } else if (err.code === 'auth/weak-password') {
      setError('La contraseña debe tener al menos 6 caracteres.')
    } else if (err.code === 'auth/invalid-email') {
      setError('El correo electrónico no es válido.')
    } else if (err.code === 'permission-denied') {
      setError('Error de permisos. Verifica las reglas de Firestore.')
    } else {
      setError(`Error al registrar: ${err.message}`)
    }
  } finally {
    setIsLoading(false)
  }
}
  return (
    <div className="min-h-screen bg-background-primary">
      {/* Header */}
      <header className="bg-background-secondary border-b border-borders-default sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-lg flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold gradient-text">BexBot</span>
            </Link>
            <Link href="/" className="text-text-secondary hover:text-text-primary transition-colors flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Volver</span>
            </Link>
          </div>
        </div>
      </header>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    currentStep >= s ? 'bg-accent-primary text-white' : 'bg-background-secondary text-text-muted'
                    }`}>
                    {s}
                    </div>
                    {s < 4 && (
                    <div className={`flex-1 h-1 mx-2 transition-all ${
                        currentStep > s ? 'bg-accent-primary' : 'bg-background-secondary'
                    }`}></div>
                    )}
                </div>
                ))}
            </div>
            <div className="flex items-center justify-between text-sm">
                <span className={currentStep >= 1 ? 'text-text-primary font-semibold' : 'text-text-muted'}>Datos de Empresa</span>
                <span className={currentStep >= 2 ? 'text-text-primary font-semibold' : 'text-text-muted'}>Productos</span>
                <span className={currentStep >= 3 ? 'text-text-primary font-semibold' : 'text-text-muted'}>Servicios</span>
                <span className={currentStep >= 4 ? 'text-text-primary font-semibold' : 'text-text-muted'}>Info Adicional</span>
            </div>
        </div>
        {/* Form Content */}
        <div className="glass-card p-8">
            {currentStep === 1 && (
                <div>
                    <div className="flex items-center space-x-3 mb-6">
                        <Building2 className="w-8 h-8 text-accent-primary" />
                        <h2 className="text-2xl font-bold">Información de la Empresa</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <input name="nombreEmpresa" value={step1Data.nombreEmpresa} onChange={handleStep1Change} placeholder="Nombre de la Empresa *" className="input-field" required/>
                        <input name="ruc" value={step1Data.ruc} onChange={handleStep1Change} placeholder="RUC *" className="input-field" maxLength={11} required/>
                        <input type="email" name="emailContacto" value={step1Data.emailContacto} onChange={handleStep1Change} placeholder="Email de Contacto *" className="input-field" required/>
                        {/* En el paso 1, reemplaza el input de contraseña por esto: */}
                        <div className="relative">
                          <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={step1Data.password}
                            onChange={(e) => setStep1Data({ ...step1Data, password: e.target.value })}
                            className="input-field w-full pr-10"
                            placeholder="Contraseña segura"
                            required
                            minLength={6}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-secondary hover:text-text-primary"
                            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                          >
                            {showPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                        <input name="razonSocial" value={step1Data.razonSocial} onChange={handleStep1Change} placeholder="Razón Social" className="input-field"/>
                        <input name="direccion" value={step1Data.direccion} onChange={handleStep1Change} placeholder="Dirección" className="input-field md:col-span-2"/>
                        <input type="tel" name="telefono" value={step1Data.telefono} onChange={handleStep1Change} placeholder="Teléfono" className="input-field"/>
                        <input type="url" name="sitioWeb" value={step1Data.sitioWeb} onChange={handleStep1Change} placeholder="Sitio Web" className="input-field"/>
                        <select name="sector" value={step1Data.sector} onChange={handleStep1Change} className="input-field">
                            <option value="">Selecciona un sector</option>
                            <option value="tecnologia">Tecnología</option>
                            <option value="retail">Retail/Comercio</option>
                            <option value="servicios">Servicios</option>
                            <option value="otro">Otro</option>
                        </select>
                        <textarea name="descripcion" value={step1Data.descripcion} onChange={handleStep1Change} placeholder="Descripción de la Empresa" className="input-field md:col-span-2" rows={4}/>
                    </div>
                </div>
            )}
            {currentStep === 2 && (
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <Package className="w-8 h-8 text-accent-primary" />
                            <h2 className="text-2xl font-bold">Productos</h2>
                        </div>
                        <button onClick={addProduct} type="button" className="btn-primary flex items-center space-x-2">
                            <Plus className="w-4 h-4" /><span>Agregar Producto</span>
                        </button>
                    </div>
                    <div className="space-y-6">
                        {products.map((p, index) => (
                            <div key={p.id} className="bg-background-secondary p-6 rounded-lg border border-borders-default">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-lg">Producto {index + 1}</h3>
                                    {products.length > 1 && <button onClick={() => removeProduct(p.id)} type="button" className="text-accent-error hover:text-red-500"><Trash2 className="w-5 h-5"/></button>}
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <input name="nombre" value={p.nombre} onChange={(e) => handleProductChange(p.id, e)} placeholder="Nombre del Producto" className="input-field"/>
                                    <input
                                      name="precio"
                                      value={p.precio}
                                      onChange={(e) => handleProductChange(p.id, e)}
                                      placeholder="Precio (Ej: 5000)"
                                      type="number"
                                      min="0"
                                      className="input-field"
                                    />
                                    <textarea name="descripcion" value={p.descripcion} onChange={(e) => handleProductChange(p.id, e)} placeholder="Descripción" className="input-field md:col-span-2" rows={3}/>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {currentStep === 3 && (
                <div>
                    <div className="flex items-center justify-between mb-6">
                         <div className="flex items-center space-x-3">
                            <FileText className="w-8 h-8 text-accent-primary" />
                            <h2 className="text-2xl font-bold">Servicios</h2>
                        </div>
                        <button onClick={addService} type="button" className="btn-primary flex items-center space-x-2">
                            <Plus className="w-4 h-4" /><span>Agregar Servicio</span>
                        </button>
                    </div>
                    <div className="space-y-6">
                        {services.map((s, index) => (
                             <div key={s.id} className="bg-background-secondary p-6 rounded-lg border border-borders-default">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-lg">Servicio {index + 1}</h3>
                                    {services.length > 1 && <button onClick={() => removeService(s.id)} type="button" className="text-accent-error hover:text-red-500"><Trash2 className="w-5 h-5"/></button>}
                                </div>
                                <div className="space-y-4">
                                    <input name="nombre" value={s.nombre} onChange={(e) => handleServiceChange(s.id, e)} placeholder="Nombre del Servicio" className="input-field"/>
                                    <textarea name="descripcion" value={s.descripcion} onChange={(e) => handleServiceChange(s.id, e)} placeholder="Descripción del Servicio" className="input-field" rows={3}/>
                                    <textarea name="excepciones" value={s.excepciones} onChange={(e) => handleServiceChange(s.id, e)} placeholder="Excepciones o políticas especiales (opcional)" className="input-field" rows={2}/>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {currentStep === 4 && (
                <form onSubmit={handleSubmit}>
                    <div className="flex items-center space-x-3 mb-6">
                        <DollarSign className="w-8 h-8 text-accent-primary" />
                        <h2 className="text-2xl font-bold">Información Adicional</h2>
                    </div>
                     <div className="space-y-6">
                        <input name="horarioAtencion" value={step4Data.horarioAtencion} onChange={handleStep4Change} placeholder="Horario de Atención (Ej: L-V 9am-6pm)" className="input-field"/>
                        <div>
                            <label className="block text-sm font-semibold mb-3">Métodos de Pago Aceptados</label>
                            <div className="grid md:grid-cols-3 gap-3">
                                {['Efectivo', 'Tarjeta de Crédito', 'Tarjeta de Débito', 'Yape', 'Plin', 'Transferencia'].map(m => (
                                    <label key={m} className="flex items-center space-x-2 cursor-pointer">
                                        <input type="checkbox" checked={step4Data.metodosPago.includes(m)} onChange={() => handlePagoChange(m)} className="w-4 h-4 text-accent-primary bg-background-secondary border-borders-default rounded focus:ring-accent-primary"/>
                                        <span>{m}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <textarea name="politicasDevolucion" value={step4Data.politicasDevolucion} onChange={handleStep4Change} placeholder="Políticas de Devolución" className="input-field" rows={4}/>
                        <input name="tiempoEntrega" value={step4Data.tiempoEntrega} onChange={handleStep4Change} placeholder="Tiempo de Entrega (Ej: 24-48h Lima)" className="input-field"/>
                        <input name="coberturaEntrega" value={step4Data.coberturaEntrega} onChange={handleStep4Change} placeholder="Cobertura de Entrega (Ej: Lima Metropolitana)" className="input-field"/>
                    </div>
                    {/* Feedback Messages & Submit Button */}
                    <div className="mt-8">
                      {error && (
                        <div className="text-center p-3 mb-4 rounded-md bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center space-x-2">
                          <AlertCircle className="w-5 h-5" />
                          <p>{error}</p>
                        </div>
                      )}
                      {success && (
                          <div className="text-center p-3 mb-4 rounded-md bg-green-500/10 border border-green-500/20 text-green-500">
                              <p>{success}</p>
                          </div>
                      )}
                      <div className="flex justify-between">
                          <button type="button" onClick={handlePrev} className="btn-secondary flex items-center space-x-2">
                              <ArrowLeft className="w-4 h-4" />
                              <span>Anterior</span>
                          </button>
                          <button type="submit" className="btn-primary flex items-center space-x-2" disabled={isLoading}>
                              {isLoading ? (
                                  <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                  <CheckCircle className="w-5 h-5" />
                              )}
                              <span>{isLoading ? 'Registrando...' : 'Finalizar Registro'}</span>
                          </button>
                      </div>
                    </div>
                </form>
            )}
        </div>
        {/* Navigation Buttons (for steps 1-3) */}
        {currentStep < 4 && (
            <div className="flex items-center justify-between mt-8">
                <button
                    onClick={handlePrev}
                    disabled={currentStep === 1}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2">
                    <ArrowLeft className="w-4 h-4" />
                    <span>Anterior</span>
                </button>
                <button onClick={handleNext} className="btn-primary flex items-center space-x-2">
                    <span>Siguiente</span>
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        )}
      </div>
    </div>
  )
}