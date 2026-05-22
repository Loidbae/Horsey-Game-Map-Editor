'use strict';

window.HME = {

  TS: 32,

  TILE_COLORS: {
    1:'#5a9e4f', 2:'#7ab85a', 3:'#9ac870', 4:'#4a8a3f',
    5:'#6ab04c', 6:'#4a7a3a', 7:'#5a8a40', 8:'#c9a84c',
    9:'#1a3a6a', 10:'#2a5a9a', 11:'#4a7a5a', 12:'#6a5a3a',
    13:'#8a7a5a', 14:'#a09060', 15:'#b0a070', 16:'#6a4a2a',
    17:'#7a7a6a', 18:'#8a8a7a', 19:'#9a9a8a', 20:'#aaaaaa',
    21:'#9a8070', 22:'#7a6a5a', 23:'#8a7a6a', 24:'#707070',
    25:'#5a8a50', 26:'#6a9a50', 27:'#7a6040', 28:'#5a5a5a',
    29:'#aaaaaa', 30:'#909090', 31:'#b09060', 32:'#c0c0b0',
    33:'#7a7a8a', 34:'#6a6a7a', 35:'#5a5a6a', 36:'#8a8a9a',
    37:'#7a7a8a', 38:'#6a6a7a', 39:'#5a5a6a', 40:'#4a4a5a',
    41:'#7a7a8a', 42:'#6a6a7a', 43:'#5a5a6a', 44:'#8a8a9a',
    45:'#7a7a8a', 46:'#6a6a7a', 47:'#5a5a6a', 48:'#4a4a5a',
    49:'#c0a870', 50:'#b09860', 51:'#a08850', 52:'#c0b080',
    53:'#b0a070', 54:'#a09060', 55:'#908050', 56:'#807040',
    57:'#c0a870', 58:'#b09860', 59:'#a08850', 60:'#c0b080',
    61:'#b0a070', 62:'#a09060', 63:'#908050', 64:'#807040',
    65:'#707060', 66:'#808070', 67:'#2a5a9a', 68:'#3a6aaa',
    69:'#2a5090', 70:'#4a8a50', 71:'#5a9a40', 72:'#6aaa50',
    73:'#7aba60', 74:'#8aca70', 75:'#5a9a40', 76:'#3a7a5a',
    77:'#4a8a6a', 78:'#5a9a7a', 79:'#6aaa8a', 80:'#7aba9a',
    81:'#8a7a50', 82:'#9a8a60', 83:'#aa9a70', 84:'#baaa80',
    85:'#caba90', 86:'#6a9a50', 87:'#7aaa60', 88:'#8aba70',
    89:'#9aca80', 90:'#aada90', 91:'#5a8a50', 92:'#6a9a60',
    93:'#7aaa70', 94:'#8aba80', 95:'#9aca90', 96:'#c0a840',
  },

  LOC_COLORS: {
    97:'#e87a3a',  98:'#e87a3a',  99:'#e87a3a', 100:'#e87a3a',
    101:'#e87a3a', 102:'#c8a83a', 103:'#e87a3a', 104:'#e87a3a',
    105:'#3a9ee8', 106:'#3a9ee8', 107:'#3a9ee8', 108:'#3a9ee8',
    109:'#3a9ee8', 110:'#3a9ee8', 111:'#8a5ab8', 112:'#606060',
    113:'#cc4444', 114:'#cc4444', 115:'#c8a83a', 116:'#9a4a9a',
    117:'#44aa66', 118:'#44aa66', 119:'#44aa66', 120:'#cc6688',
    121:'#7aaa5a', 122:'#e87a3a', 123:'#8a5ab8', 124:'#c8a83a',
    125:'#8a5ab8', 126:'#cc6688', 127:'#8888aa', 128:'#cc4444',
    129:'#3a9ee8', 130:'#8a5ab8', 131:'#3a9ee8', 132:'#8a5ab8',
    133:'#9a4a9a', 134:'#606060', 135:'#c8a83a',
    136:'#44aa66', 137:'#c8a83a',
    138:'#cc4444', 139:'#c8a83a', 140:'#c8a83a', 141:'#8a5ab8', 142:'#8a5ab8',
    145:'#c8a83a', 146:'#7a9a5a', 147:'#cc6644', 148:'#c8a83a',
    149:'#cc4444', 150:'#7a9a5a', 153:'#44aa66',
  },

  TILE_NAMES: {
    1:'Plain',    2:'Plain',    3:'Plain',    4:'Plain',
    5:'GrassLand',6:'BogLand',  7:'PalmLand', 8:'CactusLand',
    9:'Water',   10:'Pond',    11:'Bush',    12:'Stump',
    13:'Birch',  14:'BridgeH', 15:'BridgeV', 16:'BadLand',
    17:'Mountain',18:'Mountain',19:'Mountain',20:'Mountain',
    21:'Fir',    22:'Un1',     23:'Un2',     24:'Boulder',
    25:'Acacia', 26:'Apple',   27:'DeadTree',28:'Cave',
    29:'FenceH', 30:'FenceV',  31:'Tumble',  32:'Pebbles',
    33:'Road',   34:'Road',    35:'Road',    36:'Road',
    37:'Road',   38:'Road',    39:'Road',    40:'Road',
    41:'Road',   42:'Road',    43:'Road',    44:'Road',
    45:'Road',   46:'Road',    47:'Road',    48:'Road',
    49:'Dirt',   50:'Dirt',    51:'Dirt',    52:'Dirt',
    53:'Dirt',   54:'Dirt',    55:'Dirt',    56:'Dirt',
    57:'Dirt',   58:'Dirt',    59:'Dirt',    60:'Dirt',
    61:'Dirt',   62:'Dirt',    63:'Dirt',    64:'Dirt',
    65:'Goop',   66:'Goop',    67:'Glass',   68:'GlassBG',
    69:'Gray',   70:'NGrass',
    71:'Grass',  72:'Grass',   73:'Grass',   74:'Grass',   75:'Grass',
    76:'Reeds',  77:'Reeds',   78:'Reeds',   79:'Reeds',   80:'Reeds',
    81:'Acacia', 82:'Acacia',  83:'Acacia',  84:'Acacia',  85:'Acacia',
    86:'Apple',  87:'Apple',   88:'Apple',   89:'Apple',   90:'Apple',
    91:'Palm',   92:'Palm',    93:'Palm',    94:'Palm',    95:'Palm',
    96:'Cactus',
  },

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

  tileColor(gid){ return HME.TILE_COLORS[gid] || '#404040'; },
  locColor(gid) { return HME.LOC_COLORS[gid]  || '#aaaaaa'; },

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
