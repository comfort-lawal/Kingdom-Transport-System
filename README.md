# Kingdom Transport System v4.0

Investment collaboration tracking with real money flow — beneficiary accounts, transfer logging, admin verification, and purchase confirmation.

## What's New in v4

1. **Beneficiary System** — Shows whose turn it is to receive funds, with their bank details
2. **Transfer Logging** — Any collaborator can log their weekly transfer
3. **Admin Verification** — Admin approves or rejects each transfer
4. **Progress Tracking** — Live progress ring showing verified amount toward ₦4M
5. **Purchase Confirmation** — Admin confirms when target is reached; system auto-advances
6. **Notifications** — Real-time alerts for all actions

## Setup Instructions

### Step 1: Firebase Configuration

You already have a Firebase project from the original app. You need to add your config:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click the **gear icon** → **Project settings**
4. Scroll to "Your apps" → Click your web app
5. Copy the `firebaseConfig` object
6. Open `src/config/firebase.js` and paste your config values

### Step 2: Firestore Indexes

The app uses compound queries that need indexes. **Two options:**

**Option A (Automatic):** When you first load the app and see an error in browser console about missing indexes, Firebase will include a direct link to create them. Just click each link.

**Option B (Manual):** In Firebase Console → Firestore → Indexes → Add these:

| Collection | Fields |
|-----------|--------|
| `transfers` | `kekeNumber` (Asc) + `createdAt` (Desc) |
| `notifications` | `userId` (Asc) + `createdAt` (Desc) |

### Step 3: Firestore Security Rules

1. Go to Firebase Console → Firestore → **Rules** tab
2. Replace all content with the contents of `firestore.rules`
3. Click **Publish**

### Step 4: Install and Build

```bash
cd kingdom-transport
npm install
npm run build
```

### Step 5: Deploy

**If using Netlify (linked to GitHub):**
1. Replace the files in your `Kingdom-Transport-System` GitHub repo with these new files
2. Commit and push
3. Netlify auto-deploys

**If manually deploying:**
1. Go to [Netlify](https://app.netlify.com)
2. Select your kingdom-colab site
3. Drag the `dist` folder to deploy

## Important Notes

- **Admin account:** oluwaselawal@gmail.com (A.S.O) has admin privileges
- **Rotation order:** Fadeke → A.S.O → Itunu → Dayo (repeating)
- **Bank details:** Admin must set the beneficiary's bank details before others can transfer
- **First run:** The app seeds the rotation data automatically on first load

## Current Investment Status

| Parameter | Value |
|-----------|-------|
| Start Date | October 20, 2025 |
| Original Kekes | 4 (₦75k/week each) |
| New Keke Cost | ₦4,000,000 |
| New Keke ROI | ₦125k/week for 52 weeks |
| ROI Gap | 2 weeks after purchase |
| Target | 12 kekes total |
| Keke #5 | Dr. Fadeke (Purchased Mar 2) |
| Keke #6 | A.S.O (Currently saving) |

## File Structure

```
src/
├── config/
│   ├── firebase.js        # Firebase connection (ADD YOUR CONFIG)
│   └── investment.js       # All financial constants (single source of truth)
├── contexts/
│   ├── AuthContext.jsx      # Authentication + user profiles
│   └── TransferContext.jsx  # Transfers, verification, purchases, notifications
├── components/
│   ├── Login.jsx            # Sign in / sign up
│   ├── Dashboard.jsx        # Main layout
│   ├── BeneficiaryCard.jsx  # Current beneficiary + progress + bank details
│   ├── TransferForm.jsx     # Log a transfer modal
│   ├── TransferHistory.jsx  # List of all transfers with statuses
│   ├── AdminVerification.jsx # Admin panel to approve/reject
│   ├── RotationTimeline.jsx # Keke ownership timeline
│   ├── WeeklyStatus.jsx     # Current week info + income breakdown
│   └── Notifications.jsx    # Bell icon + notification dropdown
├── App.jsx
├── main.jsx
└── index.css
```
