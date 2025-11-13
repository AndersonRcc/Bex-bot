'use client'
import { useState } from 'react'
import { Bot, Search, Filter, ShoppingBag, GraduationCap, Heart, Building2, Briefcase, Utensils, Star, Eye } from 'lucide-react'
import Link from 'next/link'
const templates = [
  {
    id: 1,
    name: 'E-commerce Pro',
    category: 'retail',
    icon: '🛍️',
    description: 'Bot completo para tiendas online con catálogo, carrito y pagos',
    features: ['Catálogo de productos', 'Carrito de compras', 'Seguimiento de pedidos', 'Recomendaciones IA'],
    rating: 4.9,
    uses: 1234,
    preview: 'https://via.placeholder.com/400x300'
  },
  {
    id: 2,
    name: 'Soporte Técnico',
    category: 'support',
    icon: '🔧',
    description: 'Resuelve problemas técnicos y crea tickets automáticamente',
    features: ['Diagnóstico automático', 'Base de conocimiento', 'Creación de tickets', 'Escalamiento inteligente'],
    rating: 4.8,
    uses: 856,
    preview: 'https://via.placeholder.com/400x300'
  },
  {
    id: 3,
    name: 'Salud & Wellness',
    category: 'health',
    icon: '🏥',
    description: 'Agenda citas médicas y brinda información de salud',
    features: ['Agendamiento de citas', 'Recordatorios', 'Consultas básicas', 'Historial médico'],
    rating: 4.9,
    uses: 642,
    preview: 'https://via.placeholder.com/400x300'
  },
  {
    id: 4,
    name: 'Educación Online',
    category: 'education',
    icon: '🎓',
    description: 'Asistente para instituciones educativas y cursos online',
    features: ['Información de cursos', 'Inscripciones', 'Soporte a estudiantes', 'Calendario académico'],
    rating: 4.7,
    uses: 523,
    preview: 'https://via.placeholder.com/400x300'
  },
  {
    id: 5,
    name: 'Restaurante & Delivery',
    category: 'food',
    icon: '🍔',
    description: 'Toma pedidos y reservaciones para restaurantes',
    features: ['Menú digital', 'Pedidos online', 'Reservaciones', 'Delivery tracking'],
    rating: 4.8,
    uses: 789,
    preview: 'https://via.placeholder.com/400x300'
  },
  {
    id: 6,
    name: 'Inmobiliaria',
    category: 'realestate',
    icon: '🏠',
    description: 'Muestra propiedades y agenda visitas automáticamente',
    features: ['Catálogo de propiedades', 'Búsqueda avanzada', 'Agendar visitas', 'Calculadora de hipoteca'],
    rating: 4.6,
    uses: 412,
    preview: 'https://via.placeholder.com/400x300'
  }
]
const categories = [
  { id: 'all', name: 'Todos', icon: <Filter className="w-4 h-4" /> },
  { id: 'retail', name: 'Retail', icon: <ShoppingBag className="w-4 h-4" /> },
  { id: 'education', name: 'Educación', icon: <GraduationCap className="w-4 h-4" /> },
  { id: 'health', name: 'Salud', icon: <Heart className="w-4 h-4" /> },
  { id: 'realestate', name: 'Inmobiliaria', icon: <Building2 className="w-4 h-4" /> },
  { id: 'support', name: 'Soporte', icon: <Briefcase className="w-4 h-4" /> },
  { id: 'food', name: 'Restaurantes', icon: <Utensils className="w-4 h-4" /> }
]
export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })
  return (
    <div className="min-h-screen bg-background-primary">
      {/* Header */}
      <header className="bg-background-secondary border-b border-borders-default sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-lg flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold gradient-text">BexBot</span>
              </Link>
              <nav className="hidden md:flex items-center space-x-6 ml-8">
                <Link href="/dashboard" className="text-text-secondary hover:text-text-primary transition-colors">Dashboard</Link>
                <Link href="/templates" className="text-text-primary font-semibold">Templates</Link>
                <Link href="/analytics" className="text-text-secondary hover:text-text-primary transition-colors">Analytics</Link>
              </nav>
            </div>
          </div>
        </div>
      </header>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Biblioteca de <span className="gradient-text">Templates</span>
          </h1>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto">
            Comienza rápido con templates prediseñados por industria. Personaliza y despliega en minutos.
          </p>
        </div>
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              placeholder="Buscar templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field w-full pl-12 py-3"
            />
          </div>
          {/* Category Filters */}
          <div className="flex items-center justify-center flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  selectedCategory === category.id
                    ? 'bg-accent-primary text-white'
                    : 'bg-background-secondary text-text-secondary hover:bg-background-hover'
                }`}
              >
                {category.icon}
                <span className="font-semibold">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="glass-card overflow-hidden hover:scale-105 transition-transform duration-300">
              {/* Preview Image */}
              <div className="h-48 bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 flex items-center justify-center">
                <div className="text-6xl">{template.icon}</div>
              </div>
              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold">{template.name}</h3>
                  <div className="flex items-center space-x-1 text-accent-warning">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-semibold">{template.rating}</span>
                  </div>
                </div>
                <p className="text-text-secondary text-sm mb-4">{template.description}</p>
                {/* Features */}
                <div className="space-y-2 mb-4">
                  {template.features.slice(0, 3).map((feature, i) => (
                    <div key={i} className="flex items-center space-x-2 text-xs text-text-muted">
                      <div className="w-1.5 h-1.5 bg-accent-primary rounded-full"></div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-text-muted mb-4 pb-4 border-b border-borders-default">
                  <span>{template.uses.toLocaleString()} usos</span>
                </div>
                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button className="btn-primary flex-1 text-sm py-2">
                    Usar Template
                  </button>
                  <button className="btn-secondary px-3 py-2">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-background-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-text-muted" />
            </div>
            <h3 className="text-xl font-bold mb-2">No se encontraron templates</h3>
            <p className="text-text-muted">Intenta con otros términos de búsqueda o categorías</p>
          </div>
        )}
      </div>
    </div>
  )
}