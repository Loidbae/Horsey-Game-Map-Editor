'use strict';

HME.setMode = function(mode) {
  HME.state.mode = mode;
  HME.state.altCmdDown = false;
  HME.closeBrushSizeModal();
  const canvas = document.getElementById('map-canvas');
  canvas.style.cursor = HME.modeCursor();

  ['inspect', 'paint', 'object'].forEach(m => {
    document.getElementById('btn-' + m).classList.toggle('active', m === mode);
  });
  const arrowBtn = document.querySelector('#btn-paint-wrap .tool-btn-arrow');
  if (arrowBtn) arrowBtn.classList.toggle('active', mode === 'paint');

  const inspList  = document.getElementById('inspect-list');
  const terrPal   = document.getElementById('terrain-pal');
  const objPal    = document.getElementById('object-pal');
  inspList.style.display = mode === 'inspect' ? 'flex'  : 'none';
  terrPal.style.display  = mode === 'paint'   ? 'flex'  : 'none';
  objPal.style.display   = mode === 'object'  ? 'flex'  : 'none';

  const titles = { inspect: 'Objects', paint: 'Terrain Tiles', object: 'Locs Objects' };
  document.getElementById('left-title').textContent = titles[mode];

  if (mode !== 'object' && mode !== 'inspect') {
    HME.state.selObj = null;
    document.getElementById('obj-inspector').style.display = 'none';
  }

  HME.updateObjectWarning();

  if (mode === 'paint') {
    HME.updatePaintInspector();
  }

  HME.render();
};

HME.updateObjectWarning = function() {
  const warnBar = document.getElementById('warn-bar');
  if (!warnBar || !HME.state.map) return;

  const placedGIDs = new Set(HME.state.map.objects.map(o => o.gid));
  const required   = HME._requiredLocGIDs || new Set();
  const missingSet = new Set([...required].filter(g => !placedGIDs.has(g)));

  if (!HME._missingLocQueue) HME._missingLocQueue = [];
  HME._missingLocQueue = HME._missingLocQueue.filter(g => missingSet.has(g));
  missingSet.forEach(g => {
    if (!HME._missingLocQueue.includes(g)) HME._missingLocQueue.push(g);
  });

  const dlBtn = document.getElementById('btn-download-map');
  if (dlBtn) dlBtn.disabled = HME._missingLocQueue.length > 0;

  if (HME._missingLocQueue.length === 0) {
    warnBar.classList.remove('show');
  } else {
    const locsFirst  = (HME.state.map.tilesets.find(ts => ts.source && ts.source.includes('locs'))?.firstgid) || 97;
    const gidToType  = {};
    HME.state.map.objects.forEach(o => { if (o.type && o.type.trim()) gidToType[o.gid] = o.type.trim(); });
    const names = HME._missingLocQueue.map(g => {
      const sprite = HME.locsAtlas ? HME.locsAtlas[g - locsFirst] : null;
      const raw = gidToType[g] || (sprite ? sprite.name : `GID ${g}`);
      return raw.replace(/^[Ll]oc/, '');
    }).join(', ');
    warnBar.innerHTML = `<i class="ph ph-warning" style="font-size:14px"></i> Missing locations: <strong>${names}</strong>`;
    warnBar.classList.add('show');
  }

  if (HME.state.mode === 'object') HME._refreshMissingHighlights();
};

HME._refreshMissingHighlights = function() {
  const queue        = HME._missingLocQueue || [];
  const primaryGID   = queue[0];
  const secondarySet = new Set(queue.slice(1));

  document.querySelectorAll('.o-chip[data-gid]').forEach(chip => {
    const gid        = +chip.dataset.gid;
    const wasPrimary = chip.classList.contains('spawner-missing-primary');
    chip.classList.remove('spawner-missing-primary', 'spawner-missing-secondary');

    if (gid === primaryGID) {
      if (!wasPrimary) void chip.offsetWidth;
      chip.classList.add('spawner-missing-primary');
    } else if (secondarySet.has(gid)) {
      chip.classList.add('spawner-missing-secondary');
    }
  });

  if (primaryGID === undefined) {
    if (HME._scrollLerpRaf) { cancelAnimationFrame(HME._scrollLerpRaf); HME._scrollLerpRaf = null; }
    return;
  }

  const primaryChip = document.querySelector(`.o-chip[data-gid="${primaryGID}"]`);
  const pal = document.getElementById('object-pal');
  if (primaryChip && pal) {
    HME._lerpScrollTo(pal, primaryChip);

    document.querySelectorAll('.o-chip').forEach(c => c.classList.remove('sel'));
    primaryChip.classList.add('sel');
    HME.state.selLocGID = primaryGID;
    const locsFirst = (HME.state.map.tilesets.find(ts => ts.source && ts.source.includes('locs'))?.firstgid) || 97;
    const sprite = HME.locsAtlas ? HME.locsAtlas[primaryGID - locsFirst] : null;
    HME.state.selLocType = sprite ? sprite.name : `GID ${primaryGID}`;
  }
};

