# Design — undo-and-confirm-coherence (CHG-5)

## H4 — Ctrl+Z y campos de texto

**Causa:** `document.addEventListener('keydown', e => { if ((e.ctrlKey||e.metaKey) && e.key==='z') { e.preventDefault(); undo(); } })` — el `preventDefault()` incondicional impide el undo nativo del navegador cuando el foco está en un input/textarea.

**Opción elegida (la única coherente con PD-3):** si el elemento activo es un campo de texto editable, el handler **no interviene** (ni `preventDefault` ni `undo`): el navegador ejecuta su undo nativo sobre el texto. Fuera de campos de texto: comportamiento actual.

```js
function isTextEditable(el) {
    if (!el) return false;
    if (el.isContentEditable) return true;
    if (el.tagName === 'TEXTAREA') return true;
    if (el.tagName === 'INPUT') {
        const t = (el.type || 'text').toLowerCase();
        return !['checkbox','radio','range','color','file','button','submit','reset','image'].includes(t);
    }
    return false;
}

document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (isTextEditable(document.activeElement)) return; // H4/CHG-5: undo nativo del texto
        e.preventDefault();
        undo();
    }
})
```

- Inputs no-texto (`file` del import, `checkbox`…): el undo nativo no existe; se mantiene el undo del tablero (no roba nada que el usuario pueda estar haciendo).
- El enunciado (`textarea`) y todos los `input[type=text]` (categorías, ítems) quedan cubiertos.

## H6 — Confirmaciones coherentes

Estado actual (verificado en código):

| Operación | Disparador | Confirmación |
|---|---|---|
| `resetLogic` | botón "Limpiar Tablero" | "¿Limpiar tablero?" ✔ |
| `cleanCategory` | doble click en cabecera de categoría (`th_cat`/`rh_cat`) | "¿Limpiar grupo?" ✔ |
| `cleanZone` | doble click en zona | **sin confirmación** ✗ |
| `handleCleanLabel` | doble click en etiqueta de ítem (`th_item`/`rh_item`) | **sin confirmación** ✗ |

**Opción elegida:** añadir confirmación a las dos que la carecen (dirección segura: añadir protección, no quitarla). Mensajes: "¿Limpiar zona?" y "¿Limpiar ítem?".

**`cleanZone` (orden de operaciones):**
1. Cancelar los clicks pendientes de esa zona (CHG-4) — inmediato, sin diálogo.
2. `if (!confirm("¿Limpiar zona?")) return;` — si cancela, la zona queda sin cambios.
3. `saveHistory()` + limpieza (solo tras confirmar: no se guarda historial de operaciones canceladas) + `updateResultsTable()`.

Justificación del paso 1 antes del diálogo: las entradas pendientes existentes en el momento del doble click son (casi siempre) los propios clicks del doble click; si el usuario cancela, su intención final ("no limpiar") deja la zona intacta y no debe reaparecer una marca fantasma 250 ms después.

**`handleCleanLabel`:** `confirm("¿Limpiar ítem?")` antes de `saveHistory()` + `cleanLabel`.

**Semánticas de limpieza NO tocadas (fuera de alcance de PD-3):**
- `cleanZone` usa `force` → **no modifica círculos** (comportamiento documentado en CHG-4).
- `cleanLabel`/`cleanCategory` usan `resetCell` → **quitan también círculos**.
- Esta asimetría ya existe y no cambia.

## Riesgos y mitigaciones

- T2b (doble click programado) y otros tests: el stub `__diag.confirm` devuelve `confirmResults = true` por defecto → los doble clicks de los tests existentes se confirman y siguen pasando.
- T5 (Ctrl+Z con foco en body): `document.activeElement` = body → no es editable → undo del tablero inalterado.
- Undo nativo específico de Chromium: T5b lo verifica con el navegador real de la suite (evidencia de ejecución).
