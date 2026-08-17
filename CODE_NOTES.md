# Notes développeur — LidlVM

Créateur du projet : **MV**

Quelques choix faits volontairement dans le projet :

- pas de framework lourd pour garder un chargement rapide ;
- stockage local pour les formulaires et les brouillons ;
- génération des comptes-rendus directement dans le navigateur ;
- CSS regroupé dans un fichier principal pour pouvoir corriger rapidement l'apparence ;
- JavaScript séparé entre le bilan et la livraison afin d'éviter de mélanger les deux logiques métier.

Les commentaires dans les fichiers sont là pour faciliter les futures modifications, pas pour documenter chaque ligne.

- Ajout d'un accès direct **Demande d'absence** vers MyLidl (RH), ouverture dans un nouvel onglet.
