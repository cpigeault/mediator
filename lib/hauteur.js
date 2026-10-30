/* Détection de la hauteur d'une note, par autocorrélation.
 *
 * Le principe : une corde qui vibre produit un signal qui se répète. On cherche
 * au bout de combien d'échantillons il se ressemble le plus à lui-même — cette
 * durée est la période, et la fréquence en découle.
 *
 * Deux garde-fous importants :
 *
 * 1. On ne cherche la période que dans l'intervalle d'une guitare (ici 70 à
 *    400 Hz). C'est à la fois beaucoup plus rapide — quelques centaines de
 *    décalages au lieu de deux mille — et ça supprime l'erreur d'octave la plus
 *    courante, où l'algorithme répond le double de la bonne fréquence.
 *
 * 2. On compare la fréquence trouvée aux six cordes attendues, et non à toutes
 *    les notes de la gamme. Si on tombe à une octave près, la comparaison le
 *    rattrape.
 */

const FREQ_MIN = 70;
const FREQ_MAX = 400;

/* Les six cordes en accordage standard, de la 6e à la 1re. */
export const CORDES = [
  { rang: '6e', nom: 'Mi', lettre: 'E', freq: 82.41 },
  { rang: '5e', nom: 'La', lettre: 'A', freq: 110.0 },
  { rang: '4e', nom: 'Ré', lettre: 'D', freq: 146.83 },
  { rang: '3e', nom: 'Sol', lettre: 'G', freq: 196.0 },
  { rang: '2e', nom: 'Si', lettre: 'B', freq: 246.94 },
  { rang: '1re', nom: 'Mi', lettre: 'E', freq: 329.63 },
];

/** Écart en cents entre deux fréquences. 100 cents = un demi-ton. */
export const cents = (mesuree, cible) => 1200 * Math.log2(mesuree / cible);

/**
 * @param {Float32Array} signal échantillons entre -1 et 1
 * @param {number} taux fréquence d'échantillonnage, ex. 48000
 * @returns {number} la fréquence en Hz, ou -1 si le signal est trop faible
 */
export function detecterFrequence(signal, taux) {
  const n = signal.length;

  // Volume : sous ce seuil, c'est du silence ou du souffle. On ne devine pas.
  let energie = 0;
  for (let i = 0; i < n; i++) energie += signal[i] * signal[i];
  const rms = Math.sqrt(energie / n);
  if (rms < 0.012) return -1;

  const decalageMin = Math.floor(taux / FREQ_MAX);
  const decalageMax = Math.min(Math.floor(taux / FREQ_MIN), Math.floor(n / 2));
  if (decalageMax <= decalageMin) return -1;

  // Autocorrélation normalisée : on divise par l'énergie de la tranche comparée,
  // sinon les petits décalages sont systématiquement favorisés.
  let meilleur = -1;
  let meilleurScore = 0;
  const scores = new Float32Array(decalageMax + 1);

  for (let d = decalageMin; d <= decalageMax; d++) {
    let produit = 0;
    let energieD = 0;
    for (let i = 0; i < n - d; i++) {
      produit += signal[i] * signal[i + d];
      energieD += signal[i + d] * signal[i + d];
    }
    const score = energieD > 0 ? produit / Math.sqrt(energieD) : 0;
    scores[d] = score;
    if (score > meilleurScore) {
      meilleurScore = score;
      meilleur = d;
    }
  }

  if (meilleur < 0 || meilleurScore <= 0) return -1;

  // Interpolation parabolique : le vrai sommet est entre deux échantillons.
  // Sans ça, la précision plafonne et l'aiguille ne peut pas se centrer.
  let periode = meilleur;
  if (meilleur > decalageMin && meilleur < decalageMax) {
    const g = scores[meilleur - 1];
    const c = scores[meilleur];
    const d = scores[meilleur + 1];
    const courbure = g + d - 2 * c;
    if (courbure !== 0) periode = meilleur - (d - g) / (2 * courbure) / 2;
  }

  return taux / periode;
}

/**
 * Rapproche une fréquence de la corde la plus proche, en tolérant une erreur
 * d'octave. Renvoie l'index de la corde et l'écart en cents.
 */
export function corde(frequence) {
  if (!(frequence > 0)) return null;

  let meilleur = null;
  CORDES.forEach((c, index) => {
    // On teste aussi la moitié et le double : si l'algorithme s'est trompé
    // d'octave, c'est ici qu'on le corrige.
    for (const candidate of [frequence, frequence / 2, frequence * 2]) {
      const ecart = cents(candidate, c.freq);
      if (!meilleur || Math.abs(ecart) < Math.abs(meilleur.ecart)) {
        meilleur = { index, corde: c, ecart, frequence: candidate };
      }
    }
  });

  // Au-delà d'un demi-ton et demi, on n'a probablement pas pincé une corde.
  return Math.abs(meilleur.ecart) > 150 ? null : meilleur;
}

/**
 * Lisse une série de mesures par la médiane : une aiguille qui tremble est
 * inutilisable, et une mesure aberrante isolée ne doit pas la faire sauter.
 */
export function mediane(valeurs) {
  if (!valeurs.length) return null;
  const triees = [...valeurs].sort((a, b) => a - b);
  const milieu = Math.floor(triees.length / 2);
  return triees.length % 2 ? triees[milieu] : (triees[milieu - 1] + triees[milieu]) / 2;
}
