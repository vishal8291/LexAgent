import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { useAuth, API } from '../context/AuthContext'
import axios from 'axios'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'

const LANGUAGES = ['hindi','english','tamil','marathi','bengali','gujarati','telugu','kannada']
const LABELS = { hindi:'🇮🇳 Hindi', english:'🇬🇧 English', tamil:'Tamil', marathi:'Marathi', bengali:'Bengali', gujarati:'Gujarati', telugu:'Telugu', kannada:'Kannada' }

const PLANS = [
  {
    id: 'pro',
    name: 'Pro',
    price: 299,
    color: 'border-green-500',
    highlight: 'bg-green-900/20',
    textColor: 'text-green-400',
    features: ['Unlimited analyses','Deep 3-agent analysis','All 8 languages','PDF download','Full history','CA connect 2/month'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 999,
    color: 'border-amber-500',
    highlight: 'bg-amber-900/20',
    textColor: 'text-amber-400',
    features: ['Everything in Pro','5-agent analysis','Web search agent','Live GST verification','Court case references','Unlimited CA connect','API access'],
  },
]

export default function Settings() {
  const { selectedLanguage, setSelectedLanguage } = useApp()
  const { user, authHeader } = useAuth()
  const [toggles, setToggles] = useState({ email: true, autosave: true, whatsapp: false, dark: true })
  const [status, setStatus] = useState(null)
  const [payModal, setPayModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [tab, setTab] = useState('general')

  useEffect(() => {
    if (!user) return
    axios.get(`${API}/user/status`, { headers: authHeader })
      .then(r => setStatus(r.data))
      .catch(() => {})
  }, [user])

  const openPayModal = (plan) => {
    setSelectedPlan(plan)
    setPayModal(true)
  }

  const monthlyUsed = status?.monthly_analyses || 0
  const isPro = status?.is_pro || false
  const usagePercent = isPro ? 100 : Math.min((monthlyUsed / 3) * 100, 100)
  const usageColor = usagePercent >= 100 ? '#f87171' : usagePercent >= 66 ? '#fbbf24' : '#4ade80'

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Settings</h1>
      <p className="text-muted text-sm mb-6">Manage your preferences and billing</p>

      {/* TABS */}
      <div className="flex gap-1 bg-card border border-border rounded-xl p-1 mb-6">
        {[
          { id: 'general', label: 'General' },
          { id: 'billing', label: 'Billing & Usage' },
          { id: 'language', label: 'Language' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all border-0 cursor-pointer ${tab === t.id ? 'bg-primary text-white' : 'text-muted hover:text-white bg-transparent'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* GENERAL TAB */}
      {tab === 'general' && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <h4 className="font-semibold text-white mb-4">Notifications</h4>
          {[
            { key: 'email', label: 'Email Notifications', desc: 'Get notified when analysis is complete' },
            { key: 'autosave', label: 'Auto-save Reports', desc: 'Automatically save every analysis' },
            { key: 'whatsapp', label: 'WhatsApp Reminders', desc: 'Contract renewal reminders' },
            { key: 'dark', label: 'Dark Mode', desc: 'Always on — LexAgent is dark by default' },
          ].map(s => (
            <div key={s.key} className="flex justify-between items-center py-4 border-b border-border last:border-0">
              <div>
                <div className="text-sm font-medium text-white">{s.label}</div>
                <div className="text-xs text-muted">{s.desc}</div>
              </div>
              <div
                onClick={() => setToggles(t => ({ ...t, [s.key]: !t[s.key] }))}
                className={`w-11 h-6 rounded-full cursor-pointer transition-colors relative flex-shrink-0 ${toggles[s.key] ? 'bg-primary' : 'bg-border'}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${toggles[s.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* BILLING & USAGE TAB */}
      {tab === 'billing' && (
        <div className="space-y-4">

          {/* CURRENT PLAN */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="text-xs text-muted uppercase tracking-widest mb-4">Current Plan</div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className={`text-2xl font-bold ${isPro ? 'text-green-400' : 'text-primary'}`}>
                  {isPro ? 'Pro' : 'Free'}
                </div>
                <div className="text-xs text-muted mt-1">
                  {isPro ? 'All Pro features active' : '3 analyses per month'}
                </div>
              </div>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${isPro ? 'bg-green-900/30 text-green-400' : 'bg-primary/20 text-primary'}`}>
                {isPro ? 'Active' : 'Free'}
              </span>
            </div>
            {isPro && (
              <div className="bg-surface rounded-xl p-4">
                <div className="flex justify-between text-xs text-muted mb-1">
                  <span>Next billing date</span>
                  <span className="text-white">Auto-renews monthly</span>
                </div>
                <div className="flex justify-between text-xs text-muted">
                  <span>Amount</span>
                  <span className="text-green-400 font-semibold">₹299 / month</span>
                </div>
              </div>
            )}
          </div>

          {/* USAGE THIS MONTH */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="text-xs text-muted uppercase tracking-widest mb-4">Usage This Month</div>
            <div className="flex justify-between items-end mb-3">
              <div>
                <div className="text-3xl font-bold text-white">{monthlyUsed}</div>
                <div className="text-xs text-muted">analyses done</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold" style={{ color: usageColor }}>
                  {isPro ? 'Unlimited' : `${3 - monthlyUsed} remaining`}
                </div>
                <div className="text-xs text-muted">{isPro ? 'Pro plan' : 'of 3 free'}</div>
              </div>
            </div>
            <div className="h-2 bg-surface rounded-full overflow-hidden mb-2">
              <div className="h-full rounded-full transition-all" style={{ width: `${usagePercent}%`, background: usageColor }} />
            </div>
            {!isPro && usagePercent >= 100 && (
              <p className="text-xs text-red-400 mt-2">Monthly limit reached. Upgrade or wait for reset.</p>
            )}
          </div>

          {/* UPGRADE PLANS */}
          {!isPro && (
            <div>
              <div className="text-xs text-muted uppercase tracking-widest mb-3">Upgrade Your Plan</div>
              <div className="grid grid-cols-2 gap-4">
                {PLANS.map(plan => (
                  <div key={plan.id} className={`bg-card border-2 ${plan.color} rounded-2xl p-5`}>
                    <div className={`text-lg font-bold ${plan.textColor} mb-1`}>{plan.name}</div>
                    <div className="text-2xl font-bold text-white mb-1">₹{plan.price}<span className="text-xs text-muted font-normal">/mo</span></div>
                    <ul className="space-y-1.5 mb-4 mt-3">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-center gap-2 text-xs text-gray-300">
                          <div className={`w-1 h-1 rounded-full flex-shrink-0 ${plan.textColor}`} />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => openPayModal(plan)}
                      className={`w-full py-2.5 rounded-xl text-sm font-semibold border-0 cursor-pointer transition-all ${plan.id === 'pro' ? 'bg-green-500 hover:bg-green-600 text-green-900' : 'bg-amber-400 hover:bg-amber-500 text-amber-900'}`}
                    >
                      Upgrade to {plan.name}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* INVOICE / HISTORY */}
          {isPro && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="text-xs text-muted uppercase tracking-widest mb-4">Billing History</div>
              <div className="space-y-3">
                {[
                  { date: 'Mar 1, 2026', amount: '₹299', status: 'Paid', plan: 'Pro' },
                  { date: 'Feb 1, 2026', amount: '₹299', status: 'Paid', plan: 'Pro' },
                ].map((inv, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <div className="text-sm text-white">{inv.plan} Plan</div>
                      <div className="text-xs text-muted">{inv.date}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-white">{inv.amount}</span>
                      <span className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded-full">{inv.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isPro && (
            <div className="bg-red-900/10 border border-red-900/30 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-white mb-1">Cancel Subscription</div>
                <div className="text-xs text-muted">Access continues until end of billing period</div>
              </div>
              <Button variant="danger" size="sm">Cancel Plan</Button>
            </div>
          )}
        </div>
      )}

      {/* LANGUAGE TAB */}
      {tab === 'language' && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <h4 className="font-semibold text-white mb-4">Report Language</h4>
          <div className="grid grid-cols-2 gap-2">
            {LANGUAGES.map(lang => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer border-0 ${selectedLanguage === lang ? 'bg-primary text-white' : 'bg-surface text-muted hover:text-white hover:bg-white/10'}`}
              >
                {LABELS[lang]}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted mt-4 text-center">
            Selected: <span className="text-primary font-medium">{LABELS[selectedLanguage]}</span>
          </p>
        </div>
      )}

      {/* PAYMENT MODAL */}
      <PaymentModal
        isOpen={payModal}
        onClose={() => setPayModal(false)}
        plan={selectedPlan}
      />
    </div>
  )
}

function PaymentModal({ isOpen, onClose, plan }) {
  const [method, setMethod] = useState('card')
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    cardNumber: '', expiry: '', cvv: '', name: '',
    upiId: '',
    netbankingBank: '',
  })
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)

  const formatCard = (val) => val.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim()
  const formatExpiry = (val) => { const v = val.replace(/\D/g,'').slice(0,4); return v.length >= 3 ? v.slice(0,2)+'/'+v.slice(2) : v }

  const handlePay = () => {
    setProcessing(true)
    setTimeout(() => {
      setProcessing(false)
      setSuccess(true)
    }, 2000)
  }

  const handleClose = () => {
    setSuccess(false)
    setStep(1)
    setProcessing(false)
    setMethod('card')
    onClose()
  }

  if (!plan) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={success ? 'Payment Successful!' : `Upgrade to ${plan?.name}`}
      subtitle={success ? `You are now on the ${plan?.name} plan` : `₹${plan?.price}/month • Cancel anytime`}
    >
      {success ? (
        <div className="text-center py-4">
          <div className="text-5xl mb-4">🎉</div>
          <p className="text-white font-semibold mb-2">Welcome to {plan?.name}!</p>
          <p className="text-muted text-sm mb-6">All {plan?.name} features are now unlocked.</p>
          <Button onClick={handleClose} className="w-full justify-center">Start Analyzing →</Button>
        </div>
      ) : (
        <>
          {/* PLAN SUMMARY */}
          <div className={`bg-surface rounded-xl p-4 mb-5 border ${plan?.id === 'pro' ? 'border-green-800/50' : 'border-amber-800/50'}`}>
            <div className="flex justify-between items-center">
              <div>
                <div className={`text-sm font-semibold ${plan?.id === 'pro' ? 'text-green-400' : 'text-amber-400'}`}>{plan?.name} Plan</div>
                <div className="text-xs text-muted">Monthly subscription</div>
              </div>
              <div className="text-xl font-bold text-white">₹{plan?.price}</div>
            </div>
          </div>

          {/* PAYMENT METHOD TABS */}
          <div className="flex gap-1 bg-surface rounded-xl p-1 mb-5">
            {[
              { id: 'card', label: '💳 Card' },
              { id: 'upi', label: '📱 UPI' },
              { id: 'netbanking', label: '🏦 Netbanking' },
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all border-0 cursor-pointer ${method === m.id ? 'bg-primary text-white' : 'text-muted hover:text-white bg-transparent'}`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* CARD FORM */}
          {method === 'card' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-muted mb-1.5">Card Number</label>
                <input
                  className="input tracking-widest"
                  placeholder="1234 5678 9012 3456"
                  value={form.cardNumber}
                  maxLength={19}
                  onChange={e => setForm(p => ({ ...p, cardNumber: formatCard(e.target.value) }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted mb-1.5">Expiry</label>
                  <input
                    className="input"
                    placeholder="MM/YY"
                    value={form.expiry}
                    maxLength={5}
                    onChange={e => setForm(p => ({ ...p, expiry: formatExpiry(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1.5">CVV</label>
                  <input
                    className="input"
                    placeholder="•••"
                    type="password"
                    maxLength={4}
                    value={form.cvv}
                    onChange={e => setForm(p => ({ ...p, cvv: e.target.value.replace(/\D/,'').slice(0,4) }))}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-muted mb-1.5">Name on Card</label>
                <input
                  className="input"
                  placeholder="VISHAL TIWARI"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value.toUpperCase() }))}
                />
              </div>
            </div>
          )}

          {/* UPI FORM */}
          {method === 'upi' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-muted mb-1.5">UPI ID</label>
                <input
                  className="input"
                  placeholder="yourname@upi or phone@paytm"
                  value={form.upiId}
                  onChange={e => setForm(p => ({ ...p, upiId: e.target.value }))}
                />
              </div>
              <div className="bg-surface rounded-xl p-3">
                <p className="text-xs text-muted text-center mb-3">Or pay with</p>
                <div className="grid grid-cols-4 gap-2">
                  {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
                    <button
                      key={app}
                      onClick={() => setForm(p => ({ ...p, upiId: `via${app}` }))}
                      className={`py-2 rounded-lg text-xs font-medium border-0 cursor-pointer transition-all ${form.upiId === `via${app}` ? 'bg-primary text-white' : 'bg-card text-muted hover:text-white'}`}
                    >
                      {app}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* NETBANKING FORM */}
          {method === 'netbanking' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-muted mb-1.5">Select Bank</label>
                <div className="grid grid-cols-2 gap-2">
                  {['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'PNB'].map(bank => (
                    <button
                      key={bank}
                      onClick={() => setForm(p => ({ ...p, netbankingBank: bank }))}
                      className={`py-2.5 rounded-xl text-sm font-medium border transition-all cursor-pointer ${form.netbankingBank === bank ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-surface text-muted hover:text-white hover:border-muted'}`}
                    >
                      {bank}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECURE BADGES */}
          <div className="flex items-center justify-center gap-4 my-4">
            <span className="text-xs text-muted flex items-center gap-1">🔒 256-bit SSL</span>
            <span className="text-xs text-muted flex items-center gap-1">✅ PCI DSS</span>
            <span className="text-xs text-muted flex items-center gap-1">🏦 Powered by Razorpay</span>
          </div>

          {/* PAY BUTTON */}
          <Button
            onClick={handlePay}
            disabled={processing}
            className="w-full justify-center"
          >
            {processing ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              `Pay ₹${plan?.price} Securely →`
            )}
          </Button>

          <p className="text-center text-xs text-muted mt-3">
            By paying you agree to our <span className="text-primary cursor-pointer">Terms</span> • Cancel anytime from Settings
          </p>
        </>
      )}
    </Modal>
  )
}