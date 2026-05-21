'use strict';

HME.TILE_CATEGORIES = {
  'Terraform': [
    'Plain', 'GrassLand', 'BogLand', 'PalmLand', 'CactusLand', 'NGrassLand',
    'Water', 'Pond', 'BadLand',
    'Grass', 'Reeds', 'NGrass',
  ],
  'Flora': [
    'Bush', 'Stump', 'Birch', 'Fir',
    'AcaciaLand', 'AppleTree', 'DeadTree', 'Tumbleweed',
    'Acacia', 'Apple', 'Palm', 'Cactus',
  ],
  'Big Rocks': [
    'Mountain', 'Boulder', 'Pebbles', 'Cave','Un1', 'Un2'
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
