# API Documentation

This document describes the REST API for the Express server.

All responses are JSON.  
Base URL (development): `http://localhost:3000/api`

Common error format:

```json
{
  "error": true,
  "message": "Human readable error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

---

## Clients Endpoints

### Get Clients

**Endpoint:** `GET /api/clients`

**Description:** Returns a list of clients, optionally filtered by status.

**Query Parameters:**

- `statut` (optional, string): `actif | inactif | tous` (default: `actif`)

**Example Request:**

```bash
curl "http://localhost:3000/api/clients?statut=actif"
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "nom": "Ouedraogo",
      "prenom": "Aminata",
      "telephone": "+226 70 12 34 56",
      "email": "aminata@email.com",
      "adresse": "Ouagadougou, Secteur 15",
      "dateCreation": "2025-01-03T10:30:00.000Z",
      "statut": "actif"
    }
  ],
  "count": 1
}
```

**Error Response (500 Internal Server Error):**

```json
{
  "error": true,
  "message": "Internal server error",
  "code": "INTERNAL_ERROR"
}
```

---

### Get Client by ID

**Endpoint:** `GET /api/clients/:id`

**Description:** Retrieves a single client by its ID.

**Path Parameters:**

- `id` (string, required): Client UUID.

**Example Request:**

```bash
curl "http://localhost:3000/api/clients/550e8400-e29b-41d4-a716-446655440000"
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nom": "Ouedraogo",
    "prenom": "Aminata",
    "telephone": "+226 70 12 34 56",
    "email": "aminata@email.com",
    "adresse": "Ouagadougou, Secteur 15",
    "dateCreation": "2025-01-03T10:30:00.000Z",
    "statut": "actif"
  }
}
```

**Error Response (404 Not Found):**

```json
{
  "error": true,
  "message": "Client non trouvé",
  "code": "CLIENT_NOT_FOUND"
}
```

---

### Create New Client

**Endpoint:** `POST /api/clients`

**Description:** Creates a new client in the system.

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

**Example Request:**

```bash
curl -X POST "http://localhost:3000/api/clients" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Ouedraogo",
    "prenom": "Aminata",
    "telephone": "+226 70 12 34 56",
    "email": "aminata@email.com",
    "adresse": "Ouagadougou, Secteur 15"
  }'
```

**Success Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "nom": "Ouedraogo",
    "prenom": "Aminata",
    "telephone": "+226 70 12 34 56",
    "email": "aminata@email.com",
    "adresse": "Ouagadougou, Secteur 15",
    "dateCreation": "2025-01-03T10:30:00.000Z",
    "statut": "actif"
  }
}
```

**Error Response (400 Bad Request):**

```json
{
  "error": true,
  "message": "Données invalides",
  "code": "VALIDATION_ERROR",
  "details": [
    "Le numéro de téléphone doit être au format +226 XX XX XX XX"
  ]
}
```

---

### Update Client

**Endpoint:** `PUT /api/clients/:id`

**Description:** Updates an existing client. `id` and `dateCreation` cannot be modified.

**Path Parameters:**

- `id` (string, required): Client UUID.

**Request Body (partial or full):**

```json
{
  "nom": "Kaboré",
  "telephone": "+226 70 11 22 33",
  "adresse": "Ouagadougou, Secteur 10"
}
```

**Example Request:**

```bash
curl -X PUT "http://localhost:3000/api/clients/550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Kaboré",
    "telephone": "+226 70 11 22 33",
    "adresse": "Ouagadougou, Secteur 10"
  }'
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nom": "Kaboré",
    "prenom": "Aminata",
    "telephone": "+226 70 11 22 33",
    "email": "aminata@email.com",
    "adresse": "Ouagadougou, Secteur 10",
    "dateCreation": "2025-01-03T10:30:00.000Z",
    "statut": "actif"
  }
}
```

**Error Response (404 Not Found or 400 Bad Request):**

