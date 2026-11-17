# Spec Delta — board-interaction

## MODIFIED Requirements

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
Un doble click sobre una zona del tablero SHALL vaciar las celdas con cruz de esa zona y cancelar cualquier click simple pendiente sobre ella. Los círculos existentes de la zona NO se modifican por la limpieza (la primitiva de limpieza `force` no toca celdas con círculo — comportamiento observado y conservado).
_Estado: corrección de precisión sobre el requisito previo (Fase 3), que describía "vaciar todas las celdas" — en la implementación la limpieza no modifica círculos (evidencia: `force` en `script.js`, verificada en ejecución por T2b, 2026-11-17). Sin cambio de código en CHG-4; se documenta el comportamiento real observado._

#### Scenario: Doble click en una zona
- **WHEN** el usuario hace doble click sobre la zona (A,B) que contiene un círculo en r0c0 y cruces por autocruce
- **THEN** los cruces de la zona quedan vacíos, el círculo r0c0 permanece, los resultados se recalculan y cualquier click simple pendiente de esa zona se cancela
