# SP-Berner Supplier Management

Aplicación web progresiva local para registrar proveedores, contactos, visitas y evaluaciones durante visitas y ferias. Esta entrega cubre las fases 1–3 del documento de requisitos.

## Qué incluye

- Interfaz adaptable a escritorio, tablet y móvil; navegación táctil y menú compacto.
- Proveedores con especialidades, estado, datos generales y contacto principal.
- Varios contactos por empresa y visitas/reuniones independientes con notas y acuerdos.
- Evaluación común por secciones, preguntas técnicas por especialidad, notas ponderadas de 1 a 5, requisitos obligatorios y condiciones comerciales.
- Guardado en IndexedDB del navegador y solicitud automática/manual de almacenamiento persistente cuando el navegador lo permite.
- Service Worker y manifiesto para instalación y apertura offline después de la primera visita mientras se sirve desde HTTPS/localhost.

Se utiliza JavaScript del navegador y APIs nativas (IndexedDB, Service Worker y almacenamiento web), sin paquetes externos. Esto reduce dependencias de red y permite almacenar valores, pero todavía no incluye el esquema de exportación ZIP, informes PDF, Excel, adjuntos, tareas, comparativas ni formularios de todas las subespecialidades descritas en el prompt. Esas funciones quedan para fases posteriores. Los criterios actuales suman 100% por defecto y se pueden ajustar en Ajustes.

## Ejecutar localmente

No abras `index.html` directamente como archivo. IndexedDB puede funcionar con `file:`, pero el Service Worker no; utiliza un servidor HTTP local.

Con Node.js instalado, desde esta carpeta inicia un servidor estático. Por ejemplo, con `npx serve .` (requiere que el paquete esté disponible) o con cualquier servidor local estático. Abre la dirección que indique en Chrome o Edge. `localhost` se considera un contexto seguro para desarrollo.

No hay un paso de build ni instalación de paquetes en esta primera versión.

## Despliegue HTTPS

Publica el contenido de esta carpeta en el directorio raíz de un hosting estático con HTTPS (por ejemplo, Pages). Mantén `index.html`, `app.js`, `styles.css`, `manifest.webmanifest`, `icon.svg` y `sw.js` juntos. Si publicas bajo una subruta, revisa `start_url`, `scope` y `CORE` en `sw.js` para que coincidan con la subruta. Entra una vez con conexión y espera a que cargue antes de usar la app offline.

## Instalar

- **Windows (Chrome/Edge):** abre la página HTTPS y usa el botón de instalación que ofrece el navegador en la barra de direcciones o menú.
- **Android (Chrome):** abre la página HTTPS, menú del navegador y “Instalar aplicación” o “Añadir a pantalla de inicio”.
- **iPhone/iPad (Safari):** abre la página HTTPS, Compartir y “Añadir a pantalla de inicio”. La instalación y algunas capacidades dependen de la versión de iOS/iPadOS.

La primera instalación requiere visitar la web desde HTTPS y un navegador compatible. No se puede instalar por primera vez estando offline.

## Uso

1. Crea una ficha básica del proveedor; puedes completarla más tarde.
2. Abre la ficha para añadir contactos, registrar cada reunión por separado o iniciar la evaluación.
3. En la evaluación, cambia de pestaña para completar preguntas comunes y técnicas, la puntuación, requisitos o condiciones comerciales. El formulario guarda cambios automáticamente en IndexedDB.
4. Para criterios de evaluación, ajusta ponderaciones en Ajustes. Su suma debería ser 100%; el porcentaje de cobertura solo incluye criterios evaluados.

El estado del proveedor se edita manualmente; la puntuación no cambia dicho estado.

## Datos y copias de seguridad

Los registros se guardan en el perfil local del navegador y no se transmiten a servidores. Borrar los datos del sitio, desinstalar el navegador o perder el dispositivo puede borrar los registros. Ajustes muestra la cuota estimada y permite pedir almacenamiento persistente, pero la decisión final depende del navegador y del sistema.

**Esta fase aún no incorpora exportación/importación de copias de seguridad.** No la uses como único repositorio de información importante hasta que esa función se implemente y se pruebe. No hay cifrado local implementado.

## Comprobaciones y límites

- Revisado: sintaxis de `app.js` y `sw.js` con `node --check`.
- El almacenamiento real requiere abrir la app en Chrome/Edge/Safari o Firefox; no se considera verificado en este entorno hasta completar una prueba de crear, cerrar y reabrir los datos en cada sistema objetivo.
- El Service Worker cachea la carcasa de la aplicación, no envía solicitudes a terceros y deja las funcionalidades de datos dentro de IndexedDB.
- La cuota, persistencia, cámara/archivos y opción de instalar varían según navegador, dispositivo y espacio libre.

## Próximas fases

La fase 4 añadirá adjuntos, seguimiento e historial más completo. La fase 5 añadirá informes y exportación Excel. La fase 6 añadirá copias ZIP e importación y pruebas offline. La fase 7 documentará las comprobaciones de compatibilidad y preparación para uso real.
