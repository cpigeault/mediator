/* Génère un diagramme d'accord en SVG à partir d'un doigté.
 *
 *   diagramme("x02210")                       → La mineur, petit format
 *   diagramme("320003", { taille:"grand", doigts:[2,1,0,0,0,3] })
 *
 * Le doigté se lit de la corde grave (6e, Mi) à l'aiguë (1re, Mi) :
 *   "x" = corde étouffée, "0" = corde à vide, "3" = 3e case.
 *
 * Tout est dessiné en entier dans le SVG retourné : pas de <use>, pas de bloc
 * partagé. C'est volontaire — une grille partagée via <use> n'est pas atteinte
 * par le CSS, et les diagrammes s'affichaient sans leurs cordes.
 */

const GEO = {
  petit: {
    larg: 54, haut: 64,
    cordes: [7, 15, 23, 31, 39, 47],
    y0: 14, cases: [28, 42, 56],
    marque: 7, rPoint: 3.6, rOuvert: 2.6, hSillet: 3.2, police: 0,
  },
  grand: {
    larg: 104, haut: 124,
    cordes: [16, 31, 46, 61, 76, 90],
    y0: 35, cases: [60, 87, 114],
    marque: 21, rPoint: 8, rOuvert: 4.5, hSillet: 5, police: 9,
  },
};

/** "x02210" ou [null,0,2,2,1,0] → [null,0,2,2,1,0] */
export function lireDoigte(doigte) {
  if (Array.isArray(doigte)) return doigte.slice(0, 6);
  return String(doigte)
    .replace(/\s/g, '')
    .split('')
    .slice(0, 6)
    .map((c) => (c === 'x' || c === 'X' ? null : Number(c)));
}

export function diagramme(doigte, options = {}) {
  const { taille = 'petit', doigts = null, barre = null } = options;
  const g = GEO[taille] || GEO.petit;
  const cordes = lireDoigte(doigte);
  if (cordes.length < 6) return '';

  const pressees = cordes.filter((f) => typeof f === 'number' && f > 0);
  const min = pressees.length ? Math.min(...pressees) : 1;
  const max = pressees.length ? Math.max(...pressees) : 0;

  // On montre le sillet tant que l'accord tient dans les trois premières cases.
  const avecSillet = max <= 3;
  const depart = avecSillet ? 1 : min;

  // Centre vertical de chaque case affichée.
  const bornes = [g.y0, ...g.cases];
  const centre = (rang) => (bornes[rang] + bornes[rang + 1]) / 2;

  const out = [];
  out.push(
    `<svg class="diagramme" viewBox="0 0 ${g.larg} ${g.haut}" role="img" aria-label="${aria(doigte, cordes)}">`
  );

  // Sillet, ou simple trait quand le diagramme commence plus haut sur le manche.
  if (avecSillet) {
    const x = g.cordes[0];
    const l = g.cordes[5] - g.cordes[0];
    out.push(`<rect class="dg-sillet" x="${x - 1}" y="${g.y0 - g.hSillet}" width="${l + 2}" height="${g.hSillet}"/>`);
  } else {
    out.push(trait(g.cordes[0] - 1, g.y0, g.cordes[5] + 1, g.y0, 'dg-case'));
    out.push(
      `<text class="dg-pos" x="${taille === 'grand' ? 2 : 0}" y="${centre(0) + 3}">${depart}</text>`
    );
  }

  // Barrettes.
  for (const y of g.cases) {
    out.push(trait(g.cordes[0] - 1, y, g.cordes[5] + 1, y, 'dg-case'));
  }
  // Cordes.
  for (const x of g.cordes) {
    out.push(trait(x, g.y0, x, g.cases[g.cases.length - 1], 'dg-corde'));
  }

  // Barré éventuel.
  if (barre != null) {
    const rang = barre - depart;
    if (rang >= 0 && rang < g.cases.length) {
      const y = centre(rang);
      const h = g.rPoint * 1.7;
      out.push(
        `<rect class="dg-barre" x="${g.cordes[0] - g.rPoint}" y="${y - h / 2}" ` +
          `width="${g.cordes[5] - g.cordes[0] + g.rPoint * 2}" height="${h}" rx="${h / 2}"/>`
      );
    }
  }

  cordes.forEach((frette, i) => {
    const x = g.cordes[i];

    if (frette === null) {
      // Croix : corde qu'on ne fait pas sonner.
      const r = g.rOuvert;
      out.push(
        `<path class="dg-muet" d="M${x - r} ${g.marque - r}L${x + r} ${g.marque + r}` +
          `M${x + r} ${g.marque - r}L${x - r} ${g.marque + r}"/>`
      );
      return;
    }
    if (frette === 0) {
      out.push(`<circle class="dg-ouvert" cx="${x}" cy="${g.marque}" r="${g.rOuvert}"/>`);
      return;
    }

    const rang = frette - depart;
    if (rang < 0 || rang >= g.cases.length) return;
    const y = centre(rang);
    const surBarre = barre != null && frette === barre;
    if (!surBarre) {
      out.push(`<circle class="dg-point" cx="${x}" cy="${y}" r="${g.rPoint}"/>`);
    }
    if (g.police && doigts && doigts[i]) {
      out.push(
        `<text class="dg-num" x="${x}" y="${y + g.police * 0.38}" text-anchor="middle">${doigts[i]}</text>`
      );
    }
  });

  out.push('</svg>');
  return out.join('');
}

function trait(x1, y1, x2, y2, classe) {
  return `<line class="${classe}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
}

function aria(doigte, cordes) {
  const noms = ['6e', '5e', '4e', '3e', '2e', '1re'];
  const parts = cordes.map((f, i) =>
    f === null ? `${noms[i]} étouffée` : f === 0 ? `${noms[i]} à vide` : `${noms[i]} case ${f}`
  );
  return `Doigté ${doigte} : ${parts.join(', ')}`;
}
