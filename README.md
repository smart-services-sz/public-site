# SmartService Public Site

Sitio publico estatico, pensado para publicarse rapido en el dominio principal y servir como pagina institucional, politica de privacidad y terminos legales para verificaciones de negocio.

## Archivos

- `index.html`: SPA de una sola pagina con secciones legales.
- `styles.css`: estilos responsive con paleta azul, verde y turquesa.
- `app.js`: datos legales, menu movil, alta ciudadana y seguimiento; carga las categorias municipales habilitadas desde Gateway.

## Alta ciudadana municipal

El formulario consulta `GET /api/reclamos/public-config` y solo habilita el envio cuando hay un municipio activo con categorias disponibles. Si la consulta falla o el catalogo esta vacio, muestra un reintento y mantiene el alta bloqueada. El servidor vuelve a validar la configuracion al recibir el reclamo.

Antes de publicar, crear o activar el municipio y sus categorias en el panel administrativo y configurar `PUBLIC_MUNICIPALITY_ID` en Gateway con ese mismo identificador. Nombre, ciudad, pais, cobertura y prioridad provienen del catalogo de MS-Auth; `PUBLIC_MUNICIPALITY_NAME` y `PUBLIC_COUNTRY` ya no gobiernan este flujo.

La meta `smartservice-gateway-url` permite indicar la URL del Gateway si se publica en otro origen; habilitar el CORS correspondiente. En localhost o al abrir el HTML directamente se usa por defecto `http://localhost:3000`. El sitio no necesita un servidor de desarrollo propio.

Los codigos de categoria siguen siendo los admitidos por el dominio de reclamos. El catalogo permite definir sus nombres, prioridad y habilitacion por municipio, no introducir nuevos codigos arbitrarios.

## Personalizacion minima antes de publicar

Edita `app.js` y actualiza estos valores:

- `owner`
- `legalEmail`
- `contactPhone`
- `updatedAt`

## Publicacion rapida

Puedes subir el contenido de esta carpeta a cualquier hosting estatico o configurarlo como raiz publica del dominio `szsmartservice.com`.

Opciones comunes:

- Railway con servicio estatico o Nginx
- Vercel
- Netlify
- Cloudflare Pages

## Nota legal

El contenido es una base institucional y operativa. Conviene revisarlo con los datos reales del titular, correo legal y cualquier requisito regulatorio especifico de tu jurisdiccion antes de usarlo como version final.