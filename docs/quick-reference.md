# Quick Reference Guide
## Portfolio Management Web Application

A concise reference for common development tasks, commands, and configurations.

---

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to GitHub Pages
npm run deploy

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Type check
npm run type-check

# Format code
npm run format
```

---

## 🔥 Firebase Commands

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in project
firebase init

# Deploy Cloud Functions
firebase deploy --only functions

# Deploy Security Rules
firebase deploy --only firestore:rules

# Deploy Indexes
firebase deploy --only firestore:indexes

# Export Firestore data
firebase firestore:export gs://your-bucket/backups/$(date +%Y%m%d)

# Import Firestore data
firebase firestore:import gs://your-bucket/backups/20251129

# View Firebase logs
firebase functions:log

# Run emulator suite
firebase emulators:start
```

---

## 📂 Project Structure

```
Portfolio-Management-Web-Application/
├── .github/                    # GitHub Actions workflows
│   └── workflows/
│       └── deploy.yml         # Deployment workflow
├── docs/                      # Documentation
│   ├── requirements.md        # Project requirements
│   ├── technical-architecture.md
│   ├── setup-guide.md
│   ├── api-documentation.md
│   ├── database-schema.md
│   └── deployment-checklist.md
├── public/                    # Static assets
│   ├── favicon.ico
│   └── robots.txt
├── src/                       # Source code
│   ├── components/           # React components
│   │   ├── layout/          # Layout components
│   │   ├── dashboard/       # Dashboard components
│   │   ├── portfolio/       # Portfolio components
│   │   ├── transactions/    # Transaction components
│   │   ├── analytics/       # Analytics components
│   │   ├── charts/          # Chart components
│   │   └── common/          # Shared components
│   ├── pages/               # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Portfolio.tsx
│   │   ├── Transactions.tsx
│   │   ├── Analytics.tsx
│   │   └── Settings.tsx
│   ├── services/            # API services
│   │   ├── firebase.ts      # Firebase config
│   │   ├── api.ts           # API client
│   │   ├── auth.ts          # Auth service
│   │   └── portfolio.ts     # Portfolio service
│   ├── store/               # State management
│   │   ├── authStore.ts
│   │   ├── portfolioStore.ts
│   │   └── settingsStore.ts
│   ├── hooks/               # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── usePortfolio.ts
│   │   └── useTransactions.ts
│   ├── utils/               # Utility functions
│   │   ├── calculations.ts
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── constants.ts
│   ├── types/               # TypeScript types
│   │   ├── portfolio.ts
│   │   ├── transaction.ts
│   │   └── user.ts
│   ├── App.tsx             # Root component
│   └── main.tsx            # Entry point
├── .env.example            # Environment template
├── .gitignore              # Git ignore rules
├── index.html              # HTML template
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
├── vite.config.ts          # Vite config
├── tailwind.config.js      # Tailwind config
└── README.md               # Project readme
```

---

## 🎨 Component Naming Conventions

### File Naming
- **Components:** PascalCase - `PortfolioCard.tsx`
- **Hooks:** camelCase with 'use' prefix - `usePortfolio.ts`
- **Utilities:** camelCase - `formatCurrency.ts`
- **Types:** PascalCase - `Portfolio.ts`
- **Constants:** UPPER_SNAKE_CASE - `API_ENDPOINTS.ts`

### Component Structure
```typescript
// ComponentName.tsx
import { useState, useEffect } from 'react';
import { SomeType } from '@/types';

interface ComponentNameProps {
  prop1: string;
  prop2?: number;
}

export const ComponentName: React.FC<ComponentNameProps> = ({ 
  prop1, 
  prop2 = 0 
}) => {
  // Hooks
  const [state, setState] = useState<string>('');

  // Effects
  useEffect(() => {
    // Effect logic
  }, []);

  // Handlers
  const handleClick = () => {
    // Handler logic
  };

  // Render
  return (
    <div className="container">
      {/* Component JSX */}
    </div>
  );
};
```

---

## 🔧 Environment Variables

### Development (.env)
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc...

# Optional
VITE_APP_NAME=Portfolio Management
VITE_APP_VERSION=1.0.0
```

### Production (GitHub Secrets)
Same variables without `VITE_` prefix:
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- etc.

---

## 🗄️ Database Quick Reference

### Collections
- **users** - User profiles and preferences
- **portfolios** - Portfolio information
- **transactions** - All transaction records
- **analytics** - Cached analytics data

### Common Queries

**Get User's Portfolios:**
```typescript
const q = query(
  collection(db, 'portfolios'),
  where('userId', '==', userId)
);
```

**Get Recent Transactions:**
```typescript
const q = query(
  collection(db, 'transactions'),
  where('portfolioId', '==', portfolioId),
  orderBy('date', 'desc'),
  limit(20)
);
```

**Get Transactions by Type:**
```typescript
const q = query(
  collection(db, 'transactions'),
  where('userId', '==', userId),
  where('type', '==', 'mutualFund'),
  orderBy('date', 'desc')
);
```

---

## 🎯 Common Tasks

### Add New Component

1. Create component file:
```bash
touch src/components/common/NewComponent.tsx
```

2. Component template:
```typescript
import React from 'react';

