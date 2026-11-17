# Modos y configuración de la cuadrícula

## Purpose
Seleccionar en el servidor el modo del puzle (tamaño de la cuadrícula) y definir la topología de zonas que se renderiza en la página.

## Requirements

### Requirement: Selección de modo y dimensiones por modo
El servidor SHALL seleccionar la configuración desde el parámetro GET `mode` (`3x4` por defecto) y generar la cuadrícula con estas dimensiones: `3x4` = 4 categorías × 3 ítems; `4x4` = 4 × 4; `5x4` = 4 × 5; `5x5` = 5 categorías (A–E) × 5 ítems.
_Estado: comportamiento observado y documentado en README ("Configuración Dinámica"). Evidencia: `logic.php:15-35`, `index.php:16-23`. Caracterización: pendiente (T4).

#### Scenario: Carga sin parámetro de modo
- **WHEN** se carga `/index.php` sin parámetro `mode`
- **THEN** la página renderiza 4 categorías (A, B, C, D) con 3 ítems cada una y el selector marca `3x4 (Original)`

#### Scenario: Modo 5x5 con variable E
- **WHEN** se carga `/index.php?mode=5x5`
- **THEN** la página renderiza 5 categorías (A–E) con 5 ítems cada una

### Requirement: Topología de zonas por modo
La cuadrícula SHALL renderizar solo las zonas (pares de categorías comparables) definidas por modo: en `3x4`/`4x4`/`5x4`, 6 zonas —(A,B), (A,C), (A,D), (D,B), (D,C), (C,B) —; en `5x5`, 10 zonas —las 6 anteriores más (E,B), (E,C), (E,D), (D,E)—. La lógica cliente (`getCoords`) SHALL devolver `null` para pares de categorías sin zona.
_Estado: comportamiento observado. Evidencia: `index.php:109-113`, `script.js:286-303` (verificada en ejecución 2026-11-17). Caracterización: pendiente (T4).

#### Scenario: Zonas del modo 3x4
- **WHEN** se renderiza la tabla LÓGICA en modo `3x4`
- **THEN** existen exactamente las zonas (A,B), (A,C), (A,D), (D,B), (D,C) y (C,B), cada una con `numItems`×`numItems` celdas marcables

### Requirement: Valores desconocidos de modo
El servidor SHALL aceptar cualquier valor de `mode` ajeno a los cuatro definidos devolviendo la configuración de `3x4`, sin error ni validación adicional.
_Estado: comportamiento observado (no es un requisito aprobado; se registra por trazabilidad del riesgo R2/XSS). Evidencia: `logic.php:5,30-34`.

#### Scenario: Modo no reconocido
- **WHEN** se carga `/index.php?mode=modo-inexistente`
- **THEN** la página renderiza la cuadrícula `3x4` sin fallo

### Requirement: Etiquetas por defecto de categorías e ítems
El servidor SHALL renderizar categorías con nombres por defecto `A`…`E` e ítems con nombres por defecto `a1`, `a2`, … (categoría en minúscula + ordinal), todos editables desde la tabla INTRODUCCIÓN.
_Estado: comportamiento observado y documentado en README ("Campos de texto para personalizar"). Evidencia: `index.php:33-43`, `logic.php:10`.

#### Scenario: Etiquetas por defecto
- **WHEN** se carga la página en modo `3x4`
- **THEN** la tabla INTRODUCCIÓN muestra categorías A–D e ítems `a1..a3`, `b1..b3`, `c1..c3`, `d1..d3`

### Requirement: El servidor valida y escapa el parámetro `mode`
El servidor SHALL validar `mode` contra la lista de modos admitidos y escapar todo valor antes de ecoearlo en la página.
_Estado: **REQUISITO PENDIENTE DE DECISIÓN (PD-1).** No confirmado hoy: el valor crudo de `$_GET['mode']` se ecoea sin escapar en `<title>` y en el bloque `<script>` (XSS reflejado, R2), confirmado en ejecución 2026-11-17 (V6). Evidencia del defecto: `index.php:7,174`, `logic.php:5`. No se incluye en la línea base de comportamiento aceptado.

#### Scenario: Intento de inyección vía parámetro (defecto observado)
- **WHEN** se carga `/index.php?mode=%22%3E%3Cscript%3Ealert(1)%3C%2Fscript%3E`
- **THEN** hoy el payload se refleja sin escapar en el `<title>` (comportamiento observado, defecto R2); tras la decisión PD-1 y su corrección, el valor se normaliza a un modo válido o se escapa y el payload no se ejecuta
