/* Petits outils de rendu. Les écrans renvoient du HTML sous forme de texte ;
 * tout ce qui vient des données passe par echappe() pour qu'un titre contenant
 * une apostrophe ou un chevron ne casse pas la page.
 */

export function echappe(valeur) {
  return String(valeur ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Trois étoiles imparfaites. niveau : 1, 2, 3 ou null. */
const TRACES = [
  'M12.4 1.9 15.3 8.6 22.3 9.3 16.9 14.1 18.6 21.3 12.1 17.6 5.6 21.1 7.1 13.9 1.7 9.1 8.8 8.7Z',
  'M11.8 2.4 14.6 8.9 21.9 9.0 16.3 13.7 18.3 20.9 11.7 17.1 5.2 21.4 6.6 14.2 2.1 9.5 8.4 8.4Z',
  'M12.1 2.0 15.0 8.4 21.6 9.6 16.6 13.9 18.1 21.5 12.3 17.3 5.5 20.8 7.3 13.6 1.9 9.4 8.6 8.9Z',
];

export function etoiles(niveau, options = {}) {
  const { idMorceau = null, grande = false } = options;
  const libelles = ['Je déchiffre', "J'apprends", 'Je maîtrise'];
  const boutons = TRACES.map((trace, i) => {
    const pleine = niveau != null && i < niveau ? ' pleine' : '';
    const attrs = idMorceau != null
      ? `data-noter="${idMorceau}" data-niveau="${i + 1}" aria-label="${libelles[i]}"`
      : 'tabindex="-1" aria-hidden="true"';
    return `<button type="button" class="etoile${pleine}" ${attrs}>` +
      `<svg viewBox="0 0 24 24"><path d="${trace}"/></svg></button>`;
  }).join('');
  return `<span class="etoiles${grande ? ' grande' : ''}">${boutons}</span>`;
}

export const CHEVRON_GAUCHE =
  '<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M9.5 3.5 5 8l4.5 4.5"/></svg>';

export const LOUPE =
  '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="7" cy="7" r="4.4"/><path d="M10.3 10.3 14 14"/></svg>';

/* Rend les flèches du rythme.
 * Format : une paire par temps, séparées par un espace. D/d = vers le bas,
 * U/u = vers le haut. Majuscule = la main touche les cordes, minuscule = elle
 * continue son mouvement à vide.
 *   "Du DU dU DU"  → 4 temps, le gratté folk classique
 *   "Du du du"     → 3 temps, une valse
 * Trois ou quatre temps : il y a de vraies valses dans la bibliothèque. */
export function fleches(rythme) {
  const temps = String(rythme || '').trim().split(/\s+/).filter(Boolean);
  if (temps.length < 2 || temps.length > 4) return '';

  const cases = temps
    .map((paire, i) => {
      const signes = paire
        .split('')
        .slice(0, 2)
        .map((c) => {
          const versLeBas = c.toLowerCase() === 'd';
          const joue = c === c.toUpperCase();
          const classe = ['fl', joue ? '' : 'vide'].filter(Boolean).join(' ');
          return `<i class="${classe}">${versLeBas ? '↓' : '↑'}</i>`;
        })
        .join('');
      return `<div class="temps"><span class="num">${i + 1}</span>` +
        `<span class="paire">${signes}</span></div>`;
    })
    .join('');

  return `<div class="rythme" style="grid-template-columns:repeat(${temps.length},1fr)">${cases}</div>`;
}

/** « 4 temps » ou « 3 temps », déduit du rythme. */
export function signature(rythme) {
  const n = String(rythme || '').trim().split(/\s+/).filter(Boolean).length;
  return n >= 2 && n <= 4 ? `${n} temps` : '';
}
