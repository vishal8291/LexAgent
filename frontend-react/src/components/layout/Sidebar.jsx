import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'

const items = [
  { section: 'Main', links: [
    { icon: '🏠', label: 'Dashboard', sub: 'Your overview', path: '/dashboard', auth: true },
    { icon: '📄', label: 'Analyzer', sub: 'Analyze contracts', path: '/' },
    { icon: '📋', label: 'My Reports', sub: 'View past analyses', path: '/reports', auth: true },
    { icon: '👨‍💼', label: 'CA Connect', sub: 'Talk to a CA', path: '/ca' },
    { icon: '💎', label: 'Pricing', sub: 'Plans & subscription', path: '/pricing' },
  ]},
  { section: 'Preferences', links: [
    { icon: '🌐', label: 'Language', sub: 'Change report language', path: '/settings' },
    { icon: '⚙️', label: 'Settings', sub: 'App preferences', path: '/settings' },
  ]},
  { section: 'Info', links: [
    { icon: 'ℹ️', label: 'About', sub: 'Our mission', path: '/about' },
    { icon: '📜', label: 'Terms', sub: 'Usage terms', path: '/terms' },
    { icon: '🔒', label: 'Privacy', sub: 'Data protection', path: '/privacy' },
    { icon: '💬', label: 'Help', sub: 'Get assistance', path: '/help' },
  ]},
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const { sidebarOpen, setSidebarOpen, openAuthModal } = useApp()
  const navigate = useNavigate()

  const go = (path, auth) => {
    if (auth && !user) { openAuthModal('login'); setSidebarOpen(false); return }
    navigate(path)
    setSidebarOpen(false)
  }

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setSidebarOpen(false)} />
      )}
      <div className={`fixed top-0 left-0 h-full w-72 bg-[#0d0d18] border-r border-border z-50 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 border-b border-border flex justify-between items-center">
          <span className="text-xl font-bold"><span className="text-primary">Lex</span><span className="text-white">Agent</span></span>
          <button onClick={() => setSidebarOpen(false)} className="text-muted hover:text-white text-xl bg-transparent border-0 cursor-pointer">×</button>
        </div>

        {user && (
          <div className="p-4 border-b border-border">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-indigo-800 flex items-center justify-center text-white font-bold text-sm mb-2">
              {(user.name || user.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="text-sm font-medium text-white">{user.name || 'User'}</div>
            <div className="text-xs text-muted truncate">{user.email}</div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto py-2">
          {items.map(group => (
            <div key={group.section}>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted/50 px-5 py-3">{group.section}</div>
              {group.links.map(item => (
                <button
                  key={item.label}
                  onClick={() => go(item.path, item.auth)}
                  className="w-full flex items-center gap-3 px-5 py-3 text-left text-muted hover:bg-white/5 hover:text-white transition-all bg-transparent border-0 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm flex-shrink-0">{item.icon}</div>
                  <div>
                    <div className="text-sm font-medium">{item.label}</div>
                    <div className="text-xs text-muted/60">{item.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          ))}

          <div className="mx-4 my-2 h-px bg-border" />

          {user ? (
            <button
              onClick={() => { logout(); setSidebarOpen(false) }}
              className="w-full flex items-center gap-3 px-5 py-3 text-red-400 hover:bg-red-900/20 transition-all bg-transparent border-0 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-red-900/20 flex items-center justify-center text-sm flex-shrink-0">🚪</div>
              <div className="text-sm font-medium">Logout</div>
            </button>
          ) : (
            <button
              onClick={() => { openAuthModal('login'); setSidebarOpen(false) }}
              className="w-full flex items-center gap-3 px-5 py-3 text-primary hover:bg-primary/10 transition-all bg-transparent border-0 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-sm flex-shrink-0">🔑</div>
              <div className="text-sm font-medium">Sign In</div>
            </button>
          )}
        </div>

        <div className="p-4 border-t border-border text-center text-xs text-muted/40">
          LexAgent v2.0 • AI Legal Auditor
        </div>
      </div>
    </>
  )
}