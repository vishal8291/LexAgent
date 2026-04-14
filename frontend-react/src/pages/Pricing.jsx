import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'

const plans = [
  {
    name: 'Free', price: '₹0', period: 'forever', color: 'border-border',
    features: ['3 analyses/month','Basic risk report','Hindi + English','Standard AI scan'],
    missing: ['No PDF download','No history','No CA connect'],
    btn: 'Current plan', btnDisabled: true
  },
  {
    name: 'Pro', price: '₹299', period: 'per month', color: 'border-green-500', popular: true,
    features: ['Unlimited analyses','Deep 3-agent analysis','All 8 languages','PDF download','Full history','CA connect (2/month)','WhatsApp share'],
    btn: 'Upgrade to Pro', plan: 'pro'
  },
  {
    name: 'Enterprise', price: '₹999', period: 'per month', color: 'border-amber-500',
    features: ['Everything in Pro','5-agent deep analysis','Web search agent','Live GST verification','Court case references','Unlimited CA connect','API access'],
    btn: 'Upgrade to Enterprise', plan: 'enterprise'
  },
]

export default function Pricing() {
  const { openAuthModal } = useApp()
  const { user } = useAuth()

  const pay = (plan) => {
    if (!user) { openAuthModal('login'); return }
    alert(`Razorpay for ${plan} — coming soon!`)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-3">Choose your plan</h1>
        <p className="text-muted">Start free. Upgrade when you need more power.</p>
      </div>

      <div className="grid grid-cols-3 gap-5 mb-10">
        {plans.map(p => (
          <div key={p.name} className={`bg-card border-2 ${p.color} rounded-2xl overflow-hidden relative`}>
            {p.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-green-500 text-green-900 text-xs font-bold px-4 py-1 rounded-b-lg">
                MOST POPULAR
              </div>
            )}
            <div className={`p-5 text-center ${p.popular ? 'bg-green-900/20 pt-8' : p.name === 'Enterprise' ? 'bg-amber-900/20' : 'bg-surface'}`}>
              <div className={`text-sm font-medium mb-2 ${p.popular ? 'text-green-400' : p.name === 'Enterprise' ? 'text-amber-400' : 'text-muted'}`}>{p.name}</div>
              <div className={`text-3xl font-bold ${p.popular ? 'text-green-400' : p.name === 'Enterprise' ? 'text-amber-400' : 'text-white'}`}>{p.price}</div>
              <div className="text-xs text-muted mt-1">{p.period}</div>
            </div>
            <div className="p-5">
              <ul className="space-y-2 mb-5">
                {p.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-gray-300">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${p.popular ? 'bg-green-400' : p.name === 'Enterprise' ? 'bg-amber-400' : 'bg-primary'}`} />
                    {f}
                  </li>
                ))}
                {p.missing?.map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-muted/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-border flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => p.plan && pay(p.plan)}
                disabled={p.btnDisabled}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all border-0 cursor-pointer disabled:cursor-default ${
                  p.popular ? 'bg-green-500 hover:bg-green-600 text-green-900' :
                  p.name === 'Enterprise' ? 'bg-amber-400 hover:bg-amber-500 text-amber-900' :
                  'bg-border text-muted cursor-default'
                }`}
              >
                {p.btn}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* AGENTS SECTION */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-semibold text-white mb-5">What makes Pro and Enterprise different?</h3>
        <div className="mb-5">
          <p className="text-sm font-semibold text-green-400 mb-3">Pro — Deep 3-Agent Analysis</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { n: 'Agent 1', t: 'Clause analyzer', d: 'Deep read of every clause vs Indian Contract Act' },
              { n: 'Agent 2', t: 'GST checker', d: 'Flags all tax violations and missing numbers' },
              { n: 'Agent 3', t: 'Negotiation advisor', d: 'Suggests exact counter-clauses to protect you' },
            ].map(a => (
              <div key={a.n} className="bg-green-900/20 border border-green-800/50 rounded-xl p-3">
                <div className="text-xs text-green-400 font-semibold mb-1">{a.n}</div>
                <div className="text-sm font-medium text-white mb-1">{a.t}</div>
                <div className="text-xs text-muted">{a.d}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-amber-400 mb-3">Enterprise — 5-Agent + Web Search</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { n: 'Agent 4', t: 'Web search agent', d: 'Searches latest court judgments and RBI guidelines live' },
              { n: 'Agent 5', t: 'Company verifier', d: 'Verifies GST number, MCA registration, blacklist check' },
            ].map(a => (
              <div key={a.n} className="bg-amber-900/20 border border-amber-800/50 rounded-xl p-3">
                <div className="text-xs text-amber-400 font-semibold mb-1">{a.n}</div>
                <div className="text-sm font-medium text-white mb-1">{a.t}</div>
                <div className="text-xs text-muted">{a.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}