'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { useTheme } from '@/app/components/ThemeProvider'
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider, deleteUser } from 'firebase/auth'
import { db, auth } from '@/lib/firebaseConfig'
import { useAuth } from '@/app/components/AuthProvider'
import { 
  Lock, Trash2, Eye, EyeOff, Save, Loader2, 
  CheckCircle, AlertCircle, Settings as SettingsIcon, 
  Moon, Sun, X
} from 'lucide-react'
import Header from '@/app/components/header'
type PreferencesState = {
  appearance: {
    theme: string;
    language: string;
  };
};
const ToggleSwitch = ({ enabled, onChange, labelId }: { enabled: boolean, onChange: () => void, labelId: string }) => (
  <button
    type="button"
    role="switch"
    aria-checked={enabled}
    aria-labelledby={labelId}
    onClick={onChange}
    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
      enabled ? 'bg-accent-primary' : 'bg-borders-default'
    }`}
  >
    <span
      aria-hidden="true"
      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
        enabled ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
)
export default function ConfiguracionPage() {
  const { currentUser } = useAuth()
  const { theme, setTheme } = useTheme() 
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [activeTab, setActiveTab] = useState('general')
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [preferences, setPreferences] = useState<PreferencesState>({
    appearance: {
      theme: 'dark',
      language: 'es'
    }
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  useEffect(() => {
    if (!currentUser) {
      router.push('/login')
      return
    }
    cargarConfiguracion()
  }, [currentUser, router])

  const cargarConfiguracion = async () => {
    if (!currentUser) return
    try {
      const docRef = doc(db, 'empresas', currentUser.uid)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        if (data.preferences) {
          setPreferences(prev => ({
            ...prev,
            appearance: { 
              ...prev.appearance, 
              ...data.preferences?.appearance 
            }
          }))
        }
      }
    } catch (error) {
      console.error('Error al cargar configuración:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (!currentUser) return
    setMessage({ type: '', text: '' })
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Completa todos los campos' })
      return
    }
    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'La nueva contraseña debe tener al menos 6 caracteres' })
      return
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' })
      return
    }
    setIsChangingPassword(true)
    try {
      const credential = EmailAuthProvider.credential(
        currentUser.email!,
        passwordData.currentPassword
      )
      await reauthenticateWithCredential(currentUser, credential)
      await updatePassword(currentUser, passwordData.newPassword)
      setMessage({ type: 'success', text: '¡Contraseña actualizada exitosamente!' })
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error: any) {
      console.error('Error al cambiar contraseña:', error)
      if (error.code === 'auth/wrong-password') {
        setMessage({ type: 'error', text: 'Contraseña actual incorrecta' })
      } else {
        setMessage({ type: 'error', text: `Error: ${error.message}` })
      }
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!currentUser || deleteConfirmText !== 'ELIMINAR') {
      setMessage({ type: 'error', text: 'Escribe "ELIMINAR" para confirmar' })
      return
    }

    try {
      const docRef = doc(db, 'empresas', currentUser.uid)
      await updateDoc(docRef, { deleted: true, deletedAt: new Date().toISOString() }) // Eliminación lógica
      await deleteUser(currentUser)
      router.push('/')
    } catch (error: any) {
      console.error('Error al eliminar cuenta:', error)
      setMessage({ type: 'error', text: 'Error al eliminar la cuenta. Cierra sesión y vuelve a intentarlo.' })
    }
  }
const handlePrefChange = <
    C extends keyof PreferencesState,
    K extends keyof PreferencesState[C]
  >(category: C, key: K, value: PreferencesState[C][K]) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }))
  }
  const tabs = [
    { id: 'general', label: 'General', icon: <SettingsIcon className="w-5 h-5" /> },
    { id: 'security', label: 'Seguridad', icon: <Lock className="w-5 h-5" /> },
    { id: 'danger', label: 'Zona de Peligro', icon: <Trash2 className="w-5 h-5" /> }
  ]
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-accent-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-primary">
      <Header /> {/* <-- 2. AÑADIR EL HEADER AQUÍ */}
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header de la página */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Configuración</h1>
          <p className="text-text-secondary">Administra la configuración de tu cuenta y preferencias</p>
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
        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar de tabs */}
          <div className="md:col-span-1">
            <div className="glass-card p-4 space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setMessage({ type: '', text: '' })
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-accent-primary text-white'
                      : 'text-text-secondary hover:bg-background-hover'
                  }`}
                >
                  {tab.icon}
                  <span className="font-semibold">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
          {/* Contenido principal */}
          <div className="md:col-span-3">
            {/* --- INICIO TAB: GENERAL --- */}
            {activeTab === 'general' && (
              <div className="glass-card p-6 md:p-8">
                <h2 className="text-2xl font-bold mb-6">Configuración General</h2>
                {/* Apariencia */}
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center space-x-2">
                      {preferences.appearance.theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                      <span>Apariencia</span>
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-background-secondary rounded-lg">
                        <div>
                          <p className="font-semibold">Tema</p>
                          <p className="text-sm text-text-muted">Selecciona el tema visual</p>
                        </div>
                        <select
                          value={theme}
                          onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
                          className="input-field w-32"
                        >
                          <option value="dark">Oscuro</option>
                          <option value="light">Claro</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-background-secondary rounded-lg">
                        <div>
                          <p className="font-semibold">Idioma</p>
                          <p className="text-sm text-text-muted">Idioma de la interfaz</p>
                        </div>
                        <select
                          value={preferences.appearance.language}
                          onChange={(e) => handlePrefChange('appearance', 'language', e.target.value)}
                          className="input-field w-32"
                          disabled
                        >
                          <option value="es">Español</option>
                        </select>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}
            {/* --- FIN TAB: GENERAL --- */}
            {/* --- INICIO TAB: SEGURIDAD --- */}
            {activeTab === 'security' && (
              <div className="glass-card p-6 md:p-8">
                <h2 className="text-2xl font-bold mb-6">Seguridad de la Cuenta</h2>
                <div className="space-y-6">
                  {/* Contraseña Actual */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Contraseña Actual</label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        className="input-field w-full pr-10"
                      />
                      <button
                        onClick={() => setShowPasswords(p => ({...p, current: !p.current}))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
                      >
                        {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  {/* Nueva Contraseña */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Nueva Contraseña</label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        className="input-field w-full pr-10"
                      />
                      <button
                        onClick={() => setShowPasswords(p => ({...p, new: !p.new}))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
                      >
                        {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  {/* Confirmar Nueva Contraseña */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Confirmar Nueva Contraseña</label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        className="input-field w-full pr-10"
                      />
                      <button
                        onClick={() => setShowPasswords(p => ({...p, confirm: !p.confirm}))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
                      >
                        {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  {/* Botón de guardar */}
                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handlePasswordChange}
                      disabled={isChangingPassword}
                      className="btn-primary flex items-center space-x-2"
                    >
                      {isChangingPassword ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Save className="w-5 h-5" />
                      )}
                      <span>Actualizar Contraseña</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* --- FIN TAB: SEGURIDAD --- */}
            {/* --- INICIO TAB: ZONA DE PELIGRO --- */}
            {activeTab === 'danger' && (
              <div className="glass-card border border-red-500/30 p-6 md:p-8 space-y-4">
                <h2 className="text-2xl font-bold text-red-400">Zona de Peligro</h2>
                <p className="text-text-secondary">
                  Eliminar tu cuenta borrará permanentemente tu perfil, tus bots y todos tus datos. 
                  Esta acción es irreversible.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="btn-danger flex items-center space-x-2"
                  >
                    <Trash2 className="w-5 h-5" />
                    <span>Eliminar mi cuenta</span>
                  </button>
                </div>
              </div>
            )}
            {/* --- FIN TAB: ZONA DE PELIGRO --- */}

          </div>
        </div>
      </div>
      {/* --- INICIO MODAL: ELIMINAR CUENTA --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="glass-card p-6 rounded-lg shadow-lg max-w-md w-full m-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-red-400">Eliminar Cuenta Permanentemente</h3>
              <button onClick={() => setShowDeleteModal(false)} className="text-text-muted hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-text-secondary mb-4">
              Esta acción no se puede deshacer. Para confirmar, escribe 
              <strong className="text-red-400 mx-1">ELIMINAR</strong> en el campo de abajo.
            </p>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="ELIMINAR"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="input-field w-full"
              />
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'ELIMINAR'}
                className="btn-danger w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Eliminar esta cuenta
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary w-full"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* --- FIN MODAL: ELIMINAR CUENTA --- */}
    </div>
  )
}