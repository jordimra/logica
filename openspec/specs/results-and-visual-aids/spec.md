# Tabla de resultados y ayudas visuales

## Purpose
Derivar la solución parcial del puzle a partir de las celdas marcadas y resaltar conflictos para ayudar a la resolución.

## Requirements

### Requirement: Derivación de la tabla de resultados
Para cada fila `r` y cada categoría distinta de la primera, la tabla RESULTADOS SHALL mostrar el ítem de esa categoría que equivale al ítem `r` de la primera categoría cuando exista un círculo en la fila `r` de la zona (primera categoría, categoría objetivo); en caso contrario la celda SHALL quedar vacía. La primera columna SHALL mostrar siempre los ítems de la primera categoría.
_Estado: comportamiento observado. Evidencia: `script.js:378-397`. Caracterización: pendiente (T1/T2).

#### Scenario: Resultado derivado de un círculo
- **WHEN** existe un círculo en la zona (A,B) r0c0
- **THEN** la celda de resultados de la fila 0, columna B, muestra el ítem `b1` (capitalizado)

#### Scenario: Sin equivalencia marcada
- **WHEN** no hay círculos en la zona (A,C)
- **THEN** todas las celdas de la columna C de resultados permanecen vacías

### Requirement: Resaltado de conflictos de círculos
Cuando una zona contenga más de un círculo en la misma fila o en la misma columna, el sistema SHALL resaltar todas las celdas de esa zona (estilo `highlight-warning`).
_Estado: comportamiento observado y documentado en README ("Detección de conflictos en tiempo real"). Evidencia: `script.js:399-425`.

#### Scenario: Dos círculos en la misma fila
- **WHEN** la zona (A,B) tiene círculos en r0c0 y r0c1
- **THEN** todas las celdas de la zona (A,B) se resaltan en amarillo

### Requirement: Resaltado de filas o columnas completamente marcadas con cruz
Cuando una fila o una columna de una zona tenga el número máximo de cruces (`numItems`), el sistema SHALL resaltar todas las celdas de esa fila o columna.
_Estado: comportamiento observado y documentado en README ("Indicadores visuales cuando una fila/columna está completa o tiene errores"). Evidencia: `script.js:427-447`.

#### Scenario: Fila completa con cruces en modo 3x4
- **WHEN** la fila 1 de la zona (A,B) tiene 3 cruces
- **THEN** las 3 celdas de esa fila se resaltan en amarillo

### Requirement: Activación y desactivación de las ayudas visuales
El sistema SHALL permitir activar o desactivar los resaltados mediante el control "Ayudas visuales" (activado por defecto); cuando esté desactivado, el sistema SHALL no aplicar resaltados aunque existan conflictos.
_Estado: comportamiento observado y documentado en README ("Posibilidad de activar/desactivar estas ayudas"). Evidencia: `index.php:131-136`, `script.js:399-403`.

#### Scenario: Ayudas desactivadas
- **WHEN** el usuario desmarca "Ayudas visuales" y existe un conflicto de círculos en una zona
- **THEN** ninguna celda se resalta
