/* Écran 03 — Mode jeu. Pas de tempo, pas de défilement automatique :
 * on fait défiler au doigt. Deux sorties, la flèche et le glissement vers le bas. */

import * as store from '../lib/store.js';
import { estLigneAccords } from '../lib/accords.js';
import { transposer, signe } from '../lib/transposition.js';
import { echappe, CHEVRON_GAUCHE } from '../lib/ui.js';

const TAILLES = [11, 12.5, 14, 16];

export function rendre(id) {
  const m = store.morceau(id);
  if (!m) return `<div class="vide"><strong>Morceau introuvable</strong></div>`;

  const taille = store.reglages().taillePartition || 12.5;
  const t = m.transposition || 0;

  return `
    <div class="haut-jeu">
      <a class="bouton-retour" href="#/morceau/${m.id}" aria-label="Retour à la fiche">
        ${CHEVRON_GAUCHE}
      </a>
      <h1>${echappe(m.titre)}</h1>
    </div>

    <div class="reglages-jeu">
      ${m.capo ? `<button type="button" class="actif" disabled>Capo ${m.capo}</button>` : ''}
      <button type="button" data-ton="-1" aria-label="Un demi-ton plus bas">−½ ton</button>
      <button type="button" data-ton="1" aria-label="Un demi-ton plus haut">+½ ton</button>
      ${t ? `<button type="button" data-ton="0" class="actif">Transposé ${signe(t)} ✕</button>` : ''}
      <button type="button" data-taille="-1" aria-label="Réduire le texte">A−</button>
      <button type="button" data-taille="1" aria-label="Agrandir le texte">A+</button>
    </div>

    <div class="partition" id="partition" style="font-size:${taille}px">
      ${partition(m)}
    </div>
  `;
}

function partition(m) {
  const brut = m.grilleTexte?.trim();
  if (!brut) {
    return `<div class="vide" style="margin-top:10px">
      <strong>Pas encore de grille</strong>
      Colle les paroles et les accords, ils s'afficheront ici.
      <a class="bouton-fantome" href="#/modifier/${m.id}">Coller la grille</a>
    </div>`;
  }

  const texte = transposer(brut, m.transposition || 0, estLigneAccords);

  return texte
    .split('\n')
    .map((ligne) => {
      if (/^\s*[[(].+[\])]\s*$/.test(ligne)) {
        return `<span class="l section">${echappe(ligne.trim())}</span>`;
      }
      const classe = estLigneAccords(ligne) ? 'l accords' : 'l';
      return `<span class="${classe}">${echappe(ligne) || ' '}</span>`;
    })
    .join('');
}

export function brancher(vue, id) {
  vue.addEventListener('click', (e) => {
    const t = e.target.closest('[data-taille]');
    if (t) {
      const sens = Number(t.dataset.taille);
      const actuelle = store.reglages().taillePartition || 12.5;
      const i = TAILLES.findIndex((v) => v >= actuelle);
      const suivante = TAILLES[Math.min(TAILLES.length - 1, Math.max(0, (i < 0 ? 1 : i) + sens))];
      store.majReglages({ taillePartition: suivante });
      vue.querySelector('#partition').style.fontSize = `${suivante}px`;
      return;
    }

    const ton = e.target.closest('[data-ton]');
    if (ton) {
      const pas = Number(ton.dataset.ton);
      const actuel = store.morceau(id).transposition || 0;
      // pas = 0 : le bouton « Transposé +2 ✕ » remet la grille d'origine.
      // Au-delà de ±6 demi-tons, on revient au même endroit par l'autre côté.
      const vise = pas === 0 ? 0 : Math.max(-6, Math.min(6, actuel + pas));
      store.majMorceau(id, { transposition: vise });
      vue.innerHTML = rendre(id);
      return;
    }
  });

  // Glisser vers le bas depuis le haut de la page ramène à la fiche.
  let depart = null;
  vue.addEventListener('touchstart', (e) => {
    depart = window.scrollY <= 0 ? e.touches[0].clientY : null;
  }, { passive: true });
  vue.addEventListener('touchend', (e) => {
    if (depart == null) return;
    const delta = e.changedTouches[0].clientY - depart;
    depart = null;
    if (delta > 110) location.hash = `#/morceau/${id}`;
  });
}
