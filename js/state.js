'use strict';

window.HME = {

  TS: 32,

  terrainAtlas: null,
  locsAtlas: null,

  state: {
    originalTMX: null,
    map: null,

    terrainImg: null,
    locsImg: null,

    zoom: 1, panX: 0, panY: 0,
    isPanning: false, panStart: null,
    spaceDown: false,
    altCmdDown: false,

    mode: 'inspect',
    paintTool: 'brush',
    brushSize: 1,
    brushShape: 'round',
    selTileGID: 1,
    selLocGID: 97,
    selLocType: 'home',
    hovCol: -1, hovRow: -1,
    selObj: null,
    isPainting: false,

    undoStack: [],
    redoStack: [],
    _paintSnap: null,
    _paintDiff: null,

    modified: false,

    cameraTarget: null,
    cameraLerpActive: false,

    isDraggingObj: false,
    dragObj: null,
    dragObjOrigX: null,
    dragObjOrigY: null,
    dragMouseStartX: null,
    dragMouseStartY: null,
    dragMoved: false,
  },

  hexToRgb(hex){
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return {r,g,b};
  },

  modeCursor(){
    const m = HME.state.mode;
    if (m === 'paint') {
      if (HME.state.altCmdDown) return 'crosshair';
      const t = HME.state.paintTool || 'brush';
      return t === 'pipette' ? 'crosshair' : 'cell';
    }
    return m === 'object' ? 'copy' : 'grab';
  },

  screenToTile(sx, sy){
    const ts = HME.TS * HME.state.zoom;
    return { col: Math.floor((sx + HME.state.panX) / ts), row: Math.floor((sy + HME.state.panY) / ts) };
  },

  clampPan(){
    const canvas = document.getElementById('map-canvas');
    const ts = HME.TS * HME.state.zoom;
    HME.state.panX = Math.max(0, Math.min(HME.state.map.width  * ts - canvas.width,  HME.state.panX));
    HME.state.panY = Math.max(0, Math.min(HME.state.map.height * ts - canvas.height, HME.state.panY));
  },
};

HME.SETTINGS_KEY    = 'hme_v1_settings';
HME.ORIG_TMX_KEY    = 'hme_v1_original_tmx';
HME.ACK_KEY         = 'hme_v1_acknowledged';

HME.defaultSettings = function() {
  return {
    gridColorHex: '#ffffff',
    gridAlpha: 0.70,
    paintTool: 'brush',
    brushSize: 1,
    brushShape: 'round',
    doNotAsk: {
      restoreOriginal: false,
      downloadInstructions: false,
      patchnotes: false,
    },
    keybinds: {
      modeInspect:  'v',
      modePaint:    'b',
      modeObject:   'o',
      toolPipette:  'p',
      toolFill:     'g',
    },
  };
};

HME.settings = HME.defaultSettings();

HME.loadSettings = function() {
  try {
    const raw = localStorage.getItem(HME.SETTINGS_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      HME.settings = Object.assign(HME.defaultSettings(), saved);
      if (saved.keybinds) {
        HME.settings.keybinds = Object.assign(HME.defaultSettings().keybinds, saved.keybinds);
      }
      if (saved.doNotAsk) {
        HME.settings.doNotAsk = Object.assign(HME.defaultSettings().doNotAsk, saved.doNotAsk);
      }
    }
  } catch(e) {
    HME.settings = HME.defaultSettings();
  }
  HME.state.paintTool  = HME.settings.paintTool  || 'brush';
  HME.state.brushSize  = HME.settings.brushSize  || 1;
  HME.state.brushShape = HME.settings.brushShape || 'round';
};

HME.saveSettings = function() {
  try {
    HME.settings.paintTool  = HME.state.paintTool;
    HME.settings.brushSize  = HME.state.brushSize;
    HME.settings.brushShape = HME.state.brushShape;
    localStorage.setItem(HME.SETTINGS_KEY, JSON.stringify(HME.settings));
  } catch(e) {}
};

HME.resetDoNotAsk = function() {
  HME.settings.doNotAsk = HME.defaultSettings().doNotAsk;
  HME.saveSettings();
};

HME.loadSettings();
