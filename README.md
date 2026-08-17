[README.md](https://github.com/user-attachments/files/31154827/README.md)
# LidlVM

> Projet créé et maintenu par **MV**.

Ce dossier contient la version statique du portail interne.  
Le code reste volontairement simple à relire et à modifier : HTML, CSS et JavaScript natifs, sans framework obligatoire.

## Notes de maintenance

- Les données temporaires sont conservées localement dans le navigateur.
- Les formulaires Bilan et Livraison fonctionnent sans base de données.
- Les commentaires présents dans le code servent surtout à retrouver rapidement la logique métier.
- Les blocs de compte-rendu sont générés côté client.

---

# LidlVM — Espace Employés

Reconstruction du site statique LidlVM depuis la version publique encore disponible sur Netlify.

## Pages
- `/` — accueil
- `/index1` — bilan des tâches du jour
- `/livraison` — livraison du jour

## Déploiement Netlify
Déposer le dossier à la racine du dépôt GitHub puis connecter le dépôt à Netlify. Aucun build n'est nécessaire.

## Fonctionnalités
- formulaires responsive
- sauvegarde automatique locale (localStorage)
- génération et copie des comptes-rendus
- export PNG du bilan via html2canvas (CDN)
