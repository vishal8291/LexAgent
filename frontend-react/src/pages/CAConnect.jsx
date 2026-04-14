import { useEffect, useState } from 'react'
import { useAuth, API } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import axios from 'axios'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function CAConnect() {
  const { authHeader, user } = useAuth()
  const { openAuthModal } = useApp()
  const [cas, setCas] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCA, setSelectedCA] = useState(null)
  const [form, setForm] = useState({ name: '', phone: '', issue: '', time: '' })
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    axios.get(`${API}/cas`).then(r => setCas(r.data)).finally(() => setLoading(false))
  }, [])

  const book = (ca) => {
    if (!user) { openAuthModal('login'); return }
    setSelectedCA(ca)
    setStatus(''); setError('')
  }

  const submit = async () => {
    if (!form.name || !form.phone || !form.issue) { setError('Please fill all required fields'); return }
    if (form.phone.length !== 10) { setError('Enter a valid 10-digit phone number'); return }
    try {
      const res = await axios.post(`${API}/ca/book`, {
        ca_id: selectedCA.id, user_name: form.name,
        user_phone: form.phone, issue_summary: form.issue, preferred_time: form.time
      }, { headers: authHeader })
      setStatus(res.data.message)
      setTimeout(() => { setSelectedCA(null); setForm({ name:'',phone:'',issue:'',time:'' }) }, 3000)
    } catch (err) { setError(err.response?.data?.detail || 'Booking failed') }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Connect with a CA</h1>
      <p className="text-muted text-sm mb-8">Get expert advice from a verified Chartered Accountant — ₹499 for 30 minutes</p>

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner /></div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {cas.map(ca => (
            <div key={ca.id} className="bg-card border border-border rounded-2xl p-5 hover:border-primary/50 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white font-bold">{ca.avatar}</div>
                <div>
                  <div className="text-white font-medium text-sm">{ca.name}</div>
                  <div className="text-xs text-muted">{ca.specialization}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-xs bg-surface text-muted px-2 py-1 rounded-full">📍 {ca.location}</span>
                <span className="text-xs bg-surface text-muted px-2 py-1 rounded-full">⏱ {ca.experience_years} yrs</span>
                <span className="text-xs text-amber-400 font-semibold">★ {ca.rating}</span>
              </div>
              <div className="flex flex-wrap gap-1 mb-4">
                {ca.languages.map(l => <span key={l} className="text-xs bg-surface text-muted px-2 py-1 rounded-full">{l}</span>)}
              </div>
              <Button onClick={() => book(ca)} className="w-full justify-center" size="sm">
                Book Session — ₹{ca.price_per_session}
              </Button>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!selectedCA} onClose={() => setSelectedCA(null)} title={`Book with ${selectedCA?.name}`} subtitle="₹499 for 30 minutes • CA will call within 2 hours">
        {error && <div className="bg-red-900/20 border border-red-800 text-red-400 rounded-xl px-4 py-3 text-sm mb-4">{error}</div>}
        {status ? (
          <div className="bg-green-900/20 border border-green-800 text-green-400 rounded-xl px-4 py-3 text-sm">{status}</div>
        ) : (
          <>
            {[
              { label: 'Your Name *', key: 'name', type: 'text', placeholder: 'Your full name' },
              { label: 'Phone Number *', key: 'phone', type: 'tel', placeholder: '10-digit mobile number' },
              { label: 'Preferred time', key: 'time', type: 'text', placeholder: 'e.g. Tomorrow 3pm' },
            ].map(f => (
              <div key={f.key} className="mb-4">
                <label className="block text-xs text-muted mb-2">{f.label}</label>
                <input className="input" type={f.type} placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm(p => ({...p, [f.key]: e.target.value}))} />
              </div>
            ))}
            <div className="mb-6">
              <label className="block text-xs text-muted mb-2">Describe your issue *</label>
              <textarea className="input resize-none h-20" placeholder="Brief description..." value={form.issue} onChange={e => setForm(p => ({...p, issue: e.target.value}))} />
            </div>
            <Button onClick={submit} className="w-full justify-center">Confirm Booking — ₹499</Button>
          </>
        )}
      </Modal>
    </div>
  )
}