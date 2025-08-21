# Image Node.js officielle
FROM node:20

# Installer Python3 + pip + ffmpeg pour yt-dlp
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Créer dossier de travail
WORKDIR /app

# Copier package.json et package-lock.json et installer les dépendances
COPY package*.json ./
RUN npm install --omit=dev

# Copier le reste du projet
COPY . .

# Exposer le port pour le serveur web
EXPOSE 3000

# Commande pour lancer le bot
CMD ["node", "index.js"]
