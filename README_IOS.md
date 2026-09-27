# Guide de Compatibilité iOS & Création de l'IPA — Undertale: Last Breath

Ce projet a été entièrement adapté et optimisé pour fonctionner sur **iOS (iPhone & iPad)** et être compilé sous forme de paquet natif **`.ipa`**.

---

## 🚀 1. Améliorations & Compatibilités iOS Réalisées

1. **Moteur Audio 100% Compatible Safari & iOS WebKit** :
   - Safari iOS ne lit pas nativement le format OGG Vorbis sur les versions antérieures à iOS 18.4. L'intégralité des 102 fichiers audio (musiques BGM & effets sonores SFX) a été convertie en **MP3 haute fidélité**.
   - Le moteur `AudioManager` détecte automatiquement iOS et utilise les pistes MP3 sans aucune perte de qualité.
   - Système de déverrouillage de l'audio (`AudioContext unlock`) dès la première interaction tactile pour contourner les restrictions strictes d'autoplay d'Apple.
   - Mise en pause automatique de la musique lors de la mise en veille ou du changement d'application via l'API `visibilitychange`.

2. **Commandes Tactiles & Ergonomie Mobile** :
   - **D-Pad Arcade Virtuel** : support multi-touch complet permettant de glisser le pouce sur les directions sans lever le doigt.
   - **Boutons d'Action Z (Valider / Parade) & X (Annuler / Focus)** ergonomiques avec rétroéclairage néon.
   - **Retour Haptique (Vibrations)** : intégration de l'API `navigator.vibrate` pour un ressenti physique lors des parades et des coups.
   - **Support Manettes Bluetooth** : support natif de la Gamepad API (manettes Xbox, PS4/PS5 DualSense, Nintendo Switch et MFi / Backbone).
   - **Support Safe Area & Dynamic Island** : adaptation aux écrans avec encoche (`viewport-fit=cover`, marges de sécurité iOS).
   - Bloquage du zoom intempestif (`user-scalable=no`, `touch-action: none`) et des menus contextuels iOS (`-webkit-touch-callout: none`).

3. **Intégration Native iOS (Capacitor)** :
   - Projet Xcode complet généré dans `ios/App/App.xcworkspace`.
   - Icône d'application 1024x1024 personnalisée et intégrée aux assets Xcode (`AppIcon.appiconset`).
   - Configuration `Info.plist` en plein écran (`UIRequiresFullScreen = true`, barre d'état masquée).

---

## 📦 2. Comment Générer le Fichier `.ipa`

### Option A — Automatique via GitHub Actions (Recommandé, 0 Mac requis)

Comme la compilation d'un binaire iOS Mach-O nécessite Xcode (disponible uniquement sur macOS), un workflow CI/CD complet est inclus dans `.github/workflows/build-ios-ipa.yml`.

1. Poussez votre dossier sur un dépôt **GitHub** (public ou privé).
2. Rendez-vous sur votre dépôt GitHub, puis cliquez sur l'onglet **Actions**.
3. Sélectionnez le workflow **Build iOS IPA** à gauche et cliquez sur **Run workflow** (ou poussez simplement un commit).
4. GitHub démarre un serveur Mac virtuel (`macos-14`), installe les dépendances, compile l'application avec Xcode et génère le fichier `LastBreath.ipa`.
5. Une fois terminé (2 à 3 minutes), téléchargez l'archive dans la section **Artifacts** : vous obtenez votre fichier **`LastBreath.ipa`** !

---

### Option B — Compilation Locale sur un Mac

Si vous ou un proche disposez d'un Mac :

```bash
# 1. Installer les dépendances
npm install

# 2. Préparer les fichiers web et synchroniser le projet iOS
npm run cap:sync

# 3. Ouvrir le projet dans Xcode
npx cap open ios
```

Dans **Xcode** :
1. Sélectionnez votre équipe de développement dans l'onglet **Signing & Capabilities** (un compte Apple gratuit suffit).
2. Choisissez la cible : **Any iOS Device (arm64)**.
3. Allez dans le menu **Product > Archive**.
4. Cliquez sur **Distribute App** > **Custom** > **Ad Hoc** (ou Development) > **Export**.
5. Vous obtenez votre fichier `.ipa` dans le dossier exporté.

---

## 📱 3. Comment Installer l'IPA sur votre iPhone / iPad

Une fois le fichier `.ipa` récupéré, vous pouvez l'installer facilement :

* **Avec Sideloadly (Windows & Mac — Gratuit & Facile)** :
  1. Téléchargez [Sideloadly](https://sideloadly.io/).
  2. Branchez votre iPhone en USB et entrez votre Apple ID.
  3. Glissez-déposez le fichier `.ipa` et cliquez sur **Start**.
  4. Sur votre iPhone, allez dans *Réglages > Général > VPN et gestion des appareils*, et approuvez le certificat développeur.

* **Avec AltStore (Windows & Mac)** :
  1. Installez AltStore sur votre iPhone via AltServer.
  2. Partagez le fichier `.ipa` vers AltStore sur l'iPhone pour l'installer.

* **Avec TrollStore (Pour iOS 14.0 à 17.0)** :
  1. Ouvrez le fichier `.ipa` avec TrollStore : l'application est installée de façon permanente sans aucune révocation !

* **Avec Scarlet ou LiveContainer** :
  - Importez directement le fichier `.ipa` dans l'application sur l'appareil.

---

## 🌐 4. Alternative : Utiliser en PWA Directe (Sans IPA)

Si vous voulez y jouer immédiatement sur votre iPhone sans passer par l'installation d'un fichier IPA :

1. Hébergez le dossier (par exemple sur GitHub Pages, Vercel ou en réseau local).
2. Ouvrez l'adresse dans **Safari** sur votre iPhone/iPad.
3. Touchez l'icône de partage (carré avec la flèche vers le haut).
4. Choisissez **« Sur l'écran d'accueil »**.
5. L'icône Undertale Last Breath s'affiche sur votre écran d'accueil et le jeu se lance en plein écran comme une véritable application native !
