<?php
// logic.php

// Detectar configuración desde el selector (GET)
$mode = $_GET['mode'] ?? '3x4';

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