HME._lerpScrollTo = function(container, target) {
  if (HME._scrollLerpRaf) cancelAnimationFrame(HME._scrollLerpRaf);
  const targetScroll = target.offsetTop - container.clientHeight / 2 + target.offsetHeight / 2;
  const clamped = Math.max(0, Math.min(targetScroll, container.scrollHeight - container.clientHeight));

  function step() {
    const diff = clamped - container.scrollTop;
    if (Math.abs(diff) < 0.5) { container.scrollTop = clamped; return; }
    container.scrollTop += diff * 0.12;
    HME._scrollLerpRaf = requestAnimationFrame(step);
  }
  HME._scrollLerpRaf = requestAnimationFrame(step);
};

HME.updateInspector = function(col, row) {
  const l = HME.state.map.layer;
  if (col < 0 || row < 0 || col >= l.width || row >= l.height) return;

  const terrFirst = (HME.state.map.tilesets.find(ts => ts.source && ts.source.includes('terrain'))?.firstgid) || 1;
  const gid       = l.data[row * l.width + col];
  const sprite    = HME.terrainAtlas ? HME.terrainAtlas[gid - terrFirst] : null;
  const name      = sprite ? sprite.name : (HME.TILE_NAMES[gid] || `Tile ${gid}`);

  document.getElementById('i-tile').textContent  = name;
  document.getElementById('i-coord').textContent = `${col},${row}`;
  document.getElementById('i-gid').textContent   = gid;
};

HME.updatePaintInspector = function() {
  const S         = HME.state;
  const terrFirst = (S.map.tilesets.find(ts => ts.source && ts.source.includes('terrain'))?.firstgid) || 1;
  const sprite    = HME.terrainAtlas ? HME.terrainAtlas[S.selTileGID - terrFirst] : null;
  const name      = sprite ? sprite.name : (HME.TILE_NAMES[S.selTileGID] || `Tile ${S.selTileGID}`);

  document.getElementById('i-tile').textContent = name;
  document.getElementById('i-gid').textContent  = S.selTileGID;
};

HME.selectObj = function(obj) {
  HME.state.selObj = obj;
  document.getElementById('obj-inspector').style.display = 'block';
  document.getElementById('oi-type').textContent = obj.type;
  document.getElementById('oi-gid').textContent  = obj.gid;
  document.getElementById('oi-x').textContent    = obj.x;
  document.getElementById('oi-y').textContent    = obj.y;
};

HME._lerpRafId = null;

HME.viewObj = function(obj) {
  const canvas = document.getElementById('map-canvas');
  const S      = HME.state;
  const ts     = HME.TS * S.zoom;

  const col      = Math.floor(obj.x / HME.TS);
  const rowCoord = Math.floor(obj.y / HME.TS) - 1;

  S.cameraTarget = {
    x: col * ts - canvas.width  / 2 + ts / 2,
    y: rowCoord * ts - canvas.height / 2 + ts / 2,
  };
  S.cameraLerpActive = true;

  HME.selectObj(obj);
  HME.highlightInspectRow(obj);

  if (!HME._lerpRafId) {
    HME._lerpRafId = requestAnimationFrame(HME._lerpStep);
  }
};

