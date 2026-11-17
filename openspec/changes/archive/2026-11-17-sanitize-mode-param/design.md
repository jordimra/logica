# Design — sanitize-mode-param (CHG-3)

## Causa raíz

`logic.php:5` acepta cualquier valor de `$_GET['mode']` y `index.php` ecoea sin escapar:

- `index.php:7` — `<title>`: inyección HTML (payload reflejado; T8 baseline).
- `index.php:174` — `mode: '<?php echo $mode; ?>'`: inyección en **literal de JavaScript** (ejecución de código arbitrario + `CONFIG.mode` corrompido). No cubierto por el test T8 actual (solo comprueba el título).
- El `switch` de `logic.php` y las comparaciones `selected` del selector solo comparan (seguros, pero con valores inválidos el layout cae a `default` → 3x4 mientras `CONFIG.mode` conserva el valor basura → incoherencia).

## Opciones

| Opción | Valoración |
|---|---|
| **A. Whitelist en la fuente (`logic.php`) + escape en los ecos (`index.php`) — elegida (PD-1)** | Doble capa: la whitelist normaliza (todos los usos reciben solo 4 literales conocidos) y el escape cubre los ecos si la whitelist se elimina. Minimal (2 archivos, ~6 líneas) |
| B. Solo escape de salidas | Insuficiente: `htmlspecialchars` no protege adecuadamente el literal JS de `CONFIG.mode` (contexto distinto), no normaliza `CONFIG.mode` en modos basura y deja la incoherencia layout/JS |
| C. Validar en JS (`script.js`) | Insuficiente: el título ya está renderizado por el servidor; no cubre el punto HTML |

## Implementación

**`logic.php`** (tras `$mode = $_GET['mode'] ?? '3x4';`):

```php
// Validación (CHG-3): whitelist de modos admitidos; cualquier otro valor (incluido vacío
// o ?mode[]=...) se normaliza a 3x4. Al normalizar en la fuente, todos los ecos reciben
// solo literales seguros (defensa en profundidad con el escape de index.php).
if (!in_array($mode, ['3x4', '4x4', '5x4', '5x5'], true)) {
    $mode = '3x4';
}
```

`in_array(..., true)` estricto: un array (de `?mode[]`) nunca coincide → se normaliza sin errores PHP.

**`index.php`** (2 ecos):

```php
<title>Generador de Puzle Lógico - <?php echo htmlspecialchars($mode, ENT_QUOTES, 'UTF-8'); ?></title>
...
mode: '<?php echo htmlspecialchars($mode, ENT_QUOTES, 'UTF-8'); ?>',
```

Con la whitelist estos escapes son no-ops (el valor ∈ {`3x4`,`4x4`,`5x4`,`5x5`}); existen como segunda capa exigida por PD-1.

## Comportamiento (tablas)

| Entrada `?mode=` | Antes (layout / CONFIG.mode / título) | Después (layout / CONFIG.mode / título) |
|---|---|---|
| (ausente) | 3x4 / `3x4` / `3x4` | igual |
| `3x4`/`4x4`/`5x4`/`5x5` | igual al valor | igual (inalterado) |
| `modo-inexistente` | 3x4 / `modo-inexistente` / echo crudo | 3x4 / `3x4` / `3x4` |
| `` (vacío) | 3x4 / `` (vacío) / título roto | 3x4 / `3x4` / `3x4` |
| `"><script>…` | 3x4 / payload JS / payload en título | 3x4 / `3x4` / `3x4` |
| `?mode[]=3x4` | 3x4 / warning PHP + array | 3x4 / `3x4` / `3x4` (sin warning) |

## Riesgos y mitigaciones

- **Ruptura de modos válidos:** imposible por construcción (la whitelist es el mismo conjunto de valores del selector); guardas T4/T7/T1b en la suite.
- **Recarga de import en otro modo (T7):** `window.location.search = '?mode=' + data.mode` solo se genera con modos válidos del propio export; sin cambios.
