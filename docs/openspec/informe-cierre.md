# Informe de cierre — Adaptación a OpenSpec + campaña de corrección (CHG)

> **Fecha:** 2026-11-20 · **Proyecto:** Generador de Puzles Lógicos (PHP 8.4 + JS vanilla, sin dependencias ni BD) · **OpenSpec CLI:** 2.1.0
> **Documentos previos:** `diagnostico-inicial.md` (Fase 1) · `preparacion.md` (Fase 2) · `especificaciones-iniciales.md` (Fase 3) · `flujo-de-trabajo.md` (Fase 4) · `informe-validacion.md` (Fase 5, documento histórico del punto intermedio)

## 1. Alcance

Dos fases de trabajo:

1. **Adaptación a OpenSpec** (Fases 1-5): diagnóstico con evidencias, línea base de tests de caracterización, 6 specs principales, flujo de cambios con puertas P1-P4 y veredicto de validación (ADAPTADO CON LIMITACIONES ACEPTADAS).
2. **Campaña CHG-0…CHG-6 + limpieza**: corrección de los 6 defectos documentados en el diagnóstico, cada uno como change propio con delta de spec, tests de caracterización antes/después y commit 1:1.

## 2. Estado final verificado

| Control | Resultado | Comprobante |
|---|---|---|
| Specs principales | 6 specs, **32 requisitos**, válidas con **0 warnings** | `openspec validate <spec>` (por spec) |
| Suite de caracterización | **14/14 tests, 0 derivas, 0 BASELINE-DEFECTO** | `npm run test:characterization` (reporte en `evidencia/characterization-suite/`) |
| Defectos H2, H3, H4/H6, R2, R5, H10 | **Todos corregidos** y verificados antes/después | `evidencia/<change>/antes.md` + `despues.md` |
| Git | Working tree limpio; 9 commits en `main` | `git log --oneline` |
| Changes OpenSpec | 8 archivados, 0 activos | `openspec list` |

**Superficie de cambio de producto** (desde el andamiaje, CHG-1…6): `script.js` (+169/−~50), `index.php` (+6), `logic.php` (+7) → **+139/−43 líneas netas** en 3 ficheros. Tests: 10 → 14 tests en `tests/characterization/run.mjs`.

## 3. Registro de changes (1 commit = 1 change = 1 delta de spec + evidencia)

| # | Change | Defecto | Corrección | Commit |
|---|---|---|---|---|
| CHG-0 | `characterization-suite` | — (línea base) | Suite T1-T10 reproducible (2 ejecuciones, 0 derivas); 5 tests capturan defectos como BASELINE-DEFECTO | `88af583` |
| CHG-1 | `fix-inference-recursion` | H2/R1: recursión infinita de inferencia (`RangeError` + tabla RESULTADOS sin actualizar) | Propagación iterativa a punto fijo (`runInference`/`addCircleSafe`/`inferQueue`); T1 corregido + T1b (estrellas 3x4/5x5) | `ef4792b` |
| CHG-2 | `export-progress-json` | H10/R7: export JSON sin estado del tablero | Esquema v2 (PD-4): `version: 2` + `board` (zona→celda→1/2, vacías omitidas); import con clases directas + validación defensiva; v1 compatible; T10 corregido + T11 (round-trip) | `ad0419a` |
| CHG-3 | `sanitize-mode-param` | R2: XSS reflejado en `mode` (HTML `<title>` y literal JS `CONFIG.mode`) | Whitelist estricta en `logic.php` (normaliza a `3x4`) + `htmlspecialchars` en los 2 ecos (PD-1); T8 corregido | `9679d63` |
| CHG-4 | `fast-click-retention` | H3/R3: clicks rápidos en celdas distintas pierden la primera marca | `clickTimer` global → `clickQueue` por celda (PD-2): otra celda no cancela; misma celda reemplaza (último gana); `cleanZone` cancela solo acciones de su zona; T2 corregido + T2b (desambiguación) | `af3fb40` |
| CHG-5 | `undo-and-confirm-coherence` | H4 + H6: Ctrl+Z robado a los inputs; confirmaciones de limpieza incoherentes | Handler de Ctrl+Z ignora campos de texto editables (undo nativo, PD-3); `cleanZone`/`handleCleanLabel` piden confirmación; T5b nuevo | `765f095` |
| CHG-6 | `confirm-before-mode-reload` | R5/IC-1: cambio de modo recarga sin aviso y pierde el progreso | `confirmModeChange(sel)`: confirmar → recarga; cancelar → selector vuelve al modo actual sin recargar; T9 corregido | `aa27d37` |
| — | `spec-text-hygiene` | 7 warnings de validación (requisitos >500 chars) | Compresión de 7 requisitos (body + `_Estado` compacto); escenarios y semántica SHALL intactos; sin código | `3d48451` |

