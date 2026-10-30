/* Écran 06 — Ajouter ou modifier un morceau.
 * Le champ qui fait tout le travail est « Paroles & accords » : on colle la grille
 * telle qu'on l'a trouvée, l'app en extrait les accords. */

import * as store from '../lib/store.js';
import { accordsDuTexte } from '../lib/accords.js';
import { echappe, CHEVRON_GAUCHE } from '../lib/ui.js';

export function rendre(id) {
  const m = id ? store.morceau(id) : null;
  const edition = Boolean(m);

  return `
    <a class="retour" href="${edition ? `#/morceau/${m.id}` : '#/morceaux'}">
      ${CHEVRON_GAUCHE} ${edition ? 'Annuler' : 'Mes morceaux'}
    </a>

    <h1 class="titre-morceau">${edition ? echappe(m.titre) : 'Nouveau<br>morceau'}</h1>

    <form id="formulaire" novalidate>
      <div class="groupe">
        <label class="etiq" for="titre">Titre</label>
        <input id="titre" name="titre" value="${echappe(m?.titre || '')}" required
               autocomplete="off" ${edition ? '' : 'autofocus'}>
      </div>

      <div class="groupe">
        <label class="etiq" for="artiste">Artiste</label>
        <input id="artiste" name="artiste" value="${echappe(m?.artiste || '')}" autocomplete="off">
      </div>

      <div class="groupe">
        <label class="etiq" for="grille">Paroles &amp; accords</label>
        <textarea id="grille" name="grilleTexte" spellcheck="false"
          placeholder="[Couplet 1]&#10;G                   D&#10;À la claire fontaine">${echappe(m?.grilleTexte || '')}</textarea>
        <div class="detectes" id="detectes"></div>
        <p class="aide" id="compte"></p>
      </div>

      <div class="groupe">
        <label class="etiq" for="rythme">Rythme — 4 paires, majuscule = jouée</label>
        <input id="rythme" name="rythme" value="${echappe(m?.rythme || '')}"
               placeholder="Du DU dU DU" autocomplete="off">
      </div>

      <div class="groupe">
        <label class="etiq" for="tuto">Tuto YouTube</label>
        <input id="tuto" name="tutoUrl" type="url" value="${echappe(m?.tutoUrl || '')}"
               placeholder="Coller un lien…" autocomplete="off">
      </div>

      <div class="groupe">
        <label class="etiq" for="capo">Capo</label>
        <input id="capo" name="capo" type="number" min="0" max="9" value="${m?.capo ?? 0}">
      </div>

      <div class="groupe">
        <label class="etiq" for="note">Ma note</label>
        <input id="note" name="notePerso" value="${echappe(m?.notePerso || '')}"
               placeholder="Ce qu'il faut que je retienne…" autocomplete="off">
      </div>

      <button type="submit" class="bouton-principal">
        ${edition ? 'Enregistrer' : 'Ajouter à mes morceaux'}
      </button>
      ${edition
        ? `<button type="button" class="bouton-fantome" data-supprimer="${m.id}">
             Supprimer ce morceau</button>`
        : ''}
    </form>
  `;
}

export function brancher(vue, id) {
  const form = vue.querySelector('#formulaire');
  const grille = vue.querySelector('#grille');
  const detectes = vue.querySelector('#detectes');
  const compte = vue.querySelector('#compte');

  function relireAccords() {
    const accords = accordsDuTexte(grille.value);
    detectes.innerHTML = accords.map((a) => `<b>${echappe(a)}</b>`).join('');
    compte.textContent = accords.length
      ? `${accords.length} accord${accords.length > 1 ? 's' : ''} reconnu${accords.length > 1 ? 's' : ''}`
      : '';
    return accords;
  }

  relireAccords();
  grille.addEventListener('input', relireAccords);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form).entries());
    const donnees = {
      titre: d.titre.trim(),
      artiste: d.artiste.trim(),
      grilleTexte: d.grilleTexte,
      accords: relireAccords(),
      rythme: d.rythme.trim() || null,
      tutoUrl: d.tutoUrl.trim() || null,
      capo: Number(d.capo) || 0,
      notePerso: d.notePerso.trim(),
    };
    if (!donnees.titre) {
      vue.querySelector('#titre').focus();
      return;
    }
    const cible = id ? store.majMorceau(id, donnees) : store.ajouterMorceau(donnees);
    location.hash = `#/morceau/${cible.id}`;
  });

  vue.addEventListener('click', (e) => {
    const b = e.target.closest('[data-supprimer]');
    if (!b) return;
    if (!confirm('Supprimer ce morceau de ta bibliothèque ?')) return;
    store.supprimerMorceau(b.dataset.supprimer);
    location.hash = '#/morceaux';
  });
}
