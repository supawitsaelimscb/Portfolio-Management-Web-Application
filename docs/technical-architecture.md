# Technical Architecture Document
## Portfolio Management Web Application

**Version:** 1.0  
**Date:** November 29, 2025  
**Status:** Approved for Development

---

## 1. Executive Summary

This document outlines the technical architecture for the Portfolio Management Web Application. The system is designed as a single-page application (SPA) using React, deployed on GitHub Pages, with a serverless backend connecting to a free cloud database.

### 1.1 Architecture Overview
- **Frontend:** React.js SPA hosted on GitHub Pages
- **Backend:** Serverless functions (Firebase Cloud Functions or Vercel Serverless)
- **Database:** Firebase Firestore (Free tier) or MongoDB Atlas (Free tier)
- **Authentication:** Firebase Authentication
- **Deployment:** GitHub Pages + GitHub Actions CI/CD

---

## 2. Technology Stack

### 2.1 Frontend Technologies

#### Core Framework
- **React 18.x**
  - Functional components with Hooks
  - Context API for state management
  - React Router v6 for navigation
  - Vite for build tooling (faster than CRA)

#### UI & Styling
- **Tailwind CSS 3.x**
  - Utility-first CSS framework
  - Responsive design utilities
  - Dark mode support
  - Custom theme configuration

- **Headless UI / Shadcn UI**
  - Accessible component primitives
  - Customizable components
  - TypeScript support

#### Data Visualization
- **Recharts**
  - React-native charts
  - Responsive charts
  - Customizable themes
  - Pie, Bar, Line, Area charts

#### Form Management
- **React Hook Form**
  - Performance-optimized
  - Built-in validation
  - TypeScript support
  - Minimal re-renders

#### State Management
- **Zustand** (lightweight alternative to Redux)
  - Simple API
  - No boilerplate
  - TypeScript support
  - DevTools support

#### Utilities
- **date-fns** - Date manipulation
- **axios** - HTTP client
- **react-hot-toast** - Notifications
- **framer-motion** - Animations
- **react-icons** - Icon library
- **lodash** - Utility functions

### 2.2 Backend Technologies

#### Option A: Firebase (Recommended)
- **Firebase Firestore**
  - NoSQL document database
  - Real-time synchronization
  - Offline support
  - Free tier: 1GB storage, 50K reads/day, 20K writes/day

- **Firebase Authentication**
  - Email/password authentication
  - Google OAuth
  - Free tier: Unlimited users

- **Firebase Cloud Functions**
  - Serverless backend logic
  - Free tier: 2M invocations/month

- **Firebase Hosting** (Alternative to GitHub Pages)
  - CDN-backed hosting
  - Custom domain support
  - Free tier: 10GB storage, 360MB/day transfer

#### Option B: MongoDB Atlas + Vercel
- **MongoDB Atlas**
  - Free tier: 512MB storage
  - Shared cluster
  - 100 connections max

- **Vercel Serverless Functions**
  - API endpoints
  - Free tier: 100GB bandwidth/month

### 2.3 Development Tools

- **TypeScript** - Type safety
- **ESLint + Prettier** - Code quality
- **Vitest** - Unit testing
- **React Testing Library** - Component testing
- **Cypress** - E2E testing
- **Git** - Version control
- **VS Code** - IDE

### 2.4 Deployment & CI/CD

- **GitHub Pages** - Frontend hosting
- **GitHub Actions** - Automated deployment
- **Firebase CLI** - Backend deployment

---

## 3. System Architecture

