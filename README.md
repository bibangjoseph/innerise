# Innerise App

Application web de coaching mental assisté par IA. Elle accompagne l'utilisateur au quotidien via deux modules complémentaires : un check-in conversationnel et un diagnostic approfondi.

## Fonctionnalités

### Check-in (F1)
Conversation guidée quotidienne avec l'**IA Miroir**. L'utilisateur répond à 2 questions et reçoit un retour personnalisé. Chaque session :
- Met à jour les 4 scores de bien-être (Clarté, Résilience, Motivation, Ancrage)
- Alimente la mémoire active du profil
- Incrémente le streak de jours consécutifs
- Déclenche une alerte si des scores critiques sont détectés

### Diagnostic (F2)
Analyse en 5 étapes (domaine → situation → humeur → contexte → résultat) :
- Domaines : Professionnel, Personnel, Relationnel, Spirituel
- Calcul des scores avec deltas, points forts et points d'attention
- Action du jour personnalisée
- Mise à jour automatique de la mémoire F1

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 19 + TypeScript + Vite |
| Auth | Firebase Auth (Google Sign-In) |
| Base de données | Cloud Firestore |
| Hébergement | Firebase Hosting |
| Backend (IA) | Firebase Functions + Anthropic SDK |
| Style | CSS Modules |

## Prérequis

- Node.js 20+
- Firebase CLI : `npm install -g firebase-tools`
- Un projet Firebase avec Auth, Firestore et Functions activés

## Installation

```bash
npm install
cd functions && npm install && cd ..
```

## Variables d'environnement

Créer un fichier `.env.local` à la racine :

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## Commandes

```bash
# Développement
npm run dev

# Build production
npm run build

# Aperçu du build
npm run preview

# Lint
npm run lint

# Émulateurs Firebase (auth, firestore, functions, hosting)
firebase emulators:start

# Déploiement
npm run build && firebase deploy
```

## Structure du projet

```
src/
├── components/
│   ├── Auth/          # Écran de connexion Google
│   ├── BottomNav/     # Navigation mobile en bas d'écran
│   ├── CheckIn/       # Module F1 — chat + scores + mémoire
│   ├── Diagnostic/    # Module F2 — diagnostic en 5 étapes
│   └── Nav/           # Barre de navigation principale
├── data/
│   ├── conversations.ts   # Scénarios de check-in et diagnostics prédéfinis
│   └── profiles.ts        # Situations par domaine
├── hooks/
│   ├── useAuth.ts     # Authentification Firebase
│   └── useProfile.ts  # Gestion du profil Firestore
├── lib/
│   └── firebase.ts    # Initialisation Firebase
└── types/
    └── index.ts       # Types TypeScript (Profile, Scores, DiagnosticResult…)

functions/
└── src/               # Firebase Functions (intégration Anthropic)
```