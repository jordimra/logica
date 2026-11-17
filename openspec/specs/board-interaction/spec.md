# Interacción con el tablero

## Purpose
Definir cómo el usuario marca celdas (vacío, cruz, círculo) y limpia zonas, etiquetas o el tablero completo.

## Requirements

### Requirement: Ciclo de estados de una celda
Una celda del tablero SHALL ciclar de vacío a cruz (❌) y de cruz a círculo (🔵) con un click simple, volviendo a vacío tras el tercer click.
_Estado: comportamiento observado y documentado en README ("Haz clic para marcar una cruz o un círculo"). Evidencia: `script.js:198-234`. Caracterización: pendiente (T2).

#### Scenario: Ciclo completo de una celda
- **WHEN** el usuario hace 3 clicks sucesivos (con intervalo > 250 ms) sobre una celda vacía
- **THEN** la celda pasa por los estados vacío → ❌ → 🔵 → vacío

### Requirement: Limpieza automática al colocar un círculo
Al colocar un círculo en una zona, el sistema SHALL marcar con cruz el resto de la fila y de la columna de esa zona. El sistema SHALL no sobrescribir una celda que ya contenga un círculo.
_Estado: comportamiento observado y documentado en README ("Limpieza inteligente de filas y columnas"). Evidencia: `script.js:236-248`. Caracterización: pendiente (T3).

#### Scenario: Autocruce al confirmar
- **WHEN** el usuario coloca un círculo en la zona (A,B), fila 0, columna 0 (modo 3x4)
- **THEN** las celdas (A,B) r0c1, r0c2, r1c0 y r2c0 quedan marcadas con cruz, y el resto del tablero permanece inalterado

### Requirement: Demora de 250 ms para desambiguar click simple de doble click
El sistema SHALL ejecutar la acción de un click simple 250 ms después del click, manteniendo las acciones pendientes en una cola por celda: un click sobre una celda distinta SHALL no cancelar las acciones pendientes de otras celdas, un nuevo click sobre la misma celda SHALL reemplazar su acción pendiente (último click gana), y un doble click sobre una zona SHALL cancelar únicamente las acciones pendientes de esa zona.
_Estado: comportamiento corregido por CHG-4 (PD-2 aprobado, 2026-11-17: "pila de acciones en cola en lugar de cancelación"; ver `design.md`). La línea base del defecto anterior (H3: cancelación global por `clickTimer` único) queda conservada como evidencia en `docs/openspec/evidencia/fast-click-retention/antes.md` y en la suite de caracterización (CHG-0)._

#### Scenario: Clicks rápidos en celdas distintas
- **WHEN** el usuario hace click en celda X y, a menos de 250 ms, click en celda Y
- **THEN** ambas acciones se ejecutan (una por celda, 250 ms después de su click) y ninguna marca se pierde
_Estado: cambio intencional — en la línea base (defecto H3) la acción de X se cancelaba; evidencia anterior conservada en `antes.md`._

#### Scenario: Clicks rápidos en la misma celda
- **WHEN** el usuario hace dos clicks en la misma celda con intervalo menor a 250 ms (sin llegar a doble click)
- **THEN** solo se ejecuta una acción (el último click reemplaza el pendiente), conservando el comportamiento del baseline

#### Scenario: Doble click cancela las acciones pendientes de la zona
- **WHEN** el usuario hace click rápido sobre una celda de la zona Z y, dentro de la ventana de 250 ms, doble click sobre esa misma zona
- **THEN** la acción pendiente de esa zona se cancela (sin marca residual) y la limpieza de la zona elimina los cruces; los círculos existentes permanecen (la limpieza no modifica círculos — comportamiento de siempre, ver `force`)

#### Scenario: Doble click no cancela acciones pendientes de otras zonas
- **WHEN** el usuario hace click rápido sobre una celda de la zona Z1 y, dentro de la ventana de 250 ms, doble click sobre una zona distinta Z2
- **THEN** la acción pendiente de Z1 se ejecuta igualmente (la cancelación del doble click solo afecta a su propia zona)

