/* Toutes les données de l'app vivent dans le navigateur (localStorage).
 * Aucun serveur, aucun compte. Au premier lancement on recopie data/morceaux.json,
 * ensuite c'est la copie locale qui fait foi — c'est elle que tu modifies.
 */

const CLE = 'mediator.v1';

/* À incrémenter quand data/morceaux.json gagne des informations qu'il faut
 * faire descendre dans les bibliothèques déjà installées. Voir fusionner(). */
const VERSION_DONNEES = 2;

const CHAMPS_PAR_DEFAUT = {
  accords: [], capo: 0, maitrise: null,
  grilleTexte: '', tutoUrl: null, rythme: null, notePerso: '', transposition: 0,
};

let etat = null;

export async function charger() {
  const brut = localStorage.getItem(CLE);

  if (brut) {
    try {
      etat = JSON.parse(brut);
      if ((etat.version || 1) < VERSION_DONNEES) {
        await fusionner();
        etat.version = VERSION_DONNEES;
      }
      normaliser();
      sauver();
      return etat;
    } catch {
      // Donnée illisible : on repart du fichier de départ plutôt que de planter.
      console.warn('Sauvegarde illisible, réinitialisation.');
    }
  }

  const depart = await lireDepart();
  etat = {
    version: VERSION_DONNEES,
    morceaux: depart.morceaux.map((m) => ({ ...CHAMPS_PAR_DEFAUT, ...m })),
    reglages: { diapason: 440, taillePartition: 12.5 },
  };
  sauver();
  return etat;
}

async function lireDepart() {
  const reponse = await fetch('data/morceaux.json');
  if (!reponse.ok) throw new Error(`data/morceaux.json : ${reponse.status}`);
  return reponse.json();
}

/* Fait descendre les nouveautés du fichier de départ dans une bibliothèque déjà
 * installée, SANS jamais écraser ce que tu as saisi : on ne remplit que les
 * champs restés vides. Un rythme que tu as corrigé à la main reste le tien. */
async function fusionner() {
  const depart = await lireDepart();
  const parId = new Map(etat.morceaux.map((m) => [m.id, m]));

  for (const neuf of depart.morceaux) {
    const local = parId.get(neuf.id);
    if (!local) {
      etat.morceaux.push({ ...CHAMPS_PAR_DEFAUT, ...neuf });
      continue;
    }
    if (!local.rythme && neuf.rythme) local.rythme = neuf.rythme;
    if (!local.accords?.length && neuf.accords?.length) local.accords = neuf.accords;
    if (!local.tutoUrl && neuf.tutoUrl) local.tutoUrl = neuf.tutoUrl;
  }
}

/** Garantit que chaque morceau a tous les champs attendus par le code. */
function normaliser() {
  etat.reglages = { diapason: 440, taillePartition: 12.5, ...etat.reglages };
  etat.morceaux = etat.morceaux.map((m) => ({ ...CHAMPS_PAR_DEFAUT, ...m }));
}

function sauver() {
  localStorage.setItem(CLE, JSON.stringify(etat));
}

export const morceaux = () => etat.morceaux;
export const reglages = () => etat.reglages;

export const morceau = (id) => etat.morceaux.find((m) => m.id === Number(id));

export function majMorceau(id, modifs) {
  const m = morceau(id);
  if (!m) return null;
  Object.assign(m, modifs);
  sauver();
  return m;
}

export function majReglages(modifs) {
  Object.assign(etat.reglages, modifs);
  sauver();
}

export function ajouterMorceau(donnees) {
  const id = etat.morceaux.reduce((max, m) => Math.max(max, m.id), 0) + 1;
  const m = { ...CHAMPS_PAR_DEFAUT, id, titre: '', artiste: '', ...donnees };
  etat.morceaux.push(m);
  sauver();
  return m;
}

export function supprimerMorceau(id) {
  etat.morceaux = etat.morceaux.filter((m) => m.id !== Number(id));
  sauver();
}

/** Un morceau est complet quand il a une grille ET un niveau. Règle de la maquette. */
export const estComplet = (m) =>
  Boolean(m.grilleTexte?.trim() || m.accords?.length) && m.maitrise != null;

/* Le lien du tuto n'est pas stocké par défaut : on calcule une recherche
 * YouTube depuis le titre. Un lien enregistré à la main a la priorité — c'est
 * la vidéo que tu as choisie, elle ne doit pas être remplacée par une recherche. */
export function lienTuto(m) {
  if (m.tutoUrl) return { url: m.tutoUrl, epingle: true };
  const requete = encodeURIComponent(`${m.titre} ${m.artiste} tuto guitare`.trim());
  return { url: `https://www.youtube.com/results?search_query=${requete}`, epingle: false };
}

/** Tous les accords utilisés par la bibliothèque, pour allumer le tableau. */
export function accordsUtilises() {
  const set = new Set();
  for (const m of etat.morceaux) for (const a of m.accords || []) set.add(a);
  return set;
}

export function morceauxAvecAccord(nom) {
  return etat.morceaux.filter((m) => (m.accords || []).includes(nom));
}

/** Tri alphabétique français, insensible aux accents et à la casse. */
const collateur = new Intl.Collator('fr', { sensitivity: 'base' });
export const parTitre = (a, b) => collateur.compare(a.titre, b.titre);

export function reinitialiser() {
  localStorage.removeItem(CLE);
}
