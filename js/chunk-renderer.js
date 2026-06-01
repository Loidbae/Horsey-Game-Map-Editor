'use strict';

// ─── Chunk Renderer ───────────────────────────────────────────────────────────
// Two-level cache: 16×16 tile sub-chunks + 64×64 tile outer chunks.
// Painting invalidates only the affected sub-chunk and its parent outer chunk.
// Rendering draws a handful of large outer-chunk canvases — very few draw calls.
//
// Toggle:  HME.USE_CHUNK_RENDERER = true / false
// Remove:  delete this file + its <script> tag. Everything else untouched.
// ─────────────────────────────────────────────────────────────────────────────

HME.OUTER_CHUNK_SIZE   = 64;   // tiles per outer chunk (each axis)
HME.SUB_CHUNK_SIZE     = 16;   // tiles per sub-chunk   (each axis)
HME.CHUNK_TILE_PX      = 16;   // pixels per tile inside cache canvases
HME.LOD_ZOOM_THRESHOLD = 0.25;  // below 25% zoom → solid color LOD chunks

HME._subChunkCache   = {};  // key "scx_scy" → { canvas, dirty }
HME._outerChunkCache = {};  // key "cx_cy"   → { canvas, dirty }

HME.USE_CHUNK_RENDERER = true;

// ── Invalidation ─────────────────────────────────────────────────────────────

HME.invalidateChunk = function(col, row) {
  const scx = Math.floor(col / HME.SUB_CHUNK_SIZE);
  const scy = Math.floor(row / HME.SUB_CHUNK_SIZE);
  const cx  = Math.floor(col / HME.OUTER_CHUNK_SIZE);
  const cy  = Math.floor(row / HME.OUTER_CHUNK_SIZE);
  const sk  = `${scx}_${scy}`;
  const ok  = `${cx}_${cy}`;
  if (HME._subChunkCache[sk])   HME._subChunkCache[sk].dirty   = true;
  if (HME._outerChunkCache[ok]) HME._outerChunkCache[ok].dirty = true;
};

HME.invalidateAllChunks = function() {
  HME._subChunkCache   = {};
  HME._outerChunkCache = {};
};

// ── Sub-chunk building ────────────────────────────────────────────────────────

HME._buildSubChunk = function(scx, scy) {
  const S         = HME.state;
  const l         = S.map.layer;
  const sz        = HME.SUB_CHUNK_SIZE;
  const tpx       = HME.CHUNK_TILE_PX;
  const terrFirst = S.map.tilesets.find(ts => ts.source && ts.source.includes('terrain'))?.firstgid || 1;

  const c   = document.createElement('canvas');
  c.width   = sz * tpx;
  c.height  = sz * tpx;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const startCol = scx * sz;
  const startRow = scy * sz;

  for (let dr = 0; dr < sz; dr++) {
    for (let dc = 0; dc < sz; dc++) {
      const col = startCol + dc;
      const row = startRow + dr;
      if (col >= l.width || row >= l.height) continue;

      const gid    = l.data[row * l.width + col];
      const sprite = HME.terrainAtlas ? HME.terrainAtlas[gid - terrFirst] : null;

      const colorCache = HME._minimapColorCache;
      const col2 = colorCache ? colorCache[gid] : null;
      ctx.fillStyle = col2 ? `rgb(${col2.r},${col2.g},${col2.b})` : '#404040';
      ctx.fillRect(dc * tpx, dr * tpx, tpx + 1, tpx + 1);
    }
  }

  return c;
};

HME._getSubChunk = function(scx, scy) {
  const key = `${scx}_${scy}`;
  if (!HME._subChunkCache[key] || HME._subChunkCache[key].dirty) {
    HME._subChunkCache[key] = { canvas: HME._buildSubChunk(scx, scy), dirty: false };
  }
  return HME._subChunkCache[key].canvas;
};

// ── Outer chunk compositing ───────────────────────────────────────────────────

