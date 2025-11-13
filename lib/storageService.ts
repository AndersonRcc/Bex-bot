import { storage } from '@/lib/firebaseConfig'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
export const subirLogo = async (
  file: File, 
  empresaId: string, 
  tipo: 'empresa' | 'bot' = 'bot'
): Promise<{ success: boolean; url?: string; error?: any }> => {
  try {
    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'El archivo debe ser una imagen' }
    }
    if (file.size > 2 * 1024 * 1024) { // 2MB
      return { success: false, error: 'La imagen debe ser menor a 2MB' }
    }
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const filename = `${tipo}s/${empresaId}/${timestamp}.${extension}`
    const storageRef = ref(storage, filename)
    await uploadBytes(storageRef, file, {
      contentType: file.type,
      customMetadata: {
        empresaId,
        tipo,
        uploadedAt: new Date().toISOString()
      }
    })
    const url = await getDownloadURL(storageRef)
    console.log('✅ Logo subido exitosamente:', url)
    return { success: true, url }
  } catch (error) {
    console.error('❌ Error subiendo logo:', error)
    return { success: false, error }
  }
}
export const eliminarLogo = async (logoUrl: string): Promise<{ success: boolean; error?: any }> => {
  try {
    const storageRef = ref(storage, logoUrl)
    await deleteObject(storageRef)
    
    console.log('✅ Logo eliminado')
    return { success: true }
  } catch (error) {
    console.error('❌ Error eliminando logo:', error)
    return { success: false, error }
  }
}