### Requirement: Limpieza de una zona con doble click
Un doble click sobre una zona del tablero SHALL solicitar confirmación antes de vaciar las celdas con cruz de esa zona y cancelar cualquier click simple pendiente sobre ella. Los círculos existentes de la zona NO se modifican por la limpieza (la primitiva de limpieza no toca celdas con círculo — comportamiento observado y conservado). Si el usuario cancela, la zona no se modifica.
_Estado: corrección CHG-5 (PD-3: confirmaciones coherentes; ver `design.md`). La línea base anterior (doble click sin confirmación) queda conservada en `docs/openspec/evidencia/undo-and-confirm-coherence/antes.md`._

#### Scenario: Doble click en una zona
- **WHEN** el usuario hace doble click sobre la zona (A,B) que contiene cruces y confirma la limpieza
- **THEN** los cruces de la zona quedan vacíos, el círculo r0c0 (si existiera) permanece, los resultados se recalculan y cualquier click simple pendiente de esa zona se cancela

#### Scenario: Cancelar la limpieza de zona
- **WHEN** el usuario hace doble click sobre una zona con marcas y responde No a la confirmación
- **THEN** la zona permanece exactamente como estaba (sin limpieza ni cambios)

### Requirement: Limpieza de un grupo de categoría con doble click en su etiqueta
Un doble click sobre la etiqueta de un ítem de una categoría (fila o columna) SHALL solicitar confirmación antes de vaciar las celdas correspondientes a ese ítem en todas las zonas donde la categoría participa (como fila o como columna). Si el usuario cancela, el tablero no se modifica.
_Estado: corrección CHG-5 (PD-3: confirmaciones coherentes; la línea base "sin diálogo de confirmación" queda conservada en `docs/openspec/evidencia/undo-and-confirm-coherence/antes.md`)._

#### Scenario: Doble click en la etiqueta de B (ítem 1)
- **WHEN** el usuario hace doble click sobre la etiqueta del ítem 1 de la categoría B y confirma la limpieza
- **THEN** se vacían las celdas de la fila/columna del ítem 1 en las zonas (A,B) y (B,C)… (todas las zonas que contienen B)

#### Scenario: Cancelar la limpieza de grupo de ítem
- **WHEN** el usuario hace doble click sobre la etiqueta de un ítem y responde No a la confirmación
- **THEN** el tablero no cambia (las celdas de ese ítem permanecen)

### Requirement: Limpieza completa del tablero con confirmación
El botón "Limpiar Tablero" SHALL solicitar confirmación antes de vaciar todas las celdas del tablero y guardar el estado anterior en el historial.
_Estado: comportamiento observado. Evidencia: `script.js:322-330`.

#### Scenario: Cancelar la limpieza
- **WHEN** el usuario pulsa "Limpiar Tablero" y responde No a la confirmación
- **THEN** el tablero no cambia y no se añade un estado al historial

### Requirement: Limpieza de un grupo completo de categoría con doble click en su cabecera
Un doble click sobre la cabecera de una categoría (etiqueta de fila o columna de la categoría) SHALL solicitar confirmación; al confirmarse, el sistema SHALL vaciar todas las celdas de todos los ítems de esa categoría en las zonas donde participa. Si el usuario cancela, el tablero no se modifica.
_Estado: comportamiento observado documentado por CHG-5 (`cleanCategory` existía antes sin estar especificada; sin cambio de código). Caracterización: T5b._

#### Scenario: Doble click en la cabecera de B
- **WHEN** el usuario hace doble click sobre la cabecera de la categoría B y confirma
- **THEN** se vacían las celdas de todos los ítems de B en las zonas donde B participa y el estado previo queda en el historial (deshacible con Ctrl+Z)
