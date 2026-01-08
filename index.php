<?php require 'logic.php'; ?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generador de Puzle Lógico - <?php echo $mode; ?></title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>

    <div class="card-section">
        <div class="section-header">
            <div class="header-controls">
                <h2>1. INTRODUCCIÓN</h2>
                <form method="GET" style="margin:0;">
                    <select name="mode" class="mode-selector" onchange="this.form.submit()">
                        <option value="3x4" <?php echo $mode=='3x4'?'selected':''; ?>>3x4 (Original)</option>
                        <option value="4x4" <?php echo $mode=='4x4'?'selected':''; ?>>4x4 (Más ítems)</option>
                        <option value="5x4" <?php echo $mode=='5x4'?'selected':''; ?>>5x4 (5 ítems)</option>
                        <option value="5x5" <?php echo $mode=='5x5'?'selected':''; ?>>5x5 (Variable E)</option>
                    </select>
                </form>
                <button class="btn-blue" onclick="document.getElementById('importFile').click()">📂 Importar</button>
                <input type="file" id="importFile" style="display: none;" accept=".json" onchange="importData(this)">
                <button class="btn-green" onclick="exportData()">💾 Exportar</button>
                <button class="btn-purple" onclick="toggleDescription()" id="btn-desc">📖 Descripción</button>
                <button class="btn-orange" onclick="resetInputs()">📝 Limpiar Datos</button>
            </div>
        </div>
        <table id="table-intro">
            <?php
            for ($i = 0; $i < $numCats; $i++) {
                $cat = $catNames[$i];
                echo "<tr>";
                echo "<td class='cell-header' style='width: 60px;'><input type='text' id='cat_{$i}_name' value='{$cat}' oninput='syncData()'></td>";
                for ($j = 0; $j < $numItems; $j++) {
                    $valName = strtolower($cat) . ($j + 1);
                    echo "<td class='cell-value' style='width: 120px;'><input type='text' id='item_{$i}_{$j}' value='{$valName}' oninput='syncData()'></td>";
                }
                echo "</tr>";
            }
            ?>
        </table>

        <div id="description-container" style="display: none;">
            <label style="font-weight: bold; font-size: 13px; color: #495057;">Detalles o enunciado del puzle:</label>
            <textarea id="puzzle-description" class="desc-textarea" placeholder="Escribe aquí las pistas o la historia del puzle..."></textarea>
        </div>
    </div>

    <div class="card-section" style="overflow-x: auto; position: relative;">
        <div class="section-header" style="justify-content: space-between;">
            <h2>2. LÓGICA</h2>
            <button class="btn-gray" onclick="undo()" title="Atajo: Ctrl+Z">↩ Deshacer</button>
            <button class="btn-red" onclick="resetLogic()">🗑️ Limpiar Tablero</button>
        </div>

        <table id="table-logic" style="width: auto; table-layout: fixed;">
            <colgroup>
                <col style="width: 40px;">
                <col style="width: 120px;">
                <?php for($k=0; $k < ($totalVisualCols * $numItems); $k++) echo '<col style="width: 40px;">'; ?>
            </colgroup>

            <tr>
                <td colspan="2" rowspan="2" class="empty-corner"></td>
                <?php 
                    foreach($colOrder as $idx => $catIdx) {
                        $style = "cell-header thick-top thick-bottom thick-right";
                        if($idx === 0) $style .= " thick-left"; 
                        echo "<td colspan='{$numItems}' class='$style' id='th_cat_{$catIdx}' ondblclick=\"cleanCategory({$catIdx})\">-</td>";
                    }
                ?>
            </tr>
            
            <tr>
                <?php 
                foreach($colOrder as $idx => $g) { 
                    for($k=0; $k < $numItems; $k++) {
                        $isLastItem = ($k == $numItems - 1);
                        $class = "cell-value cell-label rotated-cell-top thick-bottom";
                        if($isLastItem) $class .= " thick-right";
                        if($idx === 0 && $k === 0) $class .= " thick-left";
                        echo "<td class='$class' id='th_item_{$g}_{$k}' ondblclick=\"handleCleanLabel($g, $k)\"><div class='vertical-text-wrapper'>-</div></td>"; 
                    }
                }
                ?>
            </tr>

            <?php
            foreach ($rowOrder as $rowIndex => $gRow) { 
                for ($r = 0; $r < $numItems; $r++) { 
                    echo "<tr>";
                    if ($r == 0) {
                        $style = "cell-header rotated-cell-side thick-left thick-right thick-bottom";
                        if($rowIndex === 0) $style .= " thick-top";
                        echo "<td rowspan='{$numItems}' class='$style' id='rh_cat_{$gRow}' ondblclick=\"cleanCategory({$gRow})\"><div class='side-text-wrapper'>-</div></td>";
                    }
                    
                    $isLastRow = ($r == $numItems - 1);
                    $borderClass = "cell-value cell-label thick-right";
                    if($isLastRow) $borderClass .= " thick-bottom";
                    if($rowIndex === 0 && $r === 0) $borderClass .= " thick-top";

                    echo "<td class='$borderClass' id='rh_item_{$gRow}_{$r}' ondblclick=\"handleCleanLabel($gRow, $r)\">-</td>";

                    $myColGroups = [];
                    if ($mode == '5x5') {
                        if($gRow == 0) $myColGroups = [1, 2, 3, 4]; if($gRow == 4) $myColGroups = [1, 2, 3]; if($gRow == 3) $myColGroups = [1, 2]; if($gRow == 2) $myColGroups = [1];
                    } else {
                        if($gRow == 0) $myColGroups = [1, 2, 3]; if($gRow == 3) $myColGroups = [1, 2]; if($gRow == 2) $myColGroups = [1];
                    }

                    foreach ($myColGroups as $idx => $gCol) {
                        for ($c = 0; $c < $numItems; $c++) {
                            $isLastCol = ($c == $numItems - 1);
                            $cellId = "cell_{$gRow}_{$gCol}_{$r}_{$c}";
                            $style = "cell-option";
                            if ($isLastCol) $style .= " thick-right"; 
                            if ($isLastRow) $style .= " thick-bottom";
                            echo "<td class='$style' id='$cellId' onclick=\"toggleCell({$gRow}, {$gCol}, {$r}, {$c})\" ondblclick=\"cleanZone({$gRow}, {$gCol})\"></td>";
                        }
                    }
                    echo "</tr>";
                }
            }
            ?>
        </table>

        <div class="visual-aids-container">
            <label style="display: flex; align-items: center; cursor: pointer; margin:0;">
                <input type="checkbox" id="visualAidsCheckbox" checked onchange="checkHighlights()" style="width: auto; height: auto; margin-right: 8px;">
                <span style="font-size: 13px; font-weight: 600; color: #495057;">Ayudas visuales</span>
            </label>
        </div>
    </div>

    <div class="card-section" style="min-width: 400px; width: fit-content;">
        <div class="section-header">
            <h2>3. RESULTADOS</h2>
        </div>
        <table id="table-results" style="width: <?php echo $numCats * 100; ?>px;">
            <thead>
                <tr>
                    <?php 
                    for($i=0; $i<$numCats; $i++) {
                        $c = $catNames[$i];
                        echo "<td class='cell-header' id='res_h_{$c}' style='width: ". (100/$numCats) ."%;'>{$c}</td>";
                    }
                    ?>
                </tr>
            </thead>
            <tbody>
                <?php for($i=0; $i<$numItems; $i++): ?>
                <tr>
                    <?php 
                    for($j=0; $j<$numCats; $j++) {
                        $c = $catNames[$j];
                        $val = ($j==0) ? '-' : '';
                        echo "<td class='cell-value' id='res_val_{$c}_{$i}'>{$val}</td>";
                    }
                    ?>
                </tr>
                <?php endfor; ?>
            </tbody>
        </table>
    </div>

    <script>
        const CONFIG = {
            numCats: <?php echo $numCats; ?>,
            numItems: <?php echo $numItems; ?>,
            mode: '<?php echo $mode; ?>',
            catNames: <?php echo json_encode(array_slice($catNames, 0, $numCats)); ?>
        };
    </script>
    <script src="script.js"></script>
</body>
</html>