HME._lerpStep = function() {
  const S = HME.state;
  if (!S.cameraTarget || !S.cameraLerpActive) {
    HME._lerpRafId = null;
    return;
  }

  const dx = S.cameraTarget.x - S.panX;
  const dy = S.cameraTarget.y - S.panY;

  if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
    S.panX = S.cameraTarget.x;
    S.panY = S.cameraTarget.y;
    HME.clampPan();
    S.cameraLerpActive = false;
    HME._lerpRafId     = null;
    HME.render();
    return;
  }

  S.panX += dx * 0.12;
  S.panY += dy * 0.12;
  HME.clampPan();
  HME.render();

  HME._lerpRafId = requestAnimationFrame(HME._lerpStep);
};

HME.updateStats = function() {
  document.getElementById('st-w').textContent    = HME.state.map.width;
  document.getElementById('st-h').textContent    = HME.state.map.height;
  document.getElementById('st-locs').textContent = HME.state.map.objects.length;
};

HME.setPaintTool = function(tool) {
  HME.state.paintTool = tool;

  const canvas = document.getElementById('map-canvas');
  if (HME.state.mode === 'paint') canvas.style.cursor = HME.modeCursor();

  document.querySelectorAll('.tool-dd-item').forEach(el => {
    el.classList.toggle('active', el.dataset.tool === tool);
  });

  const icons  = { brush: 'ph-paint-brush', pipette: 'ph-eyedropper', fill: 'ph-paint-bucket' };
  const labels = { brush: 'Paint', pipette: 'Pipette', fill: 'Fill' };
  const iconEl  = document.getElementById('paint-tool-icon');
  const labelEl = document.getElementById('paint-tool-label');
  if (iconEl)  iconEl.className  = `ph ${icons[tool] || 'ph-paint-brush'}`;
  if (labelEl) labelEl.textContent = labels[tool] || 'Paint';

  HME.saveSettings();
  HME.render();
};

HME.togglePaintDropdown = function(e) {
  e.stopPropagation();
  const dd = document.getElementById('paint-dropdown');
  if (dd) dd.classList.toggle('open');
};

HME.closePaintDropdown = function() {
  const dd = document.getElementById('paint-dropdown');
  if (dd) dd.classList.remove('open');
};

HME.openSettings = function() {
  const gcInput = document.getElementById('set-grid-color');
  const gaInput = document.getElementById('set-grid-alpha');
  if (gcInput) gcInput.value = HME.settings.gridColorHex || '#ffffff';
  if (gaInput) gaInput.value = HME.settings.gridAlpha !== undefined ? HME.settings.gridAlpha : 0.70;
  const gaVal = document.getElementById('set-grid-alpha-val');
  if (gaVal) gaVal.textContent = Math.round((HME.settings.gridAlpha || 0.70) * 100) + '%';

  const kb = HME.settings.keybinds;
  document.querySelectorAll('.keybind-btn[data-action]').forEach(btn => {
    const action = btn.dataset.action;
    if (kb[action] !== undefined) btn.textContent = kb[action].toUpperCase();
    btn.classList.remove('listening');
  });

  document.getElementById('settings-overlay').classList.add('open');
};

HME.closeSettings = function() {
  document.getElementById('settings-overlay').classList.remove('open');
};

HME.updateGridColor = function() {
  const gc = document.getElementById('set-grid-color').value;
  const ga = parseFloat(document.getElementById('set-grid-alpha').value);
  HME.settings.gridColorHex = gc;
  HME.settings.gridAlpha    = isNaN(ga) ? 0.70 : Math.max(0, Math.min(1, ga));
  HME.saveSettings();
  HME.render();
};

HME.captureKeybind = function(btn) {
  document.querySelectorAll('.keybind-btn.listening').forEach(b => {
    if (b !== btn) {
      const a = b.dataset.action;
      b.textContent = (HME.settings.keybinds[a] || '?').toUpperCase();
      b.classList.remove('listening');
    }
  });

  btn.textContent = '…';
  btn.classList.add('listening');

  function onKey(e) {
    e.preventDefault();
    e.stopPropagation();
    if (['Control','Alt','Meta','Shift'].includes(e.key)) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    const key    = e.key.toLowerCase();
    const action = btn.dataset.action;
    HME.settings.keybinds[action] = key;
    HME.saveSettings();

    btn.textContent = key.toUpperCase();
    btn.classList.remove('listening');
    document.removeEventListener('keydown', onKey, true);

    const kb = HME.settings.keybinds;
    const kbBrush   = document.getElementById('kb-brush');
    const kbPipette = document.getElementById('kb-pipette');
    const kbFill    = document.getElementById('kb-fill');
    if (kbBrush)   kbBrush.textContent   = (kb.modePaint   || 'b').toUpperCase();
    if (kbPipette) kbPipette.textContent = (kb.toolPipette || 'p').toUpperCase();
    if (kbFill)    kbFill.textContent    = (kb.toolFill    || 'g').toUpperCase();
  }
  document.addEventListener('keydown', onKey, true);
};

