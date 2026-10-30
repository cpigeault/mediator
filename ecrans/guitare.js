/* Écran 07 — Ma guitare.
 * Deux modes : « sons de référence » (le navigateur joue la note, tu accordes
 * à l'oreille) et « au micro » (l'app écoute et affiche l'écart).
 * Le dessin du manche relie chaque corde à son nom et à sa mécanique. */

import { CORDES, detecterFrequence, corde, mediane } from '../lib/hauteur.js';

/* --- son de référence --- */
let audio = null;
let oscillateur = null;
let cordeJouee = null;

/* --- écoute du micro --- */
let fluxMicro = null;
let analyseur = null;
let tampon = null;
let boucle = null;
let dernieres = [];
let derniereAnalyse = 0;

/* Une analyse coûte une dizaine de millisecondes : mesuré sur les six cordes.
 * La relancer à chaque image (60 fois par seconde) saturerait le téléphone pour
 * rien — 16 analyses par seconde suffisent largement à une aiguille. */
const PERIODE_ANALYSE = 60;

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
    <div class="accordeur" style="margin-top:16px">
      <div class="note-jouee" id="note">—</div>
      <div class="detail-note" id="detail">Touche une corde ci-dessous pour l'entendre</div>
    </div>`;
}

function zoneMicro() {
  return `
    <div class="accordeur" style="margin-top:16px">
      <div class="note-jouee" id="note">—</div>
      <div class="detail-note" id="detail">Pince une corde</div>

      <div class="jauge-accord" id="jauge">
        <div class="graduation"></div>
        <div class="centre"></div>
        <div class="aiguille" id="aiguille" style="left:50%"></div>
        <div class="bornes"><span>trop grave</span><span>juste</span><span>trop aigu</span></div>
      </div>

      <div class="consigne" id="consigne">
        <button type="button" class="bouton-principal" data-ecouter="1" style="margin-top:4px">
          Activer le micro
        </button>
      </div>
    </div>`;
}

/* Tête et manche vus de face. La corde en cours est en orange,
 * sa mécanique est cerclée.
 *
 * Les couleurs passent par des classes CSS et non par des attributs comme
 * fill="…" : les attributs de présentation SVG n'acceptent pas var(), le
 * dessin sortirait en noir.
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
  vue.addEventListener('click', async (e) => {
    const mode = e.target.closest('[data-mode]');
    if (mode) {
      for (const b of vue.querySelectorAll('[data-mode]')) {
        b.setAttribute('aria-pressed', String(b === mode));
      }
      arreterSon();
      arreterEcoute();
      vue.querySelector('#zone').innerHTML =
        mode.dataset.mode === 'micro' ? zoneMicro() : zoneReference();
      majManche(vue, 0);
      return;
    }

    if (e.target.closest('[data-ecouter]')) {
      await demarrerEcoute(vue);
      return;
    }

    const bouton = e.target.closest('[data-corde]');
    if (!bouton) return;

    // En mode micro, les pastilles ne jouent rien : elles ne sont qu'un repère.
    if (vue.querySelector('[data-mode="micro"]')?.getAttribute('aria-pressed') === 'true') {
      majManche(vue, Number(bouton.dataset.corde));
      return;
    }

    const i = Number(bouton.dataset.corde);
    if (cordeJouee === i) {
      arreterSon();
      afficherReference(vue, null);
      return;
    }
    jouer(CORDES[i].freq);
    cordeJouee = i;
    afficherReference(vue, i);
  });
}

/* ---------- mode micro ---------- */

async function demarrerEcoute(vue) {
  const consigne = vue.querySelector('#consigne');
  try {
    fluxMicro = await navigator.mediaDevices.getUserMedia({
      audio: {
        // Ces traitements sont faits pour la voix : ils déforment une note tenue.
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });
  } catch (err) {
    consigne.innerHTML =
      `<b>Micro refusé</b><br>Autorise le micro dans les réglages du site, ` +
      `ou accorde à l'oreille avec les sons de référence.`;
    console.warn('micro :', err);
    return;
  }

  audio = audio || new (window.AudioContext || window.webkitAudioContext)();
  if (audio.state === 'suspended') await audio.resume();

  const source = audio.createMediaStreamSource(fluxMicro);
  analyseur = audio.createAnalyser();
  analyseur.fftSize = 2048;
  source.connect(analyseur);
  tampon = new Float32Array(analyseur.fftSize);
  dernieres = [];

  consigne.innerHTML = '<b>Pince une corde</b><br>L\'app devine laquelle.';
  ecouter(vue);
}

