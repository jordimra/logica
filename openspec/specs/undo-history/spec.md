# Historial y deshacer (undo)

## Purpose
Permitir deshacer operaciones sobre el tablero conservando una pila de estados previos.

## Requirements

### Requirement: Historial limitado a los últimos 50 estados
El sistema SHALL guardar el estado completo de las celdas (id y estado) antes de cada modificación (click que aplique estado, limpieza de tablero, zona o grupo) y SHALL limitar la pila a 50 estados descartando el más antiguo.
_Estado: comportamiento observado. Evidencia: `script.js:8-30` (`MAX_HISTORY = 50`). Caracterización: pendiente (T5).

#### Scenario: Desbordamiento del historial
- **WHEN** el usuario realiza 51 modificaciones
- **THEN** la pila conserva como máximo 50 estados y el estado más antiguo se descarta

### Requirement: Deshacer con botón o Ctrl+Z
El sistema SHALL restaurar el último estado guardado con el botón "Deshacer" o la combinación Ctrl+Z (y Cmd+Z en Mac), recalculando después la tabla de resultados y los resaltados.
_Estado: comportamiento observado. Evidencia: `script.js:32-67`. Caracterización: pendiente (T5).

#### Scenario: Deshacer un círculo
- **WHEN** el usuario coloca un círculo (con su autocruce e inferencia) y pulsa Ctrl+Z
- **THEN** el tablero vuelve exactamente al estado anterior (mismas celdas marcadas) y la tabla de resultados se recalcula

#### Scenario: Deshacer sin historial
- **WHEN** el usuario pulsa Ctrl+Z con el historial vacío
- **THEN** no ocurre ningún cambio

### Requirement: El historial se reinicia al importar
Al importar datos, el sistema SHALL vaciar el historial para no mezclar el deshacer de puzles distintos.
_Estado: comportamiento observado. Evidencia: `script.js:145-146`.

#### Scenario: Deshacer tras una importación
- **WHEN** el usuario importa un JSON y después pulsa Ctrl+Z
- **THEN** no se restaura ningún estado previo a la importación (historial vacío)

### Requirement: El atajo Ctrl+Z no interfiere con la edición de textos
El atajo Ctrl+Z para el tablero SHALL respetar el deshacer nativo del navegador cuando el foco está en un campo de texto editable (input o textarea); fuera de esos campos, Ctrl+Z (y Cmd+Z en Mac) SHALL deshacer una operación del tablero.
_Estado: confirmado por PD-3; implementado por CHG-5. Evidencia: `docs/openspec/evidencia/undo-and-confirm-coherence/`._

#### Scenario: Editando un nombre de categoría (defecto observado)
- **WHEN** (histórico, código pre-CHG-5) el usuario edita el nombre de una categoría y pulsa Ctrl+Z
- **THEN** se deshace una operación del tablero en lugar de la edición del texto (comportamiento observado actual, defecto H4; documento histórico, no comportamiento exigido — evidencia: `antes.md`)

#### Scenario: Undo nativo dentro de un campo de texto
- **WHEN** el usuario tiene el foco en un campo de texto con texto editado y pulsa Ctrl+Z
- **THEN** el navegador deshace la edición del texto (undo nativo) y el tablero no se modifica

#### Scenario: Undo del tablero fuera de campos de texto
- **WHEN** el usuario tiene una operación aplicada en el tablero y pulsa Ctrl+Z con el foco fuera de campos de texto
- **THEN** el tablero se deshace a la operación anterior (el atajo no se delega al navegador)