HME._buildOuterChunk = function(cx, cy) {
  const ocs  = HME.OUTER_CHUNK_SIZE;
  const scs  = HME.SUB_CHUNK_SIZE;
  const tpx  = HME.CHUNK_TILE_PX;
  const subs = ocs / scs; // sub-chunks per axis (4)

  const c   = document.createElement('canvas');
  c.width   = ocs * tpx;
  c.height  = ocs * tpx;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const subPx = scs * tpx; // pixel size of one sub-chunk canvas

  for (let dsy = 0; dsy < subs; dsy++) {
    for (let dsx = 0; dsx < subs; dsx++) {
      const scx = cx * subs + dsx;
      const scy = cy * subs + dsy;
      const sub = HME._getSubChunk(scx, scy);
      ctx.drawImage(sub, 0, 0, subPx, subPx,
                    dsx * subPx, dsy * subPx, subPx + 1, subPx + 1);
    }
  }

  return c;
};

HME._getOuterChunk = function(cx, cy) {
  const key = `${cx}_${cy}`;
  const S   = HME.state;
  const ocs = HME.OUTER_CHUNK_SIZE;
  const scs = HME.SUB_CHUNK_SIZE;
  const subs = ocs / scs;

  // If any sub-chunk inside this outer chunk is dirty, recomposite
  const entry = HME._outerChunkCache[key];
  if (!entry || entry.dirty) {
    // Rebuild dirty sub-chunks first
    for (let dsy = 0; dsy < subs; dsy++) {
      for (let dsx = 0; dsx < subs; dsx++) {
        const scx = cx * subs + dsx;
        const scy = cy * subs + dsy;
        const sk  = `${scx}_${scy}`;
        if (!HME._subChunkCache[sk] || HME._subChunkCache[sk].dirty) {
          HME._subChunkCache[sk] = { canvas: HME._buildSubChunk(scx, scy), dirty: false };
        }
      }
    }
    HME._outerChunkCache[key] = { canvas: HME._buildOuterChunk(cx, cy), dirty: false };
  }

  return HME._outerChunkCache[key].canvas;
};

// ── Main chunked render ───────────────────────────────────────────────────────

