# Test de Recrutement - Développeur Full Stack
## Système de Gestion

**Durée estimée:** 3-4 heures
**Niveau:** Intermédiaire
**Langues:** Instructions en français, documentation technique en anglais

---

## Objectif du Test

Vous devez développer un système simplifié de gestion bancaire permettant de gérer des clients, leurs comptes, et effectuer des transactions basiques. Ce test évalue vos compétences en:

- **Backend:** API REST, base de données, logique métier
- **Frontend:** Interface utilisateur, gestion d'état, validation
- **Documentation:** Compréhension et rédaction en anglais technique
- **Debugging:** Capacité à identifier et corriger des bugs
- **Architecture:** Organisation du code, bonnes pratiques

---

## Critères d'Évaluation

Votre travail sera évalué sur:

1. **Qualité du code** (30%) - Lisibilité, organisation, conventions
2. **Fonctionnalités** (25%) - Toutes les features fonctionnent correctement
3. **Résolution de bugs** (20%) - Debugging et corrections
4. **Documentation technique** (15%) - README et commentaires en anglais
5. **Tests** (10%) - Au moins tests basiques

---

## Structure du Projet

```
test-recrutement-dev/
├── README.md                    (Ce fichier)
├── INSTRUCTIONS.md              (Instructions détaillées)
├── EVALUATION.md                (Critères d'évaluation - NE PAS MODIFIER)
├── backend/                     (Code backend à compléter)
│   ├── package.json
│   ├── server.js               (Serveur à corriger - contient des bugs)
│   ├── database.js             (À implémenter)
│   ├── routes/                 (Routes API à compléter)
│   └── tests/                  (Tests à écrire)
├── frontend/                    (Code frontend à compléter)
│   ├── package.json
│   ├── index.html
│   ├── src/
│   │   ├── app.js              (Application principale)
│   │   ├── api.js              (Appels API)
│   │   └── components/         (Composants UI)
│   └── styles/
└── docs/                        (Documentation à rédiger en anglais)
    ├── API.md                   (Documentation API - À COMPLÉTER)
    ├── ARCHITECTURE.md          (Explication architecture)
    └── BUGS_FIXED.md            (Liste des bugs corrigés)
```

---

## Installation et Démarrage

### Prérequis
- Node.js >= 16.x
- npm ou yarn
- Un navigateur moderne

### Installation

```bash
# Cloner ou extraire le projet
cd test-recrutement-dev

# Installer les dépendances backend
cd backend
npm install

# Installer les dépendances frontend (dans un nouveau terminal)
cd ../frontend
npm install
```

### Démarrage

```bash
# Terminal 1 - Backend (port 3000)
cd backend
npm start

# Terminal 2 - Frontend (port 8080)
cd frontend
npm start
```

L'application devrait être accessible sur `http://localhost:8080`

---

## Tâches à Réaliser

Consultez le fichier `INSTRUCTIONS.md` pour la liste complète des tâches.

### Résumé des Tâches:

**PARTIE 1 - DEBUGGING (Obligatoire)**
- Corriger 5 bugs dans le code backend fourni
- Documenter chaque bug corrigé en anglais

**PARTIE 2 - BACKEND (Obligatoire)**
- Implémenter les endpoints API manquants
- Ajouter la validation des données
- Gérer les erreurs correctement

**PARTIE 3 - FRONTEND (Obligatoire)**
- Créer l'interface de gestion des clients
- Implémenter le système de transactions
- Valider les formulaires côté client

**PARTIE 4 - DOCUMENTATION (Obligatoire)**
- Documenter l'API en anglais
- Expliquer votre architecture
- Lister les bugs corrigés avec explications

**PARTIE 5 - BONUS (Optionnel)**
- Ajouter des tests unitaires
- Implémenter des fonctionnalités avancées
- Améliorer l'UX/UI

---

## Soumission du Test

### Ce que vous devez soumettre:

1. **Code complet** dans un dossier ZIP ou lien Git
2. **Tous les fichiers de documentation** complétés
3. **Un fichier `TEMPS_PASSE.txt`** indiquant:
   - Temps total passé sur le test
   - Temps par partie (debugging, backend, frontend, documentation)
   - Difficultés rencontrées

### Format de soumission:

```
nom-prenom-test-dokal.zip
├── backend/
├── frontend/
├── docs/
└── TEMPS_PASSE.txt
```

---

## Règles Importantes

1. **Utilisation d'outils IA:** Vous pouvez utiliser des outils d'assistance (ChatGPT, GitHub Copilot, etc.) MAIS vous devez:
   - Comprendre et pouvoir expliquer chaque ligne de code
   - Adapter le code à ce contexte spécifique
   - Documenter où et comment vous avez utilisé l'IA dans `TEMPS_PASSE.txt`

2. **Code copié-collé:** Le simple copier-coller de solutions génériques sera détecté et pénalisé

3. **Tests anti-plagiat:** Votre code sera analysé pour détecter:
   - Similarité avec des solutions en ligne
   - Patterns typiques de code généré par IA
   - Incohérences de style

4. **Originalité:** Nous valorisons les solutions personnalisées et bien pensées

---

## Besoin d'Aide?

- Lisez attentivement `INSTRUCTIONS.md`
- Les fichiers fournis contiennent des commentaires avec des indices
- La documentation Node.js et Express est votre amie
- En cas de blocage majeur, documentez le problème dans `TEMPS_PASSE.txt`

---

## Contact

Pour toute question concernant le test, contactez: [VOTRE EMAIL]

**Bonne chance! **
