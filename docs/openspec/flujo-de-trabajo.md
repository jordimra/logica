# Fase 4 — Flujo de trabajo de cambios

> **Fecha:** 2026-11-17 · **Entradas:** `diagnostico-inicial.md`, `preparacion.md`, `especificaciones-iniciales.md`, specs de la Fase 3 (30 requisitos), decisiones PD-1…PD-4 e IC-1 aprobadas por el usuario (2026-11-17) · **OpenSpec:** CLI 2.1.0 (comandos verificados en esta sesión).

## Decisiones de alcance aprobadas (Fase 4, usuario)

| ID | Decisión | Consecuencia |
|---|---|---|
| PD-1 | **Corregir** XSS de `mode` (whitelist en servidor + escape) | Change CHG-3 |
| PD-2 | **Corregir** pérdida de marca con clicks rápidos (H3) | Change CHG-4 |
| PD-3 | **Unificar**: Ctrl+Z respeta inputs de texto (H4) y confirmaciones coherentes en limpiezas (H6) | Change CHG-5 |
| PD-4 | Esquema del JSON de export: **al diseño del agente** (propuesta en §6) | Change CHG-2 |
| IC-1 | **Confirmar antes de recargar** al cambiar de modo (R5) | Change CHG-6 |

## 1. Ciclo de cambio y responsabilidades

**Responsabilidades:** usuario = aprobaciones, decisiones de alcance, autorización de commits/archive. Agente (Plan/Build) = inspección, propuesta, ejecución y evidencia, siempre dentro del alcance aprobado.

Ciclo por change (adaptado a la realidad del proyecto: sin CI, sin compilación, app PHP+JS local):

1. **Explorar:** `git status`, specs y cambios activos (`openspec list`), código afectado, instrucciones. No sobrescribir trabajo local.
2. **Proponer:** `openspec new change <nombre>` → `proposal.md` con objetivo, alcance, exclusiones y criterios de aceptación.
3. **Deltas de specs:** `specs/<capability>/spec.md` dentro del change con secciones `## ADDED/MODIFIED/REMOVED Requirements` (escenarios `WHEN/THEN`).
4. **Diseño:** `design.md` cuando haya decisiones técnicas no triviales (p. ej. algoritmo de inferencia, esquema JSON). Riesgos registrados aquí.
5. **Tareas:** `tasks.md` con items verificables `[ ]/[x]/[!]`.
6. **Aprobación humana** de propuesta + deltas + diseño **antes de implementar** (puerta P1, §2).
7. **Línea base:** ejecutar la suite de caracterización (y tests pertinentes) **antes** de modificar; guardar evidencia (`docs/openspec/evidencia/<change>/antes.md` + artefactos).
8. **Implementar** solo el alcance aprobado.
9. **Re-ejecutar** la suite y registrar resultados (`…/despues.md`).
10. **Investigar diferencias** antes de tocar nada (regresión → corregirla en el change; cambio intencional → solo si hay delta aprobado).
11. **Verificar:** `openspec validate <change>`, cobertura de requisitos, riesgos, `git diff` revisado (sin cambios fuera de alcance).
12. **Archivar** solo con autorización expresa del usuario (puerta P3): `openspec archive <change>` (actualiza las specs principales).

**Encuadernación del primer change:** el change CHG-0 (suite de caracterización, §4) **no modifica producto** y debe completarse antes que CHG-1…CHG-6; su línea base es el punto de comparación de todos los cambios siguientes.

## 2. Puertas de aprobación (decisiones)

| Puerta | Cuándo | Qué se aprueba |
|---|---|---|
| **P1** | Antes de implementar (paso 6) | Propuesta, deltas de specs, diseño, criterios de aceptación |
| **P2** | Si surge un cambio de comportamiento intencional no previsto en el delta aprobado, o una decisión de diseño/alcance nueva (p. ej. schema PD-4 si se desvía de la propuesta) | Nuevo requisito/delta + actualización explícita del test afectado |
| **P3** | Antes de archivar | Tareas `[x]`, verificación OK, diff revisado → autorización expresa de `openspec archive` |
| **P4** | Commits/push/deploy | Autorización explícita del usuario por operación (restricción de la fase: sin commits sin autorización) |

**Gates de detención:** requisito ambiguo, cambio de alcance, riesgo nuevo de seguridad/compatibilidad, test fallado sin causa identificada, verificación no disponible (p. ej. servidor caído) → **detener el paso afectado, documentar y solicitar decisión**. No resolver silenciosamente decisiones de alcance.

## 3. Artefactos requeridos por change

| Artefacto | Ruta | Obligatorio |
|---|---|---|
| Propuesta | `openspec/changes/<name>/proposal.md` | Sí |
| Deltas de specs | `openspec/changes/<name>/specs/<capability>/spec.md` | Sí (salvo infraestructura pura → `--skip-specs` en archive) |
| Diseño | `openspec/changes/<name>/design.md` | Si hay decisiones técnicas no triviales |
| Tareas | `openspec/changes/<name>/tasks.md` | Sí (`[ ]/[x]/[!]`) |
| Evidencia de tests | `docs/openspec/evidencia/<name>/{antes,despues}.md` + capturas/salidas | Sí (línea base antes y después) |

