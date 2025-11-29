# Database Schema & Migration Guide
## Portfolio Management Web Application

**Version:** 1.0  
**Database:** Firebase Firestore  
**Last Updated:** November 29, 2025

---

## Table of Contents
1. [Overview](#overview)
2. [Collection Schemas](#collection-schemas)
3. [Data Relationships](#data-relationships)
4. [Indexes](#indexes)
5. [Security Rules](#security-rules)
6. [Data Migration](#data-migration)
7. [Backup Strategy](#backup-strategy)
8. [Query Patterns](#query-patterns)

---

## 1. Overview

### Database Type
- **NoSQL Document Database** (Firebase Firestore)
- **Structure:** Collections → Documents → Fields
- **Features:** Real-time sync, offline support, automatic scaling

### Key Features
- ✅ Real-time synchronization
- ✅ Offline data persistence
- ✅ Automatic indexing
- ✅ ACID transactions
- ✅ Security rules at database level
- ✅ Free tier: 1GB storage, 50K reads/day, 20K writes/day

---

## 2. Collection Schemas

### 2.1 Users Collection

**Path:** `/users/{userId}`

```typescript
interface User {
  // Primary Key
  uid: string;                    // Firebase Auth UID
  
  // Basic Info
  email: string;
  displayName: string;
  photoURL?: string;
  
  // Preferences
  preferences: {
    currency: 'THB' | 'USD';
    dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
    language: 'en' | 'th';
    theme: 'light' | 'dark' | 'auto';
    notifications: {
      email: boolean;
      push: boolean;
      weekly_summary: boolean;
    };
  };
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;
}
```

**Example Document:**
```json
{
  "uid": "kQr5xY8zP3aCbN1mW7tU",
  "email": "user@example.com",
  "displayName": "John Doe",
  "photoURL": "https://example.com/photo.jpg",
  "preferences": {
    "currency": "THB",
    "dateFormat": "DD/MM/YYYY",
    "language": "en",
    "theme": "light",
    "notifications": {
      "email": true,
      "push": false,
      "weekly_summary": true
    }
  },
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-11-29T12:00:00.000Z",
  "lastLoginAt": "2025-11-29T12:00:00.000Z"
}
```

---

### 2.2 Portfolios Collection

**Path:** `/portfolios/{portfolioId}`

```typescript
interface Portfolio {
  // Primary Key
  portfolioId: string;            // Auto-generated
  
  // Relationships
  userId: string;                 // FK to users
  
  // Basic Info
  name: string;
  description: string;
  currency: 'THB' | 'USD';
  
  // Calculated Fields (updated via Cloud Functions)
  totalValue: number;
  totalInvested: number;
  totalReturn: number;
  returnPercentage: number;
  
  // Investment Type Breakdown
  investmentTypes: {
    cooperative: {
      count: number;
      totalValue: number;
      totalInvested: number;
      percentage: number;
    };
    pvd: {
      count: number;
      totalValue: number;
      totalInvested: number;
      percentage: number;
    };
    mutualFund: {
      count: number;
      totalValue: number;
      totalInvested: number;
      percentage: number;
    };
    stock: {
      count: number;
      totalValue: number;
      totalInvested: number;
      percentage: number;
    };
    savings: {
      count: number;
      totalValue: number;
      totalInvested: number;
      percentage: number;
    };
  };
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Example Document:**
```json
{
  "portfolioId": "pf_A1B2C3D4E5F6",
  "userId": "kQr5xY8zP3aCbN1mW7tU",
  "name": "Main Investment Portfolio",
  "description": "Primary long-term investments",
  "currency": "THB",
  "totalValue": 500000,
  "totalInvested": 450000,
  "totalReturn": 50000,
  "returnPercentage": 11.11,
  "investmentTypes": {
    "cooperative": {
      "count": 12,
      "totalValue": 50000,
      "totalInvested": 48000,
      "percentage": 10
    },
    "pvd": {
      "count": 24,
      "totalValue": 150000,
      "totalInvested": 140000,
      "percentage": 30
    },
    "mutualFund": {
      "count": 8,
      "totalValue": 200000,
      "totalInvested": 180000,
      "percentage": 40
    },
    "stock": {
      "count": 5,
      "totalValue": 80000,
      "totalInvested": 70000,
      "percentage": 16
    },
    "savings": {
      "count": 12,
      "totalValue": 20000,
      "totalInvested": 12000,
      "percentage": 4
    }
  },
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-11-29T12:00:00.000Z"
}
```

---

### 2.3 Transactions Collection

**Path:** `/transactions/{transactionId}`

```typescript
type TransactionType = 
  | 'cooperative' 
  | 'pvd' 
  | 'mutualFund' 
  | 'stock' 
  | 'savings';

interface BaseTransaction {
  // Primary Key
  transactionId: string;
  
  // Relationships
  userId: string;
  portfolioId: string;
  
  // Common Fields
  type: TransactionType;
  date: Timestamp;
  amount: number;
  currency: 'THB' | 'USD';
  notes?: string;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface CooperativeTransaction extends BaseTransaction {
  type: 'cooperative';
  details: {
    year: number;
    period: number;
    month: string;
    totalInvested: number;
  };
}

interface PVDTransaction extends BaseTransaction {
  type: 'pvd';
  details: {
    year: number;
    period: number;
    month: string;
    employeeContribution: number;
    employerContribution: number;
    contributionPercentage: number;
    totalFundValue: number;
  };
}

interface MutualFundTransaction extends BaseTransaction {
  type: 'mutualFund';
  details: {
    fundName: string;
    installmentNumber: number;
    unitsPurchased: number;
    pricePerUnit: number;
    totalUnits: number;
    currentValue?: number;
    currentPricePerUnit?: number;
  };
}

interface StockTransaction extends BaseTransaction {
  type: 'stock';
  details: {
    stockName: string;
    ticker: string;
    installmentNumber: number;
    unitsPurchased: number;
    pricePerUnit: number;           // In USD
    exchangeRate: number;            // THB per USD
    purchaseValueTHB: number;
    totalInvestment: number;
    currentValue?: number;
    currentPricePerUnit?: number;
  };
}

interface SavingsTransaction extends BaseTransaction {
  type: 'savings';
  details: {
    year: number;
    month: string;
    runningBalance: number;
  };
}

type Transaction = 
  | CooperativeTransaction 
  | PVDTransaction 
  | MutualFundTransaction 
  | StockTransaction 
  | SavingsTransaction;
```

**Example Documents:**

**Mutual Fund Transaction:**
```json
{
  "transactionId": "txn_MF001",
  "userId": "kQr5xY8zP3aCbN1mW7tU",
  "portfolioId": "pf_A1B2C3D4E5F6",
  "type": "mutualFund",
  "date": "2025-11-15T00:00:00.000Z",
  "amount": 10000,
  "currency": "THB",
  "notes": "Regular monthly investment",
  "details": {
    "fundName": "SCBS&P500",
    "installmentNumber": 5,
    "unitsPurchased": 25.5,
    "pricePerUnit": 392.16,
    "totalUnits": 127.5,
    "currentValue": 11500,
    "currentPricePerUnit": 402.00
  },
  "createdAt": "2025-11-15T10:30:00.000Z",
  "updatedAt": "2025-11-29T08:00:00.000Z"
}
```

**Stock Transaction:**
```json
{
  "transactionId": "txn_ST001",
  "userId": "kQr5xY8zP3aCbN1mW7tU",
  "portfolioId": "pf_A1B2C3D4E5F6",
  "type": "stock",
  "date": "2025-11-01T00:00:00.000Z",
  "amount": 1755,
  "currency": "USD",
  "notes": "Apple stock purchase",
  "details": {
    "stockName": "Apple Inc.",
    "ticker": "AAPL",
    "installmentNumber": 3,
    "unitsPurchased": 10,
    "pricePerUnit": 175.50,
    "exchangeRate": 35.20,
    "purchaseValueTHB": 61776,
    "totalInvestment": 185328,
    "currentValue": 65000,
    "currentPricePerUnit": 184.70
  },
  "createdAt": "2025-11-01T08:00:00.000Z",
  "updatedAt": "2025-11-29T08:00:00.000Z"
}
```

**Cooperative Transaction:**
```json
{
  "transactionId": "txn_CO001",
  "userId": "kQr5xY8zP3aCbN1mW7tU",
  "portfolioId": "pf_A1B2C3D4E5F6",
  "type": "cooperative",
  "date": "2025-11-01T00:00:00.000Z",
  "amount": 5000,
  "currency": "THB",
  "details": {
    "year": 2025,
    "period": 11,
    "month": "November",
    "totalInvested": 55000
  },
  "createdAt": "2025-11-01T09:00:00.000Z",
  "updatedAt": "2025-11-01T09:00:00.000Z"
}
```

---

### 2.4 Analytics Collection

**Path:** `/analytics/{analyticsId}`

```typescript
interface Analytics {
  // Primary Key
  analyticsId: string;
  
  // Relationships
  userId: string;
  portfolioId: string;
  
  // Time Period
  date: Timestamp;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  
  // Metrics
  metrics: {
    totalValue: number;
    totalInvested: number;
    totalReturn: number;
    returnPercentage: number;
    
    // By Investment Type
    byType: {
      [key in TransactionType]: {
        value: number;
        invested: number;
        return: number;
        returnPercentage: number;
        percentage: number;
      };
    };
    
    // Trends
    trends: {
      value: {
        current: number;
        previous: number;
        change: number;
        changePercentage: number;
      };
      return: {
        current: number;
        previous: number;
        change: number;
      };
    };
  };
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## 3. Data Relationships

```
users (1) ──── (M) portfolios
              │
              └──── (M) transactions
                    │
                    └──── (1) analytics
```

### Relationship Rules
1. One user can have multiple portfolios
2. One portfolio belongs to one user
3. One portfolio can have multiple transactions
4. One transaction belongs to one portfolio and one user
5. Analytics are generated per portfolio per time period

---

## 4. Indexes

### 4.1 Composite Indexes

**Index 1: User's Portfolio Transactions by Date**
```javascript
Collection: transactions
Fields:
  - userId (Ascending)
  - portfolioId (Ascending)
  - date (Descending)
Query Scope: Collection
```

**Index 2: Transactions by Type and Date**
```javascript
Collection: transactions
Fields:
  - userId (Ascending)
  - type (Ascending)
  - date (Descending)
Query Scope: Collection
```

**Index 3: Portfolio Analytics by Period**
```javascript
Collection: analytics
Fields:
  - portfolioId (Ascending)
  - period (Ascending)
  - date (Descending)
Query Scope: Collection
```

### 4.2 Single Field Indexes (Auto-created)
- `userId`
- `portfolioId`
- `transactionId`
- `date`
- `type`
- `createdAt`

---

## 5. Security Rules

Complete Firestore security rules:

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
    
    function isValidUser() {
      return request.resource.data.keys().hasAll(['email', 'displayName']) &&
             request.resource.data.email is string &&
             request.resource.data.displayName is string;
    }
    
    function isValidPortfolio() {
      return request.resource.data.keys().hasAll(['userId', 'name', 'currency']) &&
             request.resource.data.userId == request.auth.uid &&
             request.resource.data.currency in ['THB', 'USD'];
    }
    
    function isValidTransaction() {
      return request.resource.data.keys().hasAll(['userId', 'portfolioId', 'type', 'date', 'amount']) &&
             request.resource.data.userId == request.auth.uid &&
             request.resource.data.type in ['cooperative', 'pvd', 'mutualFund', 'stock', 'savings'] &&
             request.resource.data.amount is number &&
             request.resource.data.amount > 0;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated() && isOwner(userId);
      allow create: if isAuthenticated() && isOwner(userId) && isValidUser();
      allow update: if isAuthenticated() && isOwner(userId);
      allow delete: if isAuthenticated() && isOwner(userId);
    }
    
    // Portfolios collection
    match /portfolios/{portfolioId} {
      allow read: if isAuthenticated() && 
                     resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && isValidPortfolio();
      allow update: if isAuthenticated() && 
                       resource.data.userId == request.auth.uid;
      allow delete: if isAuthenticated() && 
                       resource.data.userId == request.auth.uid;
    }
    
    // Transactions collection
    match /transactions/{transactionId} {
      allow read: if isAuthenticated() && 
                     resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && isValidTransaction();
      allow update: if isAuthenticated() && 
                       resource.data.userId == request.auth.uid;
      allow delete: if isAuthenticated() && 
                       resource.data.userId == request.auth.uid;
    }
    
    // Analytics collection (read-only for users)
    match /analytics/{analyticsId} {
      allow read: if isAuthenticated() && 
                     resource.data.userId == request.auth.uid;
      allow write: if false; // Only Cloud Functions can write
    }
  }
}
```

---

## 6. Data Migration

### 6.1 Initial Setup

```typescript
// scripts/initializeFirestore.ts
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';

async function initializeFirestore() {
  const db = getFirestore();
  
  // Create sample user
  const userId = 'sample_user_001';
  await setDoc(doc(db, 'users', userId), {
    uid: userId,
    email: 'demo@example.com',
    displayName: 'Demo User',
    preferences: {
      currency: 'THB',
      dateFormat: 'DD/MM/YYYY',
      language: 'en',
      theme: 'light',
      notifications: {
        email: true,
        push: false,
        weekly_summary: true
      }
    },
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  console.log('✅ Firestore initialized');
}
```

### 6.2 Migration from CSV

```typescript
// scripts/importFromCSV.ts
import { parse } from 'csv-parse';
import * as fs from 'fs';

async function importTransactionsFromCSV(filePath: string, portfolioId: string) {
  const parser = fs.createReadStream(filePath).pipe(parse({
    columns: true,
    skip_empty_lines: true
  }));
  
  for await (const record of parser) {
    const transaction = {
      userId: 'current_user_id',
      portfolioId: portfolioId,
      type: record.type,
      date: new Date(record.date),
      amount: parseFloat(record.amount),
      currency: record.currency,
      details: JSON.parse(record.details),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await addDoc(collection(db, 'transactions'), transaction);
  }
  
  console.log('✅ CSV import completed');
}
```

---

## 7. Backup Strategy

### 7.1 Automated Backups (Firebase Console)

1. Go to Firestore > Settings
2. Enable automatic backups
3. Schedule: Daily at 2:00 AM (your timezone)
4. Retention: 30 days

### 7.2 Manual Export

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Export all collections
firebase firestore:export gs://your-bucket/backups/$(date +%Y%m%d)
```

### 7.3 Import from Backup

```bash
# Import specific backup
firebase firestore:import gs://your-bucket/backups/20251129
```

---

## 8. Query Patterns

### 8.1 Get User's Portfolios

```typescript
import { collection, query, where, getDocs } from 'firebase/firestore';

const q = query(
  collection(db, 'portfolios'),
  where('userId', '==', currentUserId)
);

const querySnapshot = await getDocs(q);
const portfolios = querySnapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}));
```

### 8.2 Get Recent Transactions

```typescript
const q = query(
  collection(db, 'transactions'),
  where('userId', '==', currentUserId),
  where('portfolioId', '==', portfolioId),
  orderBy('date', 'desc'),
  limit(20)
);

const querySnapshot = await getDocs(q);
const transactions = querySnapshot.docs.map(doc => doc.data());
```

### 8.3 Get Transactions by Type

```typescript
const q = query(
  collection(db, 'transactions'),
  where('userId', '==', currentUserId),
  where('type', '==', 'mutualFund'),
  orderBy('date', 'desc')
);
```

### 8.4 Pagination

```typescript
// First page
const first = query(
  collection(db, 'transactions'),
  where('userId', '==', currentUserId),
  orderBy('date', 'desc'),
  limit(25)
);

const documentSnapshots = await getDocs(first);
const lastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];

// Next page
const next = query(
  collection(db, 'transactions'),
  where('userId', '==', currentUserId),
  orderBy('date', 'desc'),
  startAfter(lastVisible),
  limit(25)
);
```

### 8.5 Aggregate Queries (Cloud Functions)

```typescript
// Cloud Function to calculate portfolio totals
export const updatePortfolioTotals = functions.firestore
  .document('transactions/{transactionId}')
  .onWrite(async (change, context) => {
    const transaction = change.after.data();
    const portfolioId = transaction.portfolioId;
    
    // Get all transactions for this portfolio
    const snapshot = await db.collection('transactions')
      .where('portfolioId', '==', portfolioId)
      .get();
    
    let totalValue = 0;
    let totalInvested = 0;
    
    snapshot.forEach(doc => {
      const txn = doc.data();
      totalInvested += txn.amount;
      totalValue += txn.details.currentValue || txn.amount;
    });
    
    // Update portfolio
    await db.collection('portfolios').doc(portfolioId).update({
      totalValue,
      totalInvested,
      totalReturn: totalValue - totalInvested,
      returnPercentage: ((totalValue - totalInvested) / totalInvested) * 100,
      updatedAt: new Date()
    });
  });
```

---

## 9. Performance Optimization

### 9.1 Use Indexes Wisely
- Always index fields used in `where`, `orderBy`
- Monitor index usage in Firebase Console
- Remove unused indexes

### 9.2 Limit Query Results
- Use `limit()` for large datasets
- Implement pagination
- Use `startAt()` and `endAt()` for range queries

### 9.3 Cache Frequently Accessed Data
```typescript
import { enableIndexedDbPersistence } from 'firebase/firestore';

// Enable offline persistence
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      console.warn('Multiple tabs open');
    } else if (err.code == 'unimplemented') {
      console.warn('Browser not supported');
    }
  });
```

### 9.4 Use Cloud Functions for Aggregations
- Calculate totals server-side
- Update denormalized data automatically
- Reduce client-side reads

---

## 10. Data Validation

### TypeScript Schemas

```typescript
// utils/validation.ts
import { z } from 'zod';

export const UserSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  displayName: z.string().min(1),
  preferences: z.object({
    currency: z.enum(['THB', 'USD']),
    dateFormat: z.string(),
    language: z.enum(['en', 'th']),
    theme: z.enum(['light', 'dark', 'auto'])
  })
});

export const TransactionSchema = z.object({
  userId: z.string(),
  portfolioId: z.string(),
  type: z.enum(['cooperative', 'pvd', 'mutualFund', 'stock', 'savings']),
  date: z.date(),
  amount: z.number().positive(),
  currency: z.enum(['THB', 'USD']),
  notes: z.string().optional()
});
```

---

**Database Version:** 1.0  
**Last Migration:** November 29, 2025  
**Next Review:** December 29, 2025
