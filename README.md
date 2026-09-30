# SP-Berner Supplier Management

Aplicación web progresiva local para registrar proveedores, contactos, visitas, evaluaciones y, desde esta versión, fotografías y documentos. Se mantiene como aplicación estática sin dependencias de servicios externos; la base de datos usa IndexedDB nativo (no Dexie).

## Funciones disponibles

- Proveedores, contactos y múltiples visitas independientes.
- Formularios de evaluación común y especializados, puntuación ponderada, requisitos y datos comerciales.
- Fotos y documentos guardados como `Blob` en la nueva tienda `attachments` de IndexedDB.
- Una misma relación de archivo permite consultarlo desde la ficha del proveedor y desde su visita asociada, sin crear copias.
- Captura con cámara donde lo permita el navegador y selector de imágenes/documentos como alternativa.
- Galería con miniaturas, vista ampliada, navegación, filtros por visita, edición de título/descripción/sección y eliminación confirmada.
- Listado documental con búsqueda, nombre y tamaño, edición de metadatos, apertura de PDF compatible y descarga de archivos.
- Clasificación de fotos generales, técnicas o de visita; y documentos comerciales, técnicos, certificados/referencias u otros. La descripción es texto libre.
- Indicador de escritura por archivo. El mensaje de guardado solo aparece después de que la transacción de IndexedDB finaliza.
- Diseño responsive y controles táctiles para escritorio, tablet y móvil.

## Incorporar archivos

1. Abre una ficha de proveedor. En “Fotografías y documentos”, selecciona **Tomar fotografía**, **Añadir fotografías** o **Adjuntar documentos**.
2. Dentro de una visita, usa sus propios botones de archivos para relacionarlos con esa visita. La vista de visita muestra solo sus archivos asociados.
3. Elige una clasificación; la sección técnica y descripción son opcionales. Para seleccionar varios archivos, utiliza el selector de galería/documentos si el navegador lo admite.
4. El archivo se guarda en el dispositivo y su nombre original se conserva. Usa **Gestionar archivos** para buscar, ampliar, editar o eliminar.

La opción “Tomar fotografía” utiliza `capture="environment"`. Según navegador/dispositivo puede abrir la cámara, el selector del sistema o no estar disponible; en ese caso, **Añadir fotografías** abre la galería/selector. iOS/iPadOS, Android y Windows controlan esta experiencia, y no se ha certificado en dispositivos físicos de cada sistema.

### Formatos y almacenamiento

El selector de fotos usa `image/*`. Para documentos se admiten PDF, Excel, Word, PowerPoint, JPEG, PNG, WebP y otros formatos que exponga el selector del sistema. Los tipos que el navegador no puede previsualizar se descargan para abrirlos con una aplicación compatible. Los PDF se pueden abrir en el visor del navegador.

Cada archivo tiene un límite de 100 MB en esta versión; se muestra un aviso desde 25 MB y se consulta la cuota informada por el navegador. Una cuota estimada no garantiza que la escritura vaya a caber: IndexedDB puede rechazar la operación y se comunica el error. Los archivos se incorporan uno a uno; si se interrumpe una selección múltiple, los archivos cuyas transacciones finalizaron siguen guardados y se pueden volver a seleccionar los restantes.

No se generan versiones comprimidas ni se altera el original. Así se evita pérdida de detalle y duplicación mientras se define una estrategia de miniaturas. Las miniaturas se crean al mostrarlas y no se almacenan como otro archivo.

## Ejecución y despliegue

No abras `index.html` directamente. Sirve esta carpeta en HTTPS para instalar/usar la PWA, o desde `localhost` en desarrollo. No requiere build ni paquetes externos. Publica juntos `index.html`, `app.js`, `styles.css`, `manifest.webmanifest`, `icon.svg`, `sw.js` y conserva la subruta publicada al configurar `start_url`/`scope`.

Después de publicar una actualización, abre la aplicación una vez con conexión para que el Service Worker instale la nueva carcasa y `attachments` siga en la misma base del origen. La migración de esquema es aditiva: la base sube de versión 1 a 2 y añade la tienda `attachments`; no recrea ni limpia proveedores, contactos, visitas, evaluaciones o configuración.

## Privacidad, persistencia y copias

Los archivos permanecen en IndexedDB del origen actual y no se envían a terceros. Deben estar disponibles offline una vez incorporados. Borrar datos del sitio, desinstalar el navegador o perder el dispositivo puede eliminar información. La persistencia solicitada por la aplicación depende del navegador. La aplicación todavía no incluye exportación/importación de copias de seguridad: conserva además una copia externa de los originales y no uses este dispositivo como única copia de los documentos importantes.

Los adjuntos nunca se ejecutan desde la aplicación. Los documentos distintos de PDF se descargan en lugar de abrirse dentro de una pestaña; las imágenes solo se muestran como imagen en la galería.

## Verificación de esta entrega

- Pasó `node --check app.js` y `node --check sw.js`.
- Revisada la migración aditiva del esquema (v1 → v2) y la ruta de guardado: cada Blob espera confirmación de la transacción IndexedDB antes de mostrarse como guardado.
- Revisada la lógica de relaciones: proveedor obligatorio, visita opcional; la vista de visita filtra por `visitId` sin copiar el Blob.
- No se pudo ejecutar en este turno una carga/lectura real de fotos y PDF, reinicio, actualización offline ni pruebas táctiles en tablet/teléfono. No se declara superada la persistencia funcional en dispositivos ni la compatibilidad física.

### Comprobación manual recomendada en cada navegador

1. Adjunta varias fotos al proveedor y una foto/PDF desde una visita; confirma título, descripción, tamaño y clasificación.
2. Revisa miniaturas y navegación; filtra la ficha por visita y confirma que la vista de visita no enseña adjuntos de otra visita.
3. Cambia metadatos, vuelve a abrir el archivo y comprueba que el original sigue descargándose.
4. Cierra y abre la app; repite tras actualizar la PWA y en modo avión.
5. Elimina un archivo y confirma el diálogo; comprueba que otros archivos y datos de proveedor/evaluación permanecen.
6. Prueba cámara y selector en Windows 11, Chrome Android y Safari iPadOS/iOS; anota los límites propios de cada navegador.

## Funciones aún pendientes

No incluye tareas/recordatorios, informes PDF, exportación Excel, copias ZIP/importación, sincronización, ni informes diarios/globales. No se añadieron porque no forman parte de este paso.