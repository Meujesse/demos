window.MJFIX = (apply) => { const out=[]; const g4=i=>{const p=J(i.data.Position), z=J(i.data.Size); return [parseInt(p.PositionLeft),parseInt(p.PositionTop),parseInt(z.Width),parseInt(z.Height)];};
  G.slides().forEach(sl=>{ const top=sl.orderedItems.filter(i=>!i.data.IdGroup); const gs=top.filter(i=>i.type==='group');
    const bad=gs.filter(g=>{const [x,y,w,h]=g4(g); return x<130 && y+h>590;});
    if (bad.length) { const low=Math.max(...bad.map(g=>{const [x,y,w,h]=g4(g); return y+h;})); const dy=low-585;
      const stack=gs.filter(g=>{const [x,y]=g4(g); return x<130 && y>380;});
      if (apply) stack.forEach(g=>{const [x,y]=g4(g); H.pos(g,x,y-dy);});
      out.push('BOUTONS p'+sl.data.Order+' '+sl.data.Name.slice(0,30)+' : '+stack.map(g=>H.label(sl,g).slice(0,18)).join(' / ')+' ↑'+dy); }
    top.filter(i=>i.type!=='group').forEach(i=>{const [x,y,w,h]=g4(i); if (w<1100 && x<112 && x+w>80 && y+h>616 && y<656 && i.type!=='rich-content') out.push('AUTRE p'+sl.data.Order+' '+sl.data.Name.slice(0,30)+' : '+(i.data.LayerTitle||i.type)+' '+x+','+y+' '+w+'x'+h); });
  }); return out; };
