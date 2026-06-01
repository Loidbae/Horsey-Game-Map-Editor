'use strict';

HME._minimapColorCache = null;

HME._buildMinimapColorCache = function() {
  const cache = {};
  const S = HME.state;
  const terrFirst = (S.map.tilesets.find(ts => ts.source && ts.source.includes('terrain'))?.firstgid) || 1;

  const offscreen = document.createElement('canvas');
  offscreen.width  = 1;
  offscreen.height = 1;
  const oc = offscreen.getContext('2d');

  const unique = new Set(S.map.layer.data);
  unique.forEach(gid => {
    if (!gid) return;
    if (S.terrainImg && HME.terrainAtlas) {
      const sprite = HME.terrainAtlas[gid - terrFirst];
      if (sprite) {
        oc.clearRect(0, 0, 1, 1);
        const cx = sprite.srcX + Math.floor(sprite.w / 2);
        const cy = sprite.srcY + Math.floor(sprite.h / 2);
        oc.drawImage(S.terrainImg, cx, cy, 1, 1, 0, 0, 1, 1);
        const px = oc.getImageData(0, 0, 1, 1).data;
        cache[gid] = { r: px[0], g: px[1], b: px[2] };
        return;
      }
    }
    cache[gid] = { r: 64, g: 64, b: 64 };
  });

  return cache;
};

HME.buildMinimap = function() {
  const mm  = document.getElementById('minimap');
  const ov  = document.getElementById('minimap-overlay');
  const W   = HME.state.map.width;
  const H   = HME.state.map.height;

  mm.width  = W;
  mm.height = H;
  if (ov) { ov.width = W; ov.height = H; }

  mm.style.width       = '100%';
  mm.style.aspectRatio = `${W} / ${H}`;
  mm.style.height      = '';
  if (ov) {
    ov.style.width       = '100%';
    ov.style.aspectRatio = `${W} / ${H}`;
    ov.style.height      = '';
  }

  HME._minimapColorCache = HME._buildMinimapColorCache();

  const ctx = mm.getContext('2d');
  const l   = HME.state.map.layer;
  const img = ctx.createImageData(W, H);
  const d   = img.data;

  for (let i = 0; i < l.data.length; i++) {
    const c = HME._minimapColorCache[l.data[i]] || { r: 64, g: 64, b: 64 };
    const p = i * 4;
    d[p] = c.r; d[p+1] = c.g; d[p+2] = c.b; d[p+3] = 255;
  }

  HME.state.map.objects.forEach(o => {
    const tx = Math.floor(o.x / HME.TS);
    const ty = Math.floor(o.y / HME.TS) - 1;
    const c  = { r: 136, g: 136, b: 136 };
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const px = (ty + dy) * W + (tx + dx);
        if (px >= 0 && px < l.data.length) {
          const p = px * 4;
          d[p] = c.r; d[p+1] = c.g; d[p+2] = c.b; d[p+3] = 255;
        }
      }
    }
  });

  ctx.putImageData(img, 0, 0);
  HME.renderMinimapViewport();
};

HME.renderMinimapViewport = function() {
  const ov = document.getElementById('minimap-overlay');
  if (!ov || !HME.state.map) return;

  const canvas = document.getElementById('map-canvas');
  if (!canvas.width) return;

  const S  = HME.state;
  const ts = HME.TS * S.zoom;

  const vx = S.panX / ts;
  const vy = S.panY / ts;
  const vw = canvas.width  / ts;
  const vh = canvas.height / ts;

  const ctx = ov.getContext('2d');
  ctx.clearRect(0, 0, ov.width, ov.height);

  const rx = Math.max(0, vx);
  const ry = Math.max(0, vy);
  const rr = Math.min(S.map.width,  vx + vw);
  const rb = Math.min(S.map.height, vy + vh);

  ctx.strokeStyle = '#ffdd44';
  ctx.lineWidth   = 4;
  ctx.strokeRect(rx, ry, rr - rx, rb - ry);
};

