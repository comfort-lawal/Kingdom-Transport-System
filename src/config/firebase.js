import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD5RSTMP0X-uI70_YhPRRmh0-QJnPConP4",
  authDomain: "kingdom-collaboration.firebaseapp.com",
  projectId: "kingdom-collaboration",
  storageBucket: "kingdom-collaboration.firebasestorage.app",
  messagingSenderId: "935462436464",
  appId: "1:935462436464:web:1bb449b3ee0212e9d63eb5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

**Step 3 — Save** (Cmd + S) and close TextEdit.

**Step 4 — Rebuild:**
```
npm run build
