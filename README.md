# BotFi

## Description
BotFi est un bot polyvalent conçu pour automatiser diverses tâches et interagir avec les utilisateurs. Basé sur Node.js, il intègre une gestion de commandes, une base de données SQLite pour le stockage des données, et un système d'authentification robuste, probablement pour une plateforme de messagerie instantanée comme WhatsApp.

## Fonctionnalités

*   **Gestion des Commandes**: Exécutez diverses commandes prédéfinies telles que `about`, `extract`, `help`, `info`, `ping`, `play`, et `sticker`.
*   **Base de Données Intégrée**: Utilise SQLite (`bot.db`) pour stocker et gérer les données persistantes via `database.js`.
*   **Gestion des Utilisateurs**: Gère les informations utilisateur, potentiellement via `users.json`.
*   **Authentification et Session**: Gère les informations d'authentification et de session dans le dossier `auth_info/`, essentiel pour maintenir la connexion à la plateforme de messagerie.
*   **Journalisation**: Un module de journalisation (`logger.js`) est inclus pour suivre les activités et les erreurs du bot.

## Prérequis

Avant de commencer, assurez-vous d'avoir installé les éléments suivants sur votre système :

*   **Node.js**: Version 14 ou supérieure.
*   **npm**: Généralement installé avec Node.js.

## Installation

Suivez ces étapes pour installer et configurer BotFi :

1.  **Télécharger le projet**:
    Clonez ce dépôt Git (si disponible) ou téléchargez l'archive du projet et décompressez-la.
    ```bash
    # Si c'est un dépôt Git
    git clone <URL_DU_DEPOT>
    cd botfi
    ```
    Ou naviguez simplement vers le répertoire du projet si vous l'avez déjà.
    ```bash
    cd C:\Users\JUVENAL\Desktop\monbot\botfi
    ```

2.  **Installer les dépendances**:
    Dans le répertoire racine du projet, exécutez la commande suivante pour installer toutes les dépendances nécessaires :
    ```bash
    npm install
    ```

## Configuration

1.  **Authentification**:
    Lors du premier démarrage, le bot pourrait nécessiter une authentification (par exemple, scanner un code QR si c'est un bot WhatsApp). Suivez les instructions affichées dans la console. Les informations de session seront stockées dans le dossier `auth_info/`.

2.  **Fichier `users.json`**:
    Si `users.json` est utilisé pour la configuration initiale des utilisateurs ou des permissions, assurez-vous qu'il est correctement formaté selon les besoins de votre bot.

## Utilisation

Pour démarrer le bot, exécutez la commande suivante dans le répertoire racine du projet :

```bash
node index.js
# Ou si défini dans package.json
npm start
```

Le bot démarrera et commencera à écouter les événements ou les commandes. Vous pouvez interagir avec lui via la plateforme de messagerie pour laquelle il est configuré.

## Structure du Projet

Voici un aperçu des fichiers et dossiers importants du projet :

*   `index.js`: Le point d'entrée principal du bot.
*   `database.js`: Contient la logique pour interagir avec la base de données `bot.db`.
*   `bot.db`: Le fichier de base de données SQLite où les données sont stockées.
*   `logger.js`: Module de journalisation pour les événements du bot.
*   `users.json`: Fichier de configuration ou de données pour les utilisateurs.
*   `package.json`: Définit les métadonnées du projet et les dépendances.
*   `package-lock.json`: Enregistre les versions exactes des dépendances.
*   `auth_info/`: Contient les fichiers de session et d'authentification du bot. **Ce dossier est ignoré par Git pour des raisons de sécurité.**
*   `commands/`: Contient les modules pour chaque commande que le bot peut exécuter (ex: `about.js`, `play.js`, `sticker.js`).
*   `node_modules/`: Dossier contenant toutes les dépendances installées. **Ce dossier est ignoré par Git.**

## Licence

Ce projet est sous licence [Nom de la Licence, ex: MIT]. Voir le fichier `LICENSE` pour plus de détails.
