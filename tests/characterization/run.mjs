// tests/characterization/run.mjs — Suite de caracterización (CHG-0).
// Captura el comportamiento ACTUAL de la app. Los defectos documentados se
// registran como BASELINE-DEFECTO (lo esperado ES el comportamiento actual).
// Uso: npm run test:characterization | Vars: CHROME_PATH, PHP_PATH

import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CHROME = process.env.CHROME_PATH ?? 'C:\\Users\\jordimra\\AppData\\Local\\ms-playwright\\chromium-1254\\chrome-win64\\chrome.exe';
const PHP = process.env.PHP_PATH ?? 'C:\\Users\\jordimra\\AppData\\Local\\Microsoft\\WinGet\\Packages\\PHP.PHP.NTS.8.4_Microsoft.Winget.Source_8wekyb3d8bbwe\\php.exe';
const BASE = 'http://localhost:8000';
const OUT_DIR = path.join(ROOT, 'docs', 'openspec', 'evidencia', 'characterization-suite');
const FIX = (n) => path.join(ROOT, 'tests', 'fixtures', n);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];

async function portUp() { try { await fetch(BASE + '/index.php'); return true; } catch { return false; } }
let serverProc = null;
async function ensureServer() {
  if (await portUp()) { console.log('[srv] Servidor existente en :8000 (no se detendrá).'); return; }
  serverProc = spawn(PHP, ['-S', 'localhost:8000'], { cwd: ROOT, stdio: 'ignore' });
  const t0 = Date.now();
  while (!(await portUp()) && Date.now() - t0 < 15000) await sleep(250);
  if (!(await portUp())) throw new Error('No se pudo arrancar php -S localhost:8000');
  console.log('[srv] Servidor arrancado (pid ' + serverProc.pid + ').');
}

