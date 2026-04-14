import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, API } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import axios from 'axios'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Button from '../components/ui/Button'

const VERDICT_COLORS = {
  Safe:    'bg-green-900/30 text-green-400',
  Caution: 'bg-amber-900/30 text-amber-400',
  Danger:  'bg-red-900/30 text-red-400',
}

export default function Dashboard() {
  const { user, authHeader } = useAuth()
  const { openAuthModal, setCurrentReport } = useApp()
  const navigate = useNavigate()

  const [reports, setReports] = useState([])
  const [bookings, setBookings] = useState([])
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { openAuthModal('login'); return }
    fetchAll()
  }, [user])

  const fetchAll = async () => {
    try {
      const [reportsRes, statusRes, bookingsRes] = await Promise.allSettled([
        axios.get(`${API}/reports`, { headers: authHeader }),
        axios.get(`${API}/user/status`, { headers: authHeader }),
        axios.get(`${API}/bookings`, { headers: authHeader }),
      ])
      if (reportsRes.status === 'fulfilled') setReports(reportsRes.value.data)
      if (statusRes.status === 'fulfilled') setStatus(statusRes.value.data)
      if (bookingsRes.status === 'fulfilled') setBookings(bookingsRes.value.data)
    } catch (e) {
      console.log('Dashboard fetch error', e)
    } finally {
      setLoading(false)
    }
  }

  const openReport = (report) => {
    setCurrentReport(report)
    navigate('/results')
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your dashboard..." />
      </div>
    )
  }

  const monthlyUsed = status?.monthly_analyses || 0
  const isPro = status?.is_pro || false
  const freeLimit = 3
  const usagePercent = isPro ? 100 : Math.min((monthlyUsed / freeLimit) * 100, 100)
  const usageColor = usagePercent >= 100 ? '#f87171' : usagePercent >= 66 ? '#fbbf24' : '#4ade80'

  const initials = (user?.name || user?.email || 'U').charAt(0).toUpperCase()
  const totalReports = reports.length
  const dangerCount = reports.filter(r => r.overall_verdict === 'Danger').length
  const safeCount = reports.filter(r => r.overall_verdict === 'Safe').length

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-indigo-800 flex items-center justify-center text-white font-bold text-xl">
            {initials}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome back{user?.name ? `, ${user.name}` : ''}
            </h1>
            <p className="text-muted text-sm">{user?.email}</p>
          </div>
        </div>
        <Button onClick={() => navigate('/')}>
          + Analyze Contract
        </Button>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Analyses', value: totalReports, color: 'text-primary' },
          { label: 'This Month', value: monthlyUsed, color: 'text-blue-400' },
          { label: 'Danger Contracts', value: dangerCount, color: 'text-red-400' },
          { label: 'Safe Contracts', value: safeCount, color: 'text-green-400' },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-5">
            <div className="text-xs text-muted uppercase tracking-widest mb-2">{s.label}</div>
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* PLAN + USAGE */}
      <div className="grid grid-cols-2 gap-4 mb-6">

        {/* CURRENT PLAN */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="text-xs text-muted uppercase tracking-widest mb-4">Current Plan</div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className={`text-2xl font-bold ${isPro ? 'text-green-400' : 'text-primary'}`}>
                {isPro ? 'Pro' : 'Free'}
              </div>
              <div className="text-xs text-muted mt-1">
                {isPro ? 'Unlimited analyses' : `${freeLimit - monthlyUsed} analyses left this month`}
              </div>
            </div>
            <div className={`text-xs font-bold px-3 py-1.5 rounded-full ${isPro ? 'bg-green-900/30 text-green-400' : 'bg-primary/20 text-primary'}`}>
              {isPro ? 'Active' : 'Free'}
            </div>
          </div>
          {!isPro && (
            <Button
              onClick={() => navigate('/pricing')}
              size="sm"
              className="w-full justify-center"
            >
              Upgrade to Pro — ₹299/mo
            </Button>
          )}
          {isPro && (
            <div className="text-xs text-green-400/70 text-center py-1">
              All Pro features unlocked ✓
            </div>
          )}
        </div>

        {/* USAGE THIS MONTH */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="text-xs text-muted uppercase tracking-widest mb-4">Usage This Month</div>
          <div className="flex justify-between items-end mb-3">
            <div>
              <div className="text-2xl font-bold text-white">{monthlyUsed}</div>
              <div className="text-xs text-muted">analyses done</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold" style={{ color: usageColor }}>
                {isPro ? '∞' : `${freeLimit - monthlyUsed} left`}
              </div>
              <div className="text-xs text-muted">{isPro ? 'unlimited' : `of ${freeLimit} free`}</div>
            </div>
          </div>
          <div className="h-2 bg-surface rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${usagePercent}%`, background: usageColor }}
            />
          </div>
          {!isPro && usagePercent >= 100 && (
            <p className="text-xs text-red-400 mt-2">Limit reached — upgrade or wait for next month</p>
          )}
        </div>

      </div>

      {/* ACCOUNT INFO */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-6">
        <div className="text-xs text-muted uppercase tracking-widest mb-4">Account Info</div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Full Name', value: user?.name || 'Not set' },
            { label: 'Email Address', value: user?.email },
            { label: 'Member Since', value: user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A' },
            { label: 'Account Type', value: isPro ? 'Pro Member' : 'Free Account' },
          ].map(f => (
            <div key={f.label} className="bg-surface rounded-xl p-4">
              <div className="text-xs text-muted mb-1">{f.label}</div>
              <div className="text-sm text-white font-medium truncate">{f.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RECENT REPORTS */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="text-xs text-muted uppercase tracking-widest">Recent Reports</div>
          {reports.length > 5 && (
            <button onClick={() => navigate('/reports')} className="text-xs text-primary cursor-pointer bg-transparent border-0 hover:underline">
              View all →
            </button>
          )}
        </div>
        {reports.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-3xl mb-3">📂</div>
            <p className="text-muted text-sm mb-4">No reports yet</p>
            <Button size="sm" onClick={() => navigate('/')}>Analyze your first contract →</Button>
          </div>
        ) : (
          <div className="space-y-2">
            {reports.slice(0, 5).map(r => (
              <div
                key={r.id}
                onClick={() => openReport(r)}
                className="flex items-center justify-between p-3 rounded-xl bg-surface hover:bg-white/5 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-sm flex-shrink-0">📄</div>
                  <div className="min-w-0">
                    <div className="text-sm text-white font-medium truncate">{r.document_name}</div>
                    <div className="text-xs text-muted">
                      {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • Score: {r.risk_score}/100
                    </div>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ml-3 ${VERDICT_COLORS[r.overall_verdict]}`}>
                  {r.overall_verdict}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CA BOOKINGS */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="text-xs text-muted uppercase tracking-widest mb-4">CA Bookings</div>
        {bookings.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-3xl mb-3">👨‍💼</div>
            <p className="text-muted text-sm mb-4">No CA sessions booked yet</p>
            <Button size="sm" variant="outline" onClick={() => navigate('/ca')}>Book a CA session →</Button>
          </div>
        ) : (
          <div className="space-y-2">
            {bookings.map(b => (
              <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-surface">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-sm">👨‍💼</div>
                  <div>
                    <div className="text-sm text-white font-medium">{b.ca_name}</div>
                    <div className="text-xs text-muted">
                      {new Date(b.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • ₹{b.amount}
                    </div>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${b.status === 'confirmed' ? 'bg-green-900/30 text-green-400' : 'bg-amber-900/30 text-amber-400'}`}>
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}