```json
{
  "error": true,
  "message": "Client non trouvé",
  "code": "CLIENT_NOT_FOUND"
}
```

or

```json
{
  "error": true,
  "message": "Données invalides",
  "code": "VALIDATION_ERROR",
  "details": [
    "Le prénom doit contenir entre 2 et 50 caractères"
  ]
}
```

---

### Deactivate (Soft Delete) Client

**Endpoint:** `DELETE /api/clients/:id`

**Description:** Marks a client as inactive. Fails if the client has active accounts.

**Path Parameters:**

- `id` (string, required): Client UUID.

**Example Request:**

```bash
curl -X DELETE "http://localhost:3000/api/clients/550e8400-e29b-41d4-a716-446655440000"
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Client désactivé avec succès"
}
```

**Error Response (409 Conflict):**

```json
{
  "error": true,
  "message": "Impossible de supprimer un client avec des comptes actifs",
  "code": "HAS_ACTIVE_ACCOUNTS",
  "details": {
    "activeAccounts": 2
  }
}
```

---

## Accounts (Comptes) Endpoints

### Create Account

**Endpoint:** `POST /api/comptes`

**Description:** Creates a new bank account for a client with initial balance 0.

**Request Body:**

```json
{
  "clientId": "client-uuid-here",
  "type": "epargne"
}
```

- `clientId` (string, required): Existing active client ID.
- `type` (string, optional): `"epargne"` or `"courant"` (default: `"epargne"`).

**Example Request:**

```bash
curl -X POST "http://localhost:3000/api/comptes" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "550e8400-e29b-41d4-a716-446655440000",
    "type": "courant"
  }'
```

**Success Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "account-uuid",
    "clientId": "550e8400-e29b-41d4-a716-446655440000",
    "numeroCompte": "BF-12345-67890",
    "solde": 0,
    "devise": "XOF",
    "type": "courant",
    "dateOuverture": "2025-01-03T11:00:00.000Z",
    "statut": "actif"
  }
}
```

**Error Response (400 Bad Request):**

```json
{
  "error": true,
  "message": "Données invalides",
  "code": "VALIDATION_ERROR",
  "details": [
    "Le client spécifié n'existe pas"
  ]
}
```

---

### Get Accounts for a Client

**Endpoint:** `GET /api/comptes/client/:clientId`

**Description:** Lists all accounts for a given client.

**Path Parameters:**

- `clientId` (string, required): Client UUID.

**Example Request:**

```bash
curl "http://localhost:3000/api/comptes/client/550e8400-e29b-41d4-a716-446655440000"
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "account-uuid",
      "clientId": "550e8400-e29b-41d4-a716-446655440000",
      "numeroCompte": "BF-12345-67890",
      "solde": 50000,
      "devise": "XOF",
      "type": "epargne",
      "dateOuverture": "2025-01-03T11:00:00.000Z",
      "statut": "actif"
    }
  ],
  "count": 1
}
```

---

### Get Account by ID

**Endpoint:** `GET /api/comptes/:id`

**Description:** Retrieves a single account by its ID.

**Path Parameters:**

- `id` (string, required): Account UUID.

**Example Request:**

```bash
curl "http://localhost:3000/api/comptes/account-uuid"
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "account-uuid",
    "clientId": "550e8400-e29b-41d4-a716-446655440000",
    "numeroCompte": "BF-12345-67890",
    "solde": 50000,
    "devise": "XOF",
    "type": "epargne",
    "dateOuverture": "2025-01-03T11:00:00.000Z",
    "statut": "actif"
  }
}
```

**Error Response (404 Not Found):**

```json
{
  "error": true,
  "message": "Compte non trouvé",
  "code": "COMPTE_NOT_FOUND"
}
```

---

### Update Account Status

**Endpoint:** `PUT /api/comptes/:id/statut`

**Description:** Changes the status of an account to active or closed. An account can only be closed if its balance is zero.

**Path Parameters:**

- `id` (string, required): Account UUID.

**Request Body:**

```json
{
  "statut": "fermé"
}
```

- `statut` must be `"actif"` or `"fermé"`.

**Example Request:**

```bash
curl -X PUT "http://localhost:3000/api/comptes/account-uuid/statut" \
  -H "Content-Type: application/json" \
  -d '{ "statut": "fermé" }'
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "account-uuid",
    "statut": "fermé",
    "solde": 0,
    "devise": "XOF",
    "numeroCompte": "BF-12345-67890",
    "clientId": "550e8400-e29b-41d4-a716-446655440000",
    "type": "epargne",
    "dateOuverture": "2025-01-03T11:00:00.000Z"
  }
}
```

**Error Response (409 Conflict):**

```json
{
  "error": true,
  "message": "Impossible de fermer un compte avec un solde non nul",
  "code": "NON_ZERO_BALANCE",
  "details": {
    "currentBalance": 2500
  }
}
```

---

## Transactions Endpoints

### Make a Deposit

**Endpoint:** `POST /api/transactions/depot`

**Description:** Performs a deposit on an active account.

**Request Body:**

```json
{
  "compteId": "account-uuid",
  "montant": 10000,
  "description": "Dépôt guichet"
}
```

**Example Request:**

```bash
curl -X POST "http://localhost:3000/api/transactions/depot" \
  -H "Content-Type: application/json" \
  -d '{
    "compteId": "account-uuid",
    "montant": 10000,
    "description": "Dépôt guichet"
  }'