HME.resetSettings = function() {
  if (!confirm('Reset all settings to defaults?')) return;
  HME.settings = HME.defaultSettings();
  HME.state.paintTool = 'brush';
  HME.saveSettings();
  HME.openSettings();
  HME.render();
};

HME.resetAllDoNotAsk = function() {
  HME.resetDoNotAsk();
  const btn = document.getElementById('btn-reset-donotask');
  if (btn) {
    btn.textContent = '✓ Done';
    setTimeout(() => { btn.textContent = 'Reset "Do not show again" choices'; }, 1800);
  }
};

HME._bspOutsideListener = null;

HME.openBrushSizeModal = function(clientX, clientY) {
  const pop = document.getElementById('brush-size-popover');
  if (!pop) return;

  if (HME._bspOutsideListener) {
    document.removeEventListener('mousedown', HME._bspOutsideListener, true);
    HME._bspOutsideListener = null;
  }

  const W = window.innerWidth;
  const H = window.innerHeight;
  let x = clientX + 10;
  let y = clientY + 10;
  if (x + 190 > W) x = clientX - 198;
  if (y + 120 > H) y = clientY - 128;

  pop.style.left = x + 'px';
  pop.style.top  = y + 'px';

  const size  = HME.state.brushSize  || 1;
  const shape = HME.state.brushShape || 'round';
  const slider = document.getElementById('bsp-slider');
  const input  = document.getElementById('bsp-input');
  if (slider) slider.value = size;
  if (input)  input.value  = size;

  const btnRound  = document.getElementById('bsp-btn-round');
  const btnSquare = document.getElementById('bsp-btn-square');
  if (btnRound)  btnRound.classList.toggle('active',  shape === 'round');
  if (btnSquare) btnSquare.classList.toggle('active', shape === 'square');

  pop.classList.add('open');

  setTimeout(() => {
    HME._bspOutsideListener = function(e) {
      if (!pop.contains(e.target)) {
        HME.closeBrushSizeModal();
        e.stopPropagation();
      }
    };
    document.addEventListener('mousedown', HME._bspOutsideListener, true);
  }, 0);
};

HME.setBrushShape = function(shape) {
  HME.state.brushShape = shape;
  const btnRound  = document.getElementById('bsp-btn-round');
  const btnSquare = document.getElementById('bsp-btn-square');
  if (btnRound)  btnRound.classList.toggle('active',  shape === 'round');
  if (btnSquare) btnSquare.classList.toggle('active', shape === 'square');
  HME.saveSettings();
  HME.render();
};

HME.closeBrushSizeModal = function() {
  const pop = document.getElementById('brush-size-popover');
  if (pop) pop.classList.remove('open');
  if (HME._bspOutsideListener) {
    document.removeEventListener('mousedown', HME._bspOutsideListener, true);
    HME._bspOutsideListener = null;
  }
};

HME.setBrushSize = function(val) {
  const size = Math.max(1, Math.min(16, parseInt(val) || 1));
  HME.state.brushSize = size;
  const slider = document.getElementById('bsp-slider');
  const input  = document.getElementById('bsp-input');
  if (slider) slider.value = size;
  if (input)  input.value  = size;
  HME.saveSettings();
  HME.render();
};

HME.markModified = function() {
  HME.state.modified = true;
  document.getElementById('st-mod').style.display = 'inline';
};

HME.doRestore = function() {
  const stored = localStorage.getItem(HME.ORIG_TMX_KEY);

  if (!stored) {
    HME.showNoOriginalPopup();
    return;
  }

  if (HME.settings.doNotAsk.restoreOriginal) {
    HME._performRestore(stored);
    return;
  }

  HME.showRestoreConfirmPopup(stored);
};

HME._performRestore = function(tmxText) {
  HME.parseTMX(tmxText);
  HME.state.undoStack = [];
  HME.state.redoStack = [];
  HME.state.selObj    = null;
  HME.state.modified  = false;

  document.getElementById('st-mod').style.display        = 'none';
  document.getElementById('obj-inspector').style.display = 'none';

  HME._minimapColorCache = null;
  HME.buildMinimap();
  HME.buildTerrainPal();
  HME.buildObjectPal();
  HME.buildInspectList();
  HME.updateStats();
  HME._syncUndoRedoButtons();
  HME.render();
};

HME.showNoOriginalPopup = function() {
  document.getElementById('no-original-modal').classList.add('open');
};

HME.closeNoOriginalPopup = function() {
  document.getElementById('no-original-modal').classList.remove('open');
};

HME.saveCurrentAsOriginal = function() {
  if (!HME.state.map) return;
  const xml = HME.serializeTMX();
  try {
    localStorage.setItem(HME.ORIG_TMX_KEY, xml);
    HME.state.originalTMX = xml;
  } catch(e) {
    alert('Could not save to local storage. Your browser may have storage disabled.');
  }
  HME.closeNoOriginalPopup();
};

HME._pendingRestoreTMX = null;

HME.showRestoreConfirmPopup = function(tmxText) {
  const modal = document.getElementById('restore-confirm-modal');
  if (!modal) { HME._performRestore(tmxText); return; }

  HME._pendingRestoreTMX = tmxText;
  const dnaCheck = document.getElementById('restore-dna-check');
  if (dnaCheck) dnaCheck.checked = false;
  modal.classList.add('open');
};

HME.confirmRestore = function() {
  const dnaCheck = document.getElementById('restore-dna-check');
  if (dnaCheck && dnaCheck.checked) {
    HME.settings.doNotAsk.restoreOriginal = true;
    HME.saveSettings();
  }
  HME.closeRestoreConfirmPopup();
  if (HME._pendingRestoreTMX) {
    HME._performRestore(HME._pendingRestoreTMX);
    HME._pendingRestoreTMX = null;
  }
};

HME.closeRestoreConfirmPopup = function() {
  document.getElementById('restore-confirm-modal').classList.remove('open');
};

HME.toggleHelpDropdown = function(e) {
  e.stopPropagation();
  const dd = document.getElementById('help-dropdown');
  if (dd) {
    dd.classList.toggle('open');
    const helpBtn = document.getElementById('btn-help');
    if (helpBtn) helpBtn.classList.remove('help-pulse');
    try { localStorage.setItem('hme_v1_help_seen', '1'); } catch(e2) {}
  }
};

HME.closeHelpDropdown = function() {
  const dd = document.getElementById('help-dropdown');
  if (dd) dd.classList.remove('open');
};

HME.showInstallMapModal = function(fromHelp) {
  HME.closeHelpDropdown();
  const modal = document.getElementById('install-map-modal');
  if (!modal) return;

  if (!fromHelp && HME.settings.doNotAsk.downloadInstructions) {
    HME._doDownloadTMX();
    return;
  }

  const dnaRow = document.getElementById('install-dna-row');
  if (dnaRow) dnaRow.style.display = fromHelp ? 'none' : 'flex';
  const dnaCheck = document.getElementById('install-dna-check');
  if (dnaCheck) dnaCheck.checked = false;

  modal.querySelectorAll('.install-section').forEach(sec => sec.classList.remove('install-section-active'));
  const platform = HME._platform || 'win';
  const targetSec = modal.querySelector(`.install-section[data-os="${platform}"]`);
  if (targetSec) targetSec.classList.add('install-section-active');

  modal.classList.add('open');
};

HME.closeInstallMapModal = function() {
  document.getElementById('install-map-modal').classList.remove('open');
};

HME.doDownloadFromModal = function() {
  const dnaCheck = document.getElementById('install-dna-check');
  if (dnaCheck && dnaCheck.checked) {
    HME.settings.doNotAsk.downloadInstructions = true;
    HME.saveSettings();
  }
  HME.closeInstallMapModal();
  HME._doDownloadTMX();
};

HME._doDownloadTMX = function() {
  const blob = new Blob([HME.serializeTMX()], { type: 'text/xml' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: 'horsey.tmx' });
  a.click();
  URL.revokeObjectURL(url);
  HME.state.modified = false;
  document.getElementById('st-mod').style.display = 'none';
};
