# Design — spec-text-hygiene

## Criterios de redacción

1. **Body < 500 chars combinado con `_Estado`:** objetivo por requisito < 450 para margen. El body conserva **todos los SHALL** del requisito original (misma semántica, redacción comprimida).
2. **`_Estado:` compacto y con trazabilidad:** `confirmado por <decisión (D2/PD-n/IC-1)>; implementado por <CHG-n>. Evidencia: docs/openspec/evidencia/<change>/` — la procedencia completa (fechas, detalles del defecto) sigue disponible en la evidencia de cada change archivado; no se pierde información, se mueve de sitio.
3. **Escenarios inalterados:** el validador de OpenSpec rechaza un MODIFIED que omita nombres de escenario previos → garantía automática de que el comportamiento especificado no cambia.
4. **Sin tocar el resto de la spec:** solo los 7 requisitos con warning; los demás requisitos y el `Purpose` de cada spec quedan intactos.