## 4. Cuándo ejecutar los tests de caracterización

- **Suite de caracterización (T1–T10, Fase 1):** se crea en el **CHG-0** (solo tests, sin cambios de producto) en `tests/characterization/` (Node + Playwright contra `php -S localhost:8000`; fixtures en `tests/fixtures/`). No existe suite automatizada todavía; **no se declara línea base ejecutable hasta que CHG-0 se ejecute**.
- **Antes** de implementar cualquier change que toque la superficie cubierta: ejecutar los tests pertinentes y registrar `antes`.
- **Después** de implementar: re-ejecutar la misma selección y registrar `despues`.
- **Antes de archivar:** la suite completa (o la porción cubierta, declarada en la propuesta).
- T1 y la prueba XSS (V6) ya se ejecutaron una vez como evidencia de diagnóstico (Fase 2); su versión automatizada forma parte de CHG-0.
- **Entorno:** solo servidor local + datos sintéticos (puzles de prueba en memoria/página); sin servicios externos, sin efectos irreversibles (no se exportan archivos reales del usuario durante tests).

## 5. Comparación de resultados y gestión de diferencias

- Formato: tabla por test → `resultado antes | resultado después | coincidencia (sí/no) | nota`.
- **Diferencia sin delta aprobado** → tratar como **regresión**: investigar la causa (código vs. entorno vs. test defectuoso) antes de cambiar nada; corregir en el mismo change o abrir change nuevo si es de alcance distinto.
- **Diferencia con delta aprobado** (cambio intencional): exige (a) requisito/delta aprobado en P1/P2, (b) criterio de aceptación verificable, (c) actualización **explícita y registrada** del test con su valor anterior conservado en la evidencia.
- **Nunca** editar un test solo para que pase el código nuevo. Si un test "falla" porque captó un defecto que ahora se corrige, la actualización se documenta como cambio intencional (CHG-1: baseline `RangeError` → esperado "sin error y tabla actualizada"; CHG-2: JSON sin `board` → con `board`).
- **Comportamiento observado dudoso** (ni requisito ni defecto aprobado): no convertir en requisito; documentar el conflicto y pedir decisión (puerta P2).
- **Test no repetible o no automatizable**: registrar la limitación y el método alternativo (p. ej. verificación manual con Playwright + captura, como en V6/V7).

## 6. Propuesta de diseño PD-4 (esquema JSON de export — decisión del agente, pendiente de P1 en CHG-2)

```json
{
  "version": 2,
  "mode": "3x4",
  "cats": ["A", "B", "C", "D"],
  "items": [["a1","a2","a3"], ["b1","b2","b3"], ["c1","c2","c3"], ["d1","d2","d3"]],
  "description": "…",
  "board": { "0_1": { "0_0": 2, "0_1": 1, "1_0": 1 }, "0_2": { "0_0": 2 } }
}
```

Decisiones de diseño (justificadas):
- **`version: 2`**: compatibilidad hacia atrás; archivos v1 (sin `version`/`board`) se importan hoy igual que ahora (se ignoran las marcas).
- **Zonas clave `<gr>_<gc>`** reutilizando la notación interna de celdas (`cell_<gr>_<gc>_<r>_<c>`); estado `1`=❌, `2`=🔵, ausente=vacío (omitido para compactar).
- **Importación defensiva**: zonas noexistentes en el modo actual se ignoran; celdas con coordenadas fuera de `numItems` se ignoran; al importar **no** se re-disparan autocruce/inferencia (se restaura el estado tal cual + `updateResultsTable()`), evitando cascadas y el defecto H2.
- **Nombre de archivo** sin cambios: `puzle_<mode>.json`.

## 7. Gestión de fallos, riesgos y bloqueos

- **Test fallido (fuera de línea base esperada):** detener → hipótesis → reproducible → causa; solo entonces corregir producto o test (con P2 si es intencional). Marcar la tarea `[!]`.
- **Riesgo nuevo** (seguridad, compatibilidad, datos): registrar en `design.md` del change; si afecta a seguridad/compatibilidad/datos → detener y decidir (P2). Riesgos conocidos activos: R2 (hasta CHG-3), R1 (hasta CHG-1).
- **Bloqueos de entorno:** servidor caído → reiniciar (comando §9); Playwright no disponible → verificación manual documentada como evidencia alternativa; PHP ausente → ruta completa del §9.
- **Cambios locales del usuario:** no sobrescribir; si hay conflicto con el alcance, documentar y pedir instrucción.
- **Verificación no disponible** (p. ej. `openspec validate` falla por un bug del CLI): registrar la limitación y usar la verificación alternativa disponible; no omitir el control en silencio.

