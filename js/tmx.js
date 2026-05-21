'use strict';

HME.parseTMX = function(xml) {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  const m   = doc.querySelector('map');

  HME.state.map = {
    version:      m.getAttribute('version'),
    tiledversion: m.getAttribute('tiledversion'),
    orientation:  m.getAttribute('orientation'),
    renderorder:  m.getAttribute('renderorder'),
    width:        +m.getAttribute('width'),
    height:       +m.getAttribute('height'),
    tilewidth:    +m.getAttribute('tilewidth'),
    tileheight:   +m.getAttribute('tileheight'),
    infinite:     m.getAttribute('infinite'),
    nextlayerid:  m.getAttribute('nextlayerid'),
    nextobjectid: m.getAttribute('nextobjectid'),
    tilesets: [],
    layer: null,
    objects: [],
  };

  doc.querySelectorAll('tileset').forEach(ts =>
    HME.state.map.tilesets.push({
      firstgid: +ts.getAttribute('firstgid'),
      source:    ts.getAttribute('source'),
    })
  );

  const layerEl = doc.querySelector('layer');
  if (layerEl) {
    const dataEl = layerEl.querySelector('data');
    const csv    = dataEl.textContent.replace(/\s/g, '');
    HME.state.map.layer = {
      id:     layerEl.getAttribute('id'),
      name:   layerEl.getAttribute('name'),
      width:  +layerEl.getAttribute('width'),
      height: +layerEl.getAttribute('height'),
      data:   csv.split(',').map(Number),
    };
  }

  doc.querySelectorAll('objectgroup object').forEach(el => {
    const props = {};
    el.querySelectorAll('property').forEach(p => {
      props[p.getAttribute('name')] = p.getAttribute('value');
    });
    HME.state.map.objects.push({
      id:     +el.getAttribute('id'),
      type:    el.getAttribute('type') || '',
      gid:    +el.getAttribute('gid'),
      x:      +el.getAttribute('x'),
      y:      +el.getAttribute('y'),
      width:  +(el.getAttribute('width')  || 32),
      height: +(el.getAttribute('height') || 32),
      properties: props,
    });
  });
};

HME.serializeTMX = function() {
  const m = HME.state.map;
  const l = m.layer;

  const rows = [];
  for (let r = 0; r < l.height; r++) {
    const slice = l.data.slice(r * l.width, r * l.width + l.width);
    rows.push(slice.join(',') + (r < l.height - 1 ? ',' : ''));
  }

  const objXML = m.objects.map(o => {
    const propKeys = Object.keys(o.properties);
    if (propKeys.length) {
      const propsXML = propKeys.map(k =>
        `    <property name="${k}" value="${o.properties[k]}"/>`
      ).join('\n');
      return `  <object id="${o.id}" type="${o.type}" gid="${o.gid}" x="${o.x}" y="${o.y}" width="${o.width}" height="${o.height}">\n   <properties>\n${propsXML}\n   </properties>\n  </object>`;
    }
    return `  <object id="${o.id}" type="${o.type}" gid="${o.gid}" x="${o.x}" y="${o.y}" width="${o.width}" height="${o.height}"/>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<map version="${m.version}" tiledversion="${m.tiledversion}" orientation="${m.orientation}" renderorder="${m.renderorder}" width="${m.width}" height="${m.height}" tilewidth="${m.tilewidth}" tileheight="${m.tileheight}" infinite="${m.infinite}" nextlayerid="${m.nextlayerid}" nextobjectid="${m.nextobjectid}">
 ${m.tilesets.map(ts => `<tileset firstgid="${ts.firstgid}" source="${ts.source}"/>`).join('\n ')}
 <layer id="${l.id}" name="${l.name}" width="${l.width}" height="${l.height}">
  <data encoding="csv">
${rows.join('\n')}
  </data>
 </layer>
 <objectgroup id="2" name="Locs">
${objXML}
 </objectgroup>
</map>`;
};