async function makePage(browser, url) {
  const ctx = await browser.newContext();
  await ctx.addInitScript(() => {
    window.__diag = { alerts: [], confirms: 0, confirmResults: true, exportBlobs: [] };
    window.alert = (m) => window.__diag.alerts.push(String(m));
    window.confirm = () => { window.__diag.confirms++; return window.__diag.confirmResults; };
    const _createObjectURL = URL.createObjectURL.bind(URL);
    URL.createObjectURL = (blob) => { window.__diag.exportBlobs.push(blob); return _createObjectURL(blob); };
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('dialog', (d) => d.dismiss());
  await page.goto(url, { waitUntil: 'load' });
  return { page, errors, close: () => ctx.close() };
}
const clickCell = (page, id) => page.evaluate(async (id) => {
  const s = (ms) => new Promise((r) => setTimeout(r, ms));
  document.getElementById(id).click();
  await s(350); // > CLICK_DELAY de la app (250 ms)
}, id);
const circleCell = async (page, id) => { await clickCell(page, id); await clickCell(page, id); };
const cellState = (page, id) => page.evaluate((id) => {
  const e = document.getElementById(id);
  if (!e) return null;
  return e.classList.contains('opt-circle') ? 'O' : (e.classList.contains('opt-cross') ? 'X' : '-');
}, id);
const zonePairs = (page) => page.evaluate(() => {
  const s = new Set();
  document.querySelectorAll('.cell-option').forEach((e) => {
    const m = e.id.match(/^cell_(\d)_(\d)_/);
    if (m) s.add(m[1] + '_' + m[2]);
  });
  return [...s].sort();
});

async function test(id, name, fn) {
  const r = { id, name, ok: true, classification: 'OK-observado', evidence: [] };
  results.push(r);
  try { await fn(r); } catch (e) {
    r.ok = false; r.classification = 'ERROR-infraestructura';
    r.evidence.push('excepción: ' + ((e && e.stack) || e));
  }
  console.log('[' + r.classification + (r.ok ? '' : ' FALLA') + '] ' + id + ' ' + name);
}
function expect(r, label, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  r.evidence.push((ok ? 'OK   ' : 'FAIL ') + label + ' | observado=' + JSON.stringify(actual) + ' | esperado=' + JSON.stringify(expected));
  if (!ok) r.ok = false;
}
function markDefect(r, label) {
  if (r.classification === 'OK-observado') r.classification = 'BASELINE-DEFECTO';
  r.evidence.push('NOTA ' + label);
}

async function runAll(browser) {
  await test('T1', 'Inferencia transitiva: triángulo (CHG-1: H2 corregido)', async (r) => {
    const { page, errors, close } = await makePage(browser, BASE + '/index.php');
    await circleCell(page, 'cell_0_1_0_0');
    await circleCell(page, 'cell_0_2_0_0');
    await page.evaluate(() => new Promise((res) => setTimeout(res, 400)));
    const stackErr = errors.some((e) => /Maximum call stack size exceeded/.test(e));
    const resB = await page.evaluate(() => document.getElementById('res_val_B_0').innerText);
    const resC = await page.evaluate(() => document.getElementById('res_val_C_0').innerText);
    expect(r, 'inferencia: (B,C) r0c0 se marca sola', await cellState(page, 'cell_2_1_0_0'), 'O');
    expect(r, 'sin RangeError en consola', stackErr, false);
    expect(r, 'resultados actualizados: res_val_B_0', resB, 'B1');
    expect(r, 'resultados actualizados: res_val_C_0', resC, 'C1');
    // Nota: línea base anterior (CHG-0, defecto H2): RangeError + res_val_C_0 vacío.
    // Cambio intencional aprobado por el delta de CHG-1 (evidencia: antes.md).
    await close();
  });

  await test('T1b', 'Estrellas multi-paso 3x4 y 5x5 (aceptación CHG-1)', async (r) => {
    const p = await makePage(browser, BASE + '/index.php');
    await circleCell(p.page, 'cell_0_1_0_0'); // A0=B0
    await circleCell(p.page, 'cell_0_2_0_0'); // A0=C0
    await circleCell(p.page, 'cell_0_3_0_0'); // A0=D0
    await p.page.evaluate(() => new Promise((res) => setTimeout(res, 400)));
    expect(r, '3x4: (C,B) r0c0 inferido', await cellState(p.page, 'cell_2_1_0_0'), 'O');
    expect(r, '3x4: (D,B) r0c0 inferido', await cellState(p.page, 'cell_3_1_0_0'), 'O');
    expect(r, '3x4: (D,C) r0c0 inferido', await cellState(p.page, 'cell_3_2_0_0'), 'O');
    expect(r, '3x4: sin errores en consola', p.errors.length, 0);
    expect(r, '3x4: resultado D completado', await p.page.evaluate(() => document.getElementById('res_val_D_0').innerText), 'D1');
    await p.close();
    const q = await makePage(browser, BASE + '/index.php?mode=5x5');
    await circleCell(q.page, 'cell_0_1_0_0'); // A0=B0
    await circleCell(q.page, 'cell_0_2_0_0'); // A0=C0
    await circleCell(q.page, 'cell_0_3_0_0'); // A0=D0
    await circleCell(q.page, 'cell_0_4_0_0'); // A0=E0
    await q.page.evaluate(() => new Promise((res) => setTimeout(res, 600)));
    for (const [label, id] of [
      ['(C,B)', 'cell_2_1_0_0'], ['(D,B)', 'cell_3_1_0_0'], ['(D,C)', 'cell_3_2_0_0'],
      ['(E,B)', 'cell_4_1_0_0'], ['(E,C)', 'cell_4_2_0_0'], ['(E,D)', 'cell_4_3_0_0']
    ]) expect(r, '5x5: ' + label + ' r0c0 inferido', await cellState(q.page, id), 'O');
    expect(r, '5x5: sin errores en consola', q.errors.length, 0);
    expect(r, '5x5: resultado E completado', await q.page.evaluate(() => document.getElementById('res_val_E_0').innerText), 'E1');
    await q.close();
  });

  await test('T2', 'Ciclo de celdas + clicks rápidos (H3)', async (r) => {
    const { page, close } = await makePage(browser, BASE + '/index.php');
    await clickCell(page, 'cell_0_1_0_1');
    expect(r, '1 click → cruz', await cellState(page, 'cell_0_1_0_1'), 'X');
    await clickCell(page, 'cell_0_1_0_1');
    expect(r, '2 clicks → círculo', await cellState(page, 'cell_0_1_0_1'), 'O');
    await clickCell(page, 'cell_0_1_0_1');
    expect(r, '3 clicks → vacío', await cellState(page, 'cell_0_1_0_1'), '-');
    await page.evaluate(async () => {
      const s = (ms) => new Promise((r) => setTimeout(r, ms));
      document.getElementById('cell_0_2_0_1').click(); await s(100);
      document.getElementById('cell_0_3_0_1').click(); await s(450);
    });
    expect(r, 'H3: primer click rápido se pierde', await cellState(page, 'cell_0_2_0_1'), '-');
    expect(r, 'H3: segundo click se registra', await cellState(page, 'cell_0_3_0_1'), 'X');
    markDefect(r, 'H3: la acción pendiente del primer click se cancela (línea base)');
    await close();
  });

  await test('T3', 'Autocruce al colocar círculo', async (r) => {
    const p1 = await makePage(browser, BASE + '/index.php');
    await circleCell(p1.page, 'cell_0_1_0_0');
    expect(r, 'círculo colocado', await cellState(p1.page, 'cell_0_1_0_0'), 'O');
    for (const id of ['cell_0_1_0_1', 'cell_0_1_0_2', 'cell_0_1_1_0', 'cell_0_1_2_0'])
      expect(r, 'autocruce ' + id, await cellState(p1.page, id), 'X');
    expect(r, 'celdas ajenas sin tocar', await cellState(p1.page, 'cell_0_1_1_1'), '-');
    await p1.close();
    const p2 = await makePage(browser, BASE + '/index.php');
    await circleCell(p2.page, 'cell_0_1_1_1');
    await circleCell(p2.page, 'cell_0_1_0_0');
    expect(r, 'círculo existente no se sobrescribe', await cellState(p2.page, 'cell_0_1_1_1'), 'O');
    await p2.close();
  });

  await test('T4', 'Topología de zonas por modo', async (r) => {
    const p34 = await makePage(browser, BASE + '/index.php');
    expect(r, 'zonas 3x4', await zonePairs(p34.page), ['0_1', '0_2', '0_3', '2_1', '3_1', '3_2']);
    await p34.close();
    const p55 = await makePage(browser, BASE + '/index.php?mode=5x5');
    expect(r, 'zonas 5x5', await zonePairs(p55.page), ['0_1', '0_2', '0_3', '0_4', '2_1', '3_1', '3_2', '4_1', '4_2', '4_3']);
    await p55.close();
  });

  await test('T5', 'Undo (Ctrl+Z) y límite de historial', async (r) => {
    const p = await makePage(browser, BASE + '/index.php');
    await circleCell(p.page, 'cell_0_1_0_0');
    expect(r, 'estado previo: círculo', await cellState(p.page, 'cell_0_1_0_0'), 'O');
    await p.page.keyboard.press('Control+z');
    await sleep(50);
    expect(r, 'Ctrl+Z restaura el estado ANTES del círculo (cruz)', await cellState(p.page, 'cell_0_1_0_0'), 'X');
    expect(r, 'sin autocruces en ese estado', await cellState(p.page, 'cell_0_1_0_1'), '-');
    await p.page.keyboard.press('Control+z');
    await sleep(50);
    expect(r, '2º Ctrl+Z restaura el estado inicial (vacío)', await cellState(p.page, 'cell_0_1_0_0'), '-');
    const len = await p.page.evaluate(() => { for (let i = 0; i < 51; i++) saveHistory(); return historyStack.length; });
    expect(r, 'MAX_HISTORY=50 (white-box)', len, 50);
    await p.close();
    const p2 = await makePage(browser, BASE + '/index.php');
    await p2.page.keyboard.press('Control+z');
    await sleep(50);
    expect(r, 'undo con historial vacío: sin cambios', await cellState(p2.page, 'cell_0_1_0_0'), '-');
    await p2.close();
  });

  await test('T6', 'Import JSON mismo modo', async (r) => {
    const p = await makePage(browser, BASE + '/index.php');
    await p.page.setInputFiles('#importFile', FIX('import-3x4.json'));
    await sleep(400);
    const v = await p.page.evaluate(() => ({
      cat: document.getElementById('cat_0_name').value,
      header: document.querySelector('#rh_cat_0 .side-text-wrapper').innerText,
      item: document.getElementById('item_1_0').value,
      itemLabel: document.querySelector('#th_item_1_0 .vertical-text-wrapper').innerText,
      desc: document.getElementById('puzzle-description').value,
      alerts: window.__diag.alerts,
      hist: historyStack.length
    }));
    expect(r, 'categoría poblada', v.cat, 'Colores');
    expect(r, 'encabezado sincronizado (mayúsculas)', v.header, 'COLORES');
    expect(r, 'ítem poblado (valor bruto en el input)', v.item, 'pera');
    expect(r, 'etiqueta del ítem capitalizada', v.itemLabel, 'Pera');
    expect(r, 'descripción poblada', v.desc, 'Pista 1: el color rojo no va con la pera.');
    expect(r, 'alerta de éxito', v.alerts.includes('Importado correctamente.'), true);
    expect(r, 'historial reiniciado (white-box)', v.hist, 0);
    await p.close();
  });

  await test('T7', 'Import JSON de otro modo (recarga)', async (r) => {
    const p = await makePage(browser, BASE + '/index.php');
    await p.page.setInputFiles('#importFile', FIX('import-5x5.json'));
    await p.page.waitForURL('**/index.php?mode=5x5', { timeout: 15000 });
    await sleep(600);
    const v = await p.page.evaluate(() => ({
      mode: document.querySelector('.mode-selector').value,
      cat4: document.getElementById('cat_4_name') ? document.getElementById('cat_4_name').value : null
    }));
    expect(r, 'recargado en modo 5x5', v.mode, '5x5');
    expect(r, '5ª categoría poblada tras recarga', v.cat4, 'Islas');
    await p.close();
  });

  await test('T8', 'Parámetro mode: whitelist + escape (CHG-3: R2 corregido)', async (r) => {
    // 1) El payload no debe reflejarse en ningún sitio del HTML
    const html = await (await fetch(BASE + '/index.php?mode=%22%3E%3Cscript%3Ealert(1)%3C%2Fscript%3E')).text();
    expect(r, 'payload no reflejado en el HTML', html.includes('"><script>alert(1)</script>'), false);
    // 2) La página carga con el modo normalizado a 3x4 (cubre el literal JS CONFIG.mode)
    const p = await makePage(browser, BASE + '/index.php?mode=%22%3E%3Cscript%3Ealert(1)%3C%2Fscript%3E');
    expect(r, 'CONFIG.mode normalizado a 3x4', await p.page.evaluate(() => CONFIG.mode), '3x4');
    expect(r, 'tablero 3x4 renderizado', await p.page.evaluate(() => !!document.getElementById('cell_0_1_0_0')), true);
    expect(r, 'sin errores en consola', p.errors.length, 0);
    // 3) Modo inválido simple normalizado al por defecto
    const q = await makePage(browser, BASE + '/index.php?mode=modo-inexistente');
    expect(r, 'modo inválido normalizado a 3x4', await q.page.evaluate(() => CONFIG.mode), '3x4');
    await q.close();
    await p.close();
    // Nota: línea base anterior (CHG-0, defecto R2): el payload se reflejaba crudo en <title>.
    // Cambio intencional aprobado por el delta de CHG-3 (evidencia: antes.md).
  });

  await test('T9', 'Cambio de modo: pérdida de estado sin aviso (R5)', async (r) => {
    const p = await makePage(browser, BASE + '/index.php');
    await circleCell(p.page, 'cell_0_1_0_0');
    expect(r, 'estado previo: círculo', await cellState(p.page, 'cell_0_1_0_0'), 'O');
    await p.page.selectOption('.mode-selector', '4x4');
    await p.page.waitForLoadState('load');
    await sleep(400);
    const mode = await p.page.evaluate(() => document.querySelector('.mode-selector').value);
    expect(r, 'modo cambiado a 4x4', mode, '4x4');
    expect(r, 'R5: marcas no exportadas perdidas', await cellState(p.page, 'cell_0_1_0_0'), '-');
    markDefect(r, 'R5: recarga inmediata sin confirmación (línea base)');
    await p.close();
  });

  await test('T10', 'Export JSON con board (CHG-2: H10 corregido)', async (r) => {
    const p = await makePage(browser, BASE + '/index.php');
    await circleCell(p.page, 'cell_0_1_0_0');
    await p.page.evaluate(() => { document.getElementById('cat_0_name').value = 'Alpha'; });
    await p.page.evaluate(() => exportData());
    await sleep(400);
    const txt = await p.page.evaluate(async () => {
      const b = window.__diag.exportBlobs[0];
      return b ? await b.text() : null;
    });
    const data = JSON.parse(txt);
    expect(r, 'modo exportado', data.mode, '3x4');
    expect(r, 'versión 2', data.version, 2);
    expect(r, 'categoría editada exportada', data.cats[0], 'Alpha');
    expect(r, 'ítems exportados (4 categorías)', data.items.length, 4);
    expect(r, 'board: círculo (A,B) r0c0', data.board && data.board['0_1'] && data.board['0_1']['0_0'], 2);
    expect(r, 'board: autocruce (A,B) r0c1', data.board && data.board['0_1']['0_1'], 1);
    expect(r, 'board: autocruce (A,B) r1c0', data.board && data.board['0_1']['1_0'], 1);
    expect(r, 'board: celda sin marca omitida', data.board && data.board['0_1']['1_1'], undefined);
    // Nota: línea base anterior (CHG-0, defecto H10): el JSON no llevaba estado.
    // Cambio intencional aprobado por el delta de CHG-2 (evidencia: antes.md).
    await p.close();
  });

  await test('T11', 'Round-trip export/import del progreso (aceptación CHG-2)', async (r) => {
    const p = await makePage(browser, BASE + '/index.php');
    await circleCell(p.page, 'cell_0_1_0_0'); // (A,B) r0c0
    await circleCell(p.page, 'cell_0_2_0_0'); // (A,C) r0c0 → infiere (B,C)
    await p.page.evaluate(() => new Promise((res) => setTimeout(res, 400)));
    await p.page.evaluate(() => exportData());
    await sleep(400);
    const txt = await p.page.evaluate(async () => {
      const b = window.__diag.exportBlobs[0];
      return b ? await b.text() : null;
    });
    await p.close();
    const rtFile = FIX('roundtrip-3x4.json'); // fixture temporal generado (ignorado en git)
    fs.writeFileSync(rtFile, txt, 'utf8');
    const q = await makePage(browser, BASE + '/index.php');
    await q.page.setInputFiles('#importFile', rtFile);
    await sleep(400);
    expect(r, 'círculo (A,B) r0c0 restaurado', await cellState(q.page, 'cell_0_1_0_0'), 'O');
    expect(r, 'autocruce (A,B) r0c1 restaurado', await cellState(q.page, 'cell_0_1_0_1'), 'X');
    expect(r, 'círculo inferido (B,C) r0c0 restaurado', await cellState(q.page, 'cell_2_1_0_0'), 'O');
    expect(r, 'resultado B calculado', await q.page.evaluate(() => document.getElementById('res_val_B_0').innerText), 'B1');
    expect(r, 'resultado C calculado', await q.page.evaluate(() => document.getElementById('res_val_C_0').innerText), 'C1');
    expect(r, 'sin errores en consola', q.errors.length, 0);
    expect(r, 'alerta de éxito', await q.page.evaluate(() => window.__diag.alerts.includes('Importado correctamente.')), true);
    await q.close();
  });
}

function writeReport() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const ts = new Date().toISOString();
  const file = path.join(OUT_DIR, 'baseline-' + ts.replace(/[:.]/g, '-') + '.md');
  const lines = [
    '# Línea base de caracterización — ' + ts,
    '',
    '- Comando: `npm run test:characterization` (node ' + process.version + ')',
    '- Entorno: Chromium (' + path.basename(CHROME) + '), servidor PHP 8.4 NTS en ' + BASE,
    '- Convención: `OK-observado` = el comportamiento observado coincide con lo registrado; `BASELINE-DEFECTO` = el comportamiento observado ES un defecto documentado (H2/H3/H10/R2/R5); si un valor cambia, hay deriva o corrección → investigarlo antes de tocar el test.',
    '',
    '| Test | Comportamiento | Clasificación | Resultado |',
    '|---|---|---|---|'
  ];
  for (const r of results) lines.push('| ' + r.id + ' | ' + r.name + ' | ' + r.classification + ' | ' + (r.ok ? 'coincide con la línea base' : '**FALLA (deriva)**') + ' |');
  lines.push('', '## Evidencia por test', '');
  for (const r of results) { lines.push('### ' + r.id + ' — ' + r.name, '', ...r.evidence.map((e) => '- ' + e), ''); }
  fs.writeFileSync(file, lines.join('\n'), 'utf8');
  return file;
}

const main = async () => {
  await ensureServer();
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  try { await runAll(browser); } finally { await browser.close(); }
  const file = writeReport();
  const failed = results.filter((r) => !r.ok);
  console.log('Reporte: ' + file);
  console.log('Resumen: ' + results.length + ' tests, ' + failed.length + ' con derivas.');
  if (serverProc) { serverProc.kill(); console.log('[srv] Servidor detenido.'); }
  process.exitCode = failed.length ? 1 : 0;
};
main().catch((e) => { console.error('ERROR runner: ' + e); if (serverProc) serverProc.kill(); process.exit(1); });
