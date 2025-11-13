'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { updateProfile } from 'firebase/auth'
import Header from '@/app/components/header'
import { db, auth } from '@/lib/firebaseConfig'
import { useAuth } from '@/app/components/AuthProvider'
import { User, Mail, Phone, Building2, MapPin, Globe, FileText, Save, Loader2, CheckCircle, AlertCircle, Edit2, X } from 'lucide-react'
export default function PerfilPage() {
  const { currentUser } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    nombreUsuario: '',
    nombreEmpresa: '',
    ruc: '',
    emailContacto: '',
    telefono: '',
    direccion: '',
    sitioWeb: '',
    sector: '',
    descripcion: '',
    razonSocial: ''
  })
  useEffect(() => {
    if (!currentUser) {
      router.push('/login')
      return
    }
    cargarDatosUsuario()
  }, [currentUser, router])
  const cargarDatosUsuario = async () => {
    if (!currentUser) return
    try {
      const docRef = doc(db, 'empresas', currentUser.uid)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        setFormData({
          nombreUsuario: data.nombreUsuario || '',
          nombreEmpresa: data.nombreEmpresa || '',
          ruc: data.ruc || '',
          emailContacto: data.emailContacto || currentUser.email || '',
          telefono: data.telefono || '',
          direccion: data.direccion || '',
          sitioWeb: data.sitioWeb || '',
          sector: data.sector || '',
          descripcion: data.descripcion || '',
          razonSocial: data.razonSocial || ''
        })
      }
    } catch (error) {
      console.error('Error al cargar perfil:', error)
      setMessage({ type: 'error', text: 'Error al cargar los datos del perfil' })
    } finally {
      setIsLoading(false)
    }
  }
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  const handleSave = async () => {
    if (!currentUser) return
    
    setIsSaving(true)
    setMessage({ type: '', text: '' })
    try {
      const docRef = doc(db, 'empresas', currentUser.uid)
      await updateDoc(docRef, {
        nombreUsuario: formData.nombreUsuario,
        nombreEmpresa: formData.nombreEmpresa,
        telefono: formData.telefono,
        direccion: formData.direccion,
        sitioWeb: formData.sitioWeb,
        sector: formData.sector,
        descripcion: formData.descripcion,
        razonSocial: formData.razonSocial
      })
      if (formData.nombreUsuario && formData.nombreUsuario !== currentUser.displayName) {
        await updateProfile(currentUser, {
          displayName: formData.nombreUsuario
        })
      }
      setMessage({ type: 'success', text: '¡Perfil actualizado exitosamente!' })
      setIsEditing(false)
      await cargarDatosUsuario()
    } catch (error: any) {
      console.error('Error al actualizar:', error)
      setMessage({ type: 'error', text: `Error: ${error.message}` })
    } finally {
      setIsSaving(false)
    }
  }
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-accent-primary" />
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-background-primary">
      <Header />
      <div className="p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Mi Perfil</h1>
          <p className="text-text-secondary">Administra tu información personal y de empresa</p>
        </div>
        {/* Mensajes de feedback */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg border flex items-center space-x-3 ${
            message.type === 'success' 
              ? 'bg-green-500/10 border-green-500/20 text-green-500' 
              : 'bg-red-500/10 border-red-500/20 text-red-500'
          }`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <p>{message.text}</p>
          </div>
        )}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Sidebar - Foto de perfil */}
          <div className="md:col-span-1">
            <div className="glass-card p-6">
              <div className="flex flex-col items-center">
                {/* --- SECCIÓN DE IMAGEN MODIFICADA --- */}
                <div className="w-32 h-32 rounded-full bg-background-secondary flex items-center justify-center overflow-hidden mb-4">
                  <img
                    src="/images/user.jpeg"
                    alt="Avatar predeterminado"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* --- FIN DE SECCIÓN MODIFICADA --- */}
                <h3 className="text-xl font-bold mb-1 text-center">{formData.nombreUsuario || 'Usuario'}</h3>
                <p className="text-text-secondary text-sm text-center mb-4">{formData.emailContacto}</p>
                <div className="w-full space-y-2 text-sm">
                  <div className="flex items-center justify-between py-2 border-b border-borders-default">
                    <span className="text-text-muted">Empresa</span>
                    <span className="font-semibold">{formData.nombreEmpresa || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-borders-default">
                    <span className="text-text-muted">RUC</span>
                    <span className="font-semibold">{formData.ruc || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-text-muted">Rol</span>
                    <span className="px-2 py-1 bg-accent-primary/20 text-accent-primary rounded text-xs font-semibold">Admin</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Formulario principal */}
          <div className="md:col-span-2">
            <div className="glass-card p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Información de la Empresa</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Editar</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      cargarDatosUsuario()
                    }}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancelar</span>
                  </button>
                )}
              </div>
              <div className="space-y-6">
                {/* Datos personales */}
                <div>
                  <h3 className="font-semibold mb-4 flex items-center space-x-2">
                    <User className="w-5 h-5 text-accent-primary" />
                    <span>Datos de Contacto</span>
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Nombre de Usuario</label>
                      <input
                        type="text"
                        name="nombreUsuario"
                        value={formData.nombreUsuario}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="input-field w-full disabled:opacity-60"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Email</label>
                      <input
                        type="email"
                        name="emailContacto"
                        value={formData.emailContacto}
                        disabled
                        className="input-field w-full opacity-60 cursor-not-allowed"
                      />
                      <p className="text-xs text-text-muted mt-1">El email no se puede modificar</p>
                    </div>
                  </div>
                </div>
                {/* Datos de empresa */}
                <div className="border-t border-borders-default pt-6">
                  <h3 className="font-semibold mb-4 flex items-center space-x-2">
                    <Building2 className="w-5 h-5 text-accent-primary" />
                    <span>Datos de Empresa</span>
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Nombre de Empresa</label>
                      <input
                        type="text"
                        name="nombreEmpresa"
                        value={formData.nombreEmpresa}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="input-field w-full disabled:opacity-60"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">RUC</label>
                      <input
                        type="text"
                        name="ruc"
                        value={formData.ruc}
                        disabled
                        className="input-field w-full opacity-60 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Razón Social</label>
                      <input
                        type="text"
                        name="razonSocial"
                        value={formData.razonSocial}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="input-field w-full disabled:opacity-60"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Teléfono</label>
                      <input
                        type="tel"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="input-field w-full disabled:opacity-60"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold mb-2">Dirección</label>
                      <input
                        type="text"
                        name="direccion"
                        value={formData.direccion}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="input-field w-full disabled:opacity-60"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Sitio Web</label>
                      <input
                        type="url"
                        name="sitioWeb"
                        value={formData.sitioWeb}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="input-field w-full disabled:opacity-60"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Sector</label>
                      <select
                        name="sector"
                        value={formData.sector}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="input-field w-full disabled:opacity-60"
                      >
                        <option value="">Selecciona un sector</option>
                        <option value="tecnologia">Tecnología</option>
                        <option value="retail">Retail/Comercio</option>
                        <option value="servicios">Servicios</option>
                        <option value="otro">Otro</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold mb-2">Descripción</label>
                      <textarea
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        rows={4}
                        className="input-field w-full disabled:opacity-60"
                      />
                    </div>
                  </div>
                </div>
                {/* Botón de guardar */}
                {isEditing && (
                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="btn-primary flex items-center space-x-2"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Guardando...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          <span>Guardar Cambios</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}