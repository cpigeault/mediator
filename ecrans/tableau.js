/* Écran 05 — Les accords. Sept lettres en lignes, quatre familles en colonnes.
 * Les cases que tes morceaux utilisent déjà s'allument toutes seules. */

import * as store from '../lib/store.js';
import { LETTRES, FAMILLES, ACCORDS } from '../lib/accords.js';
import { echappe } from '../lib/ui.js';

export function rendre() {
  const utilises = store.accordsUtilises();

  return `
    <div class="titre-ecran"><h1>Les accords</h1></div>

    <table class="tableau">
      <thead>
        <tr><th></th>${FAMILLES.map((f) => `<th>${f.titre}</th>`).join('')}</tr>
      </thead>
      <tbody>
        ${LETTRES.map(
          (lettre) => `
          <tr>
            <td>${lettre}</td>
            ${FAMILLES.map((f) => {
              const nom = lettre + f.suffixe;
              const connu = utilises.has(nom);
              const existe = Boolean(ACCORDS[nom]);
              return `<td><button type="button" class="${connu ? 'connu' : ''}"
                        data-accord="${encodeURIComponent(nom)}"
                        ${existe || connu ? '' : 'aria-disabled="true"'}>${nom}</button></td>`;
            }).join('')}
          </tr>`
        ).join('')}
      </tbody>
    </table>

    <div class="inter-titre"><span>Comment ils sont fabriqués</span></div>
    <dl class="legende">
      ${FAMILLES.map(
        (f) => `
        <div>
          <dt>${f.titre}</dt>
          <dd><span class="formule">${f.formule}</span> — ${echappe(f.sens)}</dd>
        </div>`
      ).join('')}
    </dl>

    ${autresAccords(utilises)}
  `;
}

/** Les accords de tes morceaux qui ne tiennent pas dans le tableau (A7sus4, Em7…). */
function autresAccords(utilises) {
  const dansTableau = new Set();
  for (const l of LETTRES) for (const f of FAMILLES) dansTableau.add(l + f.suffixe);
  const autres = [...utilises].filter((a) => !dansTableau.has(a)).sort();
  if (!autres.length) return '';
  return `
    <div class="inter-titre"><span>Aussi dans tes morceaux</span></div>
    <div class="detectes">
      ${autres
        .map(
          (a) =>
            `<a href="#/accord/${encodeURIComponent(a)}"><b>${echappe(a)}</b></a>`
        )
        .join('')}
    </div>`;
}

export function brancher(vue) {
  vue.addEventListener('click', (e) => {
    const b = e.target.closest('[data-accord]');
    if (b) location.hash = `#/accord/${b.dataset.accord}`;
  });
}
