import { AuthProvider } from '@/app/components/AuthProvider'; // Ajusta la ruta si es necesario
import type { Metadata } from 'next';
import { ThemeProvider } from '@/app/components/ThemeProvider';
import { Inter } from 'next/font/google';
import '@/app/globals.css';
const inter = Inter({ subsets: ['latin'] });
export const metadata: Metadata = {
    title: 'BexBot - Plataforma de Bots Conversacionales',
    description: 'Crea y configura bots conversacionales inteligentes para tu negocio',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}