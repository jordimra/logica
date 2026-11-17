# Spec Delta — data-import-export

## MODIFIED Requirements

### Requirement: Exportación de la plantilla y del progreso
La exportación a JSON SHALL incluir el estado del tablero (celdas marcadas por zona y posición) además de modo, categorías, ítems y enunciado, de modo que la importación reproduzca plantillas y progresos.
_Estado: confirmado por D2; implementado por CHG-2 (esquema v2, PD-4). Evidencia: `docs/openspec/evidencia/export-progress-json/`._

#### Scenario: Línea base del defecto (comportamiento actual)
- **WHEN** (histórico, código pre-CHG-2) el usuario marca celdas y exporta
- **THEN** el JSON contiene modo, categorías, ítems y descripción, pero ninguna información de las celdas marcadas (evidencia conservada: baseline de CHG-0, test T10)

#### Scenario: Comportamiento requerido tras la corrección
- **WHEN** el usuario marca celdas, exporta y luego importa el archivo en una sesión nueva
- **THEN** el tablero se restaura con las mismas marcas (❌/🔵) y la tabla de resultados se calcula sobre ellas, sin errores

#### Scenario: Exportación versión 2 (esquema)
- **WHEN** el usuario exporta con marcas en el tablero
- **THEN** el JSON incluye `version: 2` y un objeto `board` que asocia cada zona marcada (clave `<gr>_<gc>`) a sus celdas marcadas (clave `<r>_<c>`) con valor `1` (❌) o `2` (🔵), omitiendo celdas vacías

#### Scenario: Importación de archivo v1 (sin versión ni board)
- **WHEN** el usuario importa un JSON anterior a la versión 2 (sin `version` ni `board`)
- **THEN** se pueblan categorías, ítems y descripción exactamente como antes, sin marcas y sin errores
