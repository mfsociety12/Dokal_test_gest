# Instructions Détaillées - Test Technique

## Contexte Métier

Vous travaillez pour **Dokal Africa**, une entreprise qui développe des solutions fintech pour l'Afrique de l'Ouest. Votre mission est de compléter un système de gestion bancaire qui permettra aux agents de terrain de gérer les comptes clients et les transactions.

### Besoins Fonctionnels

Le système doit permettre de:
1. Gérer des clients (création, consultation, modification)
2. Gérer des comptes bancaires associés aux clients
3. Effectuer des transactions (dépôts, retraits, transferts)
4. Consulter l'historique des transactions
5. Calculer les soldes en temps réel

---

## PARTIE 1: DEBUGGING (OBLIGATOIRE - 1h estimée)

### Contexte
Le développeur précédent a laissé du code avec des bugs. Vous devez les identifier et les corriger.

### Fichiers concernés:
- `backend/server.js` - Contient des bugs d'initialisation
- `backend/routes/clients.js` - Bugs dans les validations
- `backend/routes/transactions.js` - Bugs dans la logique métier
- `frontend/src/api.js` - Bugs dans les appels API

### Bugs à trouver et corriger (5 bugs):

#### Bug #1 - Serveur ne démarre pas correctement
**Fichier:** `backend/server.js`
**Symptôme:** L'application crash au démarrage
**À faire:** Identifier pourquoi et corriger

#### Bug #2 - Validation des numéros de téléphone
**Fichier:** `backend/routes/clients.js`
**Symptôme:** Accepte des numéros invalides (ex: "abc123")
**À faire:** Implémenter une vraie validation pour format burkinabé (+226 XX XX XX XX)

#### Bug #3 - Calcul de solde incorrect
**Fichier:** `backend/routes/transactions.js`
**Symptôme:** Le solde après transaction n'est pas correct
**À faire:** Corriger la logique de calcul

#### Bug #4 - Erreur de requête API
**Fichier:** `frontend/src/api.js`
**Symptôme:** Les requêtes POST ne fonctionnent pas
**À faire:** Corriger les headers et le format des requêtes

#### Bug #5 - Race condition dans les transactions
**Fichier:** `backend/routes/transactions.js`
**Symptôme:** Deux transactions simultanées sur le même compte causent des incohérences
**À faire:** Implémenter un mécanisme de verrouillage

### Documentation requise:
Pour chaque bug corrigé, documenter dans `docs/BUGS_FIXED.md` (EN ANGLAIS):
- Description du bug
- Cause root cause
- Solution implémentée
- Comment vous l'avez trouvé

**Exemple de format:**

```markdown
### Bug #1: Server Initialization Failure

**Description:** The server crashes on startup with error "Cannot read property 'listen' of undefined"

**Root Cause:** The Express app was not properly initialized before calling app.listen()

**Solution:** Added proper initialization sequence and error handling in server.js lines 15-20

**How I found it:** Checked the error stack trace and noticed the app variable was undefined at runtime
```

---

## PARTIE 2: BACKEND (OBLIGATOIRE - 1h30 estimée)

### 2.1 - Base de Données (`backend/database.js`)

Implémenter un système de stockage simple en mémoire avec les collections suivantes:

```javascript
{
  clients: [
    {
      id: "string (UUID)",
      nom: "string",
      prenom: "string",
      telephone: "string (+226 XX XX XX XX)",
      email: "string (optionnel)",
      adresse: "string",
      dateCreation: "ISO date string",
      statut: "actif | inactif"
    }
  ],
  comptes: [
    {
      id: "string (UUID)",
      clientId: "string",
      numeroCompte: "string (généré automatiquement)",
      solde: "number",
      devise: "XOF",
      type: "epargne | courant",
      dateOuverture: "ISO date string",
      statut: "actif | fermé"
    }
  ],
  transactions: [
    {
      id: "string (UUID)",
      compteId: "string",
      type: "depot | retrait | transfert",
      montant: "number",
      devise: "XOF",
      description: "string",
      dateTransaction: "ISO date string",
      compteDestinataireId: "string (pour transferts)",
      statut: "reussie | echouee"
    }
  ]
}
```

**Fonctions à implémenter:**
- `initDatabase()` - Initialise la base avec des données de test
- `getCollection(name)` - Retourne une collection
- `addToCollection(name, item)` - Ajoute un élément
- `updateInCollection(name, id, updates)` - Met à jour un élément
- `deleteFromCollection(name, id)` - Supprime un élément
- `findInCollection(name, predicate)` - Cherche selon critère

