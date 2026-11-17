<?php
// logic.php

// Detectar configuración desde el selector (GET)
$mode = $_GET['mode'] ?? '3x4';

// Validación (CHG-3): whitelist de modos admitidos; cualquier otro valor (incluido vacío
// o ?mode[]=...) se normaliza a 3x4. Al normalizar en la fuente, todos los ecos reciben
// solo literales seguros (defensa en profundidad con el escape de index.php).
if (!in_array($mode, ['3x4', '4x4', '5x4', '5x5'], true)) {
    $mode = '3x4';
}

// Valores por defecto
$numCats = 4;
$numItems = 3;
$catNames = ['A', 'B', 'C', 'D', 'E']; 
$rowOrder = [0, 3, 2]; 
$colOrder = [1, 2, 3]; 

// Ajustar según el modo seleccionado
switch ($mode) {
    case '4x4':
        $numCats = 4;
        $numItems = 4;
        break;
    case '5x4':
        $numCats = 4;
        $numItems = 5;
        break;
    case '5x5':
        $numCats = 5;
        $numItems = 5;
        $rowOrder = [0, 4, 3, 2]; 
        $colOrder = [1, 2, 3, 4]; 
        break;
    case '3x4':
    default:
        $numCats = 4;
        $numItems = 3;
        break;
}

// Calcular columnas visuales totales para el layout fijo
$totalVisualCols = count($colOrder);
?>