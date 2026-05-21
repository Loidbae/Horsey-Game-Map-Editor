'use strict';

HME.isTileInBrush = function(dc, dr, size, shape) {
  if (!shape || shape !== 'round' || size <= 1) return true;
  const r = size / 2;
  return dc * dc + dr * dr <= r * r;
};

HME.paintAt = function(col, row) {
  const l     = HME.state.map.layer;
  const size  = HME.state.brushSize  || 1;
  const shape = HME.state.brushShape || 'round';
  const half  = Math.floor(size / 2);
  let painted = false;

  for (let dr = -half; dr < -half + size; dr++) {
    for (let dc = -half; dc < -half + size; dc++) {
      if (!HME.isTileInBrush(dc, dr, size, shape)) continue;
      const c = col + dc;
      const r = row + dr;
      if (c < 0 || r < 0 || c >= l.width || r >= l.height) continue;
      const idx = r * l.width + c;
      if (l.data[idx] === HME.state.selTileGID) continue;
      if (HME.state._paintDiff && !HME.state._paintDiff.has(idx)) {
        HME.state._paintDiff.set(idx, { from: l.data[idx], to: HME.state.selTileGID });
      }
      l.data[idx] = HME.state.selTileGID;
      painted = true;
    }
  }
  if (painted) HME.markModified();
};

HME.commitPaintUndo = function() {
  const diff = HME.state._paintDiff;
  if (!diff || diff.size === 0) {
    HME.state._paintSnap = null;
    HME.state._paintDiff = null;
    return;
  }
  HME.state.redoStack = [];
  HME.state.undoStack.push({
    undo() { diff.forEach((v, i) => { HME.state.map.layer.data[i] = v.from; }); HME.buildMinimap(); HME.render(); },
    redo() { diff.forEach((v, i) => { HME.state.map.layer.data[i] = v.to;   }); HME.buildMinimap(); HME.render(); },
  });
  if (HME.state.undoStack.length > 80) HME.state.undoStack.shift();
  HME.state._paintSnap = null;
  HME.state._paintDiff = null;
  HME.buildMinimap();
};

HME.doUndo = function() {
  const op = HME.state.undoStack.pop();
  if (!op) return;
  op.undo();
  HME.state.redoStack.push(op);
  HME._syncUndoRedoButtons();
};

HME.doRedo = function() {
  const op = HME.state.redoStack.pop();
  if (!op) return;
  op.redo();
  HME.state.undoStack.push(op);
  HME._syncUndoRedoButtons();
};

HME._syncUndoRedoButtons = function() {
  const undoBtn = document.getElementById('btn-undo');
  const redoBtn = document.getElementById('btn-redo');
  if (undoBtn) undoBtn.disabled = HME.state.undoStack.length === 0;
  if (redoBtn) redoBtn.disabled = HME.state.redoStack.length === 0;
};

HME.objAt = function(col, row) {
  return HME.state.map.objects.find(o => {
    const tx = Math.floor(o.x / HME.TS);
    const ty = Math.floor(o.y / HME.TS) - 1;
    return tx === col && ty === row;
  });
};

HME.nextObjId = function() {
  return HME.state.map.objects.reduce((m, o) => Math.max(m, o.id), 0) + 1;
};

HME.placeObj = function(col, row) {
  if (HME.objAt(col, row)) return;
  const obj = {
    id:     HME.nextObjId(),
    type:   HME.state.selLocType,
    gid:    HME.state.selLocGID,
    x:      col * HME.TS,
    y:      (row + 1) * HME.TS,
    width:  HME.TS,
    height: HME.TS,
    properties: {},
  };
  HME.state.map.objects.push(obj);
  HME.state.redoStack = [];
  HME.state.undoStack.push({
    undo() {
      const i = HME.state.map.objects.indexOf(obj);
      if (i >= 0) HME.state.map.objects.splice(i, 1);
      if (HME.state.selObj === obj) {
        HME.state.selObj = null;
        document.getElementById('obj-inspector').style.display = 'none';
      }
      HME.updateStats(); HME.buildMinimap(); HME.buildInspectList(); HME.render();
    },
    redo() {
      HME.state.map.objects.push(obj);
      HME.updateStats(); HME.buildMinimap(); HME.buildInspectList(); HME.render();
    },
  });
  if (HME.state.undoStack.length > 80) HME.state.undoStack.shift();
  HME.markModified();
  HME.selectObj(obj);
  HME.updateStats();
  HME.buildMinimap();
  HME.buildInspectList();
  HME._syncUndoRedoButtons();
  HME.render();
};

HME.removeObj = function(obj) {
  const i = HME.state.map.objects.indexOf(obj);
  if (i < 0) return;
  HME.state.map.objects.splice(i, 1);
  if (HME.state.selObj === obj) {
    HME.state.selObj = null;
    document.getElementById('obj-inspector').style.display = 'none';
  }
  HME.state.redoStack = [];
  HME.state.undoStack.push({
    undo() {
      HME.state.map.objects.splice(i, 0, obj);
      HME.updateStats(); HME.buildMinimap(); HME.buildInspectList(); HME.render();
    },
    redo() {
      const idx = HME.state.map.objects.indexOf(obj);
      if (idx >= 0) HME.state.map.objects.splice(idx, 1);
      if (HME.state.selObj === obj) {
        HME.state.selObj = null;
        document.getElementById('obj-inspector').style.display = 'none';
      }
      HME.updateStats(); HME.buildMinimap(); HME.buildInspectList(); HME.render();
    },
  });
  if (HME.state.undoStack.length > 80) HME.state.undoStack.shift();
  HME.markModified();
  HME.updateStats();
  HME.buildMinimap();
  HME.buildInspectList();
  HME._syncUndoRedoButtons();
  HME.render();
};

HME.removeSelectedObj = function() {
  if (HME.state.selObj) HME.removeObj(HME.state.selObj);
};

HME.floodFill = function(startCol, startRow) {
  const l      = HME.state.map.layer;
  const W      = l.width;
  const H      = l.height;
  const newGID = HME.state.selTileGID;
  const idx0   = startRow * W + startCol;

  if (startCol < 0 || startRow < 0 || startCol >= W || startRow >= H) return;
  const targetGID = l.data[idx0];
  if (targetGID === newGID) return;

  const diff    = new Map();
  const stack   = [idx0];
  const visited = new Uint8Array(l.data.length);

  while (stack.length) {
    const idx = stack.pop();
    if (idx < 0 || idx >= l.data.length) continue;
    if (visited[idx]) continue;
    if (l.data[idx] !== targetGID) continue;

    visited[idx] = 1;
    diff.set(idx, { from: l.data[idx], to: newGID });
    l.data[idx] = newGID;

    const col = idx % W;
    const row = (idx / W) | 0;
    if (col > 0)     stack.push(idx - 1);
    if (col < W - 1) stack.push(idx + 1);
    if (row > 0)     stack.push(idx - W);
    if (row < H - 1) stack.push(idx + W);
  }

  if (diff.size === 0) return;

  HME.state.redoStack = [];
  HME.state.undoStack.push({
    undo() { diff.forEach((v, i) => { HME.state.map.layer.data[i] = v.from; }); HME.buildMinimap(); HME.render(); },
    redo() { diff.forEach((v, i) => { HME.state.map.layer.data[i] = v.to;   }); HME.buildMinimap(); HME.render(); },
  });
  if (HME.state.undoStack.length > 80) HME.state.undoStack.shift();

  HME.markModified();
  HME._syncUndoRedoButtons();
  HME.buildMinimap();
  HME.render();
};
