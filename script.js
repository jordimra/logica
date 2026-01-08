/* script.js */

// --- NUEVO: HISTORIAL DE ESTADOS (UNDO) ---

let historyStack = [];
const MAX_HISTORY = 50; // Límite para no saturar memoria

function saveHistory() {
    // Guardamos el estado actual de todas las celdas
    const currentState = [];
    const cells = document.querySelectorAll('.cell-option');
    
    cells.forEach(cell => {
        let status = 0;
        if (cell.classList.contains('opt-cross')) status = 1;
        if (cell.classList.contains('opt-circle')) status = 2;
        // Optimizacion: Solo guardamos si tiene algo, para ahorrar espacio, 
        // pero para restaurar fácil guardamos todo o asumimos 0 por defecto.
        // Guardaremos id y status.
        currentState.push({ id: cell.id, s: status });
    });

    historyStack.push(currentState);
    if (historyStack.length > MAX_HISTORY) historyStack.shift(); // Eliminar antiguos
}

function undo() {
    if (historyStack.length === 0) return; // No hay nada que deshacer

    const previousState = historyStack.pop();
    
    // 1. Limpiar todo el tablero visualmente primero
    const allCells = document.querySelectorAll('.cell-option');
    allCells.forEach(c => {
        c.classList.remove('opt-cross', 'opt-circle', 'highlight-warning');
        c.innerText = "";
    });

    // 2. Restaurar estado guardado
    previousState.forEach(item => {
        const cell = document.getElementById(item.id);
        if (cell) {
            if (item.s === 1) cell.classList.add('opt-cross');
            if (item.s === 2) {
                cell.classList.add('opt-circle');
                cell.innerText = ""; // El CSS pone el contenido after, aseguramos limpieza texto
            }
        }
    });

    // 3. Recalcular resultados (sin disparar lógica transitiva, solo leer)
    updateResultsTable();
}

// --- Escuchar teclado para CTRL+Z ---

document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
    }
})

// --- DESCRIPCIÓN ---

function toggleDescription() {
    const container = document.getElementById('description-container');
    const btn = document.getElementById('btn-desc');
    
    if (container.style.display === 'none') {
        container.style.display = 'block';
        btn.innerHTML = '📖 Ocultar Descripción';
    } else {
        container.style.display = 'none';
        btn.innerHTML = '📖 Descripción';
    }
}

// --- IMPORTAR / EXPORTAR ---

