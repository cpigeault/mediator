/* Écran 01 — Mes morceaux. Tri alphabétique, recherche, filtre par niveau. */

import * as store from '../lib/store.js';
import { echappe, etoiles, LOUPE } from '../lib/ui.js';

const FILTRES = [
  { cle: 'tous', libelle: 'Tous' },
  { cle: '1', libelle: 'Je déchiffre' },
  { cle: '2', libelle: "J'apprends" },
  { cle: '3', libelle: 'Je maîtrise' },
];

// Conservés d'une visite à l'autre : on revient d'une fiche là où on était.
let filtre = 'tous';
let recherche = '';

export function rendre() {
  const total = store.morceaux().length;
  return `
    <div class="titre-ecran">
      <h1>Mes morceaux</h1>
      <span class="meta">${total} titres · A→Z</span>
    </div>

    <label class="champ-recherche">
      ${LOUPE}
      <input id="recherche" type="search" value="${echappe(recherche)}"
             placeholder="Un titre, un artiste, un accord…" autocomplete="off">
    </label>

    <div id="avancement">${avancement()}</div>

    <div class="chips" id="filtres" role="group" aria-label="Filtrer par niveau">
      ${FILTRES.map(
        (f) =>
          `<button type="button" class="chip" data-filtre="${f.cle}" ` +
          `aria-pressed="${f.cle === filtre}">${f.libelle}</button>`
      ).join('')}
    </div>

    <div id="liste">${liste()}</div>

    <a class="ajouter-flottant" href="#/ajouter" aria-label="Ajouter un morceau">+</a>
  `;
}

function avancement() {
  const tous = store.morceaux();
  const complets = tous.filter(store.estComplet).length;
  if (!tous.length || complets === tous.length) return '';
  const part = Math.round((complets / tous.length) * 100);
  return `
    <button type="button" class="avancement" data-filtre="incomplets">
      <span class="txt">
        <b>Complète tes morceaux</b>
        <span>${complets} sur ${tous.length}</span>
        <span class="jauge"><i style="width:${part}%"></i></span>
      </span>
      <span class="fleche" aria-hidden="true">▸</span>
    </button>`;
}

function filtrer() {
  const q = recherche.trim().toLowerCase();
  return store
    .morceaux()
    .filter((m) => {
      if (filtre === 'incomplets' && store.estComplet(m)) return false;
      if (filtre !== 'tous' && filtre !== 'incomplets' && String(m.maitrise) !== filtre) return false;
      if (!q) return true;
      const foin = [m.titre, m.artiste, ...(m.accords || [])].join(' ').toLowerCase();
      return foin.includes(q);
    })
    .sort(store.parTitre);
}

function liste() {
  const trouves = filtrer();
  if (!trouves.length) {
    const raison = recherche
      ? 'Aucun morceau ne correspond à cette recherche.'
      : filtre === 'incomplets'
        ? 'Tous tes morceaux sont complets.'
        : 'Aucun morceau à ce niveau.';
    return `<div class="vide" style="margin-top:18px"><strong>Rien ici</strong>${raison}</div>`;
  }
  return trouves.map(ligne).join('');
}

function ligne(m) {
  const accords = (m.accords || []).join(' · ');
  const grille = accords
    ? `<div class="grille">${echappe(accords)}</div>`
    : '<div class="grille manque">grille à coller</div>';
  const capo = m.capo ? ` · capo ${m.capo}` : '';
  return `
    <div class="ligne">
      <button type="button" class="corps" data-ouvrir="${m.id}">
        <div class="titre">${echappe(m.titre)}</div>
        <div class="artiste">${echappe(m.artiste)}${capo}</div>
        ${grille}
      </button>
      ${etoiles(m.maitrise, { idMorceau: m.id })}
    </div>`;
}

export function brancher(racine) {
  const champ = racine.querySelector('#recherche');
  champ.addEventListener('input', () => {
    recherche = champ.value;
    racine.querySelector('#liste').innerHTML = liste();
  });

  racine.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-filtre]');
    if (chip) {
      filtre = chip.dataset.filtre;
      for (const b of racine.querySelectorAll('[data-filtre]')) {
        b.setAttribute('aria-pressed', String(b.dataset.filtre === filtre));
      }
      racine.querySelector('#liste').innerHTML = liste();
      return;
    }

    const ouvrir = e.target.closest('[data-ouvrir]');
    if (ouvrir) {
      location.hash = `#/morceau/${ouvrir.dataset.ouvrir}`;
      return;
    }

    const noter = e.target.closest('[data-noter]');
    if (noter) {
      const id = Number(noter.dataset.noter);
      const niveau = Number(noter.dataset.niveau);
      const actuel = store.morceau(id).maitrise;
      // Retaper l'étoile courante efface la note : on peut se tromper.
      store.majMorceau(id, { maitrise: actuel === niveau ? null : niveau });
      racine.querySelector('#liste').innerHTML = liste();
      racine.querySelector('#avancement').innerHTML = avancement();
    }
  });
}