### 2.2 - Routes API à Compléter

#### Routes Clients (`backend/routes/clients.js`)

**À implémenter:**

```
POST /api/clients
- Créer un nouveau client
- Validation: tous les champs obligatoires sauf email
- Retourne: le client créé avec son ID

GET /api/clients
- Liste tous les clients actifs
- Paramètre query optionnel: ?statut=actif|inactif|tous
- Retourne: tableau de clients

GET /api/clients/:id
- Récupère un client par ID
- Retourne: le client ou erreur 404

PUT /api/clients/:id
- Met à jour un client
- Validation: ne peut pas modifier id, dateCreation
- Retourne: le client mis à jour

DELETE /api/clients/:id (soft delete)
- Marque le client comme inactif
- Vérifie qu'il n'a pas de comptes actifs
- Retourne: succès ou erreur
```

#### Routes Comptes (`backend/routes/comptes.js`)

**À implémenter:**

```
POST /api/comptes
- Créer un compte pour un client
- Générer un numéro de compte unique (format: BF-XXXXX-XXXXX)
- Solde initial = 0
- Retourne: le compte créé

GET /api/comptes/client/:clientId
- Liste tous les comptes d'un client
- Retourne: tableau de comptes

GET /api/comptes/:id
- Récupère un compte par ID
- Inclure le solde actuel
- Retourne: le compte

PUT /api/comptes/:id/statut
- Activer/désactiver un compte
- Validation: solde doit être 0 pour fermer
- Retourne: le compte mis à jour
```

#### Routes Transactions (`backend/routes/transactions.js`)

**À implémenter:**

```
POST /api/transactions/depot
- Effectuer un dépôt
- Validation: montant > 0, compte actif
- Met à jour le solde du compte
- Retourne: la transaction créée

POST /api/transactions/retrait
- Effectuer un retrait
- Validation: montant > 0, solde suffisant, compte actif
- Met à jour le solde du compte
- Retourne: la transaction créée

POST /api/transactions/transfert
- Transférer entre deux comptes
- Validation: comptes actifs, solde suffisant, comptes différents
- Met à jour les soldes des deux comptes
- Crée deux transactions (débit et crédit)
- Retourne: les deux transactions

GET /api/transactions/compte/:compteId
- Historique des transactions d'un compte
- Paramètre query: ?limit=X (défaut: 50)
- Tri: du plus récent au plus ancien
- Retourne: tableau de transactions

GET /api/transactions/:id
- Récupère une transaction par ID
- Retourne: la transaction
```

### 2.3 - Validation des Données

Implémenter des validations robustes:

**Clients:**
- Nom et prénom: 2-50 caractères, lettres uniquement
- Téléphone: format burkinabé valide (+226 XX XX XX XX)
- Email: format email valide si fourni
- Adresse: non vide

**Comptes:**
- Type: seulement "epargne" ou "courant"
- Devise: seulement "XOF"
- Client doit exister

**Transactions:**
- Montant: nombre positif, minimum 100 XOF
- Devise: seulement "XOF"
- Description: maximum 200 caractères
- Compte(s) doivent exister et être actifs

### 2.4 - Gestion des Erreurs

Retourner des erreurs HTTP appropriées:

```javascript
200 - Succès
201 - Création réussie
400 - Données invalides
404 - Ressource non trouvée
409 - Conflit (ex: numéro de compte déjà existant)
500 - Erreur serveur

Format des erreurs:
{
  "error": true,
  "message": "Description de l'erreur",
  "code": "ERROR_CODE",
  "details": {} // optionnel
}
```

---

## PARTIE 3: FRONTEND (OBLIGATOIRE - 1h estimée)

### 3.1 - Interface de Gestion des Clients

**Fichier:** `frontend/src/components/ClientManager.js`

**À implémenter:**

1. **Liste des clients**
   - Tableau avec: nom, prénom, téléphone, statut
   - Bouton "Voir détails" pour chaque client
   - Bouton "Nouveau client"

2. **Formulaire de création/modification**
   - Tous les champs du client
   - Validation côté client (temps réel)
   - Messages d'erreur clairs
   - Boutons Annuler/Enregistrer

3. **Validation des formulaires**
   - Téléphone: vérifier format en temps réel
   - Email: vérifier format si fourni
   - Tous champs obligatoires marqués avec *
   - Désactiver le bouton submit si invalide

