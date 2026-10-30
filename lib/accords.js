/* Dictionnaire des accords.
 *
 * doigte : de la corde grave (6e) à l'aiguë (1re). "x" = étouffée, "0" = à vide.
 * doigts : quel doigt sur quelle corde (1 index, 2 majeur, 3 annulaire, 4 auriculaire),
 *          null quand il n'y a pas de doigt. Affiché seulement en grand format.
 * barre  : numéro de case barrée par l'index, s'il y en a une.
 *
 * Les doigtés sont les positions standard. Les explications ne sont écrites que
 * pour les accords ouverts, ceux qu'on apprend en premier.
 */

export const NOTES_FR = { C: 'Do', D: 'Ré', E: 'Mi', F: 'Fa', G: 'Sol', A: 'La', B: 'Si' };

export const LETTRES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

export const FAMILLES = [
  {
    cle: 'majeur', titre: 'Majeur', suffixe: '', formule: '1 · 3 · 5',
    sens: "l'accord franc, lumineux. Celui qui ouvre et ferme la plupart des morceaux.",
  },
  {
    cle: 'mineur', titre: 'Mineur', suffixe: 'm', formule: '1 · ♭3 · 5',
    sens: "on baisse la 3ᵉ d'un demi-ton : la couleur devient grave, triste.",
  },
  {
    cle: 'sept', titre: '7ᵉ', suffixe: '7', formule: '1 · 3 · 5 · ♭7',
    sens: "majeur plus une note qui gratte : il appelle l'accord suivant.",
  },
  {
    cle: 'm7', titre: 'm7', suffixe: 'm7', formule: '1 · ♭3 · 5 · ♭7',
    sens: 'le mineur adouci. Celui des ballades.',
  },
];

export const ACCORDS = {
  C: {
    doigte: 'x32010', doigts: [null, 3, 2, null, 1, null], famille: 'majeur',
    explication: "L'annulaire sur la 3ᵉ case du la, le majeur sur la 2ᵉ du ré, l'index sur la 1ʳᵉ du si. Le mi grave ne sonne pas.",
    piege: 'Bombe les doigts pour ne pas étouffer les cordes voisines.',
    versions: [
      { titre: 'Classique', doigte: 'x32010', doigts: [null, 3, 2, null, 1, null], quand: 'Celle à travailler d\'abord.', conseillee: true },
      { titre: 'Cadd9', doigte: 'x32030', doigts: [null, 2, 1, null, 3, null], quand: 'Très utilisé en folk, et il enchaîne avec G sans bouger les deux derniers doigts.' },
    ],
  },
  Cm: { doigte: 'x35543', barre: 3, famille: 'mineur' },
  C7: { doigte: 'x32310', doigts: [null, 3, 2, 4, 1, null], famille: 'sept' },
  Cm7: { doigte: 'x35343', barre: 3, famille: 'm7' },

  D: {
    doigte: 'xx0232', doigts: [null, null, null, 1, 3, 2], famille: 'majeur',
    explication: 'Les trois doigts forment un triangle sur les cordes aiguës. On ne joue que quatre cordes.',
    piege: "Attention à ne pas gratter les deux cordes graves : elles sonnent faux sur cet accord.",
  },
  Dm: {
    doigte: 'xx0231', doigts: [null, null, null, 2, 3, 1], famille: 'mineur',
    explication: 'Même triangle que D, mais l\'index descend sur la 1ʳᵉ case du mi aigu.',
  },
  D7: { doigte: 'xx0212', doigts: [null, null, null, 2, 1, 3], famille: 'sept' },
  Dm7: { doigte: 'xx0211', doigts: [null, null, null, 2, 1, 1], famille: 'm7' },

  E: {
    doigte: '022100', doigts: [null, 2, 3, 1, null, null], famille: 'majeur',
    explication: 'Les six cordes sonnent. C\'est l\'accord le plus plein de la guitare.',
  },
  Em: {
    doigte: '022000', doigts: [null, 2, 3, null, null, null], famille: 'mineur',
    explication: 'Deux doigts, six cordes. Le premier accord qu\'on apprend, et le plus utilisé.',
  },
  E7: { doigte: '020100', doigts: [null, 2, null, 1, null, null], famille: 'sept' },
  Em7: { doigte: '020000', doigts: [null, 2, null, null, null, null], famille: 'm7',
    explication: 'Un seul doigt. Si Em te va, celui-là est déjà acquis.' },

  F: {
    doigte: '133211', barre: 1, doigts: [1, 3, 4, 2, 1, 1], famille: 'majeur',
    explication: "L'index barre les six cordes sur la 1ʳᵉ case.",
    piege: "Le premier barré, et le plus dur. Commence par la version allégée ci-dessous.",
    versions: [
      { titre: 'Allégée', doigte: 'xx3211', doigts: [null, null, 3, 2, 1, 1], quand: 'Quatre cordes seulement. Le passage obligé avant le barré.', conseillee: true },
      { titre: 'Barré', doigte: '133211', barre: 1, quand: 'La vraie. Elle viendra avec la force du pouce.' },
    ],
  },
  Fm: { doigte: '133111', barre: 1, famille: 'mineur' },
  F7: { doigte: '131211', barre: 1, famille: 'sept' },
  Fm7: { doigte: '131111', barre: 1, famille: 'm7' },

  G: {
    doigte: '320003', doigts: [2, 1, null, null, null, 3], famille: 'majeur',
    explication: "L'index tient le la, le majeur descend sur le mi grave, l'annulaire va chercher le mi aigu. Les trois cordes du milieu sonnent à vide.",
    piege: "L'annulaire a tendance à étouffer le si. Pouce derrière le manche.",
    versions: [
      { titre: '3 doigts', doigte: '320003', doigts: [2, 1, null, null, null, 3], quand: 'La classique. Celle à travailler d\'abord.', conseillee: true },
      { titre: '4 doigts', doigte: '320033', doigts: [2, 1, null, null, 3, 4], quand: 'Le G « plein ». Sonne plus rond et enchaîne vers C sans lever la main.' },
      { titre: 'Barré · 3ᵉ', doigte: '355433', barre: 3, quand: 'Pour plus tard. Forme déplaçable : elle donne tous les majeurs.' },
    ],
  },
  Gm: { doigte: '355333', barre: 3, famille: 'mineur' },
  G7: { doigte: '320001', doigts: [3, 2, null, null, null, 1], famille: 'sept' },
  Gm7: { doigte: '353333', barre: 3, famille: 'm7' },

  A: {
    doigte: 'x02220', doigts: [null, null, 1, 2, 3, null], famille: 'majeur',
    explication: 'Trois doigts alignés sur la 2ᵉ case. Serre-les, la place est étroite.',
  },
  Am: {
    doigte: 'x02210', doigts: [null, null, 2, 3, 1, null], famille: 'mineur',
    explication: "Index sur la 1ʳᵉ case du si, majeur et annulaire en face sur la 2ᵉ. Forme de E décalée d'une corde : si tu as E, tu as Am.",
    piege: 'Le pouce derrière le manche, pas enroulé, sinon l\'index écrase le mi aigu.',
  },
  A7: { doigte: 'x02020', doigts: [null, null, 2, null, 1, null], famille: 'sept',
    explication: 'Deux doigts. Un A auquel on a retiré un doigt.' },
  Am7: { doigte: 'x02010', doigts: [null, null, 2, null, 1, null], famille: 'm7' },

  B: { doigte: 'x24442', barre: 2, famille: 'majeur' },
  Bm: { doigte: 'x24432', barre: 2, famille: 'mineur',
    piege: 'Barré sur la 2ᵉ case. Souvent le deuxième barré qu\'on apprend, après F.' },
  B7: { doigte: 'x21202', doigts: [null, 2, 1, 3, null, 4], famille: 'sept' },
  Bm7: { doigte: 'x20202', doigts: [null, null, 1, null, 2, null], famille: 'm7' },

  /* Accords croisés dans les morceaux, hors tableau */
  A7sus4: { doigte: 'x02030', doigts: [null, null, 2, null, 3, null], famille: 'autre',
    explication: 'Le « Wonderwall ». Un A7 dont l\'annulaire monte sur la 3ᵉ case du si.' },
  Fmaj7: { doigte: 'xx3210', doigts: [null, null, 3, 2, 1, null], famille: 'autre' },
  G6: { doigte: '320000', doigts: [2, 1, null, null, null, null], famille: 'autre' },
};

