import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import Navbar from './components/layout/Navbar'
import Sidebar from './components/layout/Sidebar'
import AuthModal from './components/ui/AuthModal'
import Home from './pages/Home'
import Results from './pages/Results'
import Reports from './pages/Reports'
import CAConnect from './pages/CAConnect'
import Pricing from './pages/Pricing'
import Settings from './pages/Settings'
import About from './pages/About'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Help from './pages/Help'
import Dashboard from './pages/Dashboard'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <div className="min-h-screen bg-surface">
            <Navbar />
            <Sidebar />
            <AuthModal />
            <main>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/" element={<Home />} />
                <Route path="/results" element={<Results />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/ca" element={<CAConnect />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/about" element={<About />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/help" element={<Help />} />
              </Routes>
            </main>
          </div>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}