Commit de arranque: `7bae0c5` (Fases 4-5: flujo de trabajo, validación, specs actualizadas).

## 4. Decisiones y hallazgos relevantes

- **D2** (usuario): los hallazgos H2 y H10 son defectos a corregir (no solo documentar); la cola CHG se ejecuta completa.
- **PD-1…PD-4, IC-1** (usuario, 2026-11-17): corregir XSS de `mode` (whitelist + escape), clicks rápidos (cola de acciones), unificar Ctrl+Z/confirmaciones, esquema JSON v2, confirmación antes de recargar al cambiar modo. Todas implementadas en CHG-3/4/5/2/6.
- **Hallazgo (sin cambio, CHG-4):** la spec decía "doble click vacía todas las celdas de la zona", pero la implementación **no modifica los círculos** (la primitiva `force` retorna si la celda tiene círculo; `cleanZone` solo usa `force`). El requisito quedó corregido para documentar el comportamiento real. **Decisión de producto pendiente:** si se desea que el doble click elimine también los círculos, será un change nuevo.
- **Nota de precisión (CHG-5):** el diagnóstico indicaba que `cleanZone` ya pedía confirmación; verificado en el código que no la pedía — la inconsistencia real afectaba a `cleanZone` y `handleCleanLabel` (ambos corregidos).
- **Transparencia de desarrollo:** dos desviaciones transitorias durante la implementación (orden de argumentos en la cola de CHG-1; expectativas de test frente a comportamiento real en CHG-4/CHG-5) se diagnosticaron, corrigieron en una línea/test respectivamente y quedan documentadas en los `despues.md` correspondientes. Ninguna implicó tocar tests para ocultar regresiones.

## 5. Cómo reproducir la verificación

```
# Prerrequisitos: PHP 8.4 NTS en PATH (o PHP_PATH), Chromium de playwright-core (CHROME_PATH)
npm run test:characterization          # suite completa (arranca php -S :8000 si no existe)
openspec validate <nombre-de-spec>     # las 6 specs: 0 warnings
```

La suite arranca/detiene el servidor PHP si no hay uno corriendo; los fixtures temporales de round-trip están excluidos por `.gitignore`.

## 6. Estructura de evidencias

```
docs/openspec/
├── diagnostico-inicial.md             # Fase 1 (H1-H12, R1-R8)
├── preparacion.md                     # Fase 2
├── especificaciones-iniciales.md      # Fase 3
├── flujo-de-trabajo.md                # Fase 4 (puertas P1-P4, cola CHG, esquema PD-4 §6)
├── informe-validacion.md              # Fase 5 (histórico)
├── informe-cierre.md                  # este documento
└── evidencia/
    ├── characterization-suite/        # reportes de cada ejecución de la suite
    ├── fix-inference-recursion/       # antes.md / despues.md (CHG-1)
    ├── export-progress-json/          # antes.md / despues.md (CHG-2)
    ├── sanitize-mode-param/           # antes.md / despues.md (CHG-3)
    ├── fast-click-retention/          # antes.md / despues.md (CHG-4)
    ├── undo-and-confirm-coherence/    # antes.md / despues.md (CHG-5)
    ├── confirm-before-mode-reload/    # antes.md / despues.md (CHG-6)
    └── spec-text-hygiene/             # invariante.md
openspec/
├── specs/                             # 6 specs principales (32 requisitos)
└── changes/archive/                   # 8 changes archivados
```

## 7. Pendientes abiertos

1. **Decisión de producto (opcional):** doble click en zona — eliminar también los círculos o mantener la semántica actual (documentada en `board-interaction`, requisito "Limpieza de una zona con doble click").
2. **Nada más:** la adaptación a OpenSpec y la cola CHG están cerradas, validadas y commiteadas.
