/* Écran 02 — Fiche d'un morceau.
 * Ordre fixe, identique aux trois niveaux : accords, rythme, tuto, puis jouer. */

import * as store from '../lib/store.js';
import { ACCORDS } from '../lib/accords.js';
import { diagramme } from '../lib/diagramme.js';
import { transposerAccord, signe } from '../lib/transposition.js';
import { echappe, etoiles, fleches, signature, CHEVRON_GAUCHE } from '../lib/ui.js';

const NIVEAUX = [
  { n: 1, libelle: 'Je déchiffre' },
  { n: 2, libelle: "J'apprends" },
  { n: 3, libelle: 'Je maîtrise' },
];

export function rendre(id) {
  const m = store.morceau(id);
  if (!m) return introuvable();

  return `
    <a class="retour" href="#/morceaux">${CHEVRON_GAUCHE} Mes morceaux</a>

    <h1 class="titre-morceau">${echappe(m.titre)}</h1>
    <div class="sous-titre">${echappe(m.artiste)}</div>

    <div class="etiquettes">
      ${m.capo ? `<span class="etiquette">Capo · ${m.capo}</span>` : ''}
      ${m.accords?.length ? `<span class="etiquette">${m.accords.length} accords</span>` : ''}
      ${m.transposition ? `<span class="etiquette transposee">Transposé ${signe(m.transposition)}</span>` : ''}
      <span class="etiquette">${m.maitrise ? NIVEAUX[m.maitrise - 1].libelle : 'Pas encore noté'}</span>
    </div>

    <div class="niveaux" role="group" aria-label="Où j'en suis">
      ${NIVEAUX.map(
        (v) =>
          `<button type="button" data-niveau="${v.n}" aria-pressed="${m.maitrise === v.n}">` +
          `<u>Niveau ${v.n}</u>${v.libelle}</button>`
      ).join('')}
    </div>

    ${sectionAccords(m)}
    ${sectionRythme(m)}
    ${sectionTuto(m)}
    ${sectionNote(m)}

    ${m.grilleTexte?.trim()
      ? `<a class="bouton-principal" href="#/jouer/${m.id}">Jouer les paroles</a>`
      : `<a class="bouton-principal" href="#/modifier/${m.id}">Coller la grille</a>`}
    <a class="bouton-fantome" href="#/modifier/${m.id}">Modifier ce morceau</a>
  `;
}

function sectionAccords(m) {
  // Si le morceau est transposé, on montre les accords tels qu'on va les jouer,
  // pas tels qu'ils sont écrits dans la grille.
  const accords = (m.accords || []).map((a) =>
    m.transposition ? transposerAccord(a, m.transposition) : a
  );
  if (!accords.length) {
    return `
      <div class="inter-titre"><span>1 — Les accords</span></div>
      <div class="vide">
        <strong>Grille pas encore collée</strong>
        Les accords apparaîtront ici dès que tu auras collé la grille du morceau.
      </div>`;
  }
  return `
    <div class="inter-titre">
      <span>1 — Les accords</span>
      <a href="#/accords">Tout voir</a>
    </div>
    <div class="bande-accords">
      ${accords.slice(0, 4).map(carteAccord).join('')}
    </div>
    ${accords.length > 4
      ? `<p class="aide">+ ${accords.length - 4} autre${accords.length > 5 ? 's' : ''} : ` +
        `${echappe(accords.slice(4).join(' · '))}</p>`
      : ''}`;
}

function carteAccord(nom) {
  const a = ACCORDS[nom];
  const dessin = a ? diagramme(a.doigte, { barre: a.barre ?? null }) : '';
  return `
    <a class="carte-accord" href="#/accord/${encodeURIComponent(nom)}">
      <span class="nom">${echappe(nom)}</span>
      ${dessin || '<span class="aide">doigté<br>à venir</span>'}
    </a>`;
}

function sectionRythme(m) {
  if (!m.rythme) {
    return `
      <div class="inter-titre"><span>2 — Le rythme</span></div>
      <div class="vide">
        <strong>Rythme pas encore noté</strong>
        Regarde le tuto ci-dessous, puis note-le.
      </div>`;
  }
  return `
    <div class="inter-titre"><span>2 — Le rythme</span><span>${signature(m.rythme)}</span></div>
    ${fleches(m.rythme)}`;
}

/* Le tuto n'est pas un lien stocké mais une recherche calculée : elle ne peut
 * pas pourrir, et elle renvoie les meilleurs tutos du jour. Quand un lien a été
 * épinglé à la main, c'est lui qui s'ouvre. */
function sectionTuto(m) {
  const { url, epingle } = store.lienTuto(m);
  return `
    <div class="inter-titre"><span>3 — Si le rythme résiste</span></div>
    <a class="tuto" href="${echappe(url)}" target="_blank" rel="noopener">
      <span class="vignette"><i></i></span>
      <span class="txt">
        <b>${epingle ? 'Ton tuto' : 'Chercher un tuto'}</b>
        <span>${epingle ? 'La vidéo que tu as épinglée' : `« ${echappe(m.titre)} tuto guitare » sur YouTube`}</span>
      </span>
    </a>`;
}

function sectionNote(m) {
  if (!m.notePerso?.trim()) return '';
  return `
    <div class="inter-titre"><span>Ma note</span></div>
    <div class="bloc"><p>${echappe(m.notePerso)}</p></div>`;
}

function introuvable() {
  return `<a class="retour" href="#/morceaux">${CHEVRON_GAUCHE} Mes morceaux</a>
    <div class="vide"><strong>Morceau introuvable</strong>Il a peut-être été supprimé.</div>`;
}

export function brancher(vue, id) {
  // Un seul écouteur, délégué : il survit aux réaffichages du contenu.
  vue.addEventListener('click', (e) => {
    const b = e.target.closest('[data-niveau]');
    if (!b) return;
    const niveau = Number(b.dataset.niveau);
    const actuel = store.morceau(id).maitrise;
    store.majMorceau(id, { maitrise: actuel === niveau ? null : niveau });
    vue.innerHTML = rendre(id);
  });
}
