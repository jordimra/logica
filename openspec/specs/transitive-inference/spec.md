# Inferencia transitiva

## Purpose
Deducer automáticamente relaciones entre categorías a partir de las equivalencias marcadas por el usuario (A=B y B=C ⟹ A=C).

## Requirements

### Requirement: Deducción transitiva de equivalencias
Cuando el usuario confirma un círculo entre dos categorías, el sistema SHALL buscar, para cada otra categoría, las equivalencias ya marcadas con ambas categorías y, si existen, marcar automáticamente el círculo correspondiente en la zona que une esas dos categorías.
_Estado: requisito confirmado (README, "Lógica Transitiva Automática") y comportamiento observado parcial: la deducción se produce. Evidencia: `script.js:250-296`. Caracterización: T1.

#### Scenario: Triángulo A=B y A=C en modo 3x4
- **WHEN** el usuario marca círculo en la zona (A,B) r0c0 y luego círculo en la zona (A,C) r0c0
- **THEN** el sistema marca automáticamente círculo en la zona (B,C) r0c0 y cruza el resto de la fila 0 y columna 0 de esa zona

### Requirement: La inferencia termina y la tabla de resultados queda siempre actualizada
El proceso de inferencia SHALL terminar para cualquier secuencia de marcas y, tras cada marca, la tabla RESULTADOS SHALL reflejar el estado final de las celdas.
_Estado: **REQUISITO CONFIRMADO por D2 (2026-11-17): corrige el defecto H2.** Línea base actual (T1 ejecutado 2026-11-17): recursión sin límite (ciclo `applyState→infer→setRel`) y tabla RESULTADOS no actualizada.

#### Scenario: Línea base del defecto (comportamiento actual)
- **WHEN** se ejecuta el triángulo (A,B) r0c0 + (A,C) r0c0 en modo 3x4 sobre el código actual
- **THEN** se observa: (B,C) r0c0 inferido (círculo), error `RangeError: Maximum call stack size exceeded` en consola, y la celda de resultados de C en la fila 0 permanece vacía

#### Scenario: Comportamiento requerido tras la corrección
- **WHEN** se ejecuta el triángulo (A,B) r0c0 + (A,C) r0c0 en modo 3x4
- **THEN** no se produce ningún error, (B,C) r0c0 queda inferido como círculo y la tabla RESULTADOS muestra la equivalencia completa de la fila 0 (B1 y C1)

### Requirement: La inferencia no sobrescribe círculos existentes
El sistema SHALL no modificar una celda que ya contenga un círculo cuando aplique cruces o inferencias; las celdas con círculo solo cambian de estado por acción explícita del usuario.
_Estado: comportamiento observado. Evidencia: `script.js:242-248` (`force` ignora celdas con círculo).

#### Scenario: Inferencia sobre celda ya marcada
- **WHEN** la inferencia intenta marcar una celda que ya contiene un círculo
- **THEN** el círculo se conserva y el resto de la inferencia sigue aplicándose sobre el estado existente

### Requirement: Inferencia solo entre categorías con zona
El sistema SHALL aplicar inferencia únicamente entre pares de categorías que tengan zona renderizada; los pares sin zona (devolución `null` de `getCoords`) SHALL ignorarse sin error.
_Estado: comportamiento observado. Evidencia: `script.js:261-303`. Caracterización: pendiente (T4).

#### Scenario: Par sin zona en modo 3x4
- **WHEN** la inferencia evalúa el par de categorías (C,D) que no tiene zona en modo `3x4`
- **THEN** el par se omite y no se produce ningún efecto ni error
