# Design — confirm-before-mode-reload (CHG-6)

## Causa raíz

`index.php:17`: `<select name="mode" class="mode-selector" onchange="this.form.submit()">` dentro de un `<form method="GET">` — al cambiar la opción el navegador navega de inmediato a `index.php?mode=<nuevo>`; todo el estado de la página (marcas, textos, historial) se destruye. No existe punto de confirmación: la navegación es síncrona con el `change`.

## Opciones

| Opción | Valoración |
|---|---|
| **A. Interceptar el `onchange` con `confirm()` en cliente — elegida** | La navegación se detiene solo desde el cliente; patrón ya usado en la app (confirmaciones de limpiezas, import de otro modo). 1 línea de HTML + función de ~10 líneas. Restablecer el `select` al cancelar no dispara un segundo `change` |
| B. Enviar a una página intermedia por el servidor | Requiere nuevo endpoint/flow, sobredimensionado para una confirmación |
| C. `beforeunload` global | Aviso genérico del navegador (no se puede personalizar el mensaje ni cancelar de forma fiable en todos los navegadores); no cubre "mantener el modo" |

## Implementación

**`index.php`:** `onchange="this.form.submit()"` → `onchange="confirmModeChange(this)"`.

**`script.js`:**

```js
// CHG-6/IC-1: confirmación antes de recargar al cambiar de modo.
// Al cancelar, el selector vuelve al modo actual (sin recarga).
function confirmModeChange(sel) {
    const next = sel.value;
    if (next === CONFIG.mode) return; // Sin cambio
    if (confirm(`¿Cambiar al modo ${next}? Se perderá el progreso no exportado.`)) {
        sel.form.submit();
    } else {
        sel.value = CONFIG.mode;
    }
}
```

- `CONFIG.mode` (literal del modo vigente, garantizado válido desde CHG-3) es la referencia del "modo actual" — más fiable que leer el `selected` del select.
- Al cancelar, `sel.value = CONFIG.mode`: asignación programática → **no** dispara `onchange` (comportamiento estándar) → no hay recarga ni segundo diálogo.
- El flujo de import de otro modo (T7, `populateData` → `window.location.search = '?mode=...'`) **no** pasa por el selector → sin confirmación (comportamiento invariante, guardado por T7).
- La confirmación usa el mismo `window.confirm` del resto de la app (los tests lo stubbean vía `__diag`, con `confirmResults` controlable).

## Semánticas (tablas)

| Acción | Baseline | Después |
|---|---|---|
| Cambiar modo (con progreso) | Recarga inmediata, progreso perdido, sin aviso | Confirmación; **OK** → recarga (progreso perdido, aceptado); **Cancelar** → modo y estado intactos |
| Cambiar modo (sin progreso) | Recarga inmediata | Confirmación (misma, sin lógica condicional) |
| Import JSON de otro modo | `location.search` + recarga directa | Igual (no pasa por el selector) |

## Riesgos y mitigaciones

- Playwright `selectOption` con restauración del valor: T9 dispara el `change` vía `evaluate` (misma técnica que T2b) para control total del valor resultante.
- Doble `change` por restauración: no existe (asignación `.value` no dispara eventos de change); T9 verifica el modo tras cancelar.
- Modos válidos: `CONFIG.mode` siempre es un literal válido (CHG-3) → la restauración siempre es un valor existente en el `<select>`.