function exportData() {
    const cats = [];
    const items = [];
    const max = CONFIG.numItems;
    const maxC = CONFIG.numCats;
    
    // Obtener datos tabla
    for(let i=0; i < maxC; i++) {
        let el = document.getElementById(`cat_${i}_name`);
        cats[i] = el ? el.value : '';
        items[i] = [];
        for(let j=0; j < max; j++) {
            let el2 = document.getElementById(`item_${i}_${j}`);
            items[i][j] = el2 ? el2.value : '';
        }
    }

    // Obtener descripción
    const description = document.getElementById('puzzle-description').value;

    const data = { 
        mode: CONFIG.mode, 
        cats: cats, 
        items: items,
        description: description // Guardamos descripción
    };

    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `puzle_${CONFIG.mode}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

function importData(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (!data.mode || !data.cats) { alert("Archivo inválido"); return; }
            if (data.mode !== CONFIG.mode) {
                if(confirm(`Modo ${data.mode}. ¿Recargar?`)) {
                    sessionStorage.setItem('pendingImport', JSON.stringify(data));
                    window.location.search = `?mode=${data.mode}`;
                }
            } else { populateData(data); }
        } catch (e) { alert("Error JSON"); }
        input.value = '';
    };
    reader.readAsText(file);
}

function populateData(data) {
    const max = CONFIG.numItems;
    const maxC = CONFIG.numCats;
    
    // Limpiamos historial al importar uno nuevo para no mezclar puzles
    historyStack = []; 

    for(let i=0; i < maxC; i++) {
        if(data.cats[i]) document.getElementById(`cat_${i}_name`).value = data.cats[i];
        for(let j=0; j < max; j++) {
            if(data.items[i] && data.items[i][j]) document.getElementById(`item_${i}_${j}`).value = data.items[i][j];
        }
    }
    if (data.description !== undefined) {
        document.getElementById('puzzle-description').value = data.description;
    }
    syncData(); 
    alert("Importado correctamente.");
}

function capitalize(s) { return s && s[0].toUpperCase() + s.slice(1); }

function syncData() {
    const cats = []; const items = [];
    const max = CONFIG.numItems;
    const maxC = CONFIG.numCats;

    for(let i=0; i < maxC; i++) {
        let c = document.getElementById(`cat_${i}_name`);
        cats[i] = c ? c.value.toUpperCase() : CONFIG.catNames[i];
        items[i] = [];
        for(let j=0; j < max; j++) {
            let v = document.getElementById(`item_${i}_${j}`);
            items[i][j] = (v && v.value) ? capitalize(v.value) : "";
        }
    }
    for(let i=0; i < maxC; i++) {
        let th = document.getElementById(`th_cat_${i}`);
        if(th) th.innerText = cats[i];
        let rh = document.getElementById(`rh_cat_${i}`);
        if(rh) rh.querySelector('.side-text-wrapper').innerText = cats[i];
        let resh = document.getElementById(`res_h_${CONFIG.catNames[i]}`);
        if(resh) resh.innerText = cats[i];
        for(let j=0; j < max; j++) {
            let thi = document.getElementById(`th_item_${i}_${j}`);
            if(thi) thi.querySelector('.vertical-text-wrapper').innerText = items[i][j];
            let rhi = document.getElementById(`rh_item_${i}_${j}`);
            if(rhi) rhi.innerText = items[i][j];
        }
    }
    for(let j=0; j < max; j++) {
        let el = document.getElementById(`res_val_A_${j}`);
        if(el) el.innerText = items[0][j];
    }
    updateResultsTable();
}

function toggleCell(gRow, gCol, r, c) {
    let id = `cell_${gRow}_${gCol}_${r}_${c}`;
    let cell = document.getElementById(id);
    if(!cell) return;
    
    // NUEVO: Guardar historia antes del cambio
    saveHistory();

    let st = 0;
    if (cell.classList.contains('opt-cross')) st = 1;
    if (cell.classList.contains('opt-circle')) st = 2;
    applyState(gRow, gCol, r, c, (st + 1) % 3);
}

function applyState(gRow, gCol, r, c, state) {
    let id = `cell_${gRow}_${gCol}_${r}_${c}`;
    let cell = document.getElementById(id);
    if(!cell) return;
    cell.classList.remove('opt-cross', 'opt-circle');
    cell.innerText = "";
    if (state === 1) cell.classList.add('opt-cross');
    else if (state === 2) {
        cell.classList.add('opt-circle');
        autoCross(gRow, gCol, r, c);
        infer(gRow, r, gCol, c); 
    }
    updateResultsTable();
}

function autoCross(gr, gc, tr, tc) {
    const max = CONFIG.numItems;
    for (let c = 0; c < max; c++) if (c !== tc) force(gr, gc, tr, c, 1);
    for (let r = 0; r < max; r++) if (r !== tr) force(gr, gc, r, tc, 1);
}

function force(gr, gc, r, c, s) {
    let id = `cell_${gr}_${gc}_${r}_${c}`;
    let cell = document.getElementById(id);
    if (!cell || cell.classList.contains('opt-circle')) return;
    cell.classList.remove('opt-cross');
    if(s === 1) cell.classList.add('opt-cross');
}

function infer(c1, i1, c2, i2) {
    const maxC = CONFIG.numCats;
    for(let c3 = 0; c3 < maxC; c3++) {
        if(c3 === c1 || c3 === c2) continue;
        let m3 = findMatch(c1, i1, c3);
        if(m3 !== -1) setRel(c2, i2, c3, m3);
        m3 = findMatch(c2, i2, c3);
        if(m3 !== -1) setRel(c1, i1, c3, m3);
    }
}

function findMatch(cs, is, ct) {
    let co = getCoords(cs, ct);
    if(!co) return -1;
    const max = CONFIG.numItems;
    let rt = co.swapped ? -1 : is;
    let ct2 = co.swapped ? is : -1;
    if (rt !== -1) {
        for(let c=0; c < max; c++) if(isCirc(co.gr, co.gc, rt, c)) return c;
    } else {
        for(let r=0; r < max; r++) if(isCirc(co.gr, co.gc, r, ct2)) return r;
    }
    return -1;
}

function setRel(ca, ia, cb, ib) {
    let co = getCoords(ca, cb);
    if(!co) return;
    applyState(co.gr, co.gc, co.swapped ? ib : ia, co.swapped ? ia : ib, 2);
}

function isCirc(gr, gc, r, c) {
    let el = document.getElementById(`cell_${gr}_${gc}_${r}_${c}`);
    return el && el.classList.contains('opt-circle');
}

function getCoords(c1, c2) {
    let min = Math.min(c1, c2), max = Math.max(c1, c2);
    if (CONFIG.mode === '5x5') {
            if(min===0) return {gr:0, gc:max, swapped: (c1!==0)};
            if(min===1 && max===2) return {gr:2, gc:1, swapped: (c1!==2)};
            if(max===3 && min===1) return {gr:3, gc:1, swapped: (c1!==3)};
            if(max===3 && min===2) return {gr:3, gc:2, swapped: (c1!==3)};
            if(max===4 && min===1) return {gr:4, gc:1, swapped: (c1!==4)};
            if(max===4 && min===2) return {gr:4, gc:2, swapped: (c1!==4)};
            if(max===4 && min===3) return {gr:4, gc:3, swapped: (c1!==4)};
    } else {
        if(min===0) return {gr:0, gc:max, swapped: (c1!==0)};
        if(max===3 && min===1) return {gr:3, gc:1, swapped: (c1!==3)};
        if(max===3 && min===2) return {gr:3, gc:2, swapped: (c1!==3)};
        if(max===2 && min===1) return {gr:2, gc:1, swapped: (c1!==2)};
    }
    return null;
}

function resetInputs() {
    if(!confirm("¿Borrar textos?")) return;
    const max = CONFIG.numItems;
    const maxC = CONFIG.numCats;
    // Limpiar tabla
    for(let i=0; i < maxC; i++) {
        document.getElementById(`cat_${i}_name`).value = CONFIG.catNames[i];
        for(let j=0; j < max; j++) {
            document.getElementById(`item_${i}_${j}`).value = CONFIG.catNames[i].toLowerCase() + (j+1);
        }
    }
    // Limpiar descripción
    document.getElementById('puzzle-description').value = '';
    
    syncData();
}

function resetLogic() {
    if(!confirm("¿Limpiar tablero?")) return;
    saveHistory(); // NUEVO: Guardar antes de borrar
    document.querySelectorAll('.cell-option').forEach(c => {
        c.classList.remove('opt-cross', 'opt-circle', 'highlight-warning');
        c.innerText = "";
    });
    updateResultsTable();
}

function cleanCategory(idx) {
    if(!confirm("¿Limpiar grupo?")) return;
    saveHistory(); // NUEVO
    const max = CONFIG.numItems;
    for(let k=0; k < max; k++) cleanLabel(idx, k);
}

function handleCleanLabel(idx, itemIdx) {
    // Esta es la que llama el HTML
    saveHistory();
    cleanLabel(idx, itemIdx);
}

function cleanLabel(idx, iIdx) {
    let zones = (CONFIG.mode === '5x5') ? 
        [{gr:0, gc:1}, {gr:0, gc:2}, {gr:0, gc:3}, {gr:0, gc:4}, {gr:4, gc:1}, {gr:4, gc:2}, {gr:4, gc:3}, {gr:3, gc:1}, {gr:3, gc:2}, {gr:2, gc:1}] : 
        [{gr:0, gc:1}, {gr:0, gc:2}, {gr:0, gc:3}, {gr:3, gc:1}, {gr:3, gc:2}, {gr:2, gc:1}];
    
    const max = CONFIG.numItems;
    zones.forEach(p => {
        if(p.gr === idx) for(let c=0; c < max; c++) resetCell(p.gr, p.gc, iIdx, c);
        if(p.gc === idx) for(let r=0; r < max; r++) resetCell(p.gr, p.gc, r, iIdx);
    });
    updateResultsTable();
}

function resetCell(gr, gc, r, c) {
    let el = document.getElementById(`cell_${gr}_${gc}_${r}_${c}`);
    if(el) { el.classList.remove('opt-cross', 'opt-circle'); el.innerText = ""; }
}

function cleanZone(gr, gc) {
    // Esta se llama con doble click en la celda
    saveHistory(); // NUEVO
    const max = CONFIG.numItems;
    for(let r=0; r < max; r++) for(let c=0; c < max; c++) force(gr, gc, r, c, 0); 
    updateResultsTable();
}

function updateResultsTable() {
    const items = [];
    const max = CONFIG.numItems;
    const maxC = CONFIG.numCats;
    for(let i=0; i < maxC; i++) {
        items[i] = [];
        for(let j=0; j < max; j++) {
            let v = document.getElementById(`item_${i}_${j}`);
            items[i][j] = (v && v.value) ? capitalize(v.value) : "";
        }
    }
    for (let r = 0; r < max; r++) { 
        for(let ct=1; ct < maxC; ct++) {
            let m = findMatch(0, r, ct);
            let cell = document.getElementById(`res_val_${CONFIG.catNames[ct]}_${r}`);
            if(cell) cell.innerText = (m !== -1) ? items[ct][m] : "";
        }
    }
    checkHighlights(); 
}

function checkHighlights() {
    document.querySelectorAll('.highlight-warning').forEach(el => el.classList.remove('highlight-warning'));
    
    const aids = document.getElementById('visualAidsCheckbox');
    if (!aids || !aids.checked) return;

    let zones = (CONFIG.mode === '5x5') ? 
        [{gr:0, gc:1}, {gr:0, gc:2}, {gr:0, gc:3}, {gr:0, gc:4}, {gr:4, gc:1}, {gr:4, gc:2}, {gr:4, gc:3}, {gr:3, gc:1}, {gr:3, gc:2}, {gr:2, gc:1}] : 
        [{gr:0, gc:1}, {gr:0, gc:2}, {gr:0, gc:3}, {gr:3, gc:1}, {gr:3, gc:2}, {gr:2, gc:1}];

    const max = CONFIG.numItems;

    zones.forEach(z => {
        let conf = false;
        // Conflictos círculos
        for(let r=0; r < max; r++) {
            let cc = 0; for(let c=0; c < max; c++) if(isCirc(z.gr, z.gc, r, c)) cc++;
            if(cc > 1) conf = true;
        }
        for(let c=0; c < max; c++) {
            let cc = 0; for(let r=0; r < max; r++) if(isCirc(z.gr, z.gc, r, c)) cc++;
            if(cc > 1) conf = true;
        }
        if(conf) {
            for(let r=0; r < max; r++) for(let c=0; c < max; c++) 
                document.getElementById(`cell_${z.gr}_${z.gc}_${r}_${c}`).classList.add('highlight-warning');
        }

        // 3 Cruces (o 4 o 5 segun config)
        for(let r=0; r < max; r++) {
            let cx = 0; 
            for(let c=0; c < max; c++) { 
                let e=document.getElementById(`cell_${z.gr}_${z.gc}_${r}_${c}`); 
                if(e && e.classList.contains('opt-cross')) cx++; 
            }
            if(cx === max) {
                for(let c=0; c < max; c++) document.getElementById(`cell_${z.gr}_${z.gc}_${r}_${c}`).classList.add('highlight-warning');
            }
        }
        for(let c=0; c < max; c++) {
            let cx = 0; 
            for(let r=0; r < max; r++) { 
                let e=document.getElementById(`cell_${z.gr}_${z.gc}_${r}_${c}`); 
                if(e && e.classList.contains('opt-cross')) cx++; 
            }
            if(cx === max) {
                for(let r=0; r < max; r++) document.getElementById(`cell_${z.gr}_${z.gc}_${r}_${c}`).classList.add('highlight-warning');
            }
        }
    });
}

window.onload = function() {
    const p = sessionStorage.getItem('pendingImport');
    if (p) { try { populateData(JSON.parse(p)); sessionStorage.removeItem('pendingImport'); } catch(e){} } 
    else syncData();
};