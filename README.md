# SP-Berner Supplier Management

Aplicación web progresiva local para registrar proveedores industriales, sus contactos, visitas y evaluaciones, y generar informes PDF individuales. No utiliza bibliotecas externas ni servicios remotos para estas funciones.

## Cambios de esta versión

- Retira de la interfaz la carga de fotografías/documentos, la galería y la gestión de adjuntos.
- No borra el almacén heredado `attachments` ni consulta, modifica o elimina sus registros. Se conserva la base y su número de versión para evitar una migración destructiva.
- Añade generación local de informes PDF individuales desde la ficha del proveedor.
- Añade el campo “Opinión del ingeniero” a la pestaña de puntuación; su texto se incluye tal cual en el informe.
- El Service Worker cachea también el generador PDF local y usa una nueva versión de caché.
- Los errores de lectura, escritura y eliminación de IndexedDB muestran estado y mensaje al usuario.

Esta copia usa IndexedDB nativo (`spberner-suppliers`, versión 2), no Dexie. Las tiendas de proveedores, contactos, visitas, evaluaciones y configuración se mantienen intactas. No se reinicia ni se limpia la base de datos.

## Uso de la aplicación

Abre la ficha de un proveedor. Desde allí puedes seguir editando proveedor, visitas y evaluación, o pulsar **Generar informe PDF**. El archivo se construye en el dispositivo y se descarga como `Informe_<proveedor>_<fecha>.pdf`.

El informe solo incluye datos que existen. Puede incluir:

- Identificador, empresa, ubicación, especialidades, estado, web, contactos, alta y observaciones generales.
- Cada visita ordenada por fecha, con lugar, participantes, objetivo, notas y acuerdos.
- Respuestas comunes y técnicas, puntuaciones y ponderaciones, resultado ponderado, cobertura, requisitos obligatorios y observaciones.
- Precio/moneda, alcance, pagos, Incoterm, plazos, garantía, costes y observaciones comerciales.
- La opinión del ingeniero, respetando el texto guardado.

No genera conclusiones ni recomendaciones automáticas. Los apartados opcionales sin contenido se omiten. Las páginas son A4 con encabezado SP-Berner y numeración.

El PDF usa las fuentes PDF estándar con codificación WinAnsi. Los acentos españoles y los caracteres occidentales habituales están incluidos. Los caracteres CJK u otros glifos fuera de WinAnsi pueden aparecer como `?`; la aplicación aún no incorpora fuentes CJK embebidas.

## Funcionamiento offline

El Service Worker almacena la carcasa de la aplicación y `pdf-report.js`. Tras publicar en HTTPS, abre la página con conexión al menos una vez y espera a que el navegador instale la nueva caché; luego puede abrirse desde la PWA sin red. En modo local, usa `localhost` para que IndexedDB y Service Worker funcionen como contexto seguro. No abras `index.html` con `file://`.

Proveedores, visitas y evaluaciones se guardan en IndexedDB del navegador. Al cerrar y volver a abrir la app, los datos permanecen en el mismo perfil y origen. Cada ingeniero conserva su base local independiente. No hay sincronización entre dispositivos.

Si borrar datos del sitio o desinstalar el navegador, la base local podría perderse. La aplicación no implementa todavía copia de seguridad/importación; conserva un respaldo externo de la información crítica.

## Ejecutar y publicar

No requiere instalar paquetes ni compilar. Sirve todos los archivos de esta carpeta desde un servidor HTTPS estático. Para desarrollo puede usarse `localhost`. Publica juntos:

- `index.html`, `app.js`, `pdf-report.js`, `styles.css`, `sw.js`, `manifest.webmanifest` e `icon.svg`.

La instalación inicial de la PWA requiere HTTPS y conexión. No se utiliza red para generar el PDF ni para trabajar con los datos una vez que la carcasa está en caché.

## Pruebas realizadas

Automatizadas, ejecutadas en Node.js:

- `node --check app.js`, `node --check pdf-report.js` y `node --check sw.js`.
- `node tests/pdf-report.test.js`: generación del PDF con proveedor y varias visitas, campos opcionales vacíos, preservación de la opinión del ingeniero y paginación extensa.

PDF:

- Generé un PDF de muestra con datos en español; Poppler lo reconoció como PDF 1.4, A4 y una página, y lo rendericé para inspección visual. Revisé que encabezado, apartados, puntuación y pie de página quedaran visibles sin cortes.

Aún pendientes en navegador/dispositivos físicos:

- Crear/editar/eliminar proveedor, visita y evaluación offline, cerrar/reabrir y recargar en modo avión.
- Abrir la PWA instalada sin conexión en Windows, Android e iOS/iPadOS.
- Descargar/abrir un informe PDF desde cada sistema y probar registros incompletos o con muchas páginas.
- Confirmar en el origen publicado que su DB name/esquema coincide con esta copia. El workspace disponible no incluye el repositorio Git ni permite verificar la base de datos de la aplicación ya instalada.

## Guía de pruebas manuales

1. Con la app cargada por HTTPS, crea un proveedor con datos parciales y guárdalo.
2. Registra dos visitas y edita una; revisa sus datos en la ficha.
3. Completa una respuesta común, un dato técnico, una puntuación, un requisito y la opinión del ingeniero; cambia de pestaña y vuelve para comprobar el guardado.
4. Genera el PDF y confirma que incluye ambas visitas y la opinión sin cambiar el texto.
5. Activa modo avión, cierra completamente y vuelve a abrir la PWA. Busca el proveedor y genera de nuevo su PDF.
6. Edita y elimina un registro de prueba en modo avión; recarga y comprueba el resultado.
7. Repite con un proveedor incompleto y con uno que tenga muchas notas para comprobar omisión de apartados y saltos de página.
8. Realiza las comprobaciones en el navegador/dispositivo objetivo: Chrome/Edge en Windows, Chrome en Android y Safari en iOS/iPadOS.

No se han ejecutado pruebas en los dispositivos físicos del usuario ni se afirma su compatibilidad offline hasta completar estos pasos.