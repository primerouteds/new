# Prime Route — Delivery Management System

A complete, Firebase-powered delivery management web app with admin and driver portals.

---

## Quick Start

### 1. Create a Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and create a new project.
2. Enable **Authentication → Email/Password** sign-in method.
3. Enable **Firestore Database** in production mode.
4. Enable **Firebase Hosting** (optional, for deployment).

### 2. Add Your Firebase Config

Open `js/firebase.js` and replace the placeholder values with your project's config:

```js
const firebaseConfig = {
  apiKey:            "...",
  authDomain:        "...",
  projectId:         "...",
  storageBucket:     "...",
  messagingSenderId: "...",
  appId:             "..."
};
```

Find this in: **Firebase Console → Project Settings → General → Your Apps → SDK setup**.

### 3. Deploy Firestore Rules

In the Firebase Console → Firestore → Rules, paste the contents of `firestore.rules`.

Or use the Firebase CLI:
```bash
npm install -g firebase-tools
firebase login
firebase init
firebase deploy --only firestore:rules
```

### 4. Set Up Your First Admin Account

Open `setup.html` in your browser (either locally or after deploying).

- Enter a name, email, and password.
- Click **Create Admin Account**.
- You will be redirected to login.

> ⚠ **Delete or restrict access to `setup.html` after creating your first admin account.**

### 5. Deploy to Firebase Hosting (optional)

```bash
firebase deploy --only hosting
```

Or upload the files via the Firebase Console.

---

## Pages

| Page | URL | Access |
|------|-----|--------|
| Landing | `index.html` | Public |
| Login | `login.html` | Public |
| Public Tracker | `tracking.html` | Public |
| First-Time Setup | `setup.html` | One-time |
| Admin Dashboard | `admin/dashboard.html` | Admin only |
| Admin Shipments | `admin/shipments.html` | Admin only |
| Admin Drivers | `admin/drivers.html` | Admin only |
| Driver Portal | `driver/dashboard.html` | Driver only |

---

## Adding Drivers

### Method A — From Admin UI
Go to **Admin → Drivers → Add Driver**. 
> ⚠ Firebase Client SDK limitation: creating a new user with `createUserWithEmailAndPassword` signs out the current user. After creating a driver, you will be redirected to login. Sign back in as admin.

### Method B — Firebase Console (Recommended)
1. Firebase Console → Authentication → Add User → enter email + password.
2. Note the new user's UID.
3. Firebase Console → Firestore → Collection `users` → Add document with ID = the UID:
   ```json
   {
     "name": "Driver Name",
     "email": "driver@company.com",
     "phone": "+1 555 000 0000",
     "role": "driver"
   }
   ```

---

## Shipment Statuses

| Status | Meaning |
|--------|---------|
| `pending` | Created, not yet assigned |
| `picked_up` | Driver assigned and picked up |
| `in_transit` | On the way |
| `out_for_delivery` | Last-mile delivery in progress |
| `delivered` | Successfully delivered |
| `failed` | Delivery attempt failed |
| `cancelled` | Cancelled |

---

## Tech Stack

- **Frontend**: Vanilla HTML/CSS/JS — no build step required
- **Backend**: Firebase (Auth + Firestore)
- **Hosting**: Firebase Hosting
- **SDK**: Firebase v10 Modular (CDN, ES Modules)

---

## File Structure

```
├── index.html              # Public landing page
├── login.html              # Login page
├── tracking.html           # Public shipment tracker
├── setup.html              # First-time admin setup (delete after use)
├── css/
│   ├── variables.css       # Design tokens / CSS variables
│   └── main.css            # Full design system
├── js/
│   ├── firebase.js         # ← EDIT THIS with your config
│   ├── auth.js             # Authentication helpers
│   ├── utils.js            # Utilities, toast, helpers
│   ├── shipments.js        # Shipment CRUD operations
│   ├── admin.js            # Admin operations (driver management)
│   ├── driver.js           # Driver operations
│   └── tracking.js         # Public tracking
├── admin/
│   ├── dashboard.html      # Admin overview & stats
│   ├── shipments.html      # Manage all shipments
│   └── drivers.html        # Manage drivers
├── driver/
│   └── dashboard.html      # Driver's delivery portal
├── firebase.json           # Firebase Hosting config
├── firestore.rules         # Firestore security rules
└── storage.rules           # Storage security rules (unused)
```