### 3.2 - Interface de Gestion des Comptes

**Fichier:** `frontend/src/components/CompteManager.js`

**À implémenter:**

1. **Liste des comptes d'un client**
   - Affichage: numéro, type, solde, statut
   - Bouton "Ouvrir un compte"
   - Bouton "Voir transactions" pour chaque compte

2. **Création de compte**
   - Sélection du type (épargne/courant)
   - Confirmation avant création
   - Message de succès avec numéro généré

### 3.3 - Interface de Transactions

**Fichier:** `frontend/src/components/TransactionManager.js`

**À implémenter:**

1. **Formulaire de transaction**
   - Onglets: Dépôt | Retrait | Transfert
   - Champs selon le type:
     - Dépôt: compte, montant, description
     - Retrait: compte, montant, description
     - Transfert: compte source, compte destination, montant, description
   - Vérification du solde en temps réel pour retrait/transfert
   - Affichage du nouveau solde prévu

2. **Historique des transactions**
   - Tableau: date, type, montant, description, statut
   - Filtrage par type
   - Indicateur visuel: vert pour dépôt, rouge pour retrait

### 3.4 - UX/UI

**Exigences:**
- Design responsive (mobile-first)
- Messages de feedback clairs (succès/erreur)
- Loading states pendant les requêtes API
- Confirmation avant actions destructives
- Navigation intuitive entre les sections

**Suggestions de librairies (optionnel):**
- CSS: Bootstrap, Tailwind, ou CSS vanilla
- Icons: Font Awesome, Feather Icons
- Forms: Aucune librairie requise, validation native

---

## PARTIE 4: DOCUMENTATION (OBLIGATOIRE - 30min estimée)

### 4.1 - Documentation API (`docs/API.md`)

**À rédiger EN ANGLAIS:**

Pour chaque endpoint:
- URL et méthode HTTP
- Description
- Paramètres (body, query, params)
- Exemple de requête
- Exemple de réponse (succès et erreur)

**Template:**

```markdown
### Create New Client

**Endpoint:** `POST /api/clients`

**Description:** Creates a new client in the system

**Request Body:**
```json
{
  "nom": "Ouedraogo",
  "prenom": "Aminata",
  "telephone": "+226 70 12 34 56",
  "email": "aminata@email.com",
  "adresse": "Ouagadougou, Secteur 15"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "nom": "Ouedraogo",
    ...
  }
}
```

**Error Response (400):**
```json
{
  "error": true,
  "message": "Invalid phone number format",
  "code": "INVALID_PHONE"
}
```
```

### 4.2 - Architecture (`docs/ARCHITECTURE.md`)

**À rédiger EN ANGLAIS:**

Expliquer:
1. **Project Structure** - Organisation des dossiers
2. **Data Flow** - Comment les données circulent
3. **Technology Choices** - Pourquoi ces technologies
4. **Design Patterns** - Patterns utilisés
5. **Security Considerations** - Aspects sécurité
6. **Possible Improvements** - Ce qui pourrait être amélioré

### 4.3 - Bugs Fixed (`docs/BUGS_FIXED.md`)

Documenter les 5 bugs trouvés et corrigés (voir Partie 1)

---

## PARTIE 5: BONUS (OPTIONNEL - +points)

### 5.1 - Tests Unitaires

**Backend Tests** (`backend/tests/`)
- Tests pour les validations
- Tests pour les routes API
- Tests pour la logique métier

Utiliser le framework de votre choix (Jest, Mocha, etc.)

**Minimum requis pour les points bonus:**
- Au moins 10 tests
- Coverage > 60%

### 5.2 - Fonctionnalités Avancées

**Idées** (choisir 1-2):

1. **Dashboard statistiques**
   - Total des clients actifs
   - Somme des soldes
   - Nombre de transactions du jour
   - Graphiques simples

2. **Recherche et filtres**
   - Recherche de clients par nom/téléphone
   - Filtrage des transactions par date/type
   - Tri des tableaux

3. **Export de données**
   - Export de la liste des clients (CSV)
   - Export de l'historique des transactions (CSV)

4. **Notifications**
   - Alertes pour solde faible
   - Notifications de transaction réussie
   - Système de toast messages

5. **Multi-devises**
   - Support de EUR, USD en plus de XOF
   - Conversion automatique
   - Taux de change fixe ou dynamique

### 5.3 - Améliorations UX/UI

