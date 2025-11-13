# 🔥 Configuración de Firebase para BexBot

## Paso 1: Crear un Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Agregar proyecto"
3. Ingresa el nombre del proyecto: **BexBot**
4. Acepta los términos y crea el proyecto

## Paso 2: Configurar Firestore Database

1. En el menú lateral, ve a **Build > Firestore Database**
2. Haz clic en "Crear base de datos"
3. Selecciona el modo:
   - **Modo de prueba** (para desarrollo)
   - **Modo de producción** (para producción con reglas de seguridad)
4. Selecciona la ubicación: **us-central1** (o la más cercana)
5. Haz clic en "Habilitar"

## Paso 3: Obtener las Credenciales

1. En el menú lateral, ve a **Configuración del proyecto** (ícono de engranaje)
2. En la sección "Tus apps", haz clic en el ícono de **Web** (`</>`)
3. Registra tu app con el nombre: **BexBot Web**
4. Copia las credenciales que aparecen

## Paso 4: Configurar Variables de Entorno

1. En la raíz del proyecto, crea un archivo `.env.local`
2. Copia el contenido de `.env.local.example`
3. Reemplaza los valores con tus credenciales de Firebase:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
```

## Paso 5: Configurar Reglas de Seguridad (Opcional pero Recomendado)

En Firestore Database > Reglas, agrega:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura y escritura en la colección empresas
    match /empresas/{empresaId} {
      allow read, write: if true; // Cambiar en producción
    }
  }
}
```

**⚠️ IMPORTANTE:** En producción, debes implementar reglas de seguridad más estrictas.

## Paso 6: Estructura de la Colección en Firestore

La colección `empresas` tendrá la siguiente estructura:

```javascript
empresas/
  └── {empresaId}/
      ├── nombreEmpresa: string
      ├── ruc: string
      ├── razonSocial: string
      ├── direccion: string
      ├── telefono: string
      ├── email: string
      ├── sitioWeb: string
      ├── sector: string
      ├── descripcion: string
      ├── productos: array[
      │     {
      │       id: string,
      │       name: string,
      │       description: string,
      │       price: string
      │     }
      │   ]
      ├── servicios: array[
      │     {
      │       id: string,
      │       name: string,
      │       description: string,
      │       price: string
      │     }
      │   ]
      ├── excepciones: array[
      │     {
      │       id: string,
      │       description: string
      │     }
      │   ]
      ├── informacionAdicional: {
      │     horarioAtencion: string,
      │     metodoPago: array[string],
      │     politicasDevolucion: string,
      │     tiempoEntrega: string,
      │     cobertura: string
      │   }
      ├── fechaRegistro: timestamp
      └── estado: string (pendiente, aprobado, rechazado)
```

## Paso 7: Probar la Integración

1. Reinicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

2. Ve a: `http://localhost:3000/registro-empresa`

3. Completa el formulario y envíalo

4. Verifica en Firebase Console > Firestore Database que se haya creado el documento

## 🎯 Próximos Pasos

- [ ] Implementar autenticación de usuarios
- [ ] Agregar validación de RUC con API de SUNAT
- [ ] Crear panel de administración para revisar empresas registradas
- [ ] Implementar notificaciones por email al registrar empresa
- [ ] Agregar carga de imágenes de productos (Firebase Storage)

## 🔒 Seguridad

**NUNCA** subas el archivo `.env.local` a Git. Ya está incluido en `.gitignore`.

## 📚 Documentación Adicional

- [Documentación de Firebase](https://firebase.google.com/docs)
- [Firestore Getting Started](https://firebase.google.com/docs/firestore/quickstart)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