```

**Success Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "transaction-uuid",
    "compteId": "account-uuid",
    "type": "depot",
    "montant": 10000,
    "devise": "XOF",
    "description": "Dépôt guichet",
    "dateTransaction": "2025-01-03T12:00:00.000Z",
    "statut": "reussie"
  },
  "nouveauSolde": 60000
}
```

**Error Response (400 Bad Request):**

```json
{
  "error": true,
  "message": "Données invalides",
  "code": "VALIDATION_ERROR",
  "details": [
    "Le montant minimum est de 100 XOF"
  ]
}
```

---

### Make a Withdrawal

**Endpoint:** `POST /api/transactions/retrait`

**Description:** Performs a withdrawal from an active account if sufficient balance is available.

**Request Body:**

```json
{
  "compteId": "account-uuid",
  "montant": 5000,
  "description": "Retrait guichet"
}
```

**Example Request:**

```bash
curl -X POST "http://localhost:3000/api/transactions/retrait" \
  -H "Content-Type: application/json" \
  -d '{
    "compteId": "account-uuid",
    "montant": 5000,
    "description": "Retrait guichet"
  }'
```

**Success Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "transaction-uuid",
    "compteId": "account-uuid",
    "type": "retrait",
    "montant": 5000,
    "devise": "XOF",
    "description": "Retrait guichet",
    "dateTransaction": "2025-01-03T12:30:00.000Z",
    "statut": "reussie"
  },
  "nouveauSolde": 45000
}
```

**Error Response (400 Bad Request – insufficient balance):**

```json
{
  "error": true,
  "message": "Solde insuffisant",
  "code": "INSUFFICIENT_BALANCE",
  "details": {
    "soldeActuel": 2000,
    "montantDemande": 5000
  }
}
```

---

### Make a Transfer

**Endpoint:** `POST /api/transactions/transfert`

**Description:** Transfers money between two different active accounts.

**Request Body:**

```json
{
  "compteSourceId": "source-account-uuid",
  "compteDestinataireId": "dest-account-uuid",
  "montant": 10000,
  "description": "Transfert interne"
}
```

**Example Request:**

```bash
curl -X POST "http://localhost:3000/api/transactions/transfert" \
  -H "Content-Type: application/json" \
  -d '{
    "compteSourceId": "source-account-uuid",
    "compteDestinataireId": "dest-account-uuid",
    "montant": 10000,
    "description": "Transfert interne"
  }'