- Animations et transitions fluides
- Dark mode
- Accessibilité (ARIA labels, navigation clavier)
- Progressive Web App (PWA)
- Offline-first avec cache

---

## Critères d'Évaluation Détaillés

### Code Quality (30 points)

- [ ] Code bien organisé et structuré (5 pts)
- [ ] Nommage cohérent et descriptif (5 pts)
- [ ] Commentaires pertinents (5 pts)
- [ ] Pas de code dupliqué (5 pts)
- [ ] Gestion des erreurs appropriée (5 pts)
- [ ] Respect des conventions JavaScript (5 pts)

### Functionality (25 points)

- [ ] Tous les endpoints API fonctionnent (10 pts)
- [ ] L'interface frontend est complète (8 pts)
- [ ] Les validations fonctionnent correctement (4 pts)
- [ ] Pas de bugs critiques (3 pts)

### Debugging (20 points)

- [ ] Les 5 bugs ont été trouvés (10 pts)
- [ ] Les corrections sont appropriées (5 pts)
- [ ] Documentation des bugs claire (5 pts)

### Documentation (15 points)

- [ ] Documentation API complète et claire (6 pts)
- [ ] Architecture bien expliquée (5 pts)
- [ ] README avec instructions claires (4 pts)

### Tests (10 points)

- [ ] Au moins quelques tests basiques (5 pts)
- [ ] Tests pertinents et bien écrits (3 pts)
- [ ] Bonne couverture (2 pts)

### Points Bonus (max 20 points)

- [ ] Fonctionnalités avancées (+5-10 pts)
- [ ] Excellent UX/UI (+5 pts)
- [ ] Tests exhaustifs (+5 pts)
- [ ] Créativité et innovation (+5 pts)

**Total possible:** 100 points + 20 bonus = 120 points

**Seuil de réussite:** 70/100

---

## Conseils pour Réussir

### À FAIRE:

1. **Lire toutes les instructions** avant de commencer
2. **Tester régulièrement** votre code
3. **Commencer par le debugging** (points faciles)
4. **Implémenter les features de base** avant les bonus
5. **Documenter au fur et à mesure** (pas à la fin)
6. **Gérer votre temps** (voir estimations par partie)
7. **Commiter régulièrement** si vous utilisez Git

### À ÉVITER:

1. **Ne pas copier-coller** sans comprendre
2. **Ne pas ignorer** les validations
3. **Ne pas oublier** la gestion des erreurs
4. **Ne pas négliger** la documentation
5. **Ne pas perdre du temps** sur les bonus avant d'avoir fini l'essentiel
6. **Ne pas utiliser** de frameworks lourds (React, Vue) sauf si explicitement autorisé

### 🤖 Utilisation d'IA:

**Autorisé:**
- Utiliser ChatGPT/Copilot pour comprendre des concepts
- Demander de l'aide sur la syntaxe
- Débugger des erreurs spécifiques

**Non autorisé / Pénalisé:**
- Copier-coller l'énoncé entier dans l'IA
- Utiliser du code généré sans le comprendre ni l'adapter
- Soumettre du code générique non personnalisé

**Conseil:** Si vous utilisez l'IA, documentez-le dans `TEMPS_PASSE.txt` et montrez que vous avez adapté et compris le code.

---

## Questions Fréquentes

**Q: Puis-je utiliser TypeScript?**
R: Oui, mais ce n'est pas obligatoire. JavaScript vanilla est suffisant.

**Q: Puis-je utiliser une vraie base de données (MongoDB, PostgreSQL)?**
R: Non pour ce test. Utilisez le stockage en mémoire demandé pour la simplicité.

**Q: Combien de temps dois-je vraiment passer?**
R: L'estimation totale est 3-4h. Si vous dépassez 5h, arrêtez-vous et soumettez ce que vous avez.

**Q: Que faire si je ne trouve pas tous les bugs?**
R: Documentez ceux que vous trouvez. Trouvez-en au moins 3 sur 5 pour avoir des points.

**Q: L'interface doit être belle?**
R: La fonctionnalité prime sur l'esthétique, mais une interface propre et utilisable est attendue.

**Q: Puis-je ajouter des fonctionnalités non demandées?**
R: Oui, mais seulement après avoir complété toutes les fonctionnalités obligatoires.

---

**Dernière mise à jour:** 2025-01-03

**Bon courage! Nous avons hâte de voir votre travail! 🚀**
