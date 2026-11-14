// Audit d'expérience d'un Genially (à charger après genially-lib.js).
// AUDIT() renvoie la liste des problèmes détectés automatiquement ;
// FIXTIMING() corrige les rythmes d'apparition (texte d'abord, choix ensuite, bouton de suite en dernier).
(function () {
  const TX = i => { try { return (JSON.stringify(i.data.Content).match(/"text":"([^"]*)"/g) || []).map(x => x.slice(8, -1)).join(' '); } catch (e) { return ''; } };
  const act = (i, ev) => { const k = J(i.data.interactivities || {})[ev]; return k ? J(ia.get(k)) : null; };
  const targets = a => { if (!a) return []; if (a.type === 'parallel') return a.interactivityActions.flatMap(targets); if (a.type === 'goToSlide') return [['go', a.target.slideId]]; if (a.type === 'slidePopup') return [['pop', a.targetSlideId]]; if (a.type === 'closeSlidePopup') return [['close']]; return [[a.type]]; };
  const d = i => parseFloat(i.data.DelayIn || '0') || 0;
  const top = s => s.orderedItems.filter(i => !i.data.IdGroup);
  const isCard = i => i.type === 'svg' && /^(carte|levier-carte|tuile|consigne-carte)/.test(i.data.LayerTitle || '') && parseFloat(i.data.Opacity || '1') > 0.5;
  const isText = i => i.type === 'text' && TX(i).trim().length > 2 && !/^nom|etiquette/.test(i.data.LayerTitle || '');
  const navOut = i => targets(act(i, 'click')).filter(t => t[0] === 'go');
  window.TX = TX;
  window.AUDIT = () => {
    const P = []; const all = [...G.slides(), ...G.popups()]; const ids = new Set(all.map(s => s.data.Id));
    const incoming = {}; all.forEach(s => s.orderedItems.forEach(i => ['click', 'hover'].forEach(ev => targets(act(i, ev)).forEach(t => { if (t[1]) incoming[t[1]] = (incoming[t[1]] || 0) + 1; }))));
    G.slides().forEach((s, idx) => {
      const nm = 'p' + s.data.Order + ' ' + (s.data.Name || '').slice(0, 40);
      const it = top(s);
      const exits = it.filter(i => navOut(i).length);
      if (!exits.length && idx < G.slides().length - 1) P.push([nm, 'aucune sortie (cul-de-sac)']);
      if (idx > 0 && !incoming[s.data.Id]) P.push([nm, 'page jamais atteinte par un lien']);
      if (s.data.Transition !== '74' && s.data.Transition !== '5') P.push([nm, 'transition ' + s.data.Transition]);
      const txtMax = Math.max(0, ...it.filter(i => isText(i) && !/retour|ok-texte|carnet-retour/.test(i.data.LayerTitle || '')).filter(i => i.data.EffectIn !== 'none' || d(i) > 0).map(d));
      const buttons = it.filter(i => i.type === 'group' && navOut(i).length);
      const choices = buttons.filter(g => !/Continuer|→/.test(H.kids(s, g).filter(k => k.type === 'text').map(TX).join('')));
      const conts = buttons.filter(g => /→/.test(H.kids(s, g).filter(k => k.type === 'text').map(TX).join('')));
      conts.forEach(g => { if (d(g) + 0.05 < txtMax) P.push([nm, 'bouton de suite (' + d(g) + 's) avant le dernier texte (' + txtMax + 's)']); });
      if (choices.length > 1) { const ds = choices.map(d); if (Math.max(...ds) - Math.min(...ds) < 0.3 * (choices.length - 1)) P.push([nm, choices.length + ' choix qui arrivent ensemble']); if (Math.min(...ds) + 0.05 < txtMax) P.push([nm, 'choix avant la fin du texte']); }
      it.forEach(i => { const c = J(i.data.interactivities || {}); if (c.hover && c.click) P.push([nm, 'survol + clic sur ' + (i.data.LayerTitle || i.type)]); if (i.data.Blocked) P.push([nm, 'élément verrouillé ' + (i.data.LayerTitle || i.type)]); });
      it.filter(isText).forEach(t => { if (/\s{2,}|  |\.\./.test(TX(t)) || /\bl ?' /.test(TX(t))) P.push([nm, 'typo ? «' + TX(t).slice(0, 60) + '»']); });
    });
    G.popups().forEach(p => { const nm = 'POP ' + p.data.Id.slice(0, 4); if (!p.orderedItems.some(i => targets(act(i, 'click')).some(t => t[0] === 'close'))) P.push([nm, 'fenêtre sans bouton de fermeture']); if (!incoming[p.data.Id]) P.push([nm, 'fenêtre jamais ouverte']); });
    return P;
  };
  window.FIXTIMING = () => {
    let n = 0;
    G.slides().forEach(s => {
      const it = top(s); const fx = (i, v) => { if (Math.abs(d(i) - v) < 0.01 && i.data.EffectIn !== 'none') return; U(() => { if (i.data.EffectIn === 'none') i.data.EffectIn = 'fade-in'; i.data.DelayIn = String(Math.round(v * 100) / 100); }); if (i.type === 'group') H.kids(s, i).forEach(k => U(() => { k.data.DelayIn = String(Math.round(v * 100) / 100); })); n++; };
      const txts = it.filter(i => isText(i) && !/retour|ok-texte|top3-ok/.test(i.data.LayerTitle || '') && d(i) > 0);
      if (!txts.length) return;
      const txtMax = Math.max(...txts.map(d));
      const buttons = it.filter(i => i.type === 'group' && navOut(i).length);
      const choices = buttons.filter(g => !/→/.test(H.kids(s, g).filter(k => k.type === 'text').map(TX).join(''))).sort((a, b) => H.Y(a) - H.Y(b));
      const conts = buttons.filter(g => /→/.test(H.kids(s, g).filter(k => k.type === 'text').map(TX).join('')));
      if (choices.length > 1) choices.forEach((g, k) => fx(g, txtMax + 1.6 + k * 0.5));
      const last = choices.length > 1 ? txtMax + 1.6 + (choices.length - 1) * 0.5 : txtMax;
      conts.forEach(g => { if (d(g) + 0.05 < last + (choices.length > 1 ? 0.5 : 0.8)) fx(g, last + (choices.length > 1 ? 0.5 : 0.8)); });
    });
    return n;
  };
})();
