# Línea base de caracterización — 2026-11-17T19:48:08.623Z

- Comando: `npm run test:characterization` (node v26.5.0)
- Entorno: Chromium (chrome.exe), servidor PHP 8.4 NTS en http://localhost:8000
- Convención: `OK-observado` = el comportamiento observado coincide con lo registrado; `BASELINE-DEFECTO` = el comportamiento observado ES un defecto documentado (H2/H3/H10/R2/R5); si un valor cambia, hay deriva o corrección → investigarlo antes de tocar el test.

| Test | Comportamiento | Clasificación | Resultado |
|---|---|---|---|
| T1 | Inferencia transitiva: triángulo (H2) | BASELINE-DEFECTO | coincide con la línea base |
| T2 | Ciclo de celdas + clicks rápidos (H3) | BASELINE-DEFECTO | coincide con la línea base |
| T3 | Autocruce al colocar círculo | OK-observado | coincide con la línea base |
| T4 | Topología de zonas por modo | OK-observado | coincide con la línea base |
| T5 | Undo (Ctrl+Z) y límite de historial | OK-observado | coincide con la línea base |
| T6 | Import JSON mismo modo | OK-observado | coincide con la línea base |
| T7 | Import JSON de otro modo (recarga) | OK-observado | coincide con la línea base |
| T8 | XSS vía parámetro mode (R2) | BASELINE-DEFECTO | coincide con la línea base |
| T9 | Cambio de modo: pérdida de estado sin aviso (R5) | BASELINE-DEFECTO | coincide con la línea base |
| T10 | Export JSON: sin estado del tablero (H10) | BASELINE-DEFECTO | coincide con la línea base |

## Evidencia por test

### T1 — Inferencia transitiva: triángulo (H2)

- OK   inferencia: (B,C) r0c0 se marca sola | observado="O" | esperado="O"
- OK   H2: RangeError en consola | observado=true | esperado=true
- OK   H2: resultados sin actualizar (res_val_C_0 vacío) | observado="" | esperado=""
- NOTA H2: recursión infinita applyState→infer→setRel (línea base del defecto)

### T2 — Ciclo de celdas + clicks rápidos (H3)

- OK   1 click → cruz | observado="X" | esperado="X"
- OK   2 clicks → círculo | observado="O" | esperado="O"
- OK   3 clicks → vacío | observado="-" | esperado="-"
- OK   H3: primer click rápido se pierde | observado="-" | esperado="-"
- OK   H3: segundo click se registra | observado="X" | esperado="X"
- NOTA H3: la acción pendiente del primer click se cancela (línea base)

### T3 — Autocruce al colocar círculo

- OK   círculo colocado | observado="O" | esperado="O"
- OK   autocruce cell_0_1_0_1 | observado="X" | esperado="X"
- OK   autocruce cell_0_1_0_2 | observado="X" | esperado="X"
- OK   autocruce cell_0_1_1_0 | observado="X" | esperado="X"
- OK   autocruce cell_0_1_2_0 | observado="X" | esperado="X"
- OK   celdas ajenas sin tocar | observado="-" | esperado="-"
- OK   círculo existente no se sobrescribe | observado="O" | esperado="O"

### T4 — Topología de zonas por modo

- OK   zonas 3x4 | observado=["0_1","0_2","0_3","2_1","3_1","3_2"] | esperado=["0_1","0_2","0_3","2_1","3_1","3_2"]
- OK   zonas 5x5 | observado=["0_1","0_2","0_3","0_4","2_1","3_1","3_2","4_1","4_2","4_3"] | esperado=["0_1","0_2","0_3","0_4","2_1","3_1","3_2","4_1","4_2","4_3"]

### T5 — Undo (Ctrl+Z) y límite de historial

- OK   estado previo: círculo | observado="O" | esperado="O"
- OK   Ctrl+Z restaura el estado ANTES del círculo (cruz) | observado="X" | esperado="X"
- OK   sin autocruces en ese estado | observado="-" | esperado="-"
- OK   2º Ctrl+Z restaura el estado inicial (vacío) | observado="-" | esperado="-"
- OK   MAX_HISTORY=50 (white-box) | observado=50 | esperado=50
- OK   undo con historial vacío: sin cambios | observado="-" | esperado="-"

### T6 — Import JSON mismo modo

- OK   categoría poblada | observado="Colores" | esperado="Colores"
- OK   encabezado sincronizado (mayúsculas) | observado="COLORES" | esperado="COLORES"
- OK   ítem poblado (valor bruto en el input) | observado="pera" | esperado="pera"
- OK   etiqueta del ítem capitalizada | observado="Pera" | esperado="Pera"
- OK   descripción poblada | observado="Pista 1: el color rojo no va con la pera." | esperado="Pista 1: el color rojo no va con la pera."
- OK   alerta de éxito | observado=true | esperado=true
- OK   historial reiniciado (white-box) | observado=0 | esperado=0

### T7 — Import JSON de otro modo (recarga)

- OK   recargado en modo 5x5 | observado="5x5" | esperado="5x5"
- OK   5ª categoría poblada tras recarga | observado="Islas" | esperado="Islas"

### T8 — XSS vía parámetro mode (R2)

- OK   payload reflejado sin escapar en <title> | observado=true | esperado=true
- NOTA R2: XSS reflejado (línea base del defecto)

### T9 — Cambio de modo: pérdida de estado sin aviso (R5)

- OK   estado previo: círculo | observado="O" | esperado="O"
- OK   modo cambiado a 4x4 | observado="4x4" | esperado="4x4"
- OK   R5: marcas no exportadas perdidas | observado="-" | esperado="-"
- NOTA R5: recarga inmediata sin confirmación (línea base)

### T10 — Export JSON: sin estado del tablero (H10)

- OK   modo exportado | observado="3x4" | esperado="3x4"
- OK   categoría editada exportada | observado="Alpha" | esperado="Alpha"
- OK   ítems exportados (4 categorías) | observado=4 | esperado=4
- OK   H10: el JSON NO incluye el estado del tablero | observado=false | esperado=false
- NOTA H10: el progreso ❌/🔵 no se exporta (línea base)
