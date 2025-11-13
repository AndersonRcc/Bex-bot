# 🚀 Guía de Despliegue de BexBot

## Opción 1: Vercel (Recomendado) ⭐

### Paso 1: Preparar el Proyecto

```bash
# Asegúrate de que todo esté commiteado
git add .
git commit -m "Preparar para despliegue"
git push origin main
```

### Paso 2: Desplegar con Vercel

#### Método A: Desde la Terminal (Más Rápido)

```bash
# Iniciar sesión en Vercel
vercel login

# Desplegar (primera vez)
vercel

# Seguir las instrucciones:
# - Set up and deploy? Yes
# - Which scope? (tu cuenta)
# - Link to existing project? No
# - Project name? bexbot (o el que prefieras)
# - Directory? ./
# - Override settings? No

# Desplegar a producción
vercel --prod
```

#### Método B: Desde la Web (Más Visual)

1. Ve a: https://vercel.com/
2. Haz clic en "Sign Up" o "Login"
3. Conecta tu cuenta de GitHub
4. Haz clic en "Add New..." → "Project"
5. Importa tu repositorio: `MelvaMamani/BexBot`
6. Configura las variables de entorno (ver abajo)
7. Haz clic en "Deploy"

### Paso 3: Configurar Variables de Entorno en Vercel

En el dashboard de Vercel:

1. Ve a tu proyecto → Settings → Environment Variables
2. Agrega estas variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY = AIzaSyDXVZdf28bwW6yjh1-StKFr1Uhzr9UheDM
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = bexbot-9074e.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID = bexbot-9074e
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = bexbot-9074e.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 1084381883211
NEXT_PUBLIC_FIREBASE_APP_ID = 1:1084381883211:web:8458e813d2d4181ce696ce
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID = G-ZPMQTZW1LW
```

3. Marca todas como "Production", "Preview" y "Development"
4. Guarda los cambios
5. Redeploy el proyecto

### Paso 4: Configurar Dominio Personalizado

#### Si ya tienes un dominio:

1. En Vercel: Settings → Domains
2. Agrega tu dominio: `tudominio.com`
3. Vercel te dará registros DNS para configurar:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

4. Ve a tu proveedor de dominios (GoDaddy, Namecheap, etc.)
5. Agrega estos registros DNS
6. Espera 24-48 horas para propagación

#### Si NO tienes dominio:

**Opción A: Usar subdominio de Vercel (Gratis)**
- Tu sitio estará en: `bexbot.vercel.app`
- Puedes personalizarlo en Settings → Domains

**Opción B: Comprar un dominio**

Proveedores recomendados:
- **Namecheap**: https://www.namecheap.com/ (~$10/año)
- **GoDaddy**: https://www.godaddy.com/ (~$12/año)
- **Google Domains**: https://domains.google/ (~$12/año)

---

## Opción 2: Netlify

### Paso 1: Desplegar

1. Ve a: https://www.netlify.com/
2. Sign up / Login con GitHub
3. "Add new site" → "Import an existing project"
4. Selecciona tu repo de GitHub
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Deploy site

### Paso 2: Variables de Entorno

Site settings → Environment variables → Add variables (las mismas de arriba)

### Paso 3: Dominio Personalizado

Site settings → Domain management → Add custom domain

---

## Opción 3: GitHub Pages (Solo para sitios estáticos)

⚠️ **Nota**: GitHub Pages no soporta funciones serverless de Next.js, pero puedes exportar como sitio estático.

### Modificar next.config.js:

```javascript
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  basePath: '/BexBot',
  assetPrefix: '/BexBot/',
}
```

### Desplegar:

```bash
npm run build
# Los archivos estarán en la carpeta 'out'
# Sube esa carpeta a la rama gh-pages
```

---

## 🎯 Recomendación Final

**Para BexBot, te recomiendo Vercel porque:**

✅ Integración perfecta con Next.js
✅ Deploy automático con cada push a GitHub
✅ SSL/HTTPS gratis
✅ CDN global
✅ Dominio personalizado gratis
✅ Variables de entorno fáciles de configurar
✅ Funciones serverless incluidas
✅ Analytics incluido

---

## 📊 URLs Finales

Después del despliegue tendrás:

- **Vercel (gratis)**: `https://bexbot.vercel.app`
- **Con dominio propio**: `https://tudominio.com`

---

## 🔒 Seguridad

✅ El archivo `.env.local` NO se sube a GitHub (está en .gitignore)
✅ Las variables de entorno se configuran directamente en Vercel
✅ Firebase está protegido con reglas de seguridad

---

## 🆘 Soporte

Si tienes problemas:
- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Firebase Docs: https://firebase.google.com/docs