HME.renderChunked = function() {
  const canvas = document.getElementById('map-canvas');
  if (!canvas.width || !HME.state.map) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const S               = HME.state;
  const ts              = HME.TS * S.zoom;
  const l               = S.map.layer;
  const ocs             = HME.OUTER_CHUNK_SIZE;
  const tpx             = HME.CHUNK_TILE_PX;
  const outerPx         = ocs * tpx;
  const outerScreenSize = ocs * ts;

  // ── Terrain via outer chunks ──────────────────────────────────────────────
  const cx0 = Math.floor(S.panX / ts / ocs);
  const cy0 = Math.floor(S.panY / ts / ocs);
  const cx1 = Math.ceil((S.panX + canvas.width)  / ts / ocs);
  const cy1 = Math.ceil((S.panY + canvas.height) / ts / ocs);

  ctx.imageSmoothingEnabled = false;

  const terrFirst = S.map.tilesets.find(ts2 => ts2.source && ts2.source.includes('terrain'))?.firstgid || 1;
  const useLOD = S.zoom < HME.LOD_ZOOM_THRESHOLD;
  const c0 = Math.max(0, Math.floor(S.panX / ts));
  const c1 = Math.min(l.width,  Math.ceil((S.panX + canvas.width)  / ts));
  const r0 = Math.max(0, Math.floor(S.panY / ts));
  const r1 = Math.min(l.height, Math.ceil((S.panY + canvas.height) / ts));

  if (useLOD) {
    for (let cy = cy0; cy <= cy1; cy++) {
      for (let cx = cx0; cx <= cx1; cx++) {
        if (cx < 0 || cy < 0 || cx * ocs >= l.width || cy * ocs >= l.height) continue;
        const outerCanvas = HME._getOuterChunk(cx, cy);
        const sx = Math.floor(cx * outerScreenSize - S.panX);
        const sy = Math.floor(cy * outerScreenSize - S.panY);
        ctx.drawImage(outerCanvas, 0, 0, outerPx, outerPx, sx, sy, outerScreenSize + 1, outerScreenSize + 1);
      }
    }
  } else {
    for (let row = r0; row < r1; row++) {
      for (let col = c0; col < c1; col++) {
        const gid    = l.data[row * l.width + col];
        const sx     = Math.floor(col * ts - S.panX);
        const sy     = Math.floor(row * ts - S.panY);
        const sw     = Math.ceil(ts) + 1;
        const sh     = Math.ceil(ts) + 1;
        const sprite = HME.terrainAtlas ? HME.terrainAtlas[gid - terrFirst] : null;
        if (S.terrainImg && sprite) {
          ctx.drawImage(S.terrainImg, sprite.srcX, sprite.srcY, sprite.w, sprite.h, sx, sy, sw, sh);
        } else {
          ctx.fillStyle = '#404040';
          ctx.fillRect(sx, sy, sw, sh);
        }
      }
    }
  }

  // ── Everything below is live (grid, objects, hover, overlays) ─────────────

  // Grid
  const showGrid = document.getElementById('tog-grid')?.checked;
  if (showGrid && ts > 4) {
    const gc    = (HME.settings && HME.settings.gridColorHex) ? HME.settings.gridColorHex : '#ffffff';
    const ga    = (HME.settings && HME.settings.gridAlpha !== undefined) ? HME.settings.gridAlpha : 0.70;
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

  // Objects
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
                const ttx = (centerCol + dc) * ts - S.panX;
                const tty = (centerRow + dr) * ts - S.panY;
                ctx.globalAlpha = 0.08;
                ctx.fillRect(ttx, tty, ts, ts);
              }
            }
          }
          ctx.globalAlpha = 0.8;
          ctx.beginPath();
          for (let dr = -r; dr <= r; dr++) {
            for (let dc = -r; dc <= r; dc++) {
              if (Math.sqrt(dc * dc + dr * dr) < r + 0.5) {
                const ttx = (centerCol + dc) * ts - S.panX;
                const tty = (centerRow + dr) * ts - S.panY;
                if (Math.sqrt(dc**2     + (dr-1)**2) >= r + 0.5) { ctx.moveTo(ttx, tty);       ctx.lineTo(ttx + ts, tty); }
                if (Math.sqrt(dc**2     + (dr+1)**2) >= r + 0.5) { ctx.moveTo(ttx, tty + ts);  ctx.lineTo(ttx + ts, tty + ts); }
                if (Math.sqrt((dc-1)**2 + dr**2)     >= r + 0.5) { ctx.moveTo(ttx, tty);       ctx.lineTo(ttx, tty + ts); }
                if (Math.sqrt((dc+1)**2 + dr**2)     >= r + 0.5) { ctx.moveTo(ttx + ts, tty);  ctx.lineTo(ttx + ts, tty + ts); }
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
      const tool       = S.altCmdDown ? 'pipette' : (S.paintTool || 'brush');
      const gid        = tool === 'pipette' ? S.map.layer.data[S.hovRow * l.width + S.hovCol] : S.selTileGID;
      const sprite     = HME.terrainAtlas ? HME.terrainAtlas[gid - terrFirst] : null;
      const brushSize  = tool === 'brush' ? (S.brushSize  || 1) : 1;
      const brushShape = tool === 'brush' ? (S.brushShape || 'round') : 'square';
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
              if (!inN) { ctx.moveTo(bsx + 0.5, bsy + 0.5);        ctx.lineTo(bsx + ts - 0.5, bsy + 0.5); }
              if (!inS) { ctx.moveTo(bsx + 0.5, bsy + ts - 0.5);   ctx.lineTo(bsx + ts - 0.5, bsy + ts - 0.5); }
              if (!inW) { ctx.moveTo(bsx + 0.5, bsy + 0.5);        ctx.lineTo(bsx + 0.5, bsy + ts - 0.5); }
              if (!inE) { ctx.moveTo(bsx + ts - 0.5, bsy + 0.5);   ctx.lineTo(bsx + ts - 0.5, bsy + ts - 0.5); }
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

// ── Render dispatch override ──────────────────────────────────────────────────
HME._originalRender = HME.render;
HME.render = function() {
  if (HME.USE_CHUNK_RENDERER) HME.renderChunked();
  else HME._originalRender();
};
