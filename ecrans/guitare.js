/* Écran 07 — Ma guitare.
 * Deux modes : « sons de référence » (fait, il suffit du navigateur) et
 * « au micro » (la détection de hauteur n'est pas encore écrite).
 * Le dessin du manche relie chaque corde à son nom et à sa mécanique. */

import { CHEVRON_GAUCHE } from '../lib/ui.js';

/* 6e corde en premier, comme partout ailleurs dans l'app. */
const CORDES = [
  { rang: '6e', nom: 'Mi', lettre: 'E', freq: 82.41 },
  { rang: '5e', nom: 'La', lettre: 'A', freq: 110.0 },
  { rang: '4e', nom: 'Ré', lettre: 'D', freq: 146.83 },
  { rang: '3e', nom: 'Sol', lettre: 'G', freq: 196.0 },
  { rang: '2e', nom: 'Si', lettre: 'B', freq: 246.94 },
  { rang: '1re', nom: 'Mi', lettre: 'E', freq: 329.63 },
];

let audio = null;
let oscillateur = null;
let cordeJouee = null;

export function rendre() {
  return `
    <div class="titre-ecran"><h1>Ma guitare</h1></div>

    <div class="chips" role="group" aria-label="Mode d'accordage">
      <button type="button" class="chip" data-mode="reference" aria-pressed="true">Sons de référence</button>
      <button type="button" class="chip" data-mode="micro" aria-pressed="false">Au micro</button>
    </div>

    <div id="zone">${zoneReference()}</div>

    ${manche()}

    <div class="six-cordes" id="cordes">
      ${CORDES.map(
        (c, i) => `
        <button type="button" data-corde="${i}">
          <b>${c.nom}</b><small>${c.rang}</small>
        </button>`
      ).join('')}
    </div>
  `;
}

function zoneReference() {
  return `
    <div class="accordeur" style="margin-top:18px">
      <div class="note-jouee" id="note">—</div>
      <div class="detail-note" id="detail">Touche une corde ci-dessous pour l'entendre</div>
    </div>`;
}

function zoneMicro() {
  return `
    <div class="vide" style="margin-top:18px">
      <strong>Pas encore branché</strong>
      La détection de hauteur au micro viendra ensuite : le navigateur donne les
      échantillons bruts, il reste l'algorithme à écrire. En attendant, accorde à
      l'oreille avec les sons de référence.
    </div>`;
}

/* Tête et manche vus de face. La corde en cours est en orange,
 * sa mécanique est cerclée.
 *
 * Les couleurs passent par style="" et non par des attributs comme fill="…" :
 * les attributs de présentation SVG n'acceptent pas var(), le dessin sortirait
 * en noir. Les classes CSS sont dans styles.css (.mch-*).
 */
function manche(active = 0) {
  const X = [64, 79, 94, 108, 123, 138];
  const EPAISSEUR = [2.6, 2.2, 1.8, 1.4, 1.1, 0.85];
  const MECANIQUES = [
    [46, 16], [46, 32], [46, 48],
    [154, 48], [154, 32], [154, 16],
  ];

  const cordes = X.map(
    (x, i) =>
      `<line class="mch-corde${i === active ? ' active' : ''}" x1="${x}" y1="58" ` +
      `x2="${x}" y2="150" style="stroke-width:${EPAISSEUR[i]}"/>`
  ).join('');

  const versMecaniques = X.map(
    (x, i) => `M${x} 58 ${MECANIQUES[i][0]} ${MECANIQUES[i][1]}`
  ).join('');

  const noms = X.map(
    (x, i) => `
      <text class="mch-rang" x="${x}" y="159" text-anchor="middle">${CORDES[i].rang.replace('re', '')}</text>
      <text class="mch-nom${i === active ? ' active' : ''}" x="${x}" y="172"
            text-anchor="middle">${CORDES[i].nom}</text>`
  ).join('');

  const mec = MECANIQUES.map(
    ([x, y]) => `<circle class="mch-mecanique" cx="${x}" cy="${y}" r="5"/>`
  ).join('');

  const axes = MECANIQUES.map(([x, y]) =>
    x < 100 ? `M${x + 5} ${y}H60` : `M${x - 5} ${y}H140`
  ).join('');

  return `
  <svg class="manche" viewBox="0 0 200 176" role="img"
       aria-label="Manche de guitare : de la 6e corde Mi, la plus épaisse, à gauche, à la 1re corde Mi à droite">
    ${mec}
    <circle class="mch-choisie" cx="${MECANIQUES[active][0]}" cy="${MECANIQUES[active][1]}" r="7"/>
    <path class="mch-axe" d="${axes}"/>
    <path class="mch-tete" d="M66 6H134Q140 6 140 12V52Q140 58 134 58H66Q60 58 60 52V12Q60 6 66 6Z"/>
    <rect class="mch-bois" x="58" y="62" width="84" height="88"/>
    <rect class="mch-sillet" x="57" y="57" width="86" height="5"/>
    <path class="mch-attache" d="${versMecaniques}"/>
    ${cordes}
    ${noms}
  </svg>`;
}