function ecouter(vue) {
  const note = vue.querySelector('#note');
  const detail = vue.querySelector('#detail');
  const jauge = vue.querySelector('#jauge');
  const aiguille = vue.querySelector('#aiguille');
  const consigne = vue.querySelector('#consigne');
  if (!note || !analyseur) return;

  const maintenant = performance.now();
  if (maintenant - derniereAnalyse < PERIODE_ANALYSE) {
    boucle = requestAnimationFrame(() => ecouter(vue));
    return;
  }
  derniereAnalyse = maintenant;

  analyseur.getFloatTimeDomainData(tampon);
  const frequence = detecterFrequence(tampon, audio.sampleRate);
  const trouvee = corde(frequence);

  if (trouvee) {
    // Médiane sur cinq mesures : l'aiguille arrête de trembler.
    dernieres.push(trouvee.ecart);
    if (dernieres.length > 5) dernieres.shift();
    const ecart = mediane(dernieres);
    const juste = Math.abs(ecart) < 5;

    note.textContent = trouvee.corde.nom;
    note.classList.toggle('juste', juste);
    detail.textContent =
      `${trouvee.corde.rang} corde · ${trouvee.corde.lettre} · ${trouvee.frequence.toFixed(1)} Hz`;

    // ±50 cents couvre toute la largeur de la jauge.
    const position = 50 + Math.max(-50, Math.min(50, ecart));
    aiguille.style.left = `${position}%`;
    jauge.classList.toggle('juste', juste);

    consigne.innerHTML = juste
      ? '<b>Juste.</b> Passe à la corde suivante.'
      : ecart < 0
        ? `<b>Un peu trop grave.</b> Tourne la mécanique vers toi, tout doucement.`
        : `<b>Un peu trop aigu.</b> Détends la corde, tout doucement.`;

    majManche(vue, trouvee.index);
  } else {
    dernieres = [];
    note.classList.remove('juste');
    jauge.classList.remove('juste');
  }

  boucle = requestAnimationFrame(() => ecouter(vue));
}

function arreterEcoute() {
  if (boucle) cancelAnimationFrame(boucle);
  boucle = null;
  if (fluxMicro) for (const piste of fluxMicro.getTracks()) piste.stop();
  fluxMicro = null;
  analyseur = null;
  dernieres = [];
}

/* ---------- mode sons de référence ---------- */

function afficherReference(vue, i) {
  const note = vue.querySelector('#note');
  const detail = vue.querySelector('#detail');
  majManche(vue, i ?? 0);
  for (const b of vue.querySelectorAll('[data-corde]')) {
    b.classList.toggle('active', Number(b.dataset.corde) === i);
  }
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

function majManche(vue, i) {
  const svg = vue.querySelector('.manche');
  if (svg) svg.outerHTML = manche(i ?? 0);
}

/* Un son pur, pas un son de guitare : c'est plus facile à accorder dessus. */
function jouer(frequence) {
  arreterSon();
  audio = audio || new (window.AudioContext || window.webkitAudioContext)();
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

function arreterSon() {
  if (!oscillateur) return;
  try {
    oscillateur._gain.gain.linearRampToValueAtTime(0, audio.currentTime + 0.05);
    oscillateur.stop(audio.currentTime + 0.06);
  } catch {
    /* déjà arrêté */
  }
  oscillateur = null;
  cordeJouee = null;
}

/** Appelé par l'aiguillage quand on quitte l'écran : on coupe tout.
 *  Sans ça, le micro resterait allumé et le voyant du téléphone avec. */
export function quitter() {
  arreterSon();
  arreterEcoute();
}