/** Nom affiché en français : "G" → "Sol majeur" */
export function nomLong(nom) {
  const a = ACCORDS[nom];
  const lettre = nom[0];
  const base = NOTES_FR[lettre] || lettre;
  const alteration = nom[1] === '#' ? ' dièse' : nom[1] === 'b' ? ' bémol' : '';
  const fam = a && FAMILLES.find((f) => f.cle === a.famille);
  return `${base}${alteration}${fam ? ' ' + fam.titre.toLowerCase() : ''}`;
}

/** Reconnaît un jeton comme nom d'accord : "Em7", "A7sus4", "C/G"… */
const RE_ACCORD = /^[A-G](#|b)?(m|maj|min|dim|aug|sus|add|M)?\d*(sus\d|add\d|maj\d)?(\/[A-G](#|b)?)?$/;

export function estAccord(jeton) {
  return RE_ACCORD.test(jeton) && jeton.length <= 9;
}

/** Une ligne est une ligne d'accords si la majorité de ses jetons en sont. */
export function estLigneAccords(ligne) {
  const jetons = ligne.trim().split(/\s+/).filter(Boolean);
  if (!jetons.length) return false;
  const accords = jetons.filter((j) => estAccord(j.replace(/[·|,]/g, ''))).length;
  return accords / jetons.length >= 0.6;
}

/** Extrait les accords d'une grille collée, dans l'ordre d'apparition. */
export function accordsDuTexte(texte) {
  const vus = [];
  for (const ligne of String(texte).split('\n')) {
    if (!estLigneAccords(ligne)) continue;
    for (const brut of ligne.trim().split(/\s+/)) {
      const j = brut.replace(/[·|,]/g, '');
      if (estAccord(j) && !vus.includes(j)) vus.push(j);
    }
  }
  return vus;
}
