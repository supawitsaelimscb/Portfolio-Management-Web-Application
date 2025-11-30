import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Dashboard } from './pages/Dashboard'
import { ForgotPassword } from './pages/ForgotPassword'
import { Settings } from './pages/Settings'
import { PVDDetail } from './pages/PVDDetail'
import { CooperativeDetail } from './pages/CooperativeDetail'
import { ProtectedRoute } from './components/ProtectedRoute'

const basename = import.meta.env.MODE === 'production' ? '/Portfolio-Management-Web-Application' : '';

function App() {
  return (
    <Router basename={basename}>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pvd/:portfolioId"
          element={
            <ProtectedRoute>
              <PVDDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cooperative/:portfolioId"
          element={
            <ProtectedRoute>
              <CooperativeDetail />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
