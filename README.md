# Portfolio Management Web Application 💼

A modern, responsive web application for managing personal investment portfolios built with React and Firebase. Track multiple investment types including Cooperative savings, PVD (Provident Fund), Mutual Funds, Stocks, and Savings accounts.

[![Deployed on GitHub Pages](https://img.shields.io/badge/Deployed-GitHub%20Pages-blue)](https://supawitsaelimscb.github.io/Portfolio-Management-Web-Application)
[![Built with React](https://img.shields.io/badge/Built%20with-React-61DAFB?logo=react)](https://react.dev)
[![Database Firebase](https://img.shields.io/badge/Database-Firebase-FFCA28?logo=firebase)](https://firebase.google.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)

---

## 🌟 Features

### Core Features
- 📊 **Comprehensive Dashboard** - Real-time portfolio overview with key metrics
- 💰 **Multiple Investment Types** - Track Cooperative, PVD, Mutual Funds, Stocks, and Savings
- 📈 **Advanced Analytics** - Performance tracking, ROI calculations, and trend analysis
- 📱 **Responsive Design** - Seamless experience on desktop, tablet, and mobile
- 🔐 **Secure Authentication** - Firebase-powered user authentication
- ☁️ **Cloud Sync** - Real-time data synchronization across devices
- 🌙 **Dark Mode** - Support for light and dark themes
- 🌍 **Multi-language** - English and Thai language support
- 📤 **Import/Export** - Bulk transaction import and data export capabilities

### Investment Type Features

#### 🏦 Cooperative Account
- Monthly contribution tracking
- Running total calculation
- Historical contribution view

#### 💼 PVD (Provident Fund)
- Employee and employer contribution tracking
- Automatic percentage calculation
- Cumulative value monitoring

#### 📊 Mutual Funds
- Multiple fund support
- Unit cost averaging
- Current valuation vs purchase value
- Profit/loss calculation

#### 📈 Stock Investment
- Multi-currency support (USD/THB)
- Exchange rate tracking
- Average cost per share
- Portfolio performance metrics

#### 💵 Savings Account
- Simple deposit tracking
- Balance history
- Running balance calculation

---

## 🚀 Live Demo

**Visit the live application:** [https://supawitsaelimscb.github.io/Portfolio-Management-Web-Application](https://supawitsaelimscb.github.io/Portfolio-Management-Web-Application)

---

## 📋 Documentation

Comprehensive documentation is available in the `/docs` folder:

| Document | Description |
|----------|-------------|
| **[Requirements](docs/requirements.md)** | Complete functional and non-functional requirements |
| **[Technical Architecture](docs/technical-architecture.md)** | System architecture, technology stack, and design patterns |
| **[Setup Guide](docs/setup-guide.md)** | Step-by-step installation and configuration instructions |
| **[API Documentation](docs/api-documentation.md)** | Complete API reference and examples |
| **[Database Schema](docs/database-schema.md)** | Firestore collections, security rules, and query patterns |

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 18.x with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Routing:** React Router v6
- **Charts:** Recharts
- **Forms:** React Hook Form
- **Animations:** Framer Motion

### Backend & Database
- **Authentication:** Firebase Authentication
- **Database:** Firebase Firestore (Free tier)
- **Serverless Functions:** Firebase Cloud Functions
- **Storage:** Firebase Storage

### Deployment
- **Hosting:** GitHub Pages
- **CI/CD:** GitHub Actions
- **DNS:** GitHub Domains

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   GitHub Pages (Frontend)                │
│  React SPA + Tailwind CSS + TypeScript + Zustand        │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS
                       ▼
┌─────────────────────────────────────────────────────────┐
│                  Firebase Backend                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Authentication  │  Firestore  │  Cloud Functions│   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Installation

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0 or yarn >= 1.22.0
- Firebase account (free tier)
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/supawitsaelimscb/Portfolio-Management-Web-Application.git
   cd Portfolio-Management-Web-Application
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
   - Enable Authentication (Email/Password)
   - Create Firestore database
   - Copy Firebase config

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:5173](http://localhost:5173)

For detailed setup instructions, see [Setup Guide](docs/setup-guide.md).

---

## 🚀 Deployment

### Deploy to GitHub Pages

1. **Update `package.json`**
   ```json
   {
     "homepage": "https://yourusername.github.io/your-repo-name"
   }
   ```

2. **Build and deploy**
   ```bash
   npm run build
   npm run deploy
   ```

### Automatic Deployment

The project includes GitHub Actions workflow for automatic deployment:
- Push to `main` branch triggers deployment
- Build, test, and deploy automatically
- No manual intervention required

See [Technical Architecture](docs/technical-architecture.md#deployment-architecture) for details.

---

## 📱 Screenshots

### Dashboard
![Dashboard](docs/images/dashboard.png)

### Portfolio Management
![Portfolio](docs/images/portfolio.png)

### Analytics
![Analytics](docs/images/analytics.png)

---

## 🎯 Roadmap

### Phase 1: MVP ✅
- [x] Dashboard with summary view
- [x] Basic CRUD for all investment types
- [x] Charts and visualizations
- [x] Responsive layout
- [x] Firebase integration

### Phase 2: Enhanced Features 🚧
- [ ] Advanced analytics
- [ ] Export to PDF/Excel
- [ ] Bulk CSV import
- [ ] Custom investment types
- [ ] Dark mode enhancement

### Phase 3: Advanced Features 📋
- [ ] Real-time market data integration
- [ ] Investment goals and planning
- [ ] Email notifications
- [ ] Multi-user portfolios

### Phase 4: Premium Features 💡
- [ ] Native mobile apps
- [ ] AI-powered insights
- [ ] Financial advisor tools
- [ ] Cryptocurrency tracking

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Update documentation
- Follow conventional commits
- Ensure all tests pass

---

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Type checking
npm run type-check

# Linting
npm run lint
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Supawit Saelim**
- GitHub: [@supawitsaelimscb](https://github.com/supawitsaelimscb)
- Repository: [Portfolio-Management-Web-Application](https://github.com/supawitsaelimscb/Portfolio-Management-Web-Application)

---

## 🙏 Acknowledgments

- [React](https://react.dev) - UI framework
- [Firebase](https://firebase.google.com) - Backend and database
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Recharts](https://recharts.org) - Data visualization
- [Vite](https://vitejs.dev) - Build tool

---

## 📞 Support

If you have any questions or issues:

1. Check the [Documentation](docs/)
2. Search [Existing Issues](https://github.com/supawitsaelimscb/Portfolio-Management-Web-Application/issues)
3. Create a [New Issue](https://github.com/supawitsaelimscb/Portfolio-Management-Web-Application/issues/new)

---

## ⭐ Show Your Support

Give a ⭐️ if this project helped you!

---

**Built with ❤️ using React and Firebase**