# Fase 3 — Especificaciones iniciales

> **Fecha:** 2026-11-17 · **Entradas:** `diagnostico-inicial.md`, `preparacion.md`, `openspec/config.yaml`, código fuente (100 %), decisiones D1–D4 aprobadas · **OpenSpec:** CLI 2.1.0, esquema `spec-driven` (formato verificado contra la plantilla y el parser instalados).

## 1. Capacidades y rutas de specs creadas

| Capacidad | Ruta | Requisitos |
|---|---|---|
| Modos y configuración de la cuadrícula | `openspec/specs/board-modes/spec.md` | 5 |
| Interacción con el tablero | `openspec/specs/board-interaction/spec.md` | 6 |
| Inferencia transitiva | `openspec/specs/transitive-inference/spec.md` | 4 |
| Tabla de resultados y ayudas visuales | `openspec/specs/results-and-visual-aids/spec.md` | 4 |
| Historial y deshacer | `openspec/specs/undo-history/spec.md` | 4 |
| Datos personalizables e import/export | `openspec/specs/data-import-export/spec.md` | 7 |

Total: **30 requisitos** (35 escenarios). Verificación: `openspec validate --specs` → **6 passed, 0 failed, 0 warnings** (2026-11-17).

## 2. Requisitos y escenarios incluidos

Ver los archivos (no se duplican aquí). Estructura por requirement: texto normativo (`SHALL`) + línea `_Estado:` con clasificación y evidencia + escenarios `WHEN/THEN`.

## 3. Fuentes y evidencias

- **Código:** `logic.php`, `index.php`, `script.js` (líneas citadas en cada requirement).
- **README.md:** características anunciadas (transitividad, limpieza inteligente, ayudas, import/export de "plantillas o progresos").
- **Ejecución 2026-11-17 (Fase 2):** V5–V7 (servidor PHP, XSS reflejado, T1: triángulo → `RangeError` + tabla sin actualizar).
- **Git:** commits `b5481f7`, `0b34543` (undo), `c94ae5c` (retardo de doble click) como contexto de las decisiones de diseño actuales.
- **Decisiones aprobadas:** D1 (entorno PHP local), D2 (H2/H10 son defectos a corregir), D4 (versionado).

## 4. Distinción: comportamiento observado vs. requisito confirmado

Cada requirement lleva su clasificación explícita en la línea `_Estado:`:

- **Comportamiento observado** (línea base; no afirma que sea deseado): modos/zonas, ciclo de celdas, autocruce, demora de 250 ms, limpiezas, derivación de resultados, resaltados, historial/undo, import/export actuales, personalización de textos.
- **Requisitos confirmados** (con aprobación):
  - *Inferencia termina y resultados siempre actualizados* (D2, corrige H2) — con scenario de **línea base del defecto** (comportamiento actual) y scenario de **comportamiento requerido**.
  - *Export incluye el progreso del tablero* (D2, corrige H10) — igual tratamiento.
  - Características del README (transitividad, limpieza inteligente, ayudas activables, import/export) se tratan como requisitos confirmados por documentación de producto, y donde el comportamiento los contradice queda documentada la discrepancia (H2, H10).
- **Pendientes de decisión (no son requisitos definitivos; marcados como tales):**
  - **PD-1:** validación/escape del parámetro `mode` (XSS R2, `board-modes`).
  - **PD-2:** pérdida de marca con clicks rápidos en celdas distintas (H3, `board-interaction`).
  - **PD-3:** Ctrl+Z dentro de inputs de texto (H4, `undo-history`) e inconsistencia de confirmaciones en limpiezas (H6, `board-interaction`).
  - **PD-4:** esquema exacto del JSON extendido para export de progreso (H10, `data-import-export`).

## 5. Relación con tests de caracterización

