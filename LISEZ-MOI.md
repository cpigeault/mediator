# Médiator

Le carnet de mes morceaux de guitare. Application web installable sur téléphone,
sans compte et sans serveur : toutes les données restent dans le navigateur.

## Lancer l'app sur l'ordinateur

Double-cliquer sur `serveur.ps1` ne suffit pas (Windows bloque les scripts par
défaut). Ouvrir un terminal dans ce dossier et taper :

```
powershell -ExecutionPolicy Bypass -File serveur.ps1
```

Puis ouvrir **http://localhost:8080**. `Ctrl+C` dans le terminal pour arrêter.

Ce serveur ne sert qu'au développement. Il faut passer par lui plutôt que
d'ouvrir `index.html` directement : le navigateur refuse de charger les modules
JavaScript depuis un simple fichier.

## Mettre l'app sur le téléphone

Il faut une adresse en `https`. Le plus simple est GitHub Pages, gratuit :

1. créer un dépôt sur GitHub et y pousser ce dossier ;
2. dans *Settings → Pages*, choisir la branche `main` et le dossier racine ;
3. ouvrir l'adresse donnée sur le téléphone, puis **Ajouter à l'écran d'accueil**.

À partir de là, l'app s'ouvre en plein écran comme une application installée, et
fonctionne sans réseau (sauf les vidéos de tuto, forcément).

## Où est quoi

| Fichier | Rôle |
|---|---|
| `index.html` | la page, volontairement vide : tout est construit en JavaScript |
| `styles.css` | **toutes** les couleurs et polices, en haut du fichier |
| `app.js` | l'aiguillage entre les écrans et la barre du bas |
| `data/morceaux.json` | la bibliothèque de départ, 69 titres |
| `lib/store.js` | lecture et écriture des données du navigateur |
| `lib/accords.js` | le dictionnaire des accords et la détection dans une grille collée |
| `lib/diagramme.js` | dessine un diagramme à partir d'un doigté comme `x02210` |
| `lib/ui.js` | les étoiles, les flèches du rythme, les icônes |
| `ecrans/` | un fichier par écran |
| `sw.js` | le fonctionnement hors-ligne |

### Changer une couleur

Tout est en haut de `styles.css`, dans le bloc `:root`. Modifier une seule ligne
change la couleur partout dans l'app.

### Ajouter un accord au dictionnaire

Dans `lib/accords.js`, à la suite des autres :

```js
Esus4: { doigte: '022200', doigts: [null, 2, 3, 4, null, null], famille: 'autre' },
```

Le doigté se lit de la corde grave (6ᵉ, Mi) à l'aiguë (1ʳᵉ, Mi).
`x` = corde étouffée, `0` = corde à vide, `3` = 3ᵉ case.
Le dessin est calculé tout seul, il n'y a aucune image à faire.

### Après une modification

Le `sw.js` garde les fichiers en mémoire pour le mode hors-ligne. Si une
modification ne s'affiche pas sur le téléphone, incrémenter `VERSION` en haut de
`sw.js` (`mediator-1` → `mediator-2`).

## Ce qui marche

- les 69 morceaux, triés alphabétiquement, recherche par titre, artiste ou accord
- la notation en trois étoiles, qui se sauvegarde
- le bandeau « Complète tes morceaux », qui disparaît quand il n'y a plus rien à faire
- coller une grille : les accords sont reconnus et rangés dans le tableau
- les diagrammes d'accords, calculés depuis les doigtés
- le tableau des accords, dont les cases s'allument selon les morceaux
- le mode jeu : paroles et accords alignés, taille du texte réglable
- l'accordeur en **sons de référence** : six notes pures jouées par le navigateur
- le dessin du manche, qui relie chaque corde à son nom et à sa mécanique

## Ce qui reste à faire

- **l'accordeur au micro** : l'algorithme de détection de hauteur n'est pas écrit
- **la transposition** (`−1 ton` / `+1 ton`) : les boutons existent, ils ne font rien
- **la recherche de tuto YouTube** : prévue via l'API YouTube, demande une clé gratuite
- **le partage depuis le navigateur** vers l'app (Web Share Target)
- **le rythme** : aucun morceau n'en a encore un. Format `Du DU dU DU` —
  4 paires, une par temps, majuscule = corde touchée, minuscule = main à vide
- **58 grilles** à coller, au fil des soirs
