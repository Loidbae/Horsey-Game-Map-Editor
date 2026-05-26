'use strict';

HME.TILE_CATEGORIES = {
  'Terraform': [
    'Plain', 'GrassLand', 'BogLand', 'NGrassLand',
    'Water', 'Pond', 'BadLand',
    'Grass', 'Reeds', 'NGrass',
  ],
  'Flora': [
    'Bush', 'Stump', 'Birch', 'Fir',
    'AcaciaLand', 'AppleTree', 'DeadTree', 'Tumbleweed',
    'Acacia', 'Apple', 'Palm', 'Cactus',
  ],
  'Big Rocks': [
    'Mountain', 'Boulder', 'Pebbles', 'Cave', 'Un1'
  ],
  'Roads': [
    'Road', 'Road8', 'DirtRoad', 'DirtRoad8',
    'BridgeH', 'BridgeV',
    'FenceIcon', 'FenceIconNotNeeded',
  ],
  'Misc': [
    'Goop', 'Glass', 'GlassBG', 'Gray'
  ]
};

HME.TILE_CATEGORY_ORDER = ['Terraform', 'Flora', 'Big Rocks', 'Roads', 'Misc'];

HME.SPAWNER_GIDS = {
  145: 'Truck',
  146: 'Fest Horse',
  147: 'Tiger',
  148: 'Giraffe',
  149: 'Alligator',
  150: 'Moose',
  153: 'Vial World',
  154: '???',
};

HME.SPAWNER_VARIANTS = {
  146: [
    { type: 'fest horse',  label: 'Fest Horse'  },
    { type: 'crazy horse', label: 'Crazy Horse' },
    { type: 'impala',      label: 'Impala'      },
  ],
};

HME.SPAWNER_TYPES = {
  145: 'truck',
  147: 'tiger',
  148: 'giraffe',
  149: 'alligator',
  150: 'moose',
  153: 'vial world',
  154: '???',
};

HME.LOC_TYPES = {
  97:  'home',
  98:  'willaby',
  99:  'circled',
  100: 'bobs',
  101: 'mabels',
  102: 'surebreed',
  103: 'hacienda',
  104: 'paradise',
  110: 'track',
  111: 'paddock',
  112: 'hermit',
  113: 'crispr',
  114: 'glue',
  115: 'car lot',
  117: 'supply',
  118: 'ecologist',
  119: 'hutch',
  120: 'circus',
  121: 'zoo',
  122: 'acres',
  123: 'saloon',
  124: 'powerplant',
  125: 'sweetie',
  126: 'sumo',
  127: 'junk',
  128: 'biohackers',
  133: 'club',
  134: 'abandoned',
};

HME.TILE_EXCLUDED = new Set([]);

HME.parseAtlasXML = function(xml, numCols, imgW, imgH, tileW, tileH) {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  const result = [];
  let seqId = 0;

  for (const s of doc.querySelectorAll('sprite')) {
    const name  = s.getAttribute('n');
    const x     = +(s.getAttribute('x') || 0);
    const y     = +(s.getAttribute('y') || 0);
    const w     = +(s.getAttribute('w') || 32);
    const h     = +(s.getAttribute('h') || 32);
    const count = +(s.getAttribute('c') || 1);

    for (let i = 0; i < count; i++) {
      const lid = numCols
        ? Math.floor(y / h) * numCols + Math.floor(x / w) + i
        : seqId;

      result[lid] = {
        localId:    lid,
        name,
        frame:      i,
        frameCount: count,
        srcX:       x + i * w,
        srcY:       y,
        w,
        h,
      };
      seqId++;
    }
  }

  if (numCols && tileW && tileH && imgW && imgH) {
    const cols = Math.floor(imgW / tileW);
    const rows = Math.floor(imgH / tileH);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const lid = r * cols + c;
        if (!result[lid]) {
          result[lid] = {
            localId: lid, name: '', frame: 0, frameCount: 1,
            srcX: c * tileW, srcY: r * tileH, w: tileW, h: tileH,
          };
        }
      }
    }
  }

  return result;
};

HME.spriteThumbnail = function(atlasImg, sprite, size) {
  if (!atlasImg || !sprite) return null;
  size = size || 16;
  const c  = document.createElement('canvas');
  c.width  = size;
  c.height = size;
  const cx = c.getContext('2d');
  cx.imageSmoothingEnabled = false;
  cx.drawImage(atlasImg, sprite.srcX, sprite.srcY, sprite.w, sprite.h, 0, 0, size, size);
  return c.toDataURL();
};
