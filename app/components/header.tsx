'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebaseConfig'
import { useAuth } from '@/app/components/AuthProvider'
import { Settings, Bot, LogOut, User , LayoutDashboard} from 'lucide-react'
import Link from 'next/link'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebaseConfig'

export default function Header() {
  const { currentUser } = useAuth()
  const [showSettingsMenu, setShowSettingsMenu] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const router = useRouter()
  const handleLogout = async () => {
    try {
      await signOut(auth)
      setShowSettingsMenu(false)
      console.log("Usuario desconectado")
      router.push('/login')
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }
    useEffect(() => {
      const cargarPerfil = async () => {
        if (currentUser) {
          try {
            const docRef = doc(db, 'empresas', currentUser.uid)
            const docSnap = await getDoc(docRef)
            if (docSnap.exists()) {
              setUserProfile(docSnap.data())
            }
          } catch (error) {
            console.error("Error al cargar perfil:", error)
          }
        }
      }
      cargarPerfil()
    }, [currentUser])
    const userInitials = userProfile?.nombreUsuario?.substring(0, 2).toUpperCase() 
                        || currentUser?.email?.substring(0, 2).toUpperCase() 
                        || 'U'

  return (
    <header className="bg-background-secondary border-b border-borders-default sticky top-0 z-40">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo y navegación */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-lg flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold gradient-text">BexBot</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-6 ml-8">
              <Link href="/dashboard" className="text-text-secondary hover:text-text-primary transition-colors">
                Dashboard
              </Link>
              <Link href="/bots" className="text-text-secondary hover:text-text-primary transition-colors">
                Mis Bots
              </Link>
              <Link href="/analytics" className="text-text-secondary hover:text-text-primary transition-colors">
                Analytics
              </Link>
              <Link href="/integrations" className="text-text-secondary hover:text-text-primary transition-colors">
                Mi Información
              </Link>
            </nav>
          </div>

          {/* Acciones del usuario */}
          <div className="flex items-center space-x-4">
            {/* Menú desplegable de configuración */}
            {/* Avatar con menú desplegable */}
            <div className="relative">
              <button 
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                className="w-10 h-10 bg-accent-primary/20 rounded-lg flex items-center justify-center text-accent-primary font-bold hover:bg-accent-primary/30 transition-all cursor-pointer"
              >
                {userInitials}
              </button>
              
              {showSettingsMenu && (
                <>
                  {/* Overlay para cerrar el menú al hacer clic fuera */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowSettingsMenu(false)}
                  />
                  
                  {/* Menú desplegable */}
                  <div className="absolute right-0 mt-2 w-56 bg-background-secondary border border-borders-default rounded-lg shadow-lg z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-borders-default">
                      <p className="text-sm text-text-muted">Sesión iniciada como</p>
                      <p className="text-sm font-semibold text-text-primary truncate">
                        {currentUser?.email}
                      </p>
                    </div>
                    
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
          </div>
        </div>
      </div>
    </header>
  )
}