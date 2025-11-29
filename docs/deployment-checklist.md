# Deployment Checklist
## Portfolio Management Web Application

Use this checklist to ensure a smooth deployment to GitHub Pages with Firebase backend.

---

## ☁️ Firebase Setup

### 1. Create Firebase Project
- [ ] Go to [Firebase Console](https://console.firebase.google.com)
- [ ] Create new project: `Portfolio-Management-App`
- [ ] Enable Google Analytics (optional)
- [ ] Select region (recommended: `asia-southeast1`)

### 2. Enable Authentication
- [ ] Go to Authentication > Sign-in method
- [ ] Enable **Email/Password** authentication
- [ ] Enable **Google Sign-in** (optional)
- [ ] Add authorized domains:
  - [ ] `localhost` (for development)
  - [ ] `supawitsaelimscb.github.io` (for production)

### 3. Create Firestore Database
- [ ] Go to Firestore Database > Create database
- [ ] Start in **Production mode**
- [ ] Select location: `asia-southeast1` or closest region
- [ ] Click "Enable"

### 4. Configure Security Rules
- [ ] Go to Firestore > Rules
- [ ] Copy rules from `docs/database-schema.md`
- [ ] Publish rules
- [ ] Test with Rules Playground

### 5. Create Indexes
- [ ] Go to Firestore > Indexes
- [ ] Create composite index for transactions:
  ```
  Collection: transactions
  Fields: userId (Asc), portfolioId (Asc), date (Desc)
  ```
- [ ] Create composite index for transaction types:
  ```
  Collection: transactions
  Fields: userId (Asc), type (Asc), date (Desc)
  ```

### 6. Get Firebase Configuration
- [ ] Go to Project Settings > General
- [ ] Scroll to "Your apps"
- [ ] Click Web app icon (</>)
- [ ] Register app: `portfolio-management-web`
- [ ] Copy Firebase config object
- [ ] Save configuration securely

---

## 💻 Local Development Setup

### 1. Clone Repository
- [ ] Clone from GitHub:
  ```bash
  git clone https://github.com/supawitsaelimscb/Portfolio-Management-Web-Application.git
  ```
- [ ] Navigate to directory:
  ```bash
  cd Portfolio-Management-Web-Application
  ```

### 2. Install Dependencies
- [ ] Install Node.js packages:
  ```bash
  npm install
  ```
- [ ] Verify installation:
  ```bash
  npm list --depth=0
  ```

### 3. Environment Configuration
- [ ] Copy example env file:
  ```bash
  cp .env.example .env
  ```
- [ ] Edit `.env` with Firebase credentials
- [ ] Add all required variables:
  - [ ] `VITE_FIREBASE_API_KEY`
  - [ ] `VITE_FIREBASE_AUTH_DOMAIN`
  - [ ] `VITE_FIREBASE_PROJECT_ID`
  - [ ] `VITE_FIREBASE_STORAGE_BUCKET`
  - [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - [ ] `VITE_FIREBASE_APP_ID`
- [ ] Verify `.env` is in `.gitignore`

### 4. Test Local Development
- [ ] Start dev server:
  ```bash
  npm run dev
  ```
- [ ] Open http://localhost:5173
- [ ] Test Firebase connection
- [ ] Test authentication flow
- [ ] Create test portfolio
- [ ] Add sample transactions

### 5. Run Tests
- [ ] Run unit tests:
  ```bash
  npm run test
  ```
- [ ] Check test coverage:
  ```bash
  npm run test:coverage
  ```
- [ ] Run linting:
  ```bash
  npm run lint
  ```
- [ ] Type checking:
  ```bash
  npm run type-check
  ```

---

## 🚀 GitHub Pages Setup

### 1. Repository Configuration
- [ ] Verify repository name matches `package.json` homepage
- [ ] Update `package.json`:
  ```json
  {
    "homepage": "https://supawitsaelimscb.github.io/Portfolio-Management-Web-Application"
  }
  ```
- [ ] Verify `vite.config.ts` base path:
  ```typescript
  base: '/Portfolio-Management-Web-Application/'
  ```

### 2. GitHub Secrets
- [ ] Go to Repository > Settings > Secrets and variables > Actions
- [ ] Add the following secrets:
  - [ ] `FIREBASE_API_KEY`
  - [ ] `FIREBASE_AUTH_DOMAIN`
  - [ ] `FIREBASE_PROJECT_ID`
  - [ ] `FIREBASE_STORAGE_BUCKET`
  - [ ] `FIREBASE_MESSAGING_SENDER_ID`
  - [ ] `FIREBASE_APP_ID`

### 3. Enable GitHub Pages
- [ ] Go to Repository > Settings > Pages
- [ ] Source: Deploy from a branch
- [ ] Branch: `gh-pages` / `root`
- [ ] Save settings
- [ ] Wait for initial deployment

### 4. Verify GitHub Actions Workflow
- [ ] Check `.github/workflows/deploy.yml` exists
- [ ] Verify workflow triggers on push to `main`
- [ ] Check workflow permissions are correct
- [ ] Test workflow by pushing to main

---

## 📦 Build and Deploy

### 1. Pre-deployment Checks
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Environment variables configured
- [ ] Firebase connection working
- [ ] No console errors in browser

### 2. Build Application
- [ ] Run production build:
  ```bash
  npm run build
  ```
- [ ] Check `dist` folder created
- [ ] Verify bundle size (should be < 500KB)
- [ ] Test production build locally:
  ```bash
  npm run preview
  ```

### 3. Deploy to GitHub Pages
- [ ] Manual deployment:
  ```bash
  npm run deploy
  ```
- [ ] Or push to main for automatic deployment:
  ```bash
  git add .
  git commit -m "deploy: initial deployment"
  git push origin main
  ```

### 4. Verify Deployment
- [ ] Check GitHub Actions tab for workflow status
- [ ] Wait for deployment to complete (2-5 minutes)
- [ ] Visit deployment URL
- [ ] Test all major features:
  - [ ] Homepage loads
  - [ ] Authentication works
  - [ ] Dashboard displays
  - [ ] Can create portfolio
  - [ ] Can add transactions
  - [ ] Charts render correctly
  - [ ] Mobile responsive
  - [ ] No console errors

---

## 🔒 Security Checklist

### Firebase Security
- [ ] Security rules properly configured
- [ ] Only authenticated users can access data
- [ ] Users can only access their own data
- [ ] Analytics collection is read-only for users
- [ ] No sensitive data exposed in security rules

### Application Security
- [ ] API keys in environment variables
- [ ] No secrets committed to repository
- [ ] `.env` in `.gitignore`
- [ ] GitHub secrets configured
- [ ] CORS properly configured
- [ ] Input validation on all forms
- [ ] XSS protection enabled

### Authentication Security
- [ ] Strong password requirements
- [ ] Email verification enabled (optional)
- [ ] Rate limiting on login attempts
- [ ] Secure session management
- [ ] Logout functionality works

---

## 🧪 Post-Deployment Testing

### Functionality Tests
- [ ] User registration works
- [ ] User login works
- [ ] User logout works
- [ ] Dashboard displays correctly
- [ ] Can create new portfolio
- [ ] Can edit portfolio
- [ ] Can delete portfolio
- [ ] Can add transactions (all types)
- [ ] Can edit transactions
- [ ] Can delete transactions
- [ ] Charts render properly
- [ ] Analytics calculations correct
- [ ] Export functionality works

### Performance Tests
- [ ] Page load time < 3 seconds
- [ ] Time to Interactive < 3 seconds
- [ ] First Contentful Paint < 1.5 seconds
- [ ] Largest Contentful Paint < 2.5 seconds
- [ ] Lighthouse score > 90

### Compatibility Tests
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Responsive Design Tests
- [ ] Mobile (320px - 767px)
- [ ] Tablet (768px - 1024px)
- [ ] Desktop (1025px+)
- [ ] Touch interactions work
- [ ] Navigation menu responsive
- [ ] Charts responsive

---

## 📊 Monitoring Setup

### Firebase Console
- [ ] Enable Firebase Analytics
- [ ] Set up crash reporting
- [ ] Configure performance monitoring
- [ ] Set up budget alerts

### Google Analytics (Optional)
- [ ] Create GA4 property
- [ ] Add tracking ID to Firebase
- [ ] Verify events are tracking
- [ ] Set up custom events

### Error Tracking (Optional)
- [ ] Set up Sentry or similar
- [ ] Configure error reporting
- [ ] Test error reporting
- [ ] Set up alert notifications

---

## 📝 Documentation

### Code Documentation
- [ ] All functions have JSDoc comments
- [ ] Complex logic explained
- [ ] TypeScript types properly defined
- [ ] README.md complete and accurate

### User Documentation
- [ ] Setup guide complete
- [ ] API documentation complete
- [ ] Database schema documented
- [ ] Troubleshooting guide available

### Project Documentation
- [ ] Requirements document
- [ ] Technical architecture document
- [ ] Deployment checklist (this file)
- [ ] Contributing guidelines

---

## 🎉 Launch Checklist

### Pre-Launch
- [ ] All development complete
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Security audit passed
- [ ] Performance optimized
- [ ] Accessibility tested

### Launch Day
- [ ] Deploy to production
- [ ] Verify deployment successful
- [ ] Monitor for errors
- [ ] Test all critical paths
- [ ] Announce launch (if applicable)

### Post-Launch
- [ ] Monitor analytics
- [ ] Watch for errors
- [ ] Collect user feedback
- [ ] Plan next iteration
- [ ] Update documentation as needed

---

## 🔄 Maintenance Tasks

### Daily
- [ ] Check error logs
- [ ] Monitor Firebase usage
- [ ] Review analytics

### Weekly
- [ ] Review GitHub Issues
- [ ] Update dependencies (if needed)
- [ ] Backup Firestore data

### Monthly
- [ ] Review Firebase costs
- [ ] Update documentation
- [ ] Security audit
- [ ] Performance review

### Quarterly
- [ ] Major dependency updates
- [ ] Feature review
- [ ] Architecture review
- [ ] User feedback analysis

---

## 📞 Emergency Contacts

**Firebase Support:** https://firebase.google.com/support  
**GitHub Support:** https://support.github.com  
**Project Repository:** https://github.com/supawitsaelimscb/Portfolio-Management-Web-Application

---

## ✅ Final Verification

Before marking deployment as complete, verify:

- [ ] Application is live and accessible
- [ ] All core features working
- [ ] No critical errors in logs
- [ ] Firebase connection stable
- [ ] Authentication working
- [ ] Data persisting correctly
- [ ] Performance metrics acceptable
- [ ] Mobile experience good
- [ ] Documentation up to date
- [ ] Monitoring configured

---

**Deployment Date:** _______________  
**Deployed By:** _______________  
**Version:** 1.0  
**Status:** ⬜ Not Started | ⬜ In Progress | ⬜ Complete

---

**🎉 Congratulations on your deployment!**
