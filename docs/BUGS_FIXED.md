## Bug #1: Server initialization failure

**Description:** The backend server crashed on startup with error "TypeError: app.use is not a function".

**Root cause:** In backend/server.js, the code used const app = express instead of calling the function by adding brackets like that : express().

**Solution:** I added brackets to correctly call the function express().

**How I found it:** I immediatly noticed this error when I was reading the code and saw that "BUG #1: This line will cause issues - can you spot it?".

**Files Modified:** backend/server.js

**Code Changes:** 
// BEFORE
const app = express;

// AFTER
const app = express();



## Bug #2: Phone number validation

**Description:** The backend accepted invalid phone numbers like "abc123".

**Root cause:** This phone number validation only used a length validation which doesn't guarantee a valid phone number validation.

**Solution:** I replaced the length validation by a phone number regex validation.

**How I found it:** I noticed that the only validation made was about yhe phone number length when we usually use regex for this kind of validation.

**Files Modified:** backend/routes/clients.js

**Code Changes:** 
// BEFORE
if (data.telephone && data.telephone.length < 3) {
  errors.push('Le numéro de téléphone est invalide');
}

// AFTER
const phoneRegex = /^\+226\s\d{2}\s\d{2}\s\d{2}\s\d{2}$/;
if (data.telephone && !phoneRegex.test(data.telephone)) {
  errors.push('Le numéro de téléphone doit être au format +226 XX XX XX XX');
}




## Bug #3: Incorrect balance calculation

**Description:** The account balance was not correct after transactions.

**Root cause:** In backend/routes/transactions.js, the updateAccountBalance function was subtracting money from the account balance when the operation was a credit instead of adding some money.

**Solution:** I changed the balance update logic to make credits operations add to the balance and debits ones subtract from the balance.

**How I found it:** When I was checking the updateAccountBalance implementation in backend/routes/transactions.js, I noticed that the comments in the file explicitly mentionned that the logic was reversed.

**Files Modified:** backend/routes/transactions.js

**Code Changes:** 
// BEFORE
if (isCredit) {
  newSolde = compte.solde - montant;
} else {
  newSolde = compte.solde + montant;
}

// AFTER
if (isCredit) {
  newSolde = compte.solde + montant;
} else {
  newSolde = compte.solde - montant;
}




## Bug #4: API request error

**Description:** Frontend POST/PUT requests to the backend were failing. The backend did not correctly receive or parse the JSON body, leading to validation errors or missing data.

**Root cause:** In frontend/src/api.js, the apiRequest helper did not set the Content-Type header and did not stringify the request body for non‑GET requests and without Content-Type: application/json and JSON.stringify, Express JS could not parse the JSON payload.

**Solution:** I updated the request configuration to include the proper headers and to stringify the body for non‑GET requests:

**How I found it:** I saw the bug description in INSTRUCTIONS.md and then inspected frontend/src/api.js. The comments around BUG #4 clearly mentionned missing headers and the lack of JSON.stringify.

**Files Modified:** frontend/src/api.js

**Code Changes:** 
// BEFORE
const config = {
    method: options.method || 'GET',
    // Missing headers! Should include Content-Type: application/json
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
};
// Only add body if it's not a GET request
if (config.method !== 'GET' && options.body) {
    // BUG #4: The body is not being stringified!
    // JSON data needs to be converted to a string
    config.body = options.body; // Should be JSON.stringify(options.body)
}


// AFTER
const config = {
    method: options.method || 'GET',
    // Missing headers! Should include Content-Type: application/json
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
};

// Only add body if it's not a GET request
if (config.method !== 'GET' && options.body) {
// BUG #4: The body is not being stringified!
// JSON data needs to be converted to a string
config.body = JSON.stringify(options.body); // Should be JSON.stringify(options.body)
}




## Bug #5: Race condition in concurrent transactions

**Description:** When two transactions were executed simultaneously on the same account, the final balance could become inconsistent.

**Root cause:** The simple lock mechanism in backend/routes/transactions.js was not actually implemented. The acquireLock function always returned true, and releaseLock did nothing: This meant that multiple concurrent requests could modify the same account balance at the same time, causing race conditions.

**Solution:** I implemented a basic in‑memory lock using the existing accountLocks map: This ensures that only one transaction at a time can modify a given account; other transactions receive a 409 error until the lock is released.

**How I found it:** I followed the instructions in INSTRUCTIONS.md and read the comments in backend/routes/transactions.js around BUG #5. The comment explicitly stated that the locking was not implemented and that acquireLock always returned true. From there, I used the existing accountLocks map to implement a simple lock/unlock mechanism.

**Files Modified:** backend/routes/transactions.js

**Code Changes:** 
// BEFORE 
function acquireLock(compteId) {
    // TODO: Fix Bug #5 - Implement proper locking
    // Currently this doesn't actually prevent race conditions
    // Hint: Check if lock exists, if not create it, if exists return false
    return true; // This always returns true - that's the bug!
}

function releaseLock(compteId) {
    // TODO: Fix Bug #5 - Implement proper lock release
    // Hint: Remove the lock from the accountLocks map
}


// AFTER
function acquireLock(compteId) {
    // TODO: Fix Bug #5 - Implement proper locking
    // Currently this doesn't actually prevent race conditions
    // Hint: Check if lock exists, if not create it, if exists return false
    if (accountLocks.has(compteId)) {
        return false; // Lock already taken
    }
    accountLocks.set(compteId, true);
    return true;
}

function releaseLock(compteId) {
    // TODO: Fix Bug #5 - Implement proper lock release
    // Hint: Remove the lock from the accountLocks map
    accountLocks.delete(compteId);
}