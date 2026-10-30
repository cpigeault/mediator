/* Médiator — aiguillage et démarrage.
 *
 * Chaque écran est un module qui expose :
 *   rendre(...params) → le HTML de l'écran, sous forme de texte
 *   brancher(racine, ...params) → facultatif, pour poser les écouteurs
 *
 * La navigation passe par le fragment d'URL (#/morceau/3). C'est ce qui fait
 * marcher le bouton « retour » d'Android sans une ligne de code.
 */

import * as store from './lib/store.js';
import * as ecranMorceaux from './ecrans/morceaux.js';
import * as ecranFiche from './ecrans/fiche.js';
import * as ecranModeJeu from './ecrans/modejeu.js';
import * as ecranAccord from './ecrans/accord.js';
import * as ecranTableau from './ecrans/tableau.js';
import * as ecranFormulaire from './ecrans/formulaire.js';
import * as ecranGuitare from './ecrans/guitare.js';

const ROUTES = [
  { motif: /^#?\/?$/, ecran: ecranMorceaux, onglet: 'morceaux' },
  { motif: /^#\/morceaux$/, ecran: ecranMorceaux, onglet: 'morceaux' },
  { motif: /^#\/morceau\/(\d+)$/, ecran: ecranFiche },
  { motif: /^#\/jouer\/(\d+)$/, ecran: ecranModeJeu },
  { motif: /^#\/accords$/, ecran: ecranTableau, onglet: 'accords' },
  { motif: /^#\/accord\/(.+)$/, ecran: ecranAccord },
  { motif: /^#\/ajouter$/, ecran: ecranFormulaire },
  { motif: /^#\/modifier\/(\d+)$/, ecran: ecranFormulaire },
  { motif: /^#\/guitare$/, ecran: ecranGuitare, onglet: 'guitare' },
];

const ONGLETS = [
  {
    cle: 'morceaux', lien: '#/morceaux', libelle: 'Morceaux',
    icone: '<rect x="4" y="2.8" width="16" height="18.4" rx="2.4"/><path d="M8 2.8v18.4"/>' +
      '<circle cx="13" cy="16.2" r="1.9"/><path d="M14.9 16.2V9.8l3.1-1.1"/>',
  },
  {
    cle: 'accords', lien: '#/accords', libelle: 'Accords',
    icone: '<path d="M4.5 5.2h15" stroke-width="2.6"/>' +
      '<path d="M8 5.2v14.6M12 5.2v14.6M16 5.2v14.6M4.5 12.6h15"/>' +
      '<circle cx="8" cy="8.9" r="1.9" fill="currentColor" stroke="none"/>' +
      '<circle cx="16" cy="16.3" r="1.9" fill="currentColor" stroke="none"/>',
  },
  {
    cle: 'guitare', lien: '#/guitare', libelle: 'Guitare',
    icone: '<path d="M12 11.4c2.6 0 3.7 1.5 4.4 2.9.6 1.2 1 2.2 1 3.3 0 2.4-2.2 4.1-5.4 4.1' +
      's-5.4-1.7-5.4-4.1c0-1.1.4-2.1 1-3.3.7-1.4 1.8-2.9 4.4-2.9z"/>' +
      '<circle cx="12" cy="16.6" r="1.7"/><path d="M10.4 11.6V6h3.2v5.6"/>' +
      '<rect x="9.2" y="2.2" width="5.6" height="3.8" rx="1.3"/>',
  },
];

const racine = document.getElementById('ecran');
const barre = document.getElementById('barre');

let ecranCourant = null;

function afficher() {
  const chemin = location.hash || '#/morceaux';
  const route = ROUTES.find((r) => r.motif.test(chemin));

  if (!route) {
    location.replace('#/morceaux');
    return;
  }

  // On laisse l'écran précédent ranger ses affaires (oscillateur audio, minuteurs…).
  ecranCourant?.quitter?.();
  ecranCourant = route.ecran;

  const params = (chemin.match(route.motif) || []).slice(1).map(decodeURIComponent);

  // On monte chaque écran dans un conteneur neuf : ses écouteurs disparaissent
  // avec lui. Réécrire le même élément ferait s'empiler les écouteurs à chaque
  // navigation, et un clic finirait par être traité trois fois.
  const vue = document.createElement('div');
  vue.innerHTML = route.ecran.rendre(...params);
  racine.replaceChildren(vue);
  route.ecran.brancher?.(vue, ...params);

  barre.hidden = !route.onglet;
  document.body.classList.toggle('sans-barre', !route.onglet);
  for (const a of barre.children) {
    if (a.dataset.onglet === route.onglet) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  }

  window.scrollTo(0, 0);
}

function construireBarre() {
  barre.innerHTML = ONGLETS.map(
    (o) =>
      `<a href="${o.lien}" data-onglet="${o.cle}">` +
      `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" ` +
      `stroke-width="1.6" stroke-linejoin="round">${o.icone}</svg>${o.libelle}</a>`
  ).join('');
}

async function demarrer() {
  try {
    await store.charger();
  } catch (e) {
    racine.innerHTML =
      '<div class="vide"><strong>Impossible de charger la bibliothèque</strong>' +
      'Vérifie que data/morceaux.json est bien là, et que la page est servie ' +
      'par un serveur (pas ouverte directement depuis le disque).</div>';
    console.error(e);
    return;
  }
  construireBarre();
  window.addEventListener('hashchange', afficher);
  afficher();

  // Le service worker ne marche qu'en http(s) : inutile d'essayer en file://
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch((e) => console.warn('sw :', e));
  }
}

demarrer();
