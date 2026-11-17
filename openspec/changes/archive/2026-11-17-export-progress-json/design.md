# Design — export-progress-json (CHG-2)

## Esquema del JSON (v2) — aprobado por PD-4 (`flujo-de-trabajo.md` §6)

```json
{
  "version": 2,
  "mode": "3x4",
  "cats": ["A", "B", "C", "D"],
  "items": [["a1","a2","a3"], ["b1","b2","b3"], ["c1","c2","c3"], ["d1","d2","d3"]],
  "description": "…",
  "board": { "0_1": { "0_0": 2, "0_1": 1 }, "2_1": { "0_0": 2 } }
}
```

- **`version: 2`**: sin `version` (o v1) → importación como hoy (sin board).
- **`board`**: clave de zona `"<gr>_<gc>"` y de celda `"<r>_<c>"` (misma notación que `cell_<gr>_<gc>_<r>_<c>`); estado `1`=❌, `2`=🔵; celdas vacías **omitidas** (compacidad; `0` nunca se escribe).
- **Orden de iteración**: `querySelectorAll('.cell-option')` (orden DOM determinista).

## Implementación

**`exportData()`**: tras leer cats/items/description (sin cambios), recorre las celdas marcadas (misma lógica de estado que `saveHistory`) y construye `board`; omite celdas sin marca y ids que no coincidan con `^cell_(\d)_(\d)_(\d)_(\d)$`.

**`populateData(data)`**: tras poblar textos/descripción y vaciar `historyStack` (sin cambios):
1. Condición: `data.board && data.mode === CONFIG.mode` (el flujo `pendingImport` garantiza modo coincidente tras recarga; si el usuario cancela la recarga, `populateData` no se llama).
2. Limpia todas las celdas (clases `opt-cross`/`opt-circle`/`highlight-warning`, texto).
3. Por cada zona/celda: valida claves con regex, descarta coordenadas `>= numItems` o zonas inexistentes (`getElementById` nulo) — importación defensiva ante `board` malformado o forjado.
4. Aplica las clases directamente (sin `applyState`): **no dispara autocruce ni inferencia** (restauración fiel + `updateResultsTable` vía `syncData()` calcula resultados y ayudas visuales).

## Riesgos y mitigaciones

- **`board` malformado/forzado:** validación defensiva (punto 3); lo desconocido se ignora, nunca se lanza.
- **Cascadas de inferencia al importar:** ausentes por diseño (clases directas).
- **Compatibilidad:** v1 y otro modo sin cambios (T6/T7 como guarda).
- **Round-trip con modo distinto:** sin cambios de flujo (T7).