HME.render = function() {
  const canvas = document.getElementById('map-canvas');
  if (!canvas.width || !HME.state.map) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const S  = HME.state;
  const ts = HME.TS * S.zoom;
  const l  = S.map.layer;

  const c0 = Math.max(0, Math.floor(S.panX / ts));
  const c1 = Math.min(l.width,  Math.ceil((S.panX + canvas.width)  / ts));
  const r0 = Math.max(0, Math.floor(S.panY / ts));
  const r1 = Math.min(l.height, Math.ceil((S.panY + canvas.height) / ts));

  ctx.imageSmoothingEnabled = false;

  const terrFirst = S.map.tilesets.find(ts2 => ts2.source && ts2.source.includes('terrain'))?.firstgid || 1;

  for (let row = r0; row < r1; row++) {
    for (let col = c0; col < c1; col++) {
      const gid = l.data[row * l.width + col];
      const sx  = Math.floor(col * ts - S.panX);
      const sy  = Math.floor(row * ts - S.panY);
      const sw  = Math.ceil(ts) + 1;
      const sh  = Math.ceil(ts) + 1;

      const sprite = HME.terrainAtlas ? HME.terrainAtlas[gid - terrFirst] : null;

      if (S.terrainImg && sprite) {
        ctx.drawImage(S.terrainImg, sprite.srcX, sprite.srcY, sprite.w, sprite.h, sx, sy, sw, sh);
      } else {
        ctx.fillStyle = '#404040';
        ctx.fillRect(sx, sy, sw, sh);
      }
    }
  }

  const showGrid = document.getElementById('tog-grid')?.checked;
  if (showGrid && ts > 4) {
    const gc = (HME.settings && HME.settings.gridColorHex) ? HME.settings.gridColorHex : '#ffffff';
    const ga = (HME.settings && HME.settings.gridAlpha !== undefined) ? HME.settings.gridAlpha : 0.70;
    const gcRgb = HME.hexToRgb(gc);
    ctx.strokeStyle = `rgba(${gcRgb.r},${gcRgb.g},${gcRgb.b},${ga})`;
    ctx.lineWidth   = 0.5;
    for (let col = c0; col <= c1; col++) {
      const x = Math.floor(col * ts - S.panX) + 0.5;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let row = r0; row <= r1; row++) {
      const y = Math.floor(row * ts - S.panY) + 0.5;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }
  }

  const showLocs  = document.getElementById('tog-locs')?.checked;
  const locsFirst = S.map.tilesets.find(ts2 => ts2.source && ts2.source.includes('locs'))?.firstgid || 97;

  if (showLocs) {
    S.map.objects.forEach(obj => {
      if (S.isDraggingObj && S.dragObj && S.dragObj.id === obj.id && S.dragMoved) return;

      const tx = obj.x / HME.TS;
      const ty = obj.y / HME.TS - 1;
      const sx = tx * ts - S.panX;
      const sy = ty * ts - S.panY;

      if (sx + ts < 0 || sy + ts < 0 || sx > canvas.width || sy > canvas.height) return;

      const localId    = obj.gid - locsFirst;
      const sprite     = (HME.locsAtlas && localId >= 0) ? HME.locsAtlas[localId] : null;
      const isBuried   = obj.gid === 154;
      const buriedId   = isBuried ? parseInt(obj.properties?.buried) : NaN;
      const buriedItem = (!isNaN(buriedId) && HME.BURIED_ITEMS) ? HME.BURIED_ITEMS[buriedId] : null;

      ctx.imageSmoothingEnabled = false;
      if (isBuried && buriedItem && S.spritesImg) {
        const scale = Math.min((ts * 0.7) / buriedItem.sw, (ts * 0.7) / buriedItem.sh);
        const dx = sx + Math.floor((ts - buriedItem.sw * scale) / 2);
        const dy = sy + Math.floor((ts - buriedItem.sh * scale) / 2);
        ctx.drawImage(S.spritesImg, buriedItem.sx, buriedItem.sy, buriedItem.sw, buriedItem.sh, dx, dy, buriedItem.sw * scale, buriedItem.sh * scale);
        const sSize = Math.max(8, ts * 0.4);
        ctx.drawImage(S.spritesImg, 7, 92, 8, 14, sx + 1, sy + 1, sSize * (8/14), sSize);
      } else if (S.locsImg && sprite) {
        ctx.drawImage(S.locsImg, sprite.srcX, sprite.srcY, sprite.w, sprite.h, sx, sy, ts, ts);
      } else {
        const r = Math.max(3, Math.min(7, ts * 0.22));
        ctx.beginPath();
        ctx.arc(sx + ts / 2, sy + ts / 2, r, 0, Math.PI * 2);
        ctx.fillStyle   = '#888888';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.85)';
        ctx.lineWidth   = 1.5;
        ctx.stroke();
      }

      if (ts > 14) {
        const fs = Math.max(8, Math.min(11, ts * 0.28));
        ctx.font         = `${fs}px sans-serif`;
        ctx.fillStyle    = 'rgba(255,255,255,0.9)';
        ctx.strokeStyle  = 'rgba(0,0,0,0.7)';
        ctx.lineWidth    = 2.5;
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'top';
        const displayName = (isBuried && buriedItem) ? buriedItem.name : obj.type;
        ctx.strokeText(displayName, sx + ts / 2, sy + ts + 1);
        ctx.fillText(displayName,   sx + ts / 2, sy + ts + 1);
      }

      if (S.selObj && S.selObj.id === obj.id && !S.isDraggingObj) {
        ctx.strokeStyle = '#ffdd44';
        ctx.lineWidth   = 2;
        ctx.strokeRect(sx + 1, sy + 1, ts - 2, ts - 2);

        const r = parseInt(obj.properties?.radius);
        if (!isNaN(r) && r > 0 && HME.SPAWNER_GIDS[obj.gid]) {
          const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
          const centerCol = Math.floor(obj.x / HME.TS);
          const centerRow = Math.floor(obj.y / HME.TS) - 1;
          ctx.fillStyle   = accentColor;
          ctx.strokeStyle = accentColor;
          ctx.lineWidth   = 2;
          for (let dr = -r; dr <= r; dr++) {
            for (let dc = -r; dc <= r; dc++) {
              if (Math.sqrt(dc * dc + dr * dr) < r + 0.5) {
                const tx = (centerCol + dc) * ts - S.panX;
                const ty = (centerRow + dr) * ts - S.panY;
                ctx.globalAlpha = 0.08;
                ctx.fillRect(tx, ty, ts, ts);
              }
            }
          }
          ctx.globalAlpha = 0.8;
          ctx.beginPath();
          for (let dr = -r; dr <= r; dr++) {
            for (let dc = -r; dc <= r; dc++) {
              if (Math.sqrt(dc * dc + dr * dr) < r + 0.5) {
                const tx = (centerCol + dc) * ts - S.panX;
                const ty = (centerRow + dr) * ts - S.panY;
                if (Math.sqrt(dc**2     + (dr-1)**2) >= r + 0.5) { ctx.moveTo(tx, ty);      ctx.lineTo(tx + ts, ty); }
                if (Math.sqrt(dc**2     + (dr+1)**2) >= r + 0.5) { ctx.moveTo(tx, ty + ts); ctx.lineTo(tx + ts, ty + ts); }
                if (Math.sqrt((dc-1)**2 + dr**2)     >= r + 0.5) { ctx.moveTo(tx, ty);      ctx.lineTo(tx, ty + ts); }
                if (Math.sqrt((dc+1)**2 + dr**2)     >= r + 0.5) { ctx.moveTo(tx + ts, ty); ctx.lineTo(tx + ts, ty + ts); }
              }
            }
          }
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    });
  }

  if (S.hovCol >= 0 && S.mode !== 'object' && !S.isDraggingObj) {
    const sx = S.hovCol * ts - S.panX;
    const sy = S.hovRow * ts - S.panY;
    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.lineWidth   = 1;
    ctx.strokeRect(sx + 0.5, sy + 0.5, ts - 1, ts - 1);
  }

  if (S.isDraggingObj && S.dragObj && S.dragMoved && S.hovCol >= 0 && S.hovRow >= 0) {
    const obj     = S.dragObj;
    const gsx     = S.hovCol * ts - S.panX;
    const gsy     = S.hovRow * ts - S.panY;
    const localId = obj.gid - locsFirst;
    const sprite  = (HME.locsAtlas && localId >= 0) ? HME.locsAtlas[localId] : null;

    ctx.globalAlpha = 0.6;
    if (S.locsImg && sprite) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(S.locsImg, sprite.srcX, sprite.srcY, sprite.w, sprite.h, gsx, gsy, ts, ts);
    } else {
      ctx.fillStyle = '#888888';
      ctx.fillRect(gsx, gsy, ts, ts);
    }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#ffdd44';
    ctx.lineWidth   = 2;
    ctx.strokeRect(gsx + 1, gsy + 1, ts - 2, ts - 2);
  }

  if (S.hovCol >= 0 && S.hovRow >= 0 && !S.isDraggingObj) {
    const gsx = S.hovCol * ts - S.panX;
    const gsy = S.hovRow * ts - S.panY;

    if (S.mode === 'paint') {
      const tool = (S.altCmdDown) ? 'pipette' : (S.paintTool || 'brush');
      const gid  = tool === 'pipette'
        ? S.map.layer.data[S.hovRow * l.width + S.hovCol]
        : S.selTileGID;
      const sprite    = HME.terrainAtlas ? HME.terrainAtlas[gid - terrFirst] : null;
      const brushSize  = (tool === 'brush') ? (S.brushSize  || 1) : 1;
      const brushShape = (tool === 'brush') ? (S.brushShape || 'round') : 'square';
      const half       = Math.floor(brushSize / 2);

      ctx.globalAlpha = tool === 'pipette' ? 0.75 : 0.55;
      ctx.imageSmoothingEnabled = false;

      if (brushSize > 1) {
        for (let dr = -half; dr <= half; dr++) {
          for (let dc = -half; dc <= half; dc++) {
            if (!HME.isTileInBrush(dc, dr, brushSize, brushShape)) continue;
            const bsx = (S.hovCol + dc) * ts - S.panX;
            const bsy = (S.hovRow + dr) * ts - S.panY;
            if (S.terrainImg && sprite) {
              ctx.drawImage(S.terrainImg, sprite.srcX, sprite.srcY, sprite.w, sprite.h, bsx, bsy, ts, ts);
            } else if (gid > 0) {
              ctx.fillStyle = '#404040';
              ctx.fillRect(bsx, bsy, ts, ts);
            }
          }
        }
        ctx.globalAlpha = 1;
        ctx.strokeStyle = 'rgba(255,255,255,0.7)';
        ctx.lineWidth   = 1.5;
        if (brushShape === 'square') {
          const bsxStart = (S.hovCol - half) * ts - S.panX;
          const bsyStart = (S.hovRow - half) * ts - S.panY;
          ctx.strokeRect(bsxStart + 0.5, bsyStart + 0.5, brushSize * ts - 1, brushSize * ts - 1);
        } else {
          for (let dr = -half; dr < -half + brushSize; dr++) {
            for (let dc = -half; dc < -half + brushSize; dc++) {
              if (!HME.isTileInBrush(dc, dr, brushSize, brushShape)) continue;
              const bsx = (S.hovCol + dc) * ts - S.panX;
              const bsy = (S.hovRow + dr) * ts - S.panY;
              const inN = HME.isTileInBrush(dc, dr - 1, brushSize, brushShape);
              const inS = HME.isTileInBrush(dc, dr + 1, brushSize, brushShape);
              const inW = HME.isTileInBrush(dc - 1, dr, brushSize, brushShape);
              const inE = HME.isTileInBrush(dc + 1, dr, brushSize, brushShape);
              ctx.beginPath();
              if (!inN) { ctx.moveTo(bsx + 0.5, bsy + 0.5); ctx.lineTo(bsx + ts - 0.5, bsy + 0.5); }
              if (!inS) { ctx.moveTo(bsx + 0.5, bsy + ts - 0.5); ctx.lineTo(bsx + ts - 0.5, bsy + ts - 0.5); }
              if (!inW) { ctx.moveTo(bsx + 0.5, bsy + 0.5); ctx.lineTo(bsx + 0.5, bsy + ts - 0.5); }
              if (!inE) { ctx.moveTo(bsx + ts - 0.5, bsy + 0.5); ctx.lineTo(bsx + ts - 0.5, bsy + ts - 0.5); }
              ctx.stroke();
            }
          }
        }
      } else {
        if (S.terrainImg && sprite) {
          ctx.drawImage(S.terrainImg, sprite.srcX, sprite.srcY, sprite.w, sprite.h, gsx, gsy, ts, ts);
        } else if (gid > 0) {
          ctx.fillStyle = '#404040';
          ctx.fillRect(gsx, gsy, ts, ts);
        }
        ctx.globalAlpha = 1;
        ctx.strokeStyle = tool === 'pipette' ? 'rgba(80,200,255,0.9)' :
                          tool === 'fill'    ? 'rgba(255,180,50,0.9)'  :
                                               'rgba(255,255,255,0.7)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(gsx + 0.5, gsy + 0.5, ts - 1, ts - 1);
      }
    }

    if (S.mode === 'object') {
      const gid     = S.selLocGID;
      const localId = gid - locsFirst;
      const sprite  = (HME.locsAtlas && localId >= 0) ? HME.locsAtlas[localId] : null;

      ctx.globalAlpha = 0.55;
      if (S.locsImg && sprite) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(S.locsImg, sprite.srcX, sprite.srcY, sprite.w, sprite.h, gsx, gsy, ts, ts);
      } else {
        ctx.fillStyle = '#888888';
        ctx.fillRect(gsx, gsy, ts, ts);
      }
      ctx.globalAlpha = 1;

      ctx.strokeStyle = 'rgba(100,200,255,0.8)';
      ctx.lineWidth   = 1.5;
      ctx.strokeRect(gsx + 0.5, gsy + 0.5, ts - 1, ts - 1);
    }
  }

  HME.renderMinimapViewport();
};