## 8. Verificación, revisión del diff y archivo

1. `openspec validate <change>` (y `--strict` cuando esté disponible sin fricción) → sin errores.
2. `openspec status --change <name>` → todos los artefactos completos.
3. Suite antes/después comparada (§5) sin diferencias no justificadas.
4. Tareas `[x]` con evidencia enlazada; tareas `[!]` resueltas o documentadas.
5. `git diff` revisado: solo ficheros del alcance; sin cambios de producto fuera del change; sin ficheros basura.
6. **P3:** autorización expresa del usuario → `openspec archive <change>` (aplica deltas a `openspec/specs/`); `--skip-specs` solo para changes sin deltas.
7. Resumen de cierre (deltas aplicados, tests antes/después, restos) antes de terminar (guía `operations.archive` de `config.yaml`).

## 9. Comandos comprobados y limitaciones conocidas

**Verificados en esta sesión (OpenSpec 2.1.0):**

| Comando | Uso |
|---|---|
| `openspec new change <name>` | Crear change |
| `openspec list` / `openspec list --specs` | Cambios activos / specs |
| `openspec show <name>` | Ver change o spec |
| `openspec validate <name>` / `--specs` / `--changes` / `--all` | Validar (escenarios exigen `**WHEN**`/`**THEN**`; requirements exigen `SHALL`/`MUST`) |
| `openspec status --change <name>` / `--all` | Estado de artefactos |
| `openspec archive <name> [-y --skip-specs --json]` | Archivar (requiere P3) |

**Entorno:**

| Comando | Uso |
|---|---|
| `& "C:\Users\jordimra\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.NTS.8.4_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe" -S localhost:8000` (desde la raíz) | Servidor (rutas largas: el PATH nuevo no está visible en shells heredadas) |
| Playwright (herramienta de OpenCode) | Navegación, clicks, consola, evaluación JS para tests de caracterización |
| `git -c safe.directory="B:/proyectos/programar/Asistido/openspec/logica" …` | Git (dubious ownership del repo) |

**Limitaciones conocidas:**
- **Sin CI ni automatización**: todos los controles de este flujo son manuales/asistidos y se ejecutan en esta sesión; **ningún gate está automatizado**. No se afirma nada en contrario.
- Sin compilación ni lint; la verificación de sintaxis JS/PHP se apoya en la ejecución (playwright/PHP) y en `openspec validate` (solo artefactos).
- El servidor corre en background de la sesión; si la sesión se cierra, re-iniciar con el comando anterior.
- La línea base automatizada no existe hasta completar CHG-0.

## 10. Cola de cambios planificada (orden de ejecución)

| # | Change | Contenido | Decisiones | Specs afectadas | Tests antes/después |
|---|---|---|---|---|---|
| CHG-0 | `characterization-suite` | Crear `tests/characterization/` (T1–T10 + XSS) y ejecutar línea base | Fase 1 (plan) | Sin deltas (`--skip-specs` en archive) | Baseline absoluto |
| CHG-1 | `fix-inference-recursion` | Corregir H2: inferencia a punto fijo sin recursión infinita; resultados siempre actualizados | D2 | `transitive-inference` (MODIFIED) | T1 (cambio intencional documentado), T4 |
| CHG-2 | `export-progress-json` | Corregir H10: export/import de progreso con el esquema §6 | D2 + PD-4 | `data-import-export` (MODIFIED) | T6, T7, T10 (cambio intencional) |
| CHG-3 | `sanitize-mode-param` | Corregir R2: whitelist de `mode` en servidor + escape | PD-1 | `board-modes` (MODIFIED: el requisito PD-1 pasa a confirmado) | Prueba XSS (cambio intencional) |
| CHG-4 | `fast-click-retention` | Corregir H3: clicks rápidos en celdas distintas no pierden la marca (diseño: pila de acciones en cola en lugar de cancelación) | PD-2 | `board-interaction` (MODIFIED) | T2 (escenario de clicks rápidos) |
| CHG-5 | `undo-and-confirm-coherence` | H4: Ctrl+Z respeta inputs; H6: confirmaciones coherentes (o explícitamente documentadas) | PD-3 | `undo-history`, `board-interaction` (MODIFIED) | T5 + manual |
| CHG-6 | `confirm-before-mode-reload` | R5/IC-1: confirmación antes de recargar al cambiar de modo | IC-1 | `board-modes` (MODIFIED) | Manual (T9) |

Cada change sigue el ciclo §1 completo, con su propia puerta P1.

---

**Comprobaciones registradas:** `openspec list` (sin cambios activos), `openspec new/change/archive/status/validate --help` (comandos verificados), `git status` limpio antes de este cambio, `config.yaml` parseable tras editar `operations:` (verificar con `openspec list` al cerrar la fase). **Entregable:** este documento + `operations:` en `config.yaml`. **Esperando aprobación para la Fase 5** (que incluye la ejecución de CHG-0 y el primer change con las puertas P1–P4).
