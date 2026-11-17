# Línea base de caracterización — 2026-11-17T20:16:35.961Z

- Comando: `npm run test:characterization` (node v26.5.0)
- Entorno: Chromium (chrome.exe), servidor PHP 8.4 NTS en http://localhost:8000
- Convención: `OK-observado` = el comportamiento observado coincide con lo registrado; `BASELINE-DEFECTO` = el comportamiento observado ES un defecto documentado (H2/H3/H10/R2/R5); si un valor cambia, hay deriva o corrección → investigarlo antes de tocar el test.

| Test | Comportamiento | Clasificación | Resultado |
|---|---|---|---|
| T1 | Inferencia transitiva: triángulo (CHG-1: H2 corregido) | OK-observado | coincide con la línea base |
| T1b | Estrellas multi-paso 3x4 y 5x5 (aceptación CHG-1) | OK-observado | coincide con la línea base |
| T2 | Ciclo de celdas + clicks rápidos (H3) | BASELINE-DEFECTO | coincide con la línea base |
| T3 | Autocruce al colocar círculo | OK-observado | coincide con la línea base |
| T4 | Topología de zonas por modo | OK-observado | coincide con la línea base |
| T5 | Undo (Ctrl+Z) y límite de historial | OK-observado | coincide con la línea base |
| T6 | Import JSON mismo modo | OK-observado | coincide con la línea base |
| T7 | Import JSON de otro modo (recarga) | OK-observado | coincide con la línea base |
| T8 | Parámetro mode: whitelist + escape (CHG-3: R2 corregido) | OK-observado | coincide con la línea base |
| T9 | Cambio de modo: pérdida de estado sin aviso (R5) | BASELINE-DEFECTO | coincide con la línea base |
| T10 | Export JSON con board (CHG-2: H10 corregido) | OK-observado | coincide con la línea base |
| T11 | Round-trip export/import del progreso (aceptación CHG-2) | OK-observado | coincide con la línea base |

## Evidencia por test

### T1 — Inferencia transitiva: triángulo (CHG-1: H2 corregido)

- OK   inferencia: (B,C) r0c0 se marca sola | observado="O" | esperado="O"
- OK   sin RangeError en consola | observado=false | esperado=false
- OK   resultados actualizados: res_val_B_0 | observado="B1" | esperado="B1"
- OK   resultados actualizados: res_val_C_0 | observado="C1" | esperado="C1"

### T1b — Estrellas multi-paso 3x4 y 5x5 (aceptación CHG-1)

- OK   3x4: (C,B) r0c0 inferido | observado="O" | esperado="O"
- OK   3x4: (D,B) r0c0 inferido | observado="O" | esperado="O"
- OK   3x4: (D,C) r0c0 inferido | observado="O" | esperado="O"
- OK   3x4: sin errores en consola | observado=0 | esperado=0
- OK   3x4: resultado D completado | observado="D1" | esperado="D1"
- OK   5x5: (C,B) r0c0 inferido | observado="O" | esperado="O"
- OK   5x5: (D,B) r0c0 inferido | observado="O" | esperado="O"
- OK   5x5: (D,C) r0c0 inferido | observado="O" | esperado="O"
- OK   5x5: (E,B) r0c0 inferido | observado="O" | esperado="O"
- OK   5x5: (E,C) r0c0 inferido | observado="O" | esperado="O"
- OK   5x5: (E,D) r0c0 inferido | observado="O" | esperado="O"
- OK   5x5: sin errores en consola | observado=0 | esperado=0
- OK   5x5: resultado E completado | observado="E1" | esperado="E1"

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

### T8 — Parámetro mode: whitelist + escape (CHG-3: R2 corregido)

- OK   payload no reflejado en el HTML | observado=false | esperado=false
- OK   CONFIG.mode normalizado a 3x4 | observado="3x4" | esperado="3x4"
- OK   tablero 3x4 renderizado | observado=true | esperado=true
- OK   sin errores en consola | observado=0 | esperado=0
- OK   modo inválido normalizado a 3x4 | observado="3x4" | esperado="3x4"

### T9 — Cambio de modo: pérdida de estado sin aviso (R5)

- OK   estado previo: círculo | observado="O" | esperado="O"
- OK   modo cambiado a 4x4 | observado="4x4" | esperado="4x4"
- OK   R5: marcas no exportadas perdidas | observado="-" | esperado="-"
- NOTA R5: recarga inmediata sin confirmación (línea base)

### T10 — Export JSON con board (CHG-2: H10 corregido)

- OK   modo exportado | observado="3x4" | esperado="3x4"
- OK   versión 2 | observado=2 | esperado=2
- OK   categoría editada exportada | observado="Alpha" | esperado="Alpha"
- OK   ítems exportados (4 categorías) | observado=4 | esperado=4
- OK   board: círculo (A,B) r0c0 | observado=2 | esperado=2
- OK   board: autocruce (A,B) r0c1 | observado=1 | esperado=1
- OK   board: autocruce (A,B) r1c0 | observado=1 | esperado=1
- OK   board: celda sin marca omitida | observado=undefined | esperado=undefined

### T11 — Round-trip export/import del progreso (aceptación CHG-2)

- OK   círculo (A,B) r0c0 restaurado | observado="O" | esperado="O"
- OK   autocruce (A,B) r0c1 restaurado | observado="X" | esperado="X"
- OK   círculo inferido (B,C) r0c0 restaurado | observado="O" | esperado="O"
- OK   resultado B calculado | observado="B1" | esperado="B1"
- OK   resultado C calculado | observado="C1" | esperado="C1"
- OK   sin errores en consola | observado=0 | esperado=0
- OK   alerta de éxito | observado=true | esperado=true
