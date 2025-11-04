# API Documentation

**TO BE COMPLETED BY CANDIDATE IN ENGLISH**

This file should document all the API endpoints you've implemented.

## Instructions

For each endpoint, provide:
- HTTP method and URL
- Description of what it does
- Request parameters (query, body, path)
- Example request
- Example success response
- Example error response(s)

---

## Template Example

### Create New Client

**Endpoint:** `POST /api/clients`

**Description:** Creates a new client in the system with the provided information.

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

**Success Response (201 Created):**
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

**Error Response (400 Bad Request):**
```json
{
  "error": true,
  "message": "Données invalides",
  "code": "VALIDATION_ERROR",
  "details": [
    "Le numéro de téléphone est invalide"
  ]
}
```

---

## Your API Documentation

### Clients Endpoints

#### GET /api/clients
**TODO: Document this endpoint**

#### GET /api/clients/:id
**TODO: Document this endpoint**

#### POST /api/clients
**TODO: Document this endpoint**

#### PUT /api/clients/:id
**TODO: Document this endpoint**

#### DELETE /api/clients/:id
**TODO: Document this endpoint**

---

### Comptes (Accounts) Endpoints

#### POST /api/comptes
**TODO: Document this endpoint**

#### GET /api/comptes/client/:clientId
**TODO: Document this endpoint**

#### GET /api/comptes/:id
**TODO: Document this endpoint**

#### PUT /api/comptes/:id/statut
**TODO: Document this endpoint**

---

### Transactions Endpoints

#### POST /api/transactions/depot
**TODO: Document this endpoint**

#### POST /api/transactions/retrait
**TODO: Document this endpoint**

#### POST /api/transactions/transfert
**TODO: Document this endpoint**

#### GET /api/transactions/compte/:compteId
**TODO: Document this endpoint**

#### GET /api/transactions/:id
**TODO: Document this endpoint**

---

## Error Codes Reference

**TODO: List all error codes used in your API**

Example:
- `VALIDATION_ERROR` - Data validation failed
- `CLIENT_NOT_FOUND` - Client with specified ID does not exist
- `COMPTE_NOT_FOUND` - Account with specified ID does not exist
- etc.

---

## Notes

**TODO: Add any additional notes about your API**

Example topics:
- Rate limiting (if implemented)
- Authentication (if implemented)
- Data formats
- Timezone handling
- Currency handling
