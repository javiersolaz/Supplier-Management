# SP-Berner Supplier Management

PWA local para registrar proveedores de automatización industrial, contactos e historial de visitas. Mantiene el diseño y la arquitectura existentes (HTML/CSS/JavaScript, IndexedDB nativo y Service Worker), sin dependencias externas, sincronización ni conexión necesaria para generar los informes.

## Estructura funcional

- **Ficha de empresa:** identificador, nombre, ubicación, dirección, web, especialidades predefinidas o personalizadas, contactos y observaciones generales.
- **Visitas:** cada registro conserva la reunión, las capacidades observadas, un comentario por apartado y los datos comerciales. La puntuación de nueve criterios, requisitos y opinión del ingeniero se completan después con **Evaluar visita** desde el historial; todo queda asociado a esa visita.
- **Informe:** desde la ficha del proveedor se genera un PDF local con los datos generales y el historial, incluida la evaluación posterior de cada visita. No incluye evaluación técnica específica por proceso o proyecto.
- **Sin conexión:** el Service Worker incluye `data-migration.js`, la aplicación, estilos y generador PDF en la caché base.

## Conservación y migración local

La base sigue llamándose `spberner-suppliers`; IndexedDB pasa de versión 2 a 3. La migración copia cada evaluación antigua a la visita más reciente de su proveedor. Si aún no tiene visitas, crea una visita histórica con la fecha de la evaluación. La copia contiene respuestas generales, puntuaciones que se pueden asociar a criterios generales, requisitos, información comercial y opinión del ingeniero. El score del criterio técnico específico de la versión anterior no se reutiliza como evaluación general.

El almacén `evaluations` antiguo y sus registros se conservan sin modificaciones como respaldo de migración. Los datos técnicos especializados antiguos también quedan dentro de `generalEvaluation.legacyTechnical` de la visita migrada, sin controles para consultarlos o puntuarlos ni inclusión en el PDF. El almacén heredado de adjuntos también se conserva; esta interfaz no lo usa. La migración no elimina ni vacía proveedores, contactos, visitas, evaluaciones, adjuntos ni configuración.

Esta copia usa IndexedDB nativo, no Dexie. La aplicación instalada previamente solo podrá migrarse automáticamente si coincide en origen, nombre y esquema de base de datos. El workspace entregado no incluye el repositorio publicado ni permite confirmar esos datos de la instalación del usuario.

## Pruebas

Ejecuta `node tests/pdf-report.test.js`. Las seis pruebas automatizadas cubren la estructura del PDF por visita, la ausencia de apartados técnicos heredados, la paginación, la asignación de evaluaciones antiguas a visitas, la creación de una visita histórica cuando no existía ninguna y la migración de ponderaciones.

También se debe probar en navegador: crear/editar proveedor; registrar y editar varias visitas; comprobar conservación de sus puntuaciones, requisitos, datos comerciales y opinión al reabrir; actualizar la PWA a través del Service Worker y probarla sin conexión; generar el PDF. Esas pruebas de navegador, persistencia real e instalación en tablet no se consideran ejecutadas en esta entrega.

## Publicación

Publica juntos `index.html`, `app.js`, `data-migration.js`, `pdf-report.js`, `styles.css`, `sw.js`, `manifest.webmanifest` e `icon.svg`. La primera apertura requiere HTTPS y conexión para instalar la PWA. Después, la carcasa puede abrirse offline. Los datos permanecen en el perfil y origen del navegador; borrar los datos del sitio puede eliminarlos. No hay copia de seguridad, importación, fusión ni sincronización implementadas.

El generador PDF usa las fuentes estándar con codificación WinAnsi. Los caracteres españoles habituales se incluyen; glifos fuera de WinAnsi pueden sustituirse.
