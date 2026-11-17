# Spec Delta — board-interaction

## MODIFIED Requirements

### Requirement: Demora de 250 ms para desambiguar click simple de doble click
El sistema SHALL ejecutar la acción de un click simple 250 ms después del click, con las acciones pendientes en cola por celda: un click en una celda distinta no cancela las de otras celdas, un nuevo click en la misma celda reemplaza su acción pendiente, y un doble click en una zona cancela solo las acciones pendientes de esa zona.
_Estado: corregido por CHG-4 (PD-2). Evidencia: `docs/openspec/evidencia/fast-click-retention/`._

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
Un doble click sobre una zona del tablero SHALL solicitar confirmación antes de vaciar las celdas con cruz de esa zona y cancelar cualquier click simple pendiente sobre ella; los círculos existentes NO se modifican por la limpieza, y si el usuario cancela, la zona no se modifica.
_Estado: confirmación añadida por CHG-5 (PD-3). Evidencia: `docs/openspec/evidencia/undo-and-confirm-coherence/`._

#### Scenario: Doble click en una zona
- **WHEN** el usuario hace doble click sobre la zona (A,B) que contiene cruces y confirma la limpieza
- **THEN** los cruces de la zona quedan vacíos, el círculo r0c0 (si existiera) permanece, los resultados se recalculan y cualquier click simple pendiente de esa zona se cancela

#### Scenario: Cancelar la limpieza de zona
- **WHEN** el usuario hace doble click sobre una zona con marcas y responde No a la confirmación
- **THEN** la zona permanece exactamente como estaba (sin limpieza ni cambios)