### 3.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        USER BROWSER                          │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         React SPA (GitHub Pages)                   │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐        │    │
│  │  │Dashboard │  │Portfolio │  │Analytics │        │    │
│  │  │Component │  │Component │  │Component │        │    │
│  │  └──────────┘  └──────────┘  └──────────┘        │    │
│  │         │              │              │            │    │
│  │         └──────────────┴──────────────┘            │    │
│  │                       │                             │    │
│  │              ┌────────▼────────┐                   │    │
│  │              │  Zustand Store  │                   │    │
│  │              └────────┬────────┘                   │    │
│  │                       │                             │    │
│  │              ┌────────▼────────┐                   │    │
│  │              │   API Service   │                   │    │
│  │              │    (Axios)      │                   │    │
│  │              └────────┬────────┘                   │    │
│  └───────────────────────┼──────────────────────────┘    │
└────────────────────────────┼──────────────────────────────┘
                             │
                    HTTPS    │
                             │
┌────────────────────────────▼──────────────────────────────┐
│                  FIREBASE BACKEND                          │
│  ┌─────────────────────────────────────────────────┐     │
│  │         Firebase Authentication                  │     │
│  └─────────────────────────────────────────────────┘     │
│                           │                                │
│  ┌─────────────────────────────────────────────────┐     │
│  │         Firebase Cloud Functions                 │     │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐      │     │
│  │  │Portfolio │  │Analytics │  │  Export  │      │     │
│  │  │   API    │  │   API    │  │   API    │      │     │
│  │  └─────┬────┘  └─────┬────┘  └─────┬────┘      │     │
│  └────────┼─────────────┼─────────────┼───────────┘     │
│           │             │             │                   │
│  ┌────────▼─────────────▼─────────────▼───────────┐     │
│  │         Firebase Firestore Database             │     │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐     │     │
│  │  │  Users   │  │Portfolio │  │Transactions     │     │
│  │  │Collection│  │Collection│  │ Collection│     │     │
│  │  └──────────┘  └──────────┘  └──────────┘     │     │
│  └──────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────┘
```

### 3.2 Component Architecture

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   └── MainLayout.tsx
│   ├── dashboard/
│   │   ├── DashboardOverview.tsx
│   │   ├── PortfolioDistribution.tsx
│   │   ├── KeyMetrics.tsx
│   │   └── RecentTransactions.tsx
│   ├── portfolio/
│   │   ├── CooperativeAccount.tsx
│   │   ├── PVDAccount.tsx
│   │   ├── MutualFund.tsx
│   │   ├── StockInvestment.tsx
│   │   └── SavingsAccount.tsx
│   ├── transactions/
│   │   ├── TransactionForm.tsx
│   │   ├── TransactionList.tsx
│   │   └── TransactionFilters.tsx
│   ├── analytics/
│   │   ├── PerformanceChart.tsx
│   │   ├── ROICalculator.tsx
│   │   └── TrendAnalysis.tsx
│   ├── charts/
│   │   ├── PieChart.tsx
│   │   ├── BarChart.tsx
│   │   ├── LineChart.tsx
│   │   └── AreaChart.tsx
│   └── common/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── Card.tsx
│       └── LoadingSpinner.tsx
├── pages/
│   ├── Dashboard.tsx
│   ├── Portfolio.tsx
│   ├── Transactions.tsx
│   ├── Analytics.tsx
│   ├── Settings.tsx
│   └── Login.tsx
├── services/
│   ├── firebase.ts
│   ├── api.ts
│   ├── auth.ts
│   └── portfolio.ts
├── store/
│   ├── authStore.ts
│   ├── portfolioStore.ts
│   └── settingsStore.ts
├── hooks/
│   ├── useAuth.ts
│   ├── usePortfolio.ts
│   └── useTransactions.ts
├── utils/
│   ├── calculations.ts
│   ├── formatters.ts
│   ├── validators.ts
│   └── constants.ts
├── types/
│   ├── portfolio.ts
│   ├── transaction.ts
│   └── user.ts
├── App.tsx
└── main.tsx
```

---

## 4. Database Schema Design

### 4.1 Firestore Collections

