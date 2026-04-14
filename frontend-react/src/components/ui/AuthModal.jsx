import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import Modal from './Modal'
import Button from './Button'

export default function AuthModal() {
  const { login, signup } = useAuth()
  const { authModalOpen, setAuthModalOpen, authMode, setAuthMode } = useApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState('')

  const isLogin = authMode === 'login'

  const handle = async () => {
    if (!email || !password) { setError('Please fill in all fields'); return }
    setLoading(true); setError('')
    try {
      if (isLogin) await login(email, password)
      else await signup(email, password, name)
      setAuthModalOpen(false)
      setEmail(''); setPassword(''); setName('')
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
    } finally { setLoading(false) }
  }

  return (
    <Modal
      isOpen={authModalOpen}
      onClose={() => setAuthModalOpen(false)}
      title={isLogin ? 'Welcome back' : 'Create account'}
      subtitle={isLogin ? 'Sign in to save your history' : 'Free account — save all your reports'}
    >
      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-400 rounded-xl px-4 py-3 text-sm mb-4">{error}</div>
      )}
      {!isLogin && (
        <div className="mb-4">
          <label className="block text-xs text-muted mb-2">Full Name</label>
          <input className="input" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
        </div>
      )}
      <div className="mb-4">
        <label className="block text-xs text-muted mb-2">Email address</label>
        <input className="input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div className="mb-6">
        <label className="block text-xs text-muted mb-2">Password</label>
        <input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handle()} />
      </div>
      <Button onClick={handle} disabled={loading} className="w-full justify-center">
        {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
      </Button>
      <p className="text-center text-sm text-muted mt-4">
        {isLogin ? "Don't have an account? " : 'Already have an account? '}
        <button onClick={() => { setAuthMode(isLogin ? 'signup' : 'login'); setError('') }} className="text-primary cursor-pointer bg-transparent border-0">
          {isLogin ? 'Sign up free' : 'Sign in'}
        </button>
      </p>
    </Modal>
  )
}