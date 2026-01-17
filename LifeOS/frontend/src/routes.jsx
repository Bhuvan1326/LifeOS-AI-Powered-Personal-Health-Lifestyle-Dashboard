import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Loader from './components/Loader'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import Dashboard from './pages/Dashboard/Dashboard'
import LifeScore from './pages/Dashboard/LifeScore'
import Insights from './pages/Dashboard/Insights'
import Habits from './pages/Habits/Habits'
import Nutrition from './pages/Nutrition/Nutrition'
import Mood from './pages/Mood/Mood'
import Finance from './pages/Finance/Finance'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return <Loader />
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 ml-64 mt-16">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function AppRoutes() {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return <Loader />
  }
  
  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
      } />
      <Route path="/register" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
      } />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AppLayout><Dashboard /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/life-score" element={
        <ProtectedRoute>
          <AppLayout><LifeScore /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/insights" element={
        <ProtectedRoute>
          <AppLayout><Insights /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/habits" element={
        <ProtectedRoute>
          <AppLayout><Habits /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/nutrition" element={
        <ProtectedRoute>
          <AppLayout><Nutrition /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/mood" element={
        <ProtectedRoute>
          <AppLayout><Mood /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/finance" element={
        <ProtectedRoute>
          <AppLayout><Finance /></AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
