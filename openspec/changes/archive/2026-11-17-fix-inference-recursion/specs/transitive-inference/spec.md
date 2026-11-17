# Spec Delta — transitive-inference

## MODIFIED Requirements

### Requirement: La inferencia termina y la tabla de resultados queda siempre actualizada
El proceso de inferencia SHALL terminar para cualquier secuencia de marcas y, tras cada marca, la tabla RESULTADOS SHALL reflejar el estado final de las celdas.
_Estado: requisito confirmado por D2 (2026-11-17); implementado por CHG-1 (propagación iterativa a punto fijo, `design.md`). La línea base del defecto anterior (H2) queda conservada en la evidencia: `docs/openspec/evidencia/characterization-suite/` (CHG-0) y `fix-inference-recursion/antes.md`._

#### Scenario: Línea base del defecto (comportamiento actual)
- **WHEN** (histórico, código pre-CHG-1) se marca el triángulo (A,B) r0c0 + (A,C) r0c0 en modo 3x4
- **THEN** se observa `(B,C) r0c0` inferido, `RangeError: Maximum call stack size exceeded` en consola y `res_val_C_0` vacío (evidencia conservada: baseline de CHG-0; documento histórico, no comportamiento exigido)

#### Scenario: Comportamiento requerido tras la corrección
- **WHEN** se marca el triángulo (A,B) r0c0 + (A,C) r0c0 en modo 3x4
- **THEN** no se produce ningún error, (B,C) r0c0 queda inferido como círculo y la tabla RESULTADOS muestra `B1` y `C1` en la fila 0

#### Scenario: Estrella multi-paso en modo 5x5
- **WHEN** el usuario marca círculo en r0c0 de las zonas (A,B), (A,C), (A,D) y (A,E) (modo 5x5)
- **THEN** las zonas (B,C), (B,D), (B,E), (C,D), (C,E) y (D,E) quedan inferidas como círculos en r0c0, no se produce ningún error en consola y la tabla RESULTADOS muestra la equivalencia completa de la fila 0
