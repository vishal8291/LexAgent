import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import Button from '../ui/Button'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { setSidebarOpen, openAuthModal } = useApp()
  const navigate = useNavigate()

  return (
    <nav className="border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-40 bg-surface/80 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="w-9 h-9 border border-border rounded-lg flex items-center justify-center text-muted hover:border-primary hover:text-primary transition-all bg-transparent cursor-pointer"
        >
          ☰
        </button>
        <Link to="/" className="text-xl font-bold">
          <span className="text-primary">Lex</span>
          <span className="text-white">Agent</span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <span className="text-xs text-muted hidden sm:block">{user.email}</span>
            <Button variant="outline" size="sm" onClick={() => navigate('/reports')}>My Reports</Button>
            <Button variant="ghost" size="sm" onClick={logout}>Logout</Button>
          </>
        ) : (
          <>
            <Button variant="outline" size="sm" onClick={() => openAuthModal('login')}>Sign In</Button>
            <Button size="sm" onClick={() => openAuthModal('signup')}>Sign Up Free</Button>
          </>
        )}
      </div>
    </nav>
  )
}