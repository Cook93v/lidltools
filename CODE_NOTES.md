[CODE_NOTES.md](https://github.com/user-attachments/files/31216614/CODE_NOTES.md)
# Notes techniques — LidlVM

## Données

Aucun `localStorage` n'est utilisé. Les valeurs saisies existent uniquement tant
que la page reste ouverte.

## Livraison

Les champs représentent des nombres d'unités : palettes, demi-palettes, Box ou
TKT. Ils utilisent donc un pas entier (`step=1`) et refusent les valeurs
négatives.

Le compte-rendu n'additionne pas des unités différentes. Chaque catégorie
indique seulement le nombre de lignes renseignées et affiche les quantités
exactes saisies.

## PNG

Les zones `deliveryExportArea` et `bilanExportArea` regroupent l'en-tête avec le
logo et le contenu du rapport. Les boutons de fermeture/action ne sont pas
capturés. L'export applique temporairement une largeur fixe afin d'obtenir un
rendu constant sur ordinateur et mobile.

## Bilan

L'index de la tâche « Édition coffre » est recherché dynamiquement. Ajouter une
tâche avant elle ne casse donc plus la gestion du champ d'erreur coffre.
