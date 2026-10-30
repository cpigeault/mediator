/* Écran 04 — Détail d'un accord : le grand diagramme, les pièges,
 * les autres façons de le faire, et les morceaux qui l'utilisent. */

import * as store from '../lib/store.js';
import { ACCORDS, nomLong } from '../lib/accords.js';
import { diagramme } from '../lib/diagramme.js';
import { echappe, etoiles, CHEVRON_GAUCHE } from '../lib/ui.js';

export function rendre(nom) {
  const a = ACCORDS[nom];
  if (!a) {
    return `<a class="retour" href="#/accords">${CHEVRON_GAUCHE} Les accords</a>
      <h1 class="titre-morceau">${echappe(nom)}</h1>
      <div class="vide" style="margin-top:14px">
        <strong>Doigté pas encore enregistré</strong>
        Cet accord est utilisé par tes morceaux mais n'est pas dans le dictionnaire.
      </div>
      ${listeMorceaux(nom)}`;
  }

  const principale = a.versions?.find((v) => v.conseillee) || a;
  const nbDoigts = compterDoigts(principale.doigte);

  return `
    <a class="retour" href="#/accords">${CHEVRON_GAUCHE} Les accords</a>

    <h1 class="titre-morceau">${echappe(nom)}</h1>
    <div class="sous-titre">${nomLong(nom)}${a.barre ? ' · barré' : ` · ${nbDoigts} doigts`}</div>

    <div class="accord-grand">
      ${diagramme(principale.doigte, {
        taille: 'grand',
        doigts: principale.doigts || null,
        barre: principale.barre ?? a.barre ?? null,
      })}
      <div class="texte">${echappe(a.explication || 'Pose les doigts comme sur le dessin.')}</div>
    </div>

    <dl class="fiches">
      ${a.piege ? `<div><dt>Piège</dt><dd>${echappe(a.piege)}</dd></div>` : ''}
    </dl>

    ${sectionVersions(a)}
    ${listeMorceaux(nom)}
  `;
}

function sectionVersions(a) {
  if (!a.versions || a.versions.length < 2) return '';
  const conseillee = a.versions.find((v) => v.conseillee);
  return `
    <div class="inter-titre"><span>Les autres façons de le faire</span></div>
    <div class="versions">
      ${a.versions
        .map(
          (v) => `
        <div class="version">
          <div class="nom">${echappe(v.titre)}</div>
          ${diagramme(v.doigte, { barre: v.barre ?? null })}
          <div class="quand">${echappe(v.quand || '')}</div>
        </div>`
        )
        .join('')}
    </div>
    ${conseillee
      ? `<div class="bloc" style="margin-top:10px"><p>
          <b style="color:var(--acc)">Celle à travailler d'abord :</b>
          ${echappe(conseillee.titre.toLowerCase())}. Les autres viendront quand tes
          enchaînements seront propres.</p></div>`
      : ''}`;
}

function listeMorceaux(nom) {
  const trouves = store.morceauxAvecAccord(nom).sort(store.parTitre);
  if (!trouves.length) {
    return `
      <div class="inter-titre"><span>Tes morceaux qui l'utilisent</span></div>
      <p class="aide">Aucun pour l'instant. Il apparaîtra ici dès qu'une de tes grilles le contiendra.</p>`;
  }
  return `
    <div class="inter-titre"><span>Tes morceaux qui l'utilisent</span></div>
    ${trouves
      .map(
        (m) => `
      <button type="button" class="mini-ligne" data-ouvrir="${m.id}">
        <span>${echappe(m.titre)}</span>
        ${etoiles(m.maitrise)}
      </button>`
      )
      .join('')}`;
}

function compterDoigts(doigte) {
  return String(doigte).split('').filter((c) => /[1-9]/.test(c)).length;
}

export function brancher(vue) {
  vue.addEventListener('click', (e) => {
    const b = e.target.closest('[data-ouvrir]');
    if (b) location.hash = `#/morceau/${b.dataset.ouvrir}`;
  });
}
