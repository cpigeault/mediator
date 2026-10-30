/* Toutes les données de l'app vivent dans le navigateur (localStorage).
 * Aucun serveur, aucun compte. Au premier lancement on recopie data/morceaux.json,
 * ensuite c'est la copie locale qui fait foi — c'est elle que tu modifies.
 */

const CLE = 'mediator.v1';

let etat = null;

export async function charger() {
  const brut = localStorage.getItem(CLE);
  if (brut) {
    try {
      etat = JSON.parse(brut);
      return etat;
    } catch {
      // Donnée illisible : on repart du fichier de départ plutôt que de planter.
      console.warn('Sauvegarde illisible, réinitialisation.');
    }
  }
  const reponse = await fetch('data/morceaux.json');
  const depart = await reponse.json();
  etat = {
    version: 1,
    morceaux: depart.morceaux.map((m) => ({ grilleTexte: '', tutoUrl: null, rythme: null, notePerso: '', ...m })),
    reglages: { diapason: 440, taillePartition: 12 },
  };
  sauver();
  return etat;
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
  const m = {
    id, titre: '', artiste: '', accords: [], capo: 0, maitrise: null,
    grilleTexte: '', tutoUrl: null, rythme: null, notePerso: '',
    ...donnees,
  };
  etat.morceaux.push(m);
  sauver();
  return m;
}

export function supprimerMorceau(id) {
  etat.morceaux = etat.morceaux.filter((m) => m.id !== Number(id));
  sauver();
}

/** Un morceau est complet quand il a une grille ET un niveau. Règle de la maquette. */
export const estComplet = (m) => Boolean(m.grilleTexte?.trim() || m.accords?.length) && m.maitrise != null;

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
