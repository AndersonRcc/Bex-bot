'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthProvider'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebaseConfig'

type Theme = 'light' | 'dark'
interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark')
  const { currentUser } = useAuth()
  const [isLoaded, setIsLoaded] = useState(false)
  useEffect(() => {
    const loadTheme = async () => {
      if (currentUser) {
        try {
          const docRef = doc(db, 'empresas', currentUser.uid)
          const docSnap = await getDoc(docRef)
          if (docSnap.exists()) {
            const savedTheme = docSnap.data()?.preferences?.appearance?.theme || 'dark'
            setThemeState(savedTheme)
            applyTheme(savedTheme)
          } else {
            applyTheme('dark')
          }
        } catch (error) {
          console.error('Error cargando tema:', error)
          applyTheme('dark')
        }
      } else {
        applyTheme('dark')
      }
      setIsLoaded(true)
    }
    loadTheme()
  }, [currentUser])
  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement
    if (newTheme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.add('light')
      root.classList.remove('dark')
    }
  }
  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme)
    applyTheme(newTheme)

    if (currentUser) {
      try {
        const docRef = doc(db, 'empresas', currentUser.uid)
        await updateDoc(docRef, {
          'preferences.appearance.theme': newTheme
        })
        console.log('✅ Tema guardado en Firestore:', newTheme)
      } catch (error) {
        console.error('❌ Error guardando tema:', error)
      }
    }
  }
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-accent-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider')
  }
  return context
}