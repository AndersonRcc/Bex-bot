'use client'
import { useState } from 'react'
import { Mail, Lock, LogIn, Loader2, Bot } from 'lucide-react'
import Link from 'next/link'
import { Eye, EyeOff, /* otros iconos */ } from 'lucide-react';
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth, db, timestamp } from '@/lib/firebaseConfig'
import { doc, updateDoc } from 'firebase/firestore'
export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      await updateDoc(doc(db, 'empresas', user.uid), {
        ultimoLogin: timestamp()
      });
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Error al iniciar sesión:', err)
      setError(`Credenciales inválidas. ${err.message.replace('Firebase:', '')}`)
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-primary px-4">
      <div className="glass-card p-8 md:p-12 w-full max-w-md">
        {/* Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-12 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-lg flex items-center justify-center mb-3">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">BexBot Login</h1>
          <p className="text-text-secondary">Accede a tu plataforma de gestión de bots</p>
        </div>
        {/* Formulario */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email */}
          <div>
            <label className="text-sm font-medium block mb-2" htmlFor="email">Email</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field w-full pl-10"
                placeholder="tu.correo@empresa.com"
                required
              />
            </div>
          </div>
          {/* Contraseña */}
          <div>
            <label className="text-sm font-medium block mb-2" htmlFor="password">Contraseña</label>
            <div className="relative"> {/* Envuelve en div relativo */}
              <Lock className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field w-full pl-10 pr-10"
                placeholder="Ingresa tu contraseña"
                required
              />
              {/* Botón para mostrar/ocultar */}
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
          </div>
          {/* Error */}
          {error && <p className="text-red-500 text-center text-sm">{error}</p>}
          {/* Botón de Login */}
          <button
            type="submit"
            className="btn-primary w-full flex items-center justify-center space-x-2 py-3"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            <span>{isLoading ? 'Accediendo...' : 'Iniciar Sesión'}</span>
          </button>
        </form>
        {/* Footer Link */}
        <p className="text-center text-sm text-text-secondary mt-6">
          ¿Aún no tienes cuenta?{' '}
          <Link href="/registro-empresa" className="text-accent-primary font-semibold hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  )
}