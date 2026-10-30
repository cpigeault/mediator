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

### Noter un rythme

Dans `data/morceaux.json`, ou directement dans la fiche du morceau via
*Modifier*. Une paire de flèches par temps, séparées par un espace :

```
"rythme": "Du DU dU DU"
```

`D` = vers le bas, `U` = vers le haut. **Majuscule = la main touche les cordes,
minuscule = elle continue son mouvement à vide.** Trois ou quatre paires, selon
que le morceau est à 3 temps (une valse) ou à 4.

Quelques exemples déjà en place :

| Rythme | Donne | Morceaux |
|---|---|---|
| `Du DU dU DU` | ↓ · ↓↑ · ↑↓↑ | le gratté folk, le plus courant |
| `Du Du Du` | ↓ ↓ ↓ sur 3 temps | les valses : La Bohème, Mon amant de Saint-Jean |
| `dU dU dU dU` | les montées seules | le reggae : Three Little Birds |
| `Du Du Du Du` | quatre descentes | la marche : Santiano |
| `Du du Du du` | sur 1 et 3 | les morceaux lents : Imagine, Chasing Cars |

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
- **la transposition** : `−½ ton` / `+½ ton` en mode jeu, mémorisée par morceau,
  en conservant l'alignement des accords au-dessus des syllabes
- **le rythme en flèches** : 13 morceaux renseignés, 3 ou 4 temps
- **le bouton tuto** : une recherche YouTube calculée depuis le titre, donc
  valable pour les 69 morceaux et impossible à casser

## Ce qui reste à faire

- **l'accordeur au micro** : l'algorithme de détection de hauteur n'est pas écrit
- **le partage depuis le navigateur** vers l'app (Web Share Target)
- **épingler un tuto** : le champ existe dans *Modifier*, mais rien ne propose
  encore une liste de vidéos à choisir
- **56 rythmes** et **58 grilles** à remplir, au fil des soirs
