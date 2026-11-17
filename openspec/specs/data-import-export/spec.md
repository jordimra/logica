# Datos personalizables e importación/exportación

## Purpose
Personalizar categorías, ítems y enunciado; y conservar o restaurar el puzle (plantilla y progreso) mediante archivos JSON.

## Requirements

### Requirement: Personalización de categorías e ítems
El usuario SHALL poder editar el nombre de cada categoría y de cada ítem desde la tabla INTRODUCCIÓN; los encabezados de la tabla LÓGICA, la etiqueta lateral y los encabezados de RESULTADOS SHALL actualizarse en tiempo real. Las categorías SHALL mostrarse en mayúsculas y los ítems con la primera letra en mayúscula.
_Estado: comportamiento observado y documentado en README ("Campos de texto para personalizar"). Evidencia: `script.js:161-196`. Caracterización: pendiente (T6).

#### Scenario: Cambiar el nombre de una categoría
- **WHEN** el usuario cambia la categoría A a "Colores"
- **THEN** los encabezados de la tabla LÓGICA y de RESULTADOS muestran "COLORES" de inmediato

### Requirement: Restablecimiento de los textos
El botón "Limpiar Datos" SHALL solicitar confirmación y, de aceptarse, restaurar los nombres por defecto de categorías e ítems y vaciar el enunciado.
_Estado: comportamiento observado. Evidencia: `script.js:305-320`.

#### Scenario: Confirmar la limpieza de datos
- **WHEN** el usuario pulsa "Limpiar Datos" y responde Sí
- **THEN** las categorías vuelven a A–E, los ítems a `a1..a3`/… y el área de descripción queda vacía

### Requirement: Área de descripción desplegable
El sistema SHALL mostrar u ocultar el área de texto del enunciado del puzle con el botón "Descripción".
_Estado: comportamiento observado y documentado en README. Evidencia: `script.js:71-82`, `index.php:27,46-49`.

#### Scenario: Mostrar y ocultar el enunciado
- **WHEN** el usuario pulsa "Descripción" y después pulsa "Ocultar Descripción"
- **THEN** el área de texto se muestra y luego se oculta, y el contenido escrito se conserva entre ambos estados

### Requirement: Exportación de la plantilla y del progreso
La exportación a JSON SHALL incluir el estado del tablero (celdas marcadas por zona y posición) además de modo, categorías, ítems y enunciado, de modo que la importación reproduzca plantillas **y progresos**.
_Estado: **REQUISITO CONFIRMADO por D2 (2026-11-17): corrige el defecto H10** (README: "Guarda tus plantillas o progresos"). Línea base actual (T10 pendiente): el JSON omite el estado del tablero. Esquema del JSON extendido: **decisión pendiente (PD-4)**.

#### Scenario: Línea base del defecto (comportamiento actual)
- **WHEN** el usuario marca celdas y exporta a JSON
- **THEN** el archivo `puzle_<modo>.json` contiene modo, categorías, ítems y descripción, pero ninguna información de las celdas marcadas

#### Scenario: Comportamiento requerido tras la corrección
- **WHEN** el usuario marca celdas, exporta y luego importa el archivo en una sesión nueva
- **THEN** el tablero se restaura con las mismas marcas (❌/🔵) y la tabla de resultados se calcula sobre ellas

### Requirement: Importación de un JSON del mismo modo
Al importar un JSON cuyo modo coincide con el actual, el sistema SHALL poblar categorías, ítems y enunciado, vaciar el historial y notificar al usuario.
_Estado: comportamiento observado. Evidencia: `script.js:121-159`. Caracterización: pendiente (T6).

#### Scenario: Importación válida en el mismo modo
- **WHEN** el usuario importa un JSON `mode=3x4` estando en modo `3x4`
- **THEN** los textos y la descripción se pueblan, el historial se vacía y se muestra "Importado correctamente."

### Requirement: Importación de un JSON de otro modo
Al importar un JSON cuyo modo difiere, el sistema SHALL preguntar si se desea recargar la página en el modo del archivo; de aceptarse, SHALL conservar los datos en `sessionStorage` (`pendingImport`) y recargar con el nuevo modo, poblando los datos al cargar.
_Estado: comportamiento observado. Evidencia: `script.js:129-134`, `script.js:451-455`. Caracterización: pendiente (T7).

#### Scenario: Cambio de modo aceptado
- **WHEN** el usuario importa un JSON `mode=5x5` desde la página `3x4` y acepta la confirmación
- **THEN** la página recarga con `?mode=5x5` y al terminar la carga los datos del JSON quedan poblados

### Requirement: Manejo de archivos de importación inválidos
El sistema SHALL mostrar un mensaje de error legible sin romper la página cuando el archivo no sea JSON válido o falte la estructura mínima (`mode` y `cats`).
_Estado: comportamiento observado. Evidencia: `script.js:125-137`.

#### Scenario: JSON malformado
- **WHEN** el usuario importa un archivo con JSON malformado
- **THEN** se muestra la alerta "Error JSON" y la página sigue operativa

#### Scenario: JSON sin estructura mínima
- **WHEN** el usuario importa un JSON válido que no contiene `mode` o `cats`
- **THEN** se muestra la alerta "Archivo inválido" y la página sigue operativa
