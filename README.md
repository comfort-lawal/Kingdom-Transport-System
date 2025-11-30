# 🛺 Keke Investment Collaboration Dashboard

A modern, real-time dashboard for tracking your Keke investment collaboration. Built with React, Firebase, and Tailwind CSS.

![Dashboard Preview](preview.png)

## Features

- ✅ **Real-time Updates** - See changes instantly across all devices
- 📊 **Progress Ring** - Visual progress toward next Keke purchase
- ⏱️ **Live Countdown** - Time remaining until next purchase
- 👥 **Collaborator Breakdown** - Individual share calculations
- 📱 **Mobile Responsive** - Works perfectly on all devices
- 🔐 **Secure Authentication** - Login for each collaborator
- 📈 **Keke Timeline** - Track all purchases and their status

---

## 🚀 Quick Setup Guide

### Step 1: Create Firebase Project (Free)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"**
3. Enter project name: `keke-collaboration` (or any name)
4. Disable Google Analytics (optional, not needed)
5. Click **Create project**

### Step 2: Enable Authentication

1. In Firebase Console, click **Authentication** (left sidebar)
2. Click **Get started**
3. Click **Email/Password**
4. Toggle **Enable** to ON
5. Click **Save**

### Step 3: Create Firestore Database

1. Click **Firestore Database** (left sidebar)
2. Click **Create database**
3. Select **Start in test mode** (we'll secure it later)
4. Choose a location closest to Nigeria (e.g., `eur3` or `europe-west1`)
5. Click **Enable**

### Step 4: Register Web App

1. In Project Overview, click the **Web icon** `</>`
2. Enter app nickname: `keke-dashboard`
3. ✅ Check "Also set up Firebase Hosting" (optional but recommended)
4. Click **Register app**
5. **COPY the firebaseConfig object** - you'll need this!

It looks like this:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy.....................",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123..."
};
```

### Step 5: Configure Your App

1. Open `src/config/firebase.js`
2. Replace the placeholder config with YOUR values from Step 4:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Step 6: Secure Your Database

In Firebase Console → Firestore → Rules, replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // All authenticated users can read/write kekes and payments
    match /kekes/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    match /payments/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Click **Publish**.

---

## 💻 Local Development

### Prerequisites
- Node.js 18+ installed ([Download](https://nodejs.org/))

### Install & Run

```bash
# Navigate to project folder
cd keke-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🌐 Deploy to Netlify (Free)

### Option A: Netlify CLI (Recommended)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build the project
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

### Option B: Netlify Web Interface

1. Build your project:
   ```bash
   npm run build
   ```

2. Go to [Netlify](https://app.netlify.com/)
3. Sign up/Login with GitHub
4. Drag and drop the `dist` folder to deploy

### Option C: Connect GitHub Repository

1. Push your code to GitHub
2. Go to [Netlify](https://app.netlify.com/)
3. Click **"Add new site"** → **"Import an existing project"**
4. Connect your GitHub repo
5. Set build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click **Deploy**

---

## 👥 Adding Collaborators

1. Share the deployed URL with your 4 collaborators
2. Each person clicks **"Sign up"**
3. They enter their name, email, and password
4. Once logged in, they can view the dashboard

---

## 📊 How It Works

### Investment Parameters (Pre-configured)

| Parameter | Value |
|-----------|-------|
| Original Kekes (1-4) | ₦75,000/week for 75 weeks |
| New Kekes (5+) | ₦125,000/week for 52 weeks |
| New Keke Cost | ₦5,000,000 |
| Target | 12 Active Kekes |
| Collaborators | 4 people |
| Start Date | October 20, 2025 |
| Holiday Weeks | Christmas & New Year (no returns) |

### Dashboard Shows

- **Progress Ring**: Visual % toward next ₦5M
- **Countdown Timer**: Estimated time to next purchase
- **Weekly Income**: Current total from all active Kekes
- **Your Share**: Your weekly portion (total ÷ 4)
- **Keke Timeline**: All Kekes with purchase/expiry dates

---

## 🔧 Customization

### Change Investment Parameters

Edit `src/contexts/InvestmentContext.jsx`:

```javascript
export const INVESTMENT_CONFIG = {
  OLD_KEKE_WEEKLY: 75000,      // Weekly return for original kekes
  OLD_KEKE_DURATION: 75,        // Weeks for original kekes
  NEW_KEKE_COST: 5000000,       // Cost of new keke
  NEW_KEKE_WEEKLY: 125000,      // Weekly return for new kekes
  NEW_KEKE_DURATION: 52,        // Weeks for new kekes
  START_KEKES: 4,               // Starting number of kekes
  TARGET_KEKES: 12,             // Goal
  NUM_COLLABORATORS: 4,         // Number of investors
  START_DATE: new Date('2025-10-20'), // Investment start
};
```

### Add More Holiday Weeks

Edit the `HOLIDAY_WEEK_NUMBERS` array in `InvestmentContext.jsx`:

```javascript
const HOLIDAY_WEEK_NUMBERS = [10, 11, 62, 63, 114, 115];
// Add more week numbers as needed
```

---

## 🛠️ Tech Stack

- **React 18** - UI Framework
- **Vite** - Build Tool
- **Firebase Auth** - Authentication
- **Firestore** - Real-time Database
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **React Router** - Navigation

---

## 📱 Mobile Support

The dashboard is fully responsive and works great on:
- 📱 Mobile phones
- 📱 Tablets
- 💻 Laptops
- 🖥️ Desktops

---

## 🔒 Security Notes

1. **Never share** your Firebase config publicly (it's okay in frontend, but don't expose service account keys)
2. **Firestore Rules** ensure only authenticated users can access data
3. **Email/Password auth** is secure when users choose strong passwords
4. Consider enabling **App Check** for production

---

## 🆘 Troubleshooting

### "Firebase App not initialized"
- Check that your `firebaseConfig` values are correct
- Ensure you copied ALL values including quotes

### "Permission denied" error
- Make sure Firestore rules are published
- User must be logged in

### Blank screen after deploy
- Check browser console for errors
- Verify build completed without errors
- Ensure `dist` folder contains `index.html`

### Data not syncing
- Check internet connection
- Verify Firestore database is active
- Check Firebase Console for quota limits

---

## 📞 Support

If you encounter issues:
1. Check browser console (F12) for errors
2. Verify Firebase configuration
3. Ensure all dependencies are installed

---

## 📄 License

Private - For Keke Investment Collaborators Only

---

Made with 💚 for successful investments!