```

**Success Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "debit": {
      "id": "debit-tx-uuid",
      "compteId": "source-account-uuid",
      "type": "transfert",
      "montant": -10000,
      "devise": "XOF",
      "description": "Transfert vers BF-99999-99999",
      "dateTransaction": "2025-01-03T13:00:00.000Z",
      "compteDestinataireId": "dest-account-uuid",
      "statut": "reussie"
    },
    "credit": {
      "id": "credit-tx-uuid",
      "compteId": "dest-account-uuid",
      "type": "transfert",
      "montant": 10000,
      "devise": "XOF",
      "description": "Transfert de BF-12345-67890",
      "dateTransaction": "2025-01-03T13:00:00.000Z",
      "compteSourceId": "source-account-uuid",
      "statut": "reussie"
    }
  },
  "nouveauSoldeSource": 40000,
  "nouveauSoldeDestinataire": 70000
}
```

**Error Response (400 Bad Request – same account or invalid data):**

```json
{
  "error": true,
  "message": "Données invalides",
  "code": "VALIDATION_ERROR",
  "details": [
    "Les comptes source et destinataire doivent être différents"
  ]
}
```

---

### Get Transactions for an Account

**Endpoint:** `GET /api/transactions/compte/:compteId`

**Description:** Returns the transaction history for an account, sorted from newest to oldest.

**Path Parameters:**

- `compteId` (string, required): Account UUID.

**Query Parameters:**

- `limit` (optional, number): Maximum number of transactions (default: `50`).

**Example Request:**

```bash
curl "http://localhost:3000/api/transactions/compte/account-uuid?limit=20"
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "tx-uuid",
      "compteId": "account-uuid",
      "type": "depot",
      "montant": 50000,
      "devise": "XOF",
      "description": "Dépôt initial",
      "dateTransaction": "2025-01-03T11:00:00.000Z",
      "statut": "reussie"
    }
  ],
  "count": 1
}
```

**Error Response (404 Not Found – account missing):**

```json
{
  "error": true,
  "message": "Compte non trouvé",
  "code": "COMPTE_NOT_FOUND"
}
```

---

### Get Transaction by ID

**Endpoint:** `GET /api/transactions/:id`

**Description:** Retrieves a single transaction by its ID.

**Path Parameters:**

- `id` (string, required): Transaction UUID.

**Example Request:**

```bash
curl "http://localhost:3000/api/transactions/tx-uuid"
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "tx-uuid",
    "compteId": "account-uuid",
    "type": "depot",
    "montant": 50000,
    "devise": "XOF",
    "description": "Dépôt initial",
    "dateTransaction": "2025-01-03T11:00:00.000Z",
    "statut": "reussie"
  }
}
```

**Error Response (404 Not Found):**

```json
{
  "error": true,
  "message": "Transaction non trouvée",
  "code": "TRANSACTION_NOT_FOUND"
}
```

---

## Error Codes Reference

Common error codes used in the API:

- `VALIDATION_ERROR` – Request data failed validation.
- `CLIENT_NOT_FOUND` – Client with specified ID does not exist.
- `COMPTE_NOT_FOUND` – Account with specified ID does not exist.
- `TRANSACTION_NOT_FOUND` – Transaction with specified ID does not exist.
- `HAS_ACTIVE_ACCOUNTS` – Cannot deactivate a client that has active accounts.
- `NON_ZERO_BALANCE` – Cannot close an account whose balance is not zero.
- `INSUFFICIENT_BALANCE` – Withdrawal/transfer amount exceeds account balance.
- `INVALID_STATUS` – Invalid account status value.
- `ACCOUNT_LOCKED` – Another transaction is already in progress on the account(s).
- `COMPTE_INACTIVE`, `SOURCE_COMPTE_INACTIVE`, `DEST_COMPTE_INACTIVE` – Account is not active.
- `INTERNAL_ERROR` – Generic server-side error.

---