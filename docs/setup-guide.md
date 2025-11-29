# Setup and Installation Guide
## Portfolio Management Web Application

**Version:** 1.0  
**Last Updated:** November 29, 2025

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Firebase Setup](#firebase-setup)
3. [Project Setup](#project-setup)
4. [Environment Configuration](#environment-configuration)
5. [Development](#development)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)

---

## 1. Prerequisites

### Required Software
- **Node.js** >= 18.0.0 (LTS recommended)
- **npm** >= 9.0.0 or **yarn** >= 1.22.0
- **Git** >= 2.30.0
- **VS Code** (recommended) or any code editor

### Recommended VS Code Extensions
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Firebase Explorer
- GitLens

### Knowledge Requirements
- Basic understanding of React
- Familiarity with TypeScript
- Understanding of REST APIs
- Basic Firebase knowledge

---

## 2. Firebase Setup

### 2.1 Create Firebase Project

1. **Go to Firebase Console**
   - Visit [https://console.firebase.google.com](https://console.firebase.google.com)
   - Sign in with your Google account

2. **Create New Project**
   ```
   Project Name: Portfolio-Management-App
   Analytics: Enable (optional)
   Region: Select your preferred region
   ```

3. **Enable Authentication**
   - Go to Authentication > Sign-in method
   - Enable Email/Password authentication
   - Enable Google Sign-in (optional)

4. **Create Firestore Database**
   - Go to Firestore Database
   - Click "Create database"
   - Start in **Production mode**
   - Choose location: `asia-southeast1` (or closest to your users)

5. **Register Web App**
   - Go to Project settings > Your apps
   - Click "Add app" > Web (</>) icon
   - App nickname: `portfolio-management-web`
   - Enable Firebase Hosting: No (we'll use GitHub Pages)
   - Click "Register app"
   - **Copy the Firebase configuration** - you'll need this later

### 2.2 Configure Firestore Security Rules

1. Go to Firestore Database > Rules
2. Replace with the following rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated() && isOwner(userId);
      allow write: if isAuthenticated() && isOwner(userId);
    }
    
    // Portfolios collection
    match /portfolios/{portfolioId} {
      allow read: if isAuthenticated() && 
                     resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && 
                       request.resource.data.userId == request.auth.uid;
      allow update, delete: if isAuthenticated() && 
                               resource.data.userId == request.auth.uid;
    }
    
    // Transactions collection
    match /transactions/{transactionId} {
      allow read: if isAuthenticated() && 
                     resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && 
                       request.resource.data.userId == request.auth.uid;
      allow update, delete: if isAuthenticated() && 
                               resource.data.userId == request.auth.uid;
    }
    
    // Analytics collection
    match /analytics/{analyticsId} {
      allow read: if isAuthenticated() && 
                     resource.data.userId == request.auth.uid;
      allow write: if false;
    }
  }
}
```

3. Click "Publish"

### 2.3 Create Firestore Indexes

1. Go to Firestore Database > Indexes
2. Create composite indexes:

**Index 1: Transactions by User and Date**
```
Collection ID: transactions
Fields indexed:
  - userId (Ascending)
  - portfolioId (Ascending)
  - date (Descending)
Query scope: Collection
```

**Index 2: Transactions by Type**
```
Collection ID: transactions
Fields indexed:
  - userId (Ascending)
  - type (Ascending)
  - date (Descending)
Query scope: Collection
```

### 2.4 Enable Firebase Services

1. **Enable Analytics** (optional)
   - Go to Analytics > Dashboard
   - Follow setup wizard

2. **Enable Performance Monitoring** (optional)
   - Go to Performance > Get started
   - Follow setup wizard

---

## 3. Project Setup

### 3.1 Clone Repository

```bash
# Clone the repository
git clone https://github.com/supawitsaelimscb/Portfolio-Management-Web-Application.git

# Navigate to project directory
cd Portfolio-Management-Web-Application
```

### 3.2 Install Dependencies

```bash
# Using npm
npm install

# Or using yarn
yarn install
```

### 3.3 Project Structure

After installation, your project should look like this:

```
Portfolio-Management-Web-Application/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── docs/
│   ├── requirements.md
│   ├── technical-architecture.md
│   └── setup-guide.md
├── public/
│   ├── favicon.ico
│   └── robots.txt
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── store/
│   ├── hooks/
│   ├── utils/
│   ├── types/
│   ├── App.tsx
│   └── main.tsx
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

---

## 4. Environment Configuration

### 4.1 Create Environment File

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` with your Firebase credentials:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# Optional: Analytics
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Application Configuration
VITE_APP_NAME=Portfolio Management
VITE_APP_VERSION=1.0.0
```

### 4.2 Configure GitHub Secrets (for deployment)

1. Go to your GitHub repository
2. Navigate to Settings > Secrets and variables > Actions
3. Click "New repository secret"
4. Add each Firebase configuration as a secret:
   - `FIREBASE_API_KEY`
   - `FIREBASE_AUTH_DOMAIN`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_STORAGE_BUCKET`
   - `FIREBASE_MESSAGING_SENDER_ID`
   - `FIREBASE_APP_ID`

---

## 5. Development

### 5.1 Start Development Server

```bash
# Using npm
npm run dev

# Or using yarn
yarn dev
```

The application will be available at: `http://localhost:5173`

### 5.2 Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format

# Type check
npm run type-check
```

### 5.3 Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write code
   - Add tests
   - Update documentation if needed

3. **Run tests and linting**
   ```bash
   npm run test
   npm run lint
   npm run type-check
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat(scope): your commit message"
   ```

5. **Push to GitHub**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - Go to GitHub repository
   - Click "New Pull Request"
   - Select your branch
   - Fill in PR template
   - Request review

---

## 6. Deployment

### 6.1 Configure GitHub Pages

1. **Enable GitHub Pages**
   - Go to repository Settings
   - Scroll to "Pages" section
   - Source: Deploy from a branch
   - Branch: `gh-pages` / `root`
   - Click Save

2. **Update package.json**
   ```json
   {
     "homepage": "https://supawitsaelimscb.github.io/Portfolio-Management-Web-Application"
   }
   ```

3. **Verify vite.config.ts**
   ```typescript
   export default defineConfig({
     base: '/Portfolio-Management-Web-Application/',
     // ... other config
   });
   ```

### 6.2 Manual Deployment

```bash
# Build the application
npm run build

# Deploy to GitHub Pages
npm run deploy
```

This will:
1. Build the production bundle
2. Create/update `gh-pages` branch
3. Push to GitHub
4. Trigger GitHub Pages deployment

### 6.3 Automatic Deployment (CI/CD)

The project includes a GitHub Actions workflow that automatically deploys when you push to the `main` branch.

**Workflow file:** `.github/workflows/deploy.yml`

**Triggers:**
- Push to `main` branch
- Pull request to `main` branch (build only, no deploy)

**Steps:**
1. Checkout code
2. Setup Node.js
3. Install dependencies
4. Run tests
5. Build application
6. Deploy to GitHub Pages

### 6.4 Verify Deployment

1. Check GitHub Actions
   - Go to Actions tab
   - Verify workflow completed successfully

2. Visit your live site
   - URL: `https://supawitsaelimscb.github.io/Portfolio-Management-Web-Application`
   - Should load without errors

3. Check browser console
   - No critical errors
   - Firebase connection successful

---

## 7. Troubleshooting

### Common Issues

#### Issue 1: Firebase Connection Failed

**Error:** `FirebaseError: Firebase: Error (auth/network-request-failed)`

**Solution:**
1. Check your internet connection
2. Verify Firebase configuration in `.env`
3. Ensure Firebase project is active
4. Check Firestore security rules

```bash
# Test Firebase connection
npm run test:firebase
```

#### Issue 2: Build Fails

**Error:** `Error: ENOENT: no such file or directory`

**Solution:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Clear cache
npm cache clean --force
```

#### Issue 3: GitHub Pages Shows 404

**Error:** Page not found after deployment

**Solution:**
1. Verify `base` in `vite.config.ts` matches repo name
2. Check GitHub Pages settings
3. Ensure `gh-pages` branch exists
4. Clear browser cache

```bash
# Redeploy
npm run deploy
```

#### Issue 4: CORS Errors

**Error:** `Access-Control-Allow-Origin` header

**Solution:**
1. Add authorized domains in Firebase Console
   - Authentication > Settings > Authorized domains
   - Add your GitHub Pages domain

2. Update Firebase configuration
   ```typescript
   // src/services/firebase.ts
   const app = initializeApp(firebaseConfig);
   ```

#### Issue 5: TypeScript Errors

**Error:** Type errors during build

**Solution:**
```bash
# Check types
npm run type-check

# Update type definitions
npm update @types/react @types/react-dom
```

### Debug Mode

Enable debug mode for detailed logging:

```typescript
// src/main.tsx
if (import.meta.env.DEV) {
  console.log('🚀 Running in development mode');
  console.log('Firebase Config:', {
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID
  });
}
```

### Performance Debugging

```bash
# Analyze bundle size
npm run build -- --analyze

# Check lighthouse score
npm install -g lighthouse
lighthouse https://your-app-url.github.io
```

---

## Additional Resources

### Documentation
- [React Documentation](https://react.dev)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)

### Community
- [GitHub Issues](https://github.com/supawitsaelimscb/Portfolio-Management-Web-Application/issues)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/react)

### Support
For issues and questions:
1. Check existing GitHub Issues
2. Search documentation
3. Create new issue with detailed description

---

## Next Steps

After completing setup:

1. ✅ Verify Firebase connection
2. ✅ Test authentication flow
3. ✅ Create test portfolio
4. ✅ Add sample transactions
5. ✅ Review analytics dashboard
6. ✅ Test on mobile device
7. ✅ Deploy to GitHub Pages

**Happy coding! 🚀**