interface NewComponentProps {
  // Props
}

export const NewComponent: React.FC<NewComponentProps> = (props) => {
  return (
    <div>
      {/* Component content */}
    </div>
  );
};
```

3. Export from index (if using barrel exports):
```typescript
// src/components/common/index.ts
export { NewComponent } from './NewComponent';
```

---

### Add New Page

1. Create page file:
```bash
touch src/pages/NewPage.tsx
```

2. Add route in App.tsx:
```typescript
<Route path="/new-page" element={<NewPage />} />
```

3. Add navigation link:
```typescript
<Link to="/new-page">New Page</Link>
```

---

### Add New API Endpoint

1. Define type:
```typescript
// src/types/newType.ts
export interface NewType {
  id: string;
  name: string;
}
```

2. Create service:
```typescript
// src/services/newService.ts
export const getNewData = async (): Promise<NewType[]> => {
  const response = await api.get('/new-endpoint');
  return response.data;
};
```

3. Create hook:
```typescript
// src/hooks/useNewData.ts
export const useNewData = () => {
  const [data, setData] = useState<NewType[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      const result = await getNewData();
      setData(result);
    };
    fetchData();
  }, []);
  
  return { data };
};
```

---

### Add New Store

1. Create store file:
```typescript
// src/store/newStore.ts
import create from 'zustand';

interface NewStore {
  data: any[];
  loading: boolean;
  fetchData: () => Promise<void>;
}

export const useNewStore = create<NewStore>((set) => ({
  data: [],
  loading: false,
  
  fetchData: async () => {
    set({ loading: true });
    try {
      const data = await api.get('/endpoint');
      set({ data, loading: false });
    } catch (error) {
      set({ loading: false });
    }
  }
}));
```

2. Use in component:
```typescript
const { data, loading, fetchData } = useNewStore();
```

---

## 🧪 Testing

### Unit Test Template
```typescript
// ComponentName.test.tsx
import { render, screen } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName prop1="test" />);
    expect(screen.getByText('test')).toBeInTheDocument();
  });
  
  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<ComponentName onClick={handleClick} />);
    
    screen.getByRole('button').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Run Specific Test
```bash
# Run single test file
npm test ComponentName.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="renders correctly"

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

---

## 🎨 Styling Reference

### Tailwind Classes

**Layout:**
```jsx
<div className="container mx-auto px-4">
<div className="flex items-center justify-between">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

**Typography:**
```jsx
<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
<p className="text-base text-gray-600 leading-relaxed">
```

**Buttons:**
```jsx
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
```

**Cards:**
```jsx
<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
```

**Responsive:**
```jsx
<div className="hidden md:block">  {/* Desktop only */}
<div className="md:hidden">        {/* Mobile only */}
```

---

## 🐛 Debugging

### Enable Debug Mode
```typescript
// src/main.tsx
if (import.meta.env.DEV) {
  console.log('🚀 Debug mode enabled');
}
```

### Firebase Debug
```typescript
// Enable Firestore debug logging
import { enableNetwork, disableNetwork } from 'firebase/firestore';

// Check connection
enableNetwork(db).then(() => {
  console.log('✅ Firestore connected');
});
```

### React DevTools
1. Install React Developer Tools extension
2. Open browser DevTools
3. Go to "Components" or "Profiler" tab

### Network Debugging
```typescript
// Log all API requests
api.interceptors.request.use(request => {
  console.log('📤', request.method, request.url);
  return request;
});

api.interceptors.response.use(response => {
  console.log('📥', response.status, response.config.url);
  return response;
});
```

---

## 🔍 Common Issues

### Build Fails
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf dist .vite
npm run build
```

### Firebase Connection Failed
1. Check `.env` variables
2. Verify Firebase project active
3. Check network connection
4. Review security rules

### GitHub Pages 404
1. Verify `base` in `vite.config.ts`
2. Check repository name matches
3. Ensure `gh-pages` branch exists
4. Clear browser cache

---

## 📚 Useful Links

### Documentation
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Firebase Docs](https://firebase.google.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Tools
- [Firebase Console](https://console.firebase.google.com)
- [GitHub Repository](https://github.com/supawitsaelimscb/Portfolio-Management-Web-Application)
- [npm Package Search](https://www.npmjs.com)

---

## 💡 Best Practices

### Code Organization
- Keep components small and focused
- Use custom hooks for reusable logic
- Separate business logic from UI
- Use TypeScript for type safety

### Performance
- Lazy load routes and heavy components
- Memoize expensive calculations
- Use React.memo for pure components
- Implement virtual scrolling for long lists

### Security
- Never commit secrets to Git
- Always validate user input
- Use environment variables
- Keep dependencies updated

### Git Workflow
- Commit frequently with clear messages
- Use feature branches
- Write meaningful PR descriptions
- Review code before merging

---

**Last Updated:** November 29, 2025  
**Version:** 1.0

---

**Need more help?** Check the [full documentation](../README.md) or [create an issue](https://github.com/supawitsaelimscb/Portfolio-Management-Web-Application/issues).
