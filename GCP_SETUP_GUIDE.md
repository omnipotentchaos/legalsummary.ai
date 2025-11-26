# 🔐 Google Cloud Platform (GCP) Credentials Setup Guide

## What are GCP Credentials?

**GCP credentials** are authentication keys that allow your application to securely access Google Cloud services like:
- **Document AI** (OCR for extracting text from PDFs)
- **Vertex AI** (AI/ML models for summarization and chat)
- **Cloud Natural Language** (Entity extraction and sentiment analysis)
- **Translation API** (Multi-language support)
- **Cloud Storage** (File storage)
- **Firestore** (NoSQL database)

---

## 🚀 Step-by-Step Setup

### **Step 1: Create a Google Cloud Project**

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click **"Select a project"** → **"New Project"**
3. Enter project name (e.g., `legalsummary-ai`)
4. Click **"Create"**
5. **Note your Project ID** (you'll need this)

---

### **Step 2: Enable Required APIs**

Run these commands in your terminal (install [gcloud CLI](https://cloud.google.com/sdk/docs/install) first):

```bash
# Set your project
gcloud config set project YOUR_PROJECT_ID

# Enable all required APIs
gcloud services enable documentai.googleapis.com
gcloud services enable aiplatform.googleapis.com
gcloud services enable language.googleapis.com
gcloud services enable translate.googleapis.com
gcloud services enable storage.googleapis.com
gcloud services enable firestore.googleapis.com
gcloud services enable run.googleapis.com
```

Or enable them manually in the Console:
- Go to **APIs & Services** → **Library**
- Search and enable each service above

---

### **Step 3: Create a Service Account**

A **Service Account** is like a "robot user" that your app uses to access Google Cloud services.

#### **Option A: Using gcloud CLI**

```bash
# Create service account
gcloud iam service-accounts create legalsummary-sa \
    --display-name="LegalSummary AI Service Account"

# Grant necessary roles
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:legalsummary-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/documentai.apiUser"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:legalsummary-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/aiplatform.user"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:legalsummary-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/cloudtranslate.user"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:legalsummary-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/storage.admin"

# Create and download the key
gcloud iam service-accounts keys create ~/legalsummary-key.json \
    --iam-account=legalsummary-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

#### **Option B: Using Console**

1. Go to **IAM & Admin** → **Service Accounts**
2. Click **"Create Service Account"**
3. Name: `legalsummary-sa`, Description: "LegalSummary AI Service Account"
4. Click **"Create and Continue"**
5. Grant these roles:
   - Document AI API User
   - Vertex AI User
   - Cloud Translation API User
   - Storage Admin
   - Cloud Datastore User
6. Click **"Continue"** → **"Done"**
7. Click on the newly created service account
8. Go to **"Keys"** tab → **"Add Key"** → **"Create New Key"**
9. Select **JSON** → Click **"Create"**
10. Save the downloaded JSON file securely (e.g., `~/legalsummary-key.json`)

---

### **Step 4: Set Up Document AI Processors**

1. Go to [Document AI Console](https://console.cloud.google.com/ai/document-ai/processors)
2. Click **"Create Processor"**
3. Select **"Document OCR"** → Click **"Create"**
4. **Copy the Processor ID** (the long alphanumeric string in the URL)
5. Repeat for **"Form Parser"** processor
6. Save both processor IDs

---

### **Step 5: Set Up Firebase**

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Add project"** → Select your existing GCP project
3. Enable **Google Analytics** (optional) → Click **"Add Firebase"**
4. Once created, click **⚙️ Settings icon** → **"Project Settings"**

#### **Get Client-side Config:**
5. Scroll to **"Your apps"** → Click **"Web" icon** (</> symbol)
6. Register app name: `LegalSummary AI` → Click **"Register app"**
7. **Copy the firebaseConfig object values** - you'll need these for `.env`

#### **Get Admin SDK Config:**
8. Go to **"Service Accounts"** tab
9. Click **"Generate New Private Key"** → **"Generate Key"**
10. Save the downloaded JSON file (e.g., `firebase-admin-key.json`)

#### **Set Up Firestore:**
11. Go to **"Firestore Database"** in Firebase Console
12. Click **"Create Database"**
13. Select **"Production mode"** → Choose region (e.g., `us-central1`)
14. Click **"Enable"**

---

### **Step 6: Configure Your .env File**

Now copy the example and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

#### **From GCP Service Account JSON** (`legalsummary-key.json`):
```env
GOOGLE_CLOUD_PROJECT_ID=your-actual-project-id
GOOGLE_CLOUD_CLIENT_EMAIL=legalsummary-sa@your-project.iam.gserviceaccount.com
GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

#### **From Document AI Console:**
```env
FORM_PARSER_PROCESSOR_NAME=abc123def456
OCR_PROCESSOR_ID=xyz789uvw012
```

#### **From Firebase Web Config:**
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456:web:abcdef
```

#### **From Firebase Admin SDK JSON** (`firebase-admin-key.json`):
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=abc123...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789012345678901
```

> **⚠️ Important:** When copying private keys, keep them as a single line with `\n` for line breaks

---

### **Step 7: Test Your Setup**

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# In another terminal, test the health endpoint
curl http://localhost:4000/api/health | jq
```

You should see:
```json
{
  "status": "ok",
  "services": {
    "document_ai": "ok",
    "vertex_ai": "ok"
  }
}
```

---

## 🔒 Security Best Practices

1. **Never commit `.env` to Git** - it's already in `.gitignore`
2. **Keep service account keys secure** - treat them like passwords
3. **Use different credentials for dev/staging/production**
4. **Rotate keys periodically** (every 90 days recommended)
5. **Grant minimum required permissions** (principle of least privilege)
6. **For production:** Use Secret Manager instead of `.env` files

---

## 💰 Cost Management

- **Free Tier:** Google Cloud offers generous free tiers for Document AI, Vertex AI, etc.
- **Set Budget Alerts:**
  1. Go to **Billing** → **Budgets & Alerts**
  2. Create budget (e.g., $50/month)
  3. Set alerts at 50%, 90%, 100%
- **Monitor Usage:** Check **Billing** → **Reports** regularly

---

## 🆘 Troubleshooting

### **"Project ID not configured"**
- Make sure `GOOGLE_CLOUD_PROJECT_ID` is set in `.env`
- Restart your dev server after editing `.env`

### **"Permission denied" errors**
- Verify your service account has the correct IAM roles
- Check that APIs are enabled in your project

### **"Invalid credentials"**
- Ensure private keys are properly formatted with `\n` line breaks
- Check for typos in email addresses

### **"Processor not found"**
- Verify processor IDs are correct
- Ensure processors are in the same region as `GOOGLE_CLOUD_LOCATION`

---

## 📚 Additional Resources

- [Google Cloud Documentation](https://cloud.google.com/docs)
- [Document AI Quickstart](https://cloud.google.com/document-ai/docs/quickstart)
- [Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
- [Firebase Setup Guide](https://firebase.google.com/docs/web/setup)
- [Service Account Best Practices](https://cloud.google.com/iam/docs/best-practices-service-accounts)

---

## 🎯 Quick Start Checklist

- [ ] Create GCP project
- [ ] Enable all required APIs
- [ ] Create service account with proper roles
- [ ] Download service account key JSON
- [ ] Create Document AI processors
- [ ] Set up Firebase project
- [ ] Get Firebase web config
- [ ] Download Firebase Admin SDK key
- [ ] Create Firestore database
- [ ] Copy `.env.example` to `.env`
- [ ] Fill in all credentials in `.env`
- [ ] Test with `npm run dev`
- [ ] Verify health endpoint

---

**Need Help?** Check the [Google Cloud Console](https://console.cloud.google.com) or reach out to the GCP support community.
