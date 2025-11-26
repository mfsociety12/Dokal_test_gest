# Architecture Documentation

## 1. Project Structure

- `backend/`
  - `server.js`: Express application bootstrap, middleware, and route registration.
  - `database.js`: In-memory data store for `clients`, `comptes`, and `transactions`, with simple CRUD helpers.
  - `routes/clients.js`: HTTP routes and validation logic for clients.
  - `routes/comptes.js`: HTTP routes and validation logic for accounts.
  - `routes/transactions.js`: HTTP routes, balance updates, and simple locking for transactions.
- `frontend/`
  - `index.html`: Single-page layout with containers for each view (clients, accounts, transactions).
  - `src/api.js`: API client responsible for HTTP communication with the backend.
  - `src/app.js`: Application shell (navigation, view switching, global state).
  - `src/components/ClientManager.js`: UI logic for managing clients (list, form, validation).
  - `src/components/CompteManager.js`: UI logic for managing accounts of a selected client.
  - `src/components/TransactionManager.js`: UI logic for deposits, withdrawals, transfers, and history.
  - `styles/main.css`: Base styling, layout, tables, forms, and responsive rules.
- `docs/`
  - `API.md`: API documentation.
  - `ARCHITECTURE.md`: This architecture document.
  - `BUGS_FIXED.md`: Description of fixed bugs in the assessment.

---

## 2. Data Flow

1. The user interacts with the frontend (buttons, forms, navigation).
2. A frontend component (`ClientManager`, `CompteManager`, or `TransactionManager`) calls a function in `api.js`.
3. `api.js` builds an HTTP request to the backend using `fetch` and a common `apiRequest` helper.
4. The Express backend receives the request on a route in `routes/*.js`.
5. The route validates the input, uses `database.js` to read or mutate in-memory collections, then returns a JSON response.
6. The frontend receives the JSON, updates internal state and re-renders the DOM (using template strings and `innerHTML`).
7. Any errors are displayed to the user via `showError`, and success states via `showSuccess`.

Conceptual diagram:

```text
[User] -> [Frontend Component] -> [api.js] -> [Express Route] -> [database.js]
[User] <- [Frontend Component] <- [api.js] <- [Express Route] <+
```

---

## 3. Technology Choices

**Backend:**

- **Node.js + Express**
  - Lightweight, widely used for REST APIs.
  - Easy to set up and understand in an assessment context.
  - Middleware pattern fits well for logging and error handling.
- **In-memory database (plain JavaScript objects)**
  - No external dependencies (e.g., PostgreSQL or MongoDB) to keep the project easy to run.
  - Good enough for demonstrating data modeling and business logic.

**Frontend:**

- **Vanilla JavaScript + DOM APIs**
  - Avoids the overhead of frameworks like React or Vue.
  - Shows understanding of fundamental web concepts (events, state, DOM updates).
- **Simple SPA pattern**
  - `app.js` manages navigation and global state; components manage their own rendering.
  - Good balance between simplicity and structure.

**Styling:**

- **Custom CSS (`styles/main.css`)**
  - No CSS framework required.
  - Enough for a responsive, clean UI with minimal dependencies.

---

## 4. Design Patterns

- **Module pattern**:
  - Each backend route file (`clients.js`, `comptes.js`, `transactions.js`) exports an Express router as a module.
  - Each frontend component (`ClientManager`, `CompteManager`, `TransactionManager`) is implemented as a JS object with methods, exported from its module.
- **Separation of concerns**:
  - Routing and HTTP-level concerns live in `routes/*.js`.
  - Data storage and low-level operations live in `database.js`.
  - UI logic is in frontend component modules; networking is isolated in `api.js`.
- **Factory-style object creation**:
  - New clients, accounts, and transactions are constructed as plain objects at the moment they are created, using helpers (`uuidv4`, `generateNumeroCompte`).
- **Centralized error handling**:
  - A global Express error handler in `server.js` ensures a consistent error format.
- **Simple locking pattern for concurrency**:
  - `transactions.js` uses a `Map` of account locks to prevent concurrent balance updates on the same account.

---

## 5. Security Considerations

- **Input validation (server-side)**:
  - Clients:
    - Names limited to 2–50 characters with only letters and basic accents.
    - Phone number must match the Burkina Faso format: `+226 XX XX XX XX`.
    - Email validated against a regex when provided.
    - Address required and non-empty.
  - Accounts:
    - `clientId` must refer to an existing, active client.
    - Account type restricted to `"epargne"` or `"courant"`.
  - Transactions:
    - Amount must be numeric, positive, and at least `100 XOF`.
    - Description length capped at 200 characters.
    - Accounts must exist and be active; balance must be sufficient for debits.

- **Input validation (client-side)**:
  - Client creation/edit forms validate phone, email, names, and address in real-time.
  - Submit buttons are disabled when the form is invalid, reducing the chance of bad requests.

- **Error handling without leaking internals**:
  - Errors use a generic structure `{ error, message, code, details }`.
  - Internal stack traces are not exposed to the client.

- **Concurrency and consistency**:
  - Transactions use an account-level lock mechanism to avoid simultaneous updates to the same account balances (prevents race conditions in this in-memory setting).

- **CORS and JSON parsing**:
  - CORS is enabled in a controlled way in `server.js`.
  - JSON bodies are parsed with `express.json()`, and content type is enforced by the frontend.

---