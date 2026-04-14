import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, API } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import axios from 'axios'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function Reports() {
  const { token, authHeader, user } = useAuth()
  const { setCurrentReport, openAuthModal } = useApp()
  const navigate = useNavigate()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { openAuthModal('login'); return }
    axios.get(`${API}/reports`, { headers: authHeader })
      .then(res => setReports(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  const open = (report) => {
    setCurrentReport(report)
    navigate('/results')
  }

  const COLORS = { Safe: 'bg-green-900/30 text-green-400', Caution: 'bg-amber-900/30 text-amber-400', Danger: 'bg-red-900/30 text-red-400' }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">My Reports</h1>
      <p className="text-muted text-sm mb-8">All your past contract analyses</p>

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner /></div>
      ) : reports.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📂</div>
          <p className="text-muted mb-4">No reports yet</p>
          <button onClick={() => navigate('/')} className="btn-primary text-sm">Analyze your first contract →</button>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map(r => (
            <div key={r.id} onClick={() => open(r)} className="bg-card border border-border rounded-2xl p-5 cursor-pointer hover:border-primary/50 transition-all flex justify-between items-center">
              <div>
                <h4 className="text-white font-medium mb-1">{r.document_name}</h4>
                <p className="text-xs text-muted">
                  {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • Risk Score: {r.risk_score}/100
                </p>
              </div>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${COLORS[r.overall_verdict]}`}>{r.overall_verdict}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}