#### Users Collection
```javascript
users/{userId}
{
  uid: string,
  email: string,
  displayName: string,
  createdAt: timestamp,
  updatedAt: timestamp,
  preferences: {
    currency: "THB",
    dateFormat: "DD/MM/YYYY",
    language: "en" | "th",
    theme: "light" | "dark"
  }
}
```

#### Portfolios Collection
```javascript
portfolios/{portfolioId}
{
  portfolioId: string,
  userId: string,
  name: string,
  description: string,
  createdAt: timestamp,
  updatedAt: timestamp,
  totalValue: number,
  currency: "THB",
  investmentTypes: {
    cooperative: { count: number, totalValue: number },
    pvd: { count: number, totalValue: number },
    mutualFund: { count: number, totalValue: number },
    stock: { count: number, totalValue: number },
    savings: { count: number, totalValue: number }
  }
}
```

#### Transactions Collection
```javascript
transactions/{transactionId}
{
  transactionId: string,
  userId: string,
  portfolioId: string,
  type: "cooperative" | "pvd" | "mutualFund" | "stock" | "savings",
  date: timestamp,
  createdAt: timestamp,
  updatedAt: timestamp,
  
  // Common fields
  amount: number,
  currency: "THB" | "USD",
  notes: string,
  
  // Type-specific fields (stored as nested object)
  details: {
    // For Cooperative
    year?: number,
    period?: number,
    month?: string,
    totalInvested?: number,
    
    // For PVD
    employeeContribution?: number,
    employerContribution?: number,
    contributionPercentage?: number,
    totalFundValue?: number,
    
    // For Mutual Fund
    fundName?: string,
    installmentNumber?: number,
    unitsPurchased?: number,
    pricePerUnit?: number,
    totalUnits?: number,
    currentValue?: number,
    
    // For Stock
    stockName?: string,
    ticker?: string,
    unitsPurchased?: number,
    pricePerUnit?: number,
    exchangeRate?: number,
    purchaseValueTHB?: number,
    
    // For Savings
    runningBalance?: number
  }
}
```

#### Analytics Collection (Cached aggregations)
```javascript
analytics/{analyticsId}
{
  analyticsId: string,
  userId: string,
  portfolioId: string,
  date: timestamp,
  period: "daily" | "monthly" | "yearly",
  
  metrics: {
    totalValue: number,
    totalInvested: number,
    totalReturn: number,
    returnPercentage: number,
    
    byType: {
      cooperative: { value: number, return: number, percentage: number },
      pvd: { value: number, return: number, percentage: number },
      mutualFund: { value: number, return: number, percentage: number },
      stock: { value: number, return: number, percentage: number },
      savings: { value: number, return: number, percentage: number }
    }
  }
}
```

### 4.2 Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
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
      allow write: if false; // Only server-side writes via Cloud Functions
    }
  }
}
```

### 4.3 Indexes

```javascript
// Composite indexes for efficient queries
{
  collectionGroup: "transactions",
  queryScope: "COLLECTION",
  fields: [
    { fieldPath: "userId", order: "ASCENDING" },
    { fieldPath: "portfolioId", order: "ASCENDING" },
    { fieldPath: "date", order: "DESCENDING" }
  ]
},
{
  collectionGroup: "transactions",
  queryScope: "COLLECTION",
  fields: [
    { fieldPath: "userId", order: "ASCENDING" },
    { fieldPath: "type", order: "ASCENDING" },
    { fieldPath: "date", order: "DESCENDING" }
  ]
}
```

---

## 5. API Design

### 5.1 REST API Endpoints (Firebase Cloud Functions)

#### Authentication
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login user
POST   /api/auth/logout            - Logout user
POST   /api/auth/forgot-password   - Request password reset
GET    /api/auth/verify            - Verify authentication token
```

#### Portfolio
```
GET    /api/portfolios             - Get all portfolios for user
GET    /api/portfolios/:id         - Get specific portfolio
POST   /api/portfolios             - Create new portfolio
PUT    /api/portfolios/:id         - Update portfolio
DELETE /api/portfolios/:id         - Delete portfolio
GET    /api/portfolios/:id/summary - Get portfolio summary with calculations
```

#### Transactions
```
GET    /api/transactions                      - Get all transactions (with filters)
GET    /api/transactions/:id                  - Get specific transaction
POST   /api/transactions                      - Create new transaction
PUT    /api/transactions/:id                  - Update transaction
DELETE /api/transactions/:id                  - Delete transaction
POST   /api/transactions/bulk                 - Bulk import transactions
GET    /api/transactions/export               - Export transactions (CSV/Excel)
```

#### Analytics
```
GET    /api/analytics/performance             - Get performance metrics
GET    /api/analytics/distribution            - Get portfolio distribution
GET    /api/analytics/trends                  - Get trend analysis
GET    /api/analytics/roi                     - Get ROI calculations
POST   /api/analytics/refresh                 - Trigger analytics recalculation
```

#### Settings
```
GET    /api/settings                          - Get user settings
PUT    /api/settings                          - Update user settings
POST   /api/settings/export                   - Export all data
POST   /api/settings/import                   - Import data from backup
```

### 5.2 API Response Format

#### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation successful",
  "timestamp": "2025-11-29T12:00:00Z"
}
```

#### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "amount",
        "message": "Amount must be greater than 0"
      }
    ]
  },
  "timestamp": "2025-11-29T12:00:00Z"
}
```

---

## 6. Frontend Implementation Details

### 6.1 State Management (Zustand)

```typescript
// portfolioStore.ts
interface Portfolio {
  portfolioId: string;
  name: string;
  totalValue: number;
  // ... other fields
}

interface PortfolioStore {
  portfolios: Portfolio[];
  currentPortfolio: Portfolio | null;
  loading: boolean;
  error: string | null;
  
  fetchPortfolios: () => Promise<void>;
  selectPortfolio: (id: string) => void;
  createPortfolio: (data: Partial<Portfolio>) => Promise<void>;
  updatePortfolio: (id: string, data: Partial<Portfolio>) => Promise<void>;
  deletePortfolio: (id: string) => Promise<void>;
}

const usePortfolioStore = create<PortfolioStore>((set, get) => ({
  portfolios: [],
  currentPortfolio: null,
  loading: false,
  error: null,
  
  fetchPortfolios: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/portfolios');
      set({ portfolios: response.data.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  
  // ... other methods
}));
```

### 6.2 Custom Hooks

```typescript
// useAuth.ts
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    return auth.signInWithEmailAndPassword(email, password);
  };

  const logout = async () => {
    return auth.signOut();
  };

  return { user, loading, login, logout };
};

// usePortfolio.ts
export const usePortfolio = (portfolioId: string) => {
  const [portfolio, setPortfolio] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const [portfolioData, transactionsData, analyticsData] = 
        await Promise.all([
          api.get(`/portfolios/${portfolioId}`),
          api.get(`/transactions?portfolioId=${portfolioId}`),
          api.get(`/analytics/performance?portfolioId=${portfolioId}`)
        ]);
      
      setPortfolio(portfolioData.data.data);
      setTransactions(transactionsData.data.data);
      setAnalytics(analyticsData.data.data);
    };

    if (portfolioId) {
      fetchData();
    }
  }, [portfolioId]);

  return { portfolio, transactions, analytics };
};
```

### 6.3 Routing Structure

```typescript
// App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <BrowserRouter basename="/Portfolio-Management-Web-Application">
      <Routes>
        <Route path="/login" element={
          user ? <Navigate to="/dashboard" /> : <Login />
        } />
        
        <Route element={<ProtectedRoute user={user} />}>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/portfolio/:type" element={<PortfolioDetail />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 6.4 Responsive Design Breakpoints

```typescript
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'xs': '320px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        // ... more colors
      },
    },
  },
};
```

---

## 7. Deployment Architecture

### 7.1 GitHub Pages Deployment

#### Build Configuration
```json
// package.json
{
  "name": "portfolio-management-app",
  "version": "1.0.0",
  "homepage": "https://supawitsaelimscb.github.io/Portfolio-Management-Web-Application",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "deploy": "npm run build && gh-pages -d dist"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    // ... more dependencies
  },
  "devDependencies": {
    "gh-pages": "^6.1.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0"
  }
}
```

#### Vite Configuration
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/Portfolio-Management-Web-Application/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'charts': ['recharts'],
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore']
        }
      }
    }
  }
});
```

### 7.2 GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test

      - name: Build
        run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.FIREBASE_APP_ID }}

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: ./dist

      - name: Deploy to GitHub Pages
        uses: actions/deploy-pages@v3
```

### 7.3 Firebase Configuration

```typescript
// src/services/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

### 7.4 Environment Variables

```bash
# .env.example
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# For production, add these to GitHub Secrets
```

---

## 8. Security Considerations

### 8.1 Authentication & Authorization
- Use Firebase Authentication for secure user management
- Implement JWT token validation
- Secure password requirements (min 8 chars, uppercase, lowercase, number)
- Rate limiting on authentication endpoints
- Session timeout after 24 hours of inactivity

### 8.2 Data Security
- All API calls over HTTPS
- Firestore security rules enforce user data isolation
- Input validation on both client and server
- XSS protection through React's built-in escaping
- CSRF protection using Firebase Authentication tokens

### 8.3 API Security
```typescript
// Example: API request with authentication
import axios from 'axios';
import { auth } from './firebase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Request interceptor to add auth token
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 8.4 Client-Side Security
- No sensitive data in localStorage
- Sanitize all user inputs
- Content Security Policy headers
- Regular dependency updates
- Secure environment variable handling

---

## 9. Performance Optimization

### 9.1 Code Splitting
```typescript
// Lazy loading routes
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const Analytics = lazy(() => import('./pages/Analytics'));

function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </Suspense>
  );
}
```

### 9.2 Caching Strategy
- Cache API responses using React Query or SWR
- Service Worker for offline support
- Firestore local persistence
- Image optimization and lazy loading

### 9.3 Bundle Optimization
- Tree shaking with Vite
- Code splitting by route
- Vendor chunk separation
- Compression (Gzip/Brotli)
- Minification

### 9.4 Database Optimization
- Indexed queries for common operations
- Pagination for large datasets
- Aggregate data in analytics collection
- Batch writes for bulk operations

---

## 10. Testing Strategy

### 10.1 Unit Testing
```typescript
// Example: Component test
import { render, screen } from '@testing-library/react';
import { PortfolioCard } from './PortfolioCard';

describe('PortfolioCard', () => {
  it('displays portfolio total value', () => {
    const portfolio = {
      name: 'My Portfolio',
      totalValue: 100000,
      currency: 'THB'
    };
    
    render(<PortfolioCard portfolio={portfolio} />);
    
    expect(screen.getByText('฿100,000.00')).toBeInTheDocument();
  });
});
```

### 10.2 Integration Testing
- Test API integration with Firebase
- Test authentication flows
- Test data persistence
- Test real-time updates

### 10.3 E2E Testing (Cypress)
```typescript
// Example: E2E test
describe('Portfolio Management', () => {
  it('user can create a new transaction', () => {
    cy.visit('/transactions');
    cy.get('[data-testid="add-transaction-btn"]').click();
    cy.get('[name="type"]').select('mutualFund');
    cy.get('[name="amount"]').type('10000');
    cy.get('[name="fundName"]').type('SCBS&P500');
    cy.get('[type="submit"]').click();
    cy.contains('Transaction created successfully').should('be.visible');
  });
});
```

---

## 11. Monitoring & Analytics

### 11.1 Error Tracking
- Implement Sentry for error monitoring
- Log errors to Firebase Analytics
- Track API failures
- Monitor authentication errors

### 11.2 Performance Monitoring
- Firebase Performance Monitoring
- Web Vitals tracking (LCP, FID, CLS)
- API response time monitoring
- Database query performance

### 11.3 User Analytics
- Google Analytics 4
- Firebase Analytics
- Track user flows
- Monitor feature usage

---

## 12. Development Workflow

### 12.1 Git Workflow
```
main (production)
  └── develop (staging)
       ├── feature/dashboard
       ├── feature/portfolio-management
       ├── feature/analytics
       └── bugfix/transaction-validation
```

### 12.2 Branch Naming Convention
- `feature/feature-name` - New features
- `bugfix/bug-description` - Bug fixes
- `hotfix/critical-fix` - Production hotfixes
- `refactor/component-name` - Code refactoring
- `docs/documentation-update` - Documentation changes

### 12.3 Commit Message Convention
```
type(scope): subject

body

footer
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Example:
```
feat(portfolio): add mutual fund transaction form

- Implement form validation
- Add unit purchase calculation
- Integrate with Firestore

Closes #123
```

---

## 13. Scalability Considerations

### 13.1 Current Free Tier Limits

**Firebase Firestore (Spark Plan)**
- Storage: 1 GB
- Reads: 50,000/day
- Writes: 20,000/day
- Deletes: 20,000/day

**Estimated Usage for 100 Active Users**
- Daily reads: ~5,000 (well within limit)
- Daily writes: ~1,000 (well within limit)
- Storage: ~50 MB (well within limit)

### 13.2 Upgrade Path
When limits are reached:
1. Upgrade to Firebase Blaze Plan (pay-as-you-go)
2. Implement caching to reduce reads
3. Use Cloud Functions for aggregations
4. Consider CDN for static assets

### 13.3 Future Enhancements
- Progressive Web App (PWA)
- Native mobile apps (React Native)
- Real-time collaboration
- AI-powered insights
- Advanced reporting

---

## 14. Documentation & Support

### 14.1 Developer Documentation
- API documentation (Swagger/OpenAPI)
- Component Storybook
- Code comments and JSDoc
- README with setup instructions

### 14.2 User Documentation
- User guide
- Tutorial videos
- FAQ section
- Troubleshooting guide

### 14.3 Maintenance Plan
- Weekly dependency updates
- Monthly security audits
- Quarterly feature reviews
- Annual architecture review

---

## 15. Success Metrics

### 15.1 Technical Metrics
- **Performance**
  - Page load time < 2 seconds
  - Time to Interactive < 3 seconds
  - API response time < 500ms
  
- **Reliability**
  - Uptime > 99.5%
  - Error rate < 0.1%
  - Successful deployment rate > 95%

- **Code Quality**
  - Test coverage > 80%
  - Zero critical security vulnerabilities
  - Lighthouse score > 90

### 15.2 Business Metrics
- User adoption rate
- Daily active users
- Feature usage statistics
- User satisfaction score

---

## Appendices

### Appendix A: Useful Resources
- [React Documentation](https://react.dev)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev)

### Appendix B: Third-Party Services
- **Firebase** - Backend & Database (Free tier)
- **GitHub Pages** - Frontend Hosting (Free)
- **GitHub Actions** - CI/CD (Free for public repos)

### Appendix C: Development Timeline
- **Week 1-2:** Project setup, Firebase configuration, basic authentication
- **Week 3-4:** Dashboard and portfolio overview implementation
- **Week 5-6:** Transaction management and CRUD operations
- **Week 7-8:** Analytics and charts implementation
- **Week 9-10:** Testing, bug fixes, and optimization
- **Week 11-12:** Documentation, deployment, and launch

---

**Document Prepared By:** Technical Architecture Team  
**Review Status:** Ready for Development  
**Next Review Date:** December 29, 2025
