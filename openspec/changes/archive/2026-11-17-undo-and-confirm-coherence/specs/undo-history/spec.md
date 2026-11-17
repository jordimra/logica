# Spec Delta — undo-history

## MODIFIED Requirements

### Requirement: El atajo Ctrl+Z no interfiere con la edición de textos
El atajo Ctrl+Z para el tablero SHALL respetar el deshacer nativo del navegador cuando el foco está dentro de un campo de texto editable (input de texto o textarea); cuando el foco está fuera de esos campos, Ctrl+Z (y Cmd+Z en Mac) SHALL deshacer una operación del tablero.
_Estado: requisito confirmado por PD-3 (2026-11-17); implementado por CHG-5 (el handler de teclado ignora el atajo sobre campos editables de texto, ver `design.md`). Línea base del defecto anterior (H4) conservada en `docs/openspec/evidencia/undo-and-confirm-coherence/antes.md`._

#### Scenario: Editando un nombre de categoría (defecto observado)
- **WHEN** (histórico, código pre-CHG-5) el usuario edita el nombre de una categoría y pulsa Ctrl+Z
- **THEN** se deshace una operación del tablero en lugar de la edición del texto (comportamiento observado actual, defecto H4; documento histórico, no comportamiento exigido — evidencia: `antes.md`)

#### Scenario: Undo nativo dentro de un campo de texto
- **WHEN** el usuario tiene el foco en un campo de texto con texto editado y pulsa Ctrl+Z
- **THEN** el navegador deshace la edición del texto (undo nativo) y el tablero no se modifica

#### Scenario: Undo del tablero fuera de campos de texto
- **WHEN** el usuario tiene una operación aplicada en el tablero y pulsa Ctrl+Z con el foco fuera de campos de texto
- **THEN** el tablero se deshace a la operación anterior (el atajo no se delega al navegador)