export function brancher(vue) {
  vue.addEventListener('click', (e) => {
    const mode = e.target.closest('[data-mode]');
    if (mode) {
      for (const b of vue.querySelectorAll('[data-mode]')) {
        b.setAttribute('aria-pressed', String(b === mode));
      }
      arreter();
      vue.querySelector('#zone').innerHTML =
        mode.dataset.mode === 'micro' ? zoneMicro() : zoneReference();
      return;
    }

    const bouton = e.target.closest('[data-corde]');
    if (!bouton) return;

    const i = Number(bouton.dataset.corde);
    if (cordeJouee === i) {
      arreter();
      rafraichir(vue, null);
      return;
    }
    jouer(CORDES[i].freq);
    cordeJouee = i;
    rafraichir(vue, i);
  });
}

function rafraichir(vue, i) {
  const note = vue.querySelector('#note');
  const detail = vue.querySelector('#detail');
  for (const b of vue.querySelectorAll('[data-corde]')) {
    b.classList.toggle('active', Number(b.dataset.corde) === i);
  }
  // Le dessin du manche suit la corde choisie.
  const svg = vue.querySelector('.manche');
  if (svg) svg.outerHTML = manche(i ?? 0);

  if (!note) return;
  if (i == null) {
    note.textContent = '—';
    detail.textContent = "Touche une corde ci-dessous pour l'entendre";
  } else {
    const c = CORDES[i];
    note.textContent = c.nom;
    detail.textContent = `${c.rang} corde · ${c.lettre} · ${c.freq.toFixed(2)} Hz`;
  }
}

/* Un son pur, pas un son de guitare : c'est plus facile à accorder dessus. */
function jouer(frequence) {
  arreter();
  audio = audio || new (window.AudioContext || window.webkitAudioContext)();
  // Les navigateurs démarrent le son en pause : il faut un geste de l'utilisateur.
  if (audio.state === 'suspended') audio.resume();
  const gain = audio.createGain();
  gain.gain.value = 0;
  oscillateur = audio.createOscillator();
  oscillateur.type = 'triangle';
  oscillateur.frequency.value = frequence;
  oscillateur.connect(gain).connect(audio.destination);
  oscillateur.start();
  // Montée douce : un démarrage sec fait un « clac » désagréable.
  gain.gain.linearRampToValueAtTime(0.18, audio.currentTime + 0.04);
  oscillateur._gain = gain;
}

function arreter() {
  if (!oscillateur) return;
  try {
    const g = oscillateur._gain;
    g.gain.linearRampToValueAtTime(0, audio.currentTime + 0.05);
    oscillateur.stop(audio.currentTime + 0.06);
  } catch {
    /* déjà arrêté */
  }
  oscillateur = null;
  cordeJouee = null;
}

/** Appelé par l'aiguillage quand on quitte l'écran : on coupe le son. */
export function quitter() {
  arreter();
}