| Test (Fase 1) | Requirement/escenario que demuestra | Estado |
|---|---|---|
| T1 | `transitive-inference`: deducción transitiva (obs. ✔ inferencia funciona) y defecto H2 (línea base del defecto: `RangeError` + `res_val_C_0` vacío) | **Ejecutado una vez** (evidencia V7); suite pendiente |
| T2 | `board-interaction`: ciclo de estados; demora 250 ms (H3) | Propuesto |
| T3 | `board-interaction`: limpieza automática al colocar círculo | Propuesto |
| T4 | `board-modes`: topología de zonas; `transitive-inference`: pares sin zona | Propuesto |
| T5 | `undo-history`: límite 50, botón/Ctrl+Z, sin historial | Propuesto |
| T6 | `data-import-export`: personalización, import mismo modo | Propuesto |
| T7 | `data-import-export`: import de otro modo (sessionStorage + recarga) | Propuesto |
| T10 | `data-import-export`: línea base del defecto H10 (JSON sin estado) | Propuesto |
| — (V6) | `board-modes`: inyección vía `mode` (R2, defecto observado) | **Ejecutado** (evidencia V6) |

Los tests pendientes **no están creados** (Fase 4); los ejecutados se citan como evidencia de diagnóstico, no como cobertura de suite.

## 6. Riesgos y trazabilidad

| Riesgo (diagnóstico) | Trazabilidad en specs |
|---|---|
| R1 (recursión) | `transitive-inference` → requirement "La inferencia termina…" (D2) + scenario línea base |
| R2 (XSS `mode`) | `board-modes` → requirement "El servidor valida y escapa…" (PD-1) |
| R5 (pérdida al cambiar modo) | **Sin requirement todavía** (ver §7, incertidumbre IC-1): no hay fuente que la convierta en requisito ni defecto aprobado |
| R6 (H3/H4) | `board-interaction` (PD-2), `undo-history` (PD-3) |
| R7 (export de progreso) | `data-import-export` → requirement "Exportación… progreso" (D2) + PD-4 |
| R8 (andamiaje sin versionar) | Cerrado en Fase 2 (commits `8d3eecc`, `b292ba0`) |

## 7. Contradicciones, inferencias y decisiones pendientes

- **C1 (diagnóstico):** README promete export de progreso; el código no lo incluye → resuelto como defecto H10 (D2) con requisito confirmado + PD-4 para el esquema.
- **C2 (diagnóstico):** README anuncia la transitividad; la implementación falla en su caso típico → resuelto como defecto H2 (D2) con requisito confirmado de terminación/actualización.
- **PD-1…PD-4:** ver §4. Requieren decisión antes de crear los changes en Fase 4 (PD-4 es requisito técnico para el change de H10; PD-1–PD-3 definen alcance de cambios opcionales).
- **IC-1 (nuevo):** el riesgo R5 (pérdida de estado al recargar por cambio de modo) no tiene requisito ni defecto aprobado: ¿se documenta solo, se pide confirmación antes de recargar, o se propone auto-guardado? **Pendiente.**
- **Inferencia H9** (topología 4x4/5x4 = 3x4 con más ítems) queda capturada como comportamiento observado en `board-modes` (sin afirmar que sea deseada).

## 8. Cobertura y limitaciones

- **Cobertura:** toda la superficie funcional documentada (modos, tablero, inferencia, resultados/ayudas, undo, datos) tiene spec. No hay specs de estilo/UI (fuera de alcance funcional) ni de despliegue (sin entorno de producción conocido, D3).
- **Limitaciones:**
  - Las specs describen el sistema **tal como se documentó el 2026-11-17**; los tests pendientes (Fase 4) pueden revelar comportamientos no capturados (p. ej. detalles de `5x5`/`4x4` en inferencia) → se actualizarán entonces como cambios, no como ediciones silenciosas.
  - 4 requisitos dependen de decisiones pendientes (PD-1…PD-4): se han registrado como observaciones/requisitos marcados, **no** como línea base aceptada.
  - `README.md` truncado (H8): se usó como fuente parcial; no afecta a la especificación funcional.
- **Comprobaciones ejecutadas:** `openspec validate --specs` (6/6, 0 warnings); `openspec list --specs` (30 requirements); `git status` limpio tras el commit de esta fase.

**Entregables:** 6 specs OpenSpec + este informe. **Esperando aprobación humana antes de la Fase 4** (flujo de cambios: primero la suite de caracterización T2–T10, luego los changes de D2 y los aprobados de PD-1…PD-4).
