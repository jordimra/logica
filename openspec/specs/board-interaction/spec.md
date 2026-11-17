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
El sistema SHALL ejecutar la acción de un click simple 250 ms después del click, y SHALL cancelar la acción pendiente si se produce otro click antes de ese plazo.
_Estado: comportamiento observado (commit `c94ae5c`). Evidencia: `script.js:5-6,198-220`. **Nota:** esto implica que dos clicks rápidos en celdas distintas pierden la primera marca (defecto H3; **corrección aprobada por PD-2, 2026-11-17, Fase 4, pendiente en change CHG-4**). Caracterización: pendiente (T2).

#### Scenario: Clicks rápidos en celdas distintas
- **WHEN** el usuario hace click en celda X y, a menos de 250 ms, click en celda Y
- **THEN** solo se registra la acción sobre Y (la acción pendiente de X se cancela) — comportamiento observado, defecto H3

### Requirement: Limpieza de una zona con doble click
Un doble click sobre una zona del tablero SHALL vaciar todas las celdas de esa zona y cancelar cualquier click simple pendiente sobre ella.
_Estado: comportamiento observado. Evidencia: `script.js:363-376` (el HTML asigna `ondblclick="cleanZone(...)"`, `index.php:122`).

#### Scenario: Doble click en una zona
- **WHEN** el usuario hace doble click sobre la zona (A,B) que contiene marcas
- **THEN** todas las celdas de la zona quedan vacías y los resultados se recalculan

### Requirement: Limpieza de un grupo de categoría con doble click en su etiqueta
Un doble click sobre la etiqueta de una categoría (fila o columna) SHALL vaciar las celdas correspondientes a ese ítem en todas las zonas donde la categoría participa (como fila o como columna).
_Estado: comportamiento observado. Evidencia: `script.js:339-356` (sin diálogo de confirmación; PD-3 sobre la inconsistencia con `cleanCategory`, H6).

#### Scenario: Doble click en la etiqueta de B (ítem 1)
- **WHEN** el usuario hace doble click sobre la etiqueta del ítem 1 de la categoría B
- **THEN** se vacían las celdas de la fila/columna del ítem 1 en las zonas (A,B) y (B,C)… (todas las zonas que contienen B)

### Requirement: Limpieza completa del tablero con confirmación
El botón "Limpiar Tablero" SHALL solicitar confirmación antes de vaciar todas las celdas del tablero y guardar el estado anterior en el historial.
_Estado: comportamiento observado. Evidencia: `script.js:322-330`.

#### Scenario: Cancelar la limpieza
- **WHEN** el usuario pulsa "Limpiar Tablero" y responde No a la confirmación
- **THEN** el tablero no cambia y no se añade un estado al historial
