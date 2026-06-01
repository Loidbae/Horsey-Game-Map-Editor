'use strict';

HME.buildInspectList = function() {
  const list = document.getElementById('inspect-list');
  list.innerHTML = '';
  const S         = HME.state;
  const locsFirst = (S.map.tilesets.find(ts => ts.source && ts.source.includes('locs'))?.firstgid) || 97;

  S.map.objects.forEach(obj => {
    const localId    = obj.gid - locsFirst;
    const sprite     = (HME.locsAtlas && localId >= 0) ? HME.locsAtlas[localId] : null;
    const isBuried   = obj.gid === 154;
    const buriedId   = isBuried ? parseInt(obj.properties?.buried) : NaN;
    const buriedItem = (!isNaN(buriedId) && HME.BURIED_ITEMS) ? HME.BURIED_ITEMS[buriedId] : null;
    let thumb = HME.spriteThumbnail(S.locsImg, sprite, 32);
    if (isBuried && buriedItem && S.spritesImg) {
      const c = document.createElement('canvas'); c.width = 32; c.height = 32;
      const cx = c.getContext('2d'); cx.imageSmoothingEnabled = false;
      const scale = Math.min(32 / buriedItem.sw, 32 / buriedItem.sh);
      const dx = Math.floor((32 - buriedItem.sw * scale) / 2);
      const dy = Math.floor((32 - buriedItem.sh * scale) / 2);
      cx.drawImage(S.spritesImg, buriedItem.sx, buriedItem.sy, buriedItem.sw, buriedItem.sh, dx, dy, buriedItem.sw * scale, buriedItem.sh * scale);
      cx.drawImage(S.spritesImg, 7, 92, 8, 14, 0, 0, 8, 14);
      thumb = c.toDataURL();
    }
    const displayName = (isBuried && buriedItem) ? buriedItem.name : obj.type;

    const col      = Math.floor(obj.x / HME.TS);
    const rowCoord = Math.floor(obj.y / HME.TS) - 1;

    const row = document.createElement('div');
    row.className  = 'insp-obj-row' + (S.selObj && S.selObj.id === obj.id ? ' selected' : '');
    row.dataset.id = obj.id;

    if (thumb) {
      row.innerHTML = `<img src="${thumb}" class="insp-thumb" alt="">
        <div class="insp-info">
          <div class="insp-name">${displayName}</div>
          <div class="insp-sub">${obj.gid} &middot; ${col},${rowCoord}</div>
        </div>
        <div class="insp-view-btn">View&nbsp;&rarr;</div>`;
    } else {
      row.innerHTML = `<div class="insp-dot-wrap"><div class="insp-dot" style="background:#888888"></div></div>
        <div class="insp-info">
          <div class="insp-name">${displayName}</div>
          <div class="insp-sub">${obj.gid} &middot; ${col},${rowCoord}</div>
        </div>
        <div class="insp-view-btn">View&nbsp;&rarr;</div>`;
    }

    row.addEventListener('click', () => HME.viewObj(obj));
    list.appendChild(row);
  });
};

HME.highlightInspectRow = function(obj) {
  document.querySelectorAll('.insp-obj-row').forEach(r => r.classList.remove('selected'));
  if (!obj) return;
  const row = document.querySelector(`.insp-obj-row[data-id="${obj.id}"]`);
  if (row) {
    row.classList.add('selected');
    row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
};

HME.buildTerrainPal = function() {
  const pal     = document.getElementById('terrain-pal');
  pal.innerHTML = '';
  const S       = HME.state;
  const terrFirst = (S.map.tilesets.find(ts => ts.source && ts.source.includes('terrain'))?.firstgid) || 1;

  if (HME.terrainAtlas && HME.terrainAtlas.length) {
    const buckets = {};
    HME.TILE_CATEGORY_ORDER.forEach(c => { buckets[c] = []; });

    HME.terrainAtlas.forEach(sprite => {
      if (!sprite) return;
      const gid = sprite.localId + terrFirst;
      if (HME.TILE_HIDDEN_GIDS.some(r => gid >= r.min && gid <= r.max)) return;
      let placed = false;
      for (const [cat, names] of Object.entries(HME.TILE_CATEGORIES)) {
        if (names.includes(sprite.name)) {
          buckets[cat].push({ sprite, gid });
          placed = true;
          break;
        }
      }
      if (!placed && !HME.TILE_EXCLUDED.has(sprite.name)) buckets['Misc'].push({ sprite, gid });
    });

    HME.TILE_CATEGORY_ORDER.forEach(cat => {
      const entries = buckets[cat];
      if (!entries.length) return;

      const section = document.createElement('div');
      section.className = 'cat-section';

      const hdr = document.createElement('div');
      hdr.className   = 'cat-hdr';
      if (cat === 'Misc') {
        const titleSpan = document.createElement('span');
        titleSpan.textContent = cat;
        hdr.appendChild(titleSpan);
        const infoWrap = document.createElement('span');
        infoWrap.className = 'spawner-info-wrap';
        infoWrap.innerHTML = `<span class="spawner-info-btn" title="These tiles exist in the game&#39;s terrain atlas but their in-game purpose is currently unknown. They may be decorative, unused, or serve a function that hasn&#39;t been documented yet." tabindex="0"><i class="ph ph-info"></i></span>`;
        hdr.appendChild(infoWrap);
      } else {
        hdr.textContent = cat;
      }
      section.appendChild(hdr);

      const grid = document.createElement('div');
      grid.className = 'tile-cat-grid';

      entries.forEach(({ sprite, gid }) => {
        const thumb = HME.spriteThumbnail(S.terrainImg, sprite, 28);
        let label = sprite.name;
        if (sprite.frameCount > 1) label += ` ${sprite.frame + 1}`;

        const chip = document.createElement('div');
        chip.className  = 'tile-chip' + (gid === S.selTileGID ? ' sel' : '');
        chip.dataset.gid = gid;
        chip.title      = `${label} (GID ${gid})`;

        if (thumb) {
          chip.innerHTML = `<img src="${thumb}" class="tile-chip-img" alt=""><div class="tile-chip-name">${label}</div>`;
        } else {
          chip.innerHTML = `<div class="tile-chip-swatch" style="background:#404040"></div><div class="tile-chip-name">${label}</div>`;
        }

        chip.addEventListener('click', () => {
          S.selTileGID = gid;
          document.querySelectorAll('.tile-chip').forEach(e => e.classList.remove('sel'));
          chip.classList.add('sel');
          HME.updatePaintInspector();
        });
        grid.appendChild(chip);
      });

      section.appendChild(grid);
      pal.appendChild(section);
    });

    return;
  }

  const locsFirst = (S.map.tilesets.find(ts => ts.source && ts.source.includes('locs'))?.firstgid) || 97;
  const uniq = [...new Set(S.map.layer.data)]
    .filter(g => g > 0 && g < locsFirst)
    .sort((a, b) => a - b);

  const section = document.createElement('div');
  section.className = 'cat-section';
  const hdr = document.createElement('div');
  hdr.className   = 'cat-hdr';
  hdr.textContent = 'All Tiles';
  section.appendChild(hdr);

  const grid = document.createElement('div');
  grid.className = 'tile-cat-grid';

  uniq.forEach(gid => {
    const chip = document.createElement('div');
    chip.className   = 'tile-chip' + (gid === S.selTileGID ? ' sel' : '');
    chip.dataset.gid = gid;
    chip.innerHTML   = `<div class="tile-chip-swatch" style="background:#404040"></div><div class="tile-chip-name">T${gid}</div>`;
    chip.addEventListener('click', () => {
      S.selTileGID = gid;
      document.querySelectorAll('.tile-chip').forEach(e => e.classList.remove('sel'));
      chip.classList.add('sel');
      HME.updatePaintInspector();
    });
    grid.appendChild(chip);
  });

  section.appendChild(grid);
  pal.appendChild(section);
};

HME.buildObjectPal = function() {
  const pal       = document.getElementById('object-pal');
  pal.innerHTML   = '';
  const S         = HME.state;
  const locsFirst = (S.map.tilesets.find(ts => ts.source && ts.source.includes('locs'))?.firstgid) || 97;

  const gidToType = {};
  S.map.objects.forEach(o => { if (o.type && o.type.trim()) gidToType[o.gid] = o.type.trim(); });

  function makeChip(gid, label, typeStr) {
    const actualType = (typeStr !== undefined && typeStr !== null) ? typeStr : label;
    const localId = gid - locsFirst;
    const sprite  = (HME.locsAtlas && localId >= 0) ? HME.locsAtlas[localId] : null;
    const thumb   = HME.spriteThumbnail(S.locsImg, sprite, 28);

    const isSel      = gid === S.selLocGID && actualType === S.selLocType;
    const chip       = document.createElement('div');
    chip.className   = 'o-chip' + (isSel ? ' sel' : '');
    chip.dataset.gid  = gid;
    chip.dataset.type = actualType;
    chip.title       = `${label} (GID ${gid})`;

    if (thumb) {
      chip.innerHTML = `<img src="${thumb}" class="o-chip-img" alt=""><div class="o-chip-name">${label}</div>`;
    } else {
      chip.innerHTML = `<div class="o-chip-ph">?</div><div class="o-chip-name">${label}</div>`;
    }

    chip.addEventListener('click', () => {
      S.selLocGID  = gid;
      S.selLocType = actualType;
      document.querySelectorAll('.o-chip').forEach(e => e.classList.remove('sel'));
      chip.classList.add('sel');
    });
    return chip;
  }

  function makeSection(title, chips, infoHtml) {
    if (!chips.length) return;
    const section   = document.createElement('div');
    section.className = 'cat-section';
    const hdr       = document.createElement('div');
    hdr.className   = 'cat-hdr';

    if (infoHtml) {
      const titleSpan = document.createElement('span');
      titleSpan.textContent = title;
      hdr.appendChild(titleSpan);
      const infoWrap = document.createElement('span');
      infoWrap.className = 'spawner-info-wrap';
      infoWrap.innerHTML = infoHtml;
      hdr.appendChild(infoWrap);
    } else {
      hdr.textContent = title;
    }

    section.appendChild(hdr);
    const grid      = document.createElement('div');
    grid.className  = 'obj-cat-grid';
    chips.forEach(c => grid.appendChild(c));
    section.appendChild(grid);
    pal.appendChild(section);
  }

  const locChips = [];
  if (HME.locsAtlas && HME.locsAtlas.length) {
    HME.locsAtlas.forEach(sprite => {
      if (!sprite || !sprite.name) return;
      if (sprite.frame > 0) return;
      const gid = sprite.localId + locsFirst;
      if (HME.SPAWNER_GIDS[gid]) return;
      const locName = HME.LOC_TYPES[gid];
      if (!locName) return;
      locChips.push(makeChip(gid, locName, locName));
    });
    const atlasGIDs = new Set(locChips.map(c => +c.dataset.gid));
    Object.entries(HME.LOC_TYPES).forEach(([gidStr, name]) => {
      const gid = +gidStr;
      if (atlasGIDs.has(gid)) return;
      locChips.push(makeChip(gid, name, name));
    });
  } else {
    Object.entries(HME.LOC_TYPES).forEach(([gidStr, name]) => {
      locChips.push(makeChip(+gidStr, name, name));
    });
  }
  const placedByGID = {};
  S.map.objects.forEach(o => { if (!HME.SPAWNER_GIDS[o.gid]) placedByGID[o.gid] = o; });

  locChips.forEach(chip => {
    const gid = +chip.dataset.gid;
    const placedObj = placedByGID[gid];
    if (!placedObj) return;
    chip.classList.add('o-chip-placed');
    const overlay = document.createElement('div');
    overlay.className = 'o-chip-placed-overlay';
    overlay.innerHTML = '<i class="ph ph-trash"></i>';
    chip.appendChild(overlay);
    overlay.addEventListener('click', e => {
      e.stopPropagation();
      HME.removeObj(placedObj);
    });
  });

  const locInfoHtml = `<span class="spawner-info-btn" title="Only one instance of each location can exist on the map.&#10;&#10;Locations with a trash icon are already placed. Click them to remove the location from the map first — then you can place it somewhere new." tabindex="0"><i class="ph ph-info"></i></span>`;
  makeSection('Locations', locChips, locInfoHtml);

  const spawnChips = [];
  Object.entries(HME.SPAWNER_GIDS).forEach(([gidStr, name]) => {
    const gid      = +gidStr;
    const variants = HME.SPAWNER_VARIANTS && HME.SPAWNER_VARIANTS[gid];
    if (variants) {
      variants.forEach(v => spawnChips.push(makeChip(gid, v.type, v.type)));
    } else {
      const gameType = HME.SPAWNER_TYPES && (HME.SPAWNER_TYPES[gid] !== undefined)
        ? HME.SPAWNER_TYPES[gid]
        : (gidToType[gid] || name);
      spawnChips.push(makeChip(gid, gameType, gameType));
    }
  });

  const spawnerInfoHtml = `<span class="spawner-info-btn" title="What is a Spawner?&#10;&#10;A Spawner is a named spot on the map where the game places animals, vehicles, or special objects when the map loads. I call them Spawners — in-game they&#39;re just regular location objects, but they&#39;re the ones that control where things appear at the start." tabindex="0"><i class="ph ph-info"></i></span>`;
  makeSection('Spawner', spawnChips, spawnerInfoHtml);

  if (HME._refreshMissingHighlights) HME._refreshMissingHighlights();
};
