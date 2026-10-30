/* Transposition d'une grille d'accords.
 *
 * Le travail délicat n'est pas de changer les noms d'accords — c'est de garder
 * l'alignement. Les accords sont posés au-dessus de la syllabe exacte où on les
 * joue ; si « G » devient « G# », la ligne s'allonge d'un caractère et tout ce
 * qui suit se décale. On réécrit donc chaque ligne en replaçant chaque accord à
 * sa colonne d'origine.
 */

import { estAccord } from './accords.js';

const DIESES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const BEMOLS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

function indexNote(nom) {
  const i = DIESES.indexOf(nom);
  return i >= 0 ? i : BEMOLS.indexOf(nom);
}

/** 'Em7' + 1 demi-ton → 'Fm7'. 'C/G' transpose aussi la basse. */
export function transposerAccord(accord, demiTons) {
  const m = /^([A-G](?:#|b)?)(.*)$/.exec(accord);
  if (!m) return accord;

  const [, fondamentale, reste] = m;
  const depart = indexNote(fondamentale);
  if (depart < 0) return accord;

  // On garde l'écriture d'origine : une grille en bémols reste en bémols.
  const echelle = fondamentale.includes('b') ? BEMOLS : DIESES;
  const arrivee = echelle[(((depart + demiTons) % 12) + 12) % 12];

  // La basse après la barre oblique suit le même décalage.
  const suite = reste.replace(/\/([A-G](?:#|b)?)/, (_, basse) => {
    const i = indexNote(basse);
    if (i < 0) return `/${basse}`;
    const ech = basse.includes('b') ? BEMOLS : DIESES;
    return `/${ech[(((i + demiTons) % 12) + 12) % 12]}`;
  });

  return arrivee + suite;
}

/** Réécrit une ligne d'accords en conservant les colonnes. */
export function transposerLigne(ligne, demiTons) {
  if (!demiTons) return ligne;

  const jetons = [];
  const re = /\S+/g;
  let m;
  while ((m = re.exec(ligne)) !== null) jetons.push({ texte: m[0], debut: m.index });

  let sortie = '';
  let curseur = 0;
  for (const j of jetons) {
    const nouveau = estAccord(j.texte) ? transposerAccord(j.texte, demiTons) : j.texte;
    // On ne recule jamais : si un accord s'allonge, il pousse le suivant du
    // strict minimum. Sinon l'accord reprend exactement sa colonne de départ.
    const debut = Math.max(j.debut, curseur);
    sortie += ' '.repeat(debut - curseur) + nouveau;
    curseur = debut + nouveau.length;
  }
  return sortie;
}

/** Transpose une grille entière. Les lignes de paroles ne sont pas touchées. */
export function transposer(texte, demiTons, estLigneAccords) {
  if (!demiTons) return texte;
  return String(texte)
    .split('\n')
    .map((ligne) => (estLigneAccords(ligne) ? transposerLigne(ligne, demiTons) : ligne))
    .join('\n');
}

/** Pour l'affichage : « +2 » ou « −3 ». */
export function signe(demiTons) {
  if (!demiTons) return '';
  return (demiTons > 0 ? '+' : '−') + Math.abs(demiTons);
}
