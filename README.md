[README.md](https://github.com/user-attachments/files/31216600/README.md)
# LidlVM — Espace Employés

Portail web léger destiné à centraliser des outils internes du quotidien :

- Bilan des tâches du jour
- Livraison du jour
- Accès MyLidl — demande d'absence
- Accès MyLidl — temps de travail

## Fonctionnement

Les formulaires Bilan et Livraison fonctionnent entièrement dans le navigateur.
Aucune saisie n'est envoyée à un serveur et aucune valeur n'est conservée après
rechargement ou fermeture de la page.

Les comptes-rendus peuvent être :

- affichés dans une fenêtre de prévisualisation ;
- copiés en texte ;
- enregistrés en PNG.

Les exports PNG chargent `html2canvas` uniquement au moment de l’export, avec
jsDelivr puis un CDN de secours. Le logo Lidl est chargé depuis Wikimedia et
aucun fichier image local n’est nécessaire.

## Corrections intégrées

- validation des quantités de livraison ;
- suppression des faux totaux mélangeant palettes, Box et TKT ;
- prise en compte d'une valeur `0` explicitement saisie ;
- copie texte cohérente avec les lignes réellement renseignées ;
- logo inclus dans les exports PNG ;
- date locale utilisée pour les noms de fichiers ;
- export PNG stabilisé entre ordinateur et mobile ;
- génération vide bloquée ;
- logique du coffre rendue indépendante de sa position dans la liste ;
- date de l'accueil mise à jour automatiquement.


## Correctif V4
- Association des quantités Livraison sécurisée par `data-index` : le regroupement visuel des catégories ne peut plus décaler les valeurs dans le compte-rendu.
