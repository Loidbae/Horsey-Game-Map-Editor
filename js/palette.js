'use strict';

HME.buildInspectList = function() {
  const list = document.getElementById('inspect-list');
  list.innerHTML = '';
  const S         = HME.state;
  const locsFirst = (S.map.tilesets.find(ts => ts.source && ts.source.includes('locs'))?.firstgid) || 97;

  S.map.objects.forEach(obj => {
    const localId = obj.gid - locsFirst;
    const sprite  = (HME.locsAtlas && localId >= 0) ? HME.locsAtlas[localId] : null;
    const thumb   = HME.spriteThumbnail(S.locsImg, sprite, 32);

    const col      = Math.floor(obj.x / HME.TS);
    const rowCoord = Math.floor(obj.y / HME.TS) - 1;

    const row = document.createElement('div');
    row.className  = 'insp-obj-row' + (S.selObj && S.selObj.id === obj.id ? ' selected' : '');
    row.dataset.id = obj.id;

    if (thumb) {
      row.innerHTML = `<img src="${thumb}" class="insp-thumb" alt="">
        <div class="insp-info">
          <div class="insp-name">${obj.type}</div>
          <div class="insp-sub">${obj.gid} &middot; ${col},${rowCoord}</div>
        </div>
        <div class="insp-view-btn">View&nbsp;&rarr;</div>`;
    } else {
      row.innerHTML = `<div class="insp-dot-wrap"><div class="insp-dot" style="background:${HME.locColor(obj.gid)}"></div></div>
        <div class="insp-info">
          <div class="insp-name">${obj.type}</div>
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
      let placed = false;
      for (const [cat, names] of Object.entries(HME.TILE_CATEGORIES)) {
        if (names.includes(sprite.name)) {
          buckets[cat].push({ sprite, gid });
          placed = true;
          break;
        }
      }
      if (!placed) buckets['Misc'].push({ sprite, gid });
    });

    HME.TILE_CATEGORY_ORDER.forEach(cat => {
      const entries = buckets[cat];
      if (!entries.length) return;

      const section = document.createElement('div');
      section.className = 'cat-section';

      const hdr = document.createElement('div');
      hdr.className   = 'cat-hdr';
      hdr.textContent = cat;
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
          chip.innerHTML = `<div class="tile-chip-swatch" style="background:${HME.tileColor(gid)}"></div><div class="tile-chip-name">${label}</div>`;
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
    const name = HME.TILE_NAMES[gid] || `T${gid}`;
    const chip = document.createElement('div');
    chip.className   = 'tile-chip' + (gid === S.selTileGID ? ' sel' : '');
    chip.dataset.gid = gid;
    chip.innerHTML   = `<div class="tile-chip-swatch" style="background:${HME.tileColor(gid)}"></div><div class="tile-chip-name">${name}</div>`;
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

  function makeChip(gid, label) {
    const localId = gid - locsFirst;
    const sprite  = (HME.locsAtlas && localId >= 0) ? HME.locsAtlas[localId] : null;
    const thumb   = HME.spriteThumbnail(S.locsImg, sprite, 28);

    const chip       = document.createElement('div');
    chip.className   = 'o-chip' + (gid === S.selLocGID ? ' sel' : '');
    chip.dataset.gid = gid;
    chip.title       = `${label} (GID ${gid})`;

    if (thumb) {
      chip.innerHTML = `<img src="${thumb}" class="o-chip-img" alt=""><div class="o-chip-name">${label}</div>`;
    } else {
      chip.innerHTML = `<div class="o-chip-ph">?</div><div class="o-chip-name">${label}</div>`;
    }

    chip.addEventListener('click', () => {
      S.selLocGID  = gid;
      S.selLocType = label;
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
      const label = gidToType[gid] || sprite.name;
      locChips.push(makeChip(gid, label));
    });
    const atlasGIDs = new Set(locChips.map(c => +c.dataset.gid));
    S.map.objects.forEach(o => {
      if (atlasGIDs.has(o.gid) || HME.SPAWNER_GIDS[o.gid]) return;
      atlasGIDs.add(o.gid);
      locChips.push(makeChip(o.gid, gidToType[o.gid] || `GID ${o.gid}`));
    });
  } else {
    const seen = new Set();
    S.map.objects.forEach(o => {
      if (seen.has(o.gid) || HME.SPAWNER_GIDS[o.gid]) return;
      seen.add(o.gid);
      locChips.push(makeChip(o.gid, gidToType[o.gid] || `GID ${o.gid}`));
    });
  }
  makeSection('Locations', locChips);

  const spawnChips = Object.entries(HME.SPAWNER_GIDS).map(([gidStr, name]) => {
    const gid   = +gidStr;
    const label = gidToType[gid] || name;
    return makeChip(gid, label);
  });

  const spawnerInfoHtml = `<span class="spawner-info-btn" title="What is a Spawner?&#10;&#10;A Spawner is a named spot on the map where the game places animals, vehicles, or special objects when the map first loads. The term &#34;Spawner&#34; was coined by the editor author — in-game these are just specific location objects, but they control where things appear at game start." tabindex="0"><i class="ti ti-info-circle"></i></span>`;
  makeSection('Spawner', spawnChips, spawnerInfoHtml);
};
