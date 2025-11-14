'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { Package, FileText, Edit2, Trash2, Loader2, CheckCircle, AlertTriangle, X, DollarSign, Plus } from 'lucide-react'
import Header from '@/app/components/header'
import { useAuth } from '@/app/components/AuthProvider'
import { db } from '@/lib/firebaseConfig'

type Product = {
  id: string
  nombre: string
  descripcion: string
  precio: string
}

type Service = {
  id: string
  nombre: string
  descripcion: string
  excepciones?: string
}

type EmpresaData = {
  nombreEmpresa?: string
  ruc?: string
  descripcion?: string
  products?: Product[]
  services?: Service[]
}

export default function MiInformacionPage() {
  const { currentUser, isLoadingAuth } = useAuth()
  const router = useRouter()

  const [empresa, setEmpresa] = useState<EmpresaData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | '' ; text: string }>({ type: '', text: '' })

  const [editProductModalOpen, setEditProductModalOpen] = useState(false)
  const [deleteProductModalOpen, setDeleteProductModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [editProductData, setEditProductData] = useState<Product | null>(null)

  const [editServiceModalOpen, setEditServiceModalOpen] = useState(false)
  const [deleteServiceModalOpen, setDeleteServiceModalOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [editServiceData, setEditServiceData] = useState<Service | null>(null)

  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [addProductModalOpen, setAddProductModalOpen] = useState(false)
  const [newProductData, setNewProductData] = useState<Product>({
    id: '',
    nombre: '',
    descripcion: '',
    precio: ''
  })

  useEffect(() => {
    if (!isLoadingAuth && !currentUser) {
      router.push('/login')
    }
  }, [currentUser, isLoadingAuth, router])

  useEffect(() => {
    const cargarEmpresa = async () => {
      if (!currentUser) return
      try {
        const docRef = doc(db, 'empresas', currentUser.uid)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const data = docSnap.data() as EmpresaData
          setEmpresa({
            nombreEmpresa: data.nombreEmpresa,
            ruc: data.ruc,
            descripcion: data.descripcion,
            products: Array.isArray(data.products) ? data.products : [],
            services: Array.isArray(data.services) ? data.services : []
          })
        } else {
          setEmpresa({ nombreEmpresa: '', ruc: '', descripcion: '', products: [], services: [] })
        }
      } catch (error) {
        console.error('Error al cargar datos de la empresa:', error)
        setMessage({ type: 'error', text: 'Error al cargar la información de la empresa' })
      } finally {
        setIsLoading(false)
      }
    }

    if (currentUser && !isLoadingAuth) {
      cargarEmpresa()
    }
  }, [currentUser, isLoadingAuth])

  const handleOpenEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setEditProductData({ ...product })
    setEditProductModalOpen(true)
    setMessage({ type: '', text: '' })
  }

  const handleOpenDeleteProduct = (product: Product) => {
    setSelectedProduct(product)
    setDeleteProductModalOpen(true)
    setMessage({ type: '', text: '' })
  }

  const handleOpenEditService = (service: Service) => {
    setSelectedService(service)
    setEditServiceData({ ...service })
    setEditServiceModalOpen(true)
    setMessage({ type: '', text: '' })
  }

  const handleOpenDeleteService = (service: Service) => {
    setSelectedService(service)
    setDeleteServiceModalOpen(true)
    setMessage({ type: '', text: '' })
  }

  const handleChangeEditProduct = (field: keyof Product, value: string) => {
    if (!editProductData) return
    setEditProductData({ ...editProductData, [field]: value })
  }

  const handleChangeEditService = (field: keyof Service, value: string) => {
    if (!editServiceData) return
    setEditServiceData({ ...editServiceData, [field]: value })
  }

  const persistEmpresaField = async (fields: Partial<EmpresaData>) => {
    if (!currentUser) return
    const docRef = doc(db, 'empresas', currentUser.uid)
    await updateDoc(docRef, fields as any)
  }

  const handleSaveProductChanges = async () => {
    if (!empresa || !editProductData) return
    setSaving(true)
    setMessage({ type: '', text: '' })
    try {
      const updatedProducts = (empresa.products || []).map((p) =>
        p.id === editProductData.id ? editProductData : p
      )
      await persistEmpresaField({ products: updatedProducts })
      setEmpresa({ ...empresa, products: updatedProducts })
      setEditProductModalOpen(false)
      setSelectedProduct(null)
      setEditProductData(null)
      setMessage({ type: 'success', text: 'Producto actualizado correctamente' })
    } catch (error) {
      console.error('Error al actualizar producto:', error)
      setMessage({ type: 'error', text: 'No se pudo actualizar el producto' })
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmDeleteProduct = async () => {
    if (!empresa || !selectedProduct) return
    setDeleting(true)
    setMessage({ type: '', text: '' })
    try {
      const updatedProducts = (empresa.products || []).filter((p) => p.id !== selectedProduct.id)
      await persistEmpresaField({ products: updatedProducts })
      setEmpresa({ ...empresa, products: updatedProducts })
      setDeleteProductModalOpen(false)
      setSelectedProduct(null)
      setMessage({ type: 'success', text: 'Producto eliminado correctamente' })
    } catch (error) {
      console.error('Error al eliminar producto:', error)
      setMessage({ type: 'error', text: 'No se pudo eliminar el producto' })
    } finally {
      setDeleting(false)
    }
  }

  const handleSaveServiceChanges = async () => {
    if (!empresa || !editServiceData) return
    setSaving(true)
    setMessage({ type: '', text: '' })
    try {
      const updatedServices = (empresa.services || []).map((s) =>
        s.id === editServiceData.id ? editServiceData : s
      )
      await persistEmpresaField({ services: updatedServices })
      setEmpresa({ ...empresa, services: updatedServices })
      setEditServiceModalOpen(false)
      setSelectedService(null)
      setEditServiceData(null)
      setMessage({ type: 'success', text: 'Servicio actualizado correctamente' })
    } catch (error) {
      console.error('Error al actualizar servicio:', error)
      setMessage({ type: 'error', text: 'No se pudo actualizar el servicio' })
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmDeleteService = async () => {
    if (!empresa || !selectedService) return
    setDeleting(true)
    setMessage({ type: '', text: '' })
    try {
      const updatedServices = (empresa.services || []).filter((s) => s.id !== selectedService.id)
      await persistEmpresaField({ services: updatedServices })
      setEmpresa({ ...empresa, services: updatedServices })
      setDeleteServiceModalOpen(false)
      setSelectedService(null)
      setMessage({ type: 'success', text: 'Servicio eliminado correctamente' })
    } catch (error) {
      console.error('Error al eliminar servicio:', error)
      setMessage({ type: 'error', text: 'No se pudo eliminar el servicio' })
    } finally {
      setDeleting(false)
    }
  }

  const handleOpenAddProduct = () => {
    setNewProductData({
      id: Date.now().toString(),
      nombre: '',
      descripcion: '',
      precio: ''
    })
    setMessage({ type: '', text: '' })
    setAddProductModalOpen(true)
  }

  const handleChangeNewProduct = (field: keyof Product, value: string) => {
    setNewProductData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCreateProduct = async () => {
    if (!empresa || !currentUser) return
    if (!newProductData.nombre || !newProductData.nombre.trim()) {
      setMessage({ type: 'error', text: 'El nombre del producto es obligatorio' })
      return
    }
    setSaving(true)
    setMessage({ type: '', text: '' })
    const newProduct: Product = {
      ...newProductData,
      id: newProductData.id || Date.now().toString(),
      nombre: newProductData.nombre.trim(),
      descripcion: newProductData.descripcion?.trim() || '',
      precio: newProductData.precio?.toString() || '0'
    }
    try {
      const updatedProducts = [...(empresa.products || []), newProduct]
      await persistEmpresaField({ products: updatedProducts })
      setEmpresa({ ...empresa, products: updatedProducts })

      try {
        await fetch('https://edgar-n8n-n8n.zxlh8i.easypanel.host/webhook/crude_supabase', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            body: {
              action: 'add',
              user_id: currentUser.uid,
              product_id: newProduct.id,
              description_product: newProduct.descripcion,
              price_product: newProduct.precio,
              metadata: 'Products'
            }
          })
        })
      } catch (webhookError) {
        console.error('Error al llamar al webhook de productos:', webhookError)
      }

      setAddProductModalOpen(false)
      setNewProductData({ id: '', nombre: '', descripcion: '', precio: '' })
      setMessage({ type: 'success', text: 'Producto agregado correctamente' })
    } catch (error) {
      console.error('Error al crear producto:', error)
      setMessage({ type: 'error', text: 'No se pudo agregar el producto' })
    } finally {
      setSaving(false)
    }
  }

  if (isLoadingAuth || isLoading) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-accent-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-primary">
      <Header />
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Mi Información</h1>
          <p className="text-text-secondary">Resumen de la información de tu empresa, productos y servicios</p>
        </div>

        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg border flex items-center space-x-3 ${
              message.type === 'success'
                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
            <p>{message.text}</p>
          </div>
        )}

        {empresa && (
          <div className="glass-card p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-1">{empresa.nombreEmpresa || 'Nombre de empresa no definido'}</h2>
                <p className="text-sm text-text-muted">RUC: {empresa.ruc || '-'}</p>
              </div>
              <div className="flex items-center space-x-3 text-sm text-text-muted">
                <DollarSign className="w-5 h-5 text-accent-primary" />
                <span>Información general de tu negocio</span>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Acerca de mí</h3>
              <p className="text-text-secondary text-sm whitespace-pre-line">
                {empresa.descripcion || 'Aún no has registrado una descripción de tu empresa.'}
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-8">
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Package className="w-6 h-6 text-accent-primary" />
                <h2 className="text-2xl font-bold">Productos</h2>
              </div>
              <button
                onClick={handleOpenAddProduct}
                className="btn-primary flex items-center space-x-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Producto</span>
              </button>
            </div>
            <div className="glass-card p-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-text-muted border-b border-borders-default">
                    <th className="py-2 px-3">Producto</th>
                    <th className="py-2 px-3">Descripción</th>
                    <th className="py-2 px-3">Precio</th>
                    <th className="py-2 px-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {empresa?.products && empresa.products.length > 0 ? (
                    empresa.products.map((product) => (
                      <tr key={product.id} className="border-b border-borders-default last:border-b-0">
                        <td className="py-3 px-3 align-top font-medium">{product.nombre}</td>
                        <td className="py-3 px-3 align-top text-text-secondary">{product.descripcion}</td>
                        <td className="py-3 px-3 align-top">{product.precio}</td>
                        <td className="py-3 px-3 align-top">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleOpenEditProduct(product)}
                              className="px-3 py-1.5 rounded-md border border-yellow-400/60 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 flex items-center space-x-1 text-xs font-semibold"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenDeleteProduct(product)}
                              className="px-3 py-1.5 rounded-md border border-borders-default bg-background-secondary text-text-secondary hover:bg-red-500/10 hover:text-red-400 flex items-center space-x-1 text-xs font-semibold"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Eliminar</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-text-muted text-sm">
                        No tienes productos registrados aún.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <FileText className="w-6 h-6 text-accent-primary" />
                <h2 className="text-2xl font-bold">Servicios</h2>
              </div>
            </div>
            <div className="glass-card p-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-text-muted border-b border-borders-default">
                    <th className="py-2 px-3">Servicio</th>
                    <th className="py-2 px-3">Descripción</th>
                    <th className="py-2 px-3">Observaciones</th>
                    <th className="py-2 px-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {empresa?.services && empresa.services.length > 0 ? (
                    empresa.services.map((service) => (
                      <tr key={service.id} className="border-b border-borders-default last:border-b-0">
                        <td className="py-3 px-3 align-top font-medium">{service.nombre}</td>
                        <td className="py-3 px-3 align-top text-text-secondary">{service.descripcion}</td>
                        <td className="py-3 px-3 align-top text-text-secondary">{service.excepciones || '-'}</td>
                        <td className="py-3 px-3 align-top">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleOpenEditService(service)}
                              className="px-3 py-1.5 rounded-md border border-yellow-400/60 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 flex items-center space-x-1 text-xs font-semibold"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenDeleteService(service)}
                              className="px-3 py-1.5 rounded-md border border-borders-default bg-background-secondary text-text-secondary hover:bg-red-500/10 hover:text-red-400 flex items-center space-x-1 text-xs font-semibold"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Eliminar</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-text-muted text-sm">
                        No tienes servicios registrados aún.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>

      {addProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="glass-card p-6 rounded-lg shadow-lg max-w-md w-full m-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-accent-primary flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Agregar Producto</span>
              </h3>
              <button
                onClick={() => {
                  setAddProductModalOpen(false)
                  setNewProductData({ id: '', nombre: '', descripcion: '', precio: '' })
                }}
                className="text-text-muted hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Producto</label>
                <input
                  type="text"
                  value={newProductData.nombre}
                  onChange={(e) => handleChangeNewProduct('nombre', e.target.value)}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Descripción</label>
                <textarea
                  value={newProductData.descripcion}
                  onChange={(e) => handleChangeNewProduct('descripcion', e.target.value)}
                  className="input-field w-full"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Precio</label>
                <input
                  type="number"
                  min="0"
                  value={newProductData.precio}
                  onChange={(e) => handleChangeNewProduct('precio', e.target.value)}
                  className="input-field w-full"
                />
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setAddProductModalOpen(false)
                  setNewProductData({ id: '', nombre: '', descripcion: '', precio: '' })
                }}
                className="px-4 py-2 rounded-md bg-background-secondary text-text-secondary hover:bg-background-hover text-sm font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateProduct}
                disabled={saving}
                className="px-4 py-2 rounded-md bg-green-500 text-white hover:bg-green-600 text-sm font-semibold flex items-center space-x-2 disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Agregar</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {editProductModalOpen && editProductData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="glass-card p-6 rounded-lg shadow-lg max-w-md w-full m-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-yellow-400 flex items-center space-x-2">
                <Edit2 className="w-5 h-5" />
                <span>Editar Producto</span>
              </h3>
              <button
                onClick={() => {
                  setEditProductModalOpen(false)
                  setSelectedProduct(null)
                  setEditProductData(null)
                }}
                className="text-text-muted hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Producto</label>
                <input
                  type="text"
                  value={editProductData.nombre}
                  onChange={(e) => handleChangeEditProduct('nombre', e.target.value)}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Descripción</label>
                <textarea
                  value={editProductData.descripcion}
                  onChange={(e) => handleChangeEditProduct('descripcion', e.target.value)}
                  className="input-field w-full"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Precio</label>
                <input
                  type="number"
                  min="0"
                  value={editProductData.precio}
                  onChange={(e) => handleChangeEditProduct('precio', e.target.value)}
                  className="input-field w-full"
                />
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setEditProductModalOpen(false)
                  setSelectedProduct(null)
                  setEditProductData(null)
                }}
                className="px-4 py-2 rounded-md bg-background-secondary text-text-secondary hover:bg-background-hover text-sm font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveProductChanges}
                disabled={saving}
                className="px-4 py-2 rounded-md bg-yellow-400 text-black hover:bg-yellow-500 text-sm font-semibold flex items-center space-x-2 disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Cambiar</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteProductModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="glass-card p-6 rounded-lg shadow-lg max-w-md w-full m-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-red-400 flex items-center space-x-2">
                <Trash2 className="w-5 h-5" />
                <span>Eliminar Producto</span>
              </h3>
              <button
                onClick={() => {
                  setDeleteProductModalOpen(false)
                  setSelectedProduct(null)
                }}
                className="text-text-muted hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-text-secondary mb-4 text-sm">
              ¿Estás seguro de que deseas eliminar el producto
              {' '}<span className="font-semibold">{selectedProduct.nombre}</span>?
            </p>
            <div className="flex items-center justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  setDeleteProductModalOpen(false)
                  setSelectedProduct(null)
                }}
                className="px-4 py-2 rounded-md bg-background-secondary text-text-secondary hover:bg-background-hover text-sm font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDeleteProduct}
                disabled={deleting}
                className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 text-sm font-semibold flex items-center space-x-2 disabled:opacity-60"
              >
                {deleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Confirmar</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {editServiceModalOpen && editServiceData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="glass-card p-6 rounded-lg shadow-lg max-w-md w-full m-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-yellow-400 flex items-center space-x-2">
                <Edit2 className="w-5 h-5" />
                <span>Editar Servicio</span>
              </h3>
              <button
                onClick={() => {
                  setEditServiceModalOpen(false)
                  setSelectedService(null)
                  setEditServiceData(null)
                }}
                className="text-text-muted hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Servicio</label>
                <input
                  type="text"
                  value={editServiceData.nombre}
                  onChange={(e) => handleChangeEditService('nombre', e.target.value)}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Descripción</label>
                <textarea
                  value={editServiceData.descripcion}
                  onChange={(e) => handleChangeEditService('descripcion', e.target.value)}
                  className="input-field w-full"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Observaciones</label>
                <textarea
                  value={editServiceData.excepciones || ''}
                  onChange={(e) => handleChangeEditService('excepciones', e.target.value)}
                  className="input-field w-full"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setEditServiceModalOpen(false)
                  setSelectedService(null)
                  setEditServiceData(null)
                }}
                className="px-4 py-2 rounded-md bg-background-secondary text-text-secondary hover:bg-background-hover text-sm font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveServiceChanges}
                disabled={saving}
                className="px-4 py-2 rounded-md bg-yellow-400 text-black hover:bg-yellow-500 text-sm font-semibold flex items-center space-x-2 disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Cambiar</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteServiceModalOpen && selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="glass-card p-6 rounded-lg shadow-lg max-w-md w-full m-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-red-400 flex items-center space-x-2">
                <Trash2 className="w-5 h-5" />
                <span>Eliminar Servicio</span>
              </h3>
              <button
                onClick={() => {
                  setDeleteServiceModalOpen(false)
                  setSelectedService(null)
                }}
                className="text-text-muted hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-text-secondary mb-4 text-sm">
              ¿Estás seguro de que deseas eliminar el servicio
              {' '}<span className="font-semibold">{selectedService.nombre}</span>?
            </p>
            <div className="flex items-center justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  setDeleteServiceModalOpen(false)
                  setSelectedService(null)
                }}
                className="px-4 py-2 rounded-md bg-background-secondary text-text-secondary hover:bg-background-hover text-sm font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDeleteService}
                disabled={deleting}
                className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 text-sm font-semibold flex items-center space-x-2 disabled:opacity-60"
              >
                {deleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Confirmar</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}