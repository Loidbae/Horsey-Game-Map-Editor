'use strict';

HME.TILE_CATEGORIES = {
  'Terraform': [
    'Plain', 'GrassLand', 'BogLand', 'NGrassLand',
    'Water', 'Pond', 'BadLand',
    'Grass', 'Reeds', 'NGrass',
  ],
  'Flora': [
    'PalmLand', 'CactusLand', 'Bush', 'Stump', 'Birch', 'Fir',
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
  154: 'Buried Item',
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

HME.TILE_EXCLUDED = new Set(['Un2']);

HME.BURIED_ITEMS = [
  { id:  0, name: 'Hay',             sx:  40, sy:  78, sw:  9, sh: 11 },
  { id:  1, name: 'Hay Bale',        sx:  43, sy: 106, sw: 24, sh: 16 },
  { id:  2, name: 'Apple',           sx:  40, sy:  92, sw:  9, sh: 11 },
  { id:  3, name: 'Beer',            sx:  68, sy: 110, sw: 13, sh: 16 },
  { id:  4, name: 'Hotsauce',       sx:   7, sy: 107, sw:  8, sh: 17 },
  { id:  5, name: 'Plutonium',         sx:  70, sy:  97, sw: 18, sh: 11 },
  { id:  6, name: 'Bones',          sx:  83, sy: 110, sw: 16, sh:  7 },
  { id:  7, name: 'Carcass (buggy, has 0 charges)',  sx: 115, sy: 152, sw: 21, sh: 10 },
  { id:  8, name: 'Dung',            sx: 100, sy: 109, sw: 14, sh:  8 },
  { id:  9, name: 'Trophy',          sx:  18, sy: 107, sw:  9, sh: 16 },
  { id: 10, name: 'Champion Trophy', sx:  30, sy: 107, sw:  9, sh: 16 },
  { id: 11, name: 'VIP Card',        sx: 137, sy: 180, sw: 17, sh: 11 },
  { id: 12, name: 'Vial (cure for sweetie)',            sx:  91, sy: 129, sw: 18, sh: 21 },
  { id: 13, name: 'Diskette',    sx: 155, sy: 174, sw: 14, sh: 14 },
  { id: 14, name: 'Briefcase',    sx: 177, sy: 153, sw: 16, sh: 13 },
  { id: 15, name: 'Chest',        sx: 488, sy: 202, sw: 21, sh: 22 },
  { id: 16, name: 'Cactus',     sx: 194, sy: 184, sw: 11, sh: 19 },
  { id: 17, name: 'Vase',  sx: 206, sy: 184, sw: 10, sh: 17 },
  { id: 18, name: 'Treasure Map',    sx:  32, sy: 264, sw: 16, sh: 16 },
  { id: 19, name: 'G',               sx: 192, sy:   3, sw:  9, sh:  9 },
  { id: 20, name: 'A',               sx: 200, sy:   3, sw:  9, sh:  9 },
  { id: 21, name: 'T',               sx: 208, sy:   3, sw:  9, sh:  9 },
  { id: 22, name: 'C',               sx: 216, sy:   3, sw:  9, sh:  9 },
  { id: 23, name: 'Stripe Upgrade',   sx: 126, sy:  44, sw: 16, sh: 15 },
  { id: 24, name: 'Lift Upgrade',  sx: 143, sy:  44, sw: 16, sh: 15 },
  { id: 25, name: 'Rambar Upgrade',  sx: 160, sy:  44, sw: 16, sh: 15 },
  { id: 26, name: 'Sneakers',        sx: 217, sy: 184, sw: 16, sh: 12 },
  { id: 27, name: 'Bow Tie',         sx: 217, sy: 197, sw: 18, sh:  9 },
  { id: 28, name: 'Cravat',        sx: 313, sy: 219, sw: 12, sh: 20 },
  { id: 29, name: 'Top Hat',         sx: 236, sy: 184, sw: 20, sh: 13 },
  { id: 30, name: 'Toque',          sx: 297, sy: 222, sw: 15, sh: 17 },
  { id: 31, name: 'Glasses',      sx: 312, sy: 208, sw: 16, sh: 10 },
  { id: 32, name: 'Sunglasses',         sx: 257, sy: 184, sw: 15, sh: 10 },
  { id: 33, name: 'Ball and Chain',  sx: 257, sy: 198, sw: 17, sh: 12 },
  { id: 34, name: 'Jet Engine',          sx: 273, sy: 184, sw: 22, sh: 12 },
  { id: 35, name: 'Balloon',         sx: 275, sy: 197, sw: 12, sh: 16 },
  { id: 36, name: 'Rollerblades',   sx: 296, sy: 184, sw: 15, sh: 14 },
  { id: 37, name: 'Stilts',          sx: 342, sy: 183, sw: 11, sh: 24 },
  { id: 38, name: 'Clown Nose',        sx: 329, sy: 184, sw: 12, sh: 12 },
  { id: 39, name: 'Cowboy Boots 1',      sx: 400, sy: 199, sw: 16, sh: 20 },
  { id: 40, name: 'Cowboy Boots 2', sx: 417, sy: 199, sw: 16, sh: 20 },
  { id: 41, name: 'Cowboy Boots 3',     sx: 400, sy: 178, sw: 16, sh: 20 },
  { id: 42, name: 'Cowboy Boots 4',      sx: 417, sy: 178, sw: 16, sh: 20 },
  { id: 43, name: 'Ribbon 1',     sx: 394, sy: 153, sw: 11, sh: 17 },
  { id: 44, name: 'Ribbon 2',   sx: 406, sy: 153, sw: 11, sh: 17 },
  { id: 45, name: 'Ribbon 3',   sx: 418, sy: 153, sw: 11, sh: 17 },
  { id: 46, name: 'Ribbon 4',    sx: 430, sy: 153, sw: 11, sh: 17 },
  { id: 47, name: 'Fence Box Upgrade',   sx: 177, sy:  44, sw: 16, sh: 15 },
  { id: 48, name: 'Memory',            sx: 110, sy: 163, sw:  9, sh: 10 },
];
HME.TILE_HIDDEN_GIDS = [{ min: 70, max: 105 }, { min: 81, max: 100 }];
HME.TILE_GID_REMAP = (gid) => {
  if (gid >= 70 && gid <= 75)   return 5;
  if (gid >= 76 && gid <= 80)   return 6;
  if (gid >= 101 && gid <= 105) return 5;
  if (gid >= 81 && gid <= 85)   return 25;
  if (gid >= 86 && gid <= 90)   return 26;
  if (gid >= 91 && gid <= 95)   return 7;
  if (gid >= 96 && gid <= 100)  return 8;
  return gid;
};

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
