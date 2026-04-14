import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { API } from '../context/AuthContext'
import axios from 'axios'
import Button from '../components/ui/Button'

const VERDICT_STYLES = {
  Safe:    { bg: 'bg-green-900/30', border: 'border-green-700', text: 'text-green-400', emoji: '✅' },
  Caution: { bg: 'bg-amber-900/30', border: 'border-amber-700', text: 'text-amber-400', emoji: '⚠️' },
  Danger:  { bg: 'bg-red-900/30',   border: 'border-red-700',   text: 'text-red-400',   emoji: '🚨' },
}

const RISK_COLORS = { High: 'border-red-500', Medium: 'border-amber-500', Low: 'border-green-500' }
const BADGE_COLORS = { High: 'bg-red-900/30 text-red-400', Medium: 'bg-amber-900/30 text-amber-400', Low: 'bg-green-900/30 text-green-400' }

export default function Results() {
  const navigate = useNavigate()
  const { currentReport: data, selectedFile, selectedLanguage } = useApp()

  if (!data) {
    navigate('/')
    return null
  }

  const langLabel = selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)
  const v = VERDICT_STYLES[data.overall_verdict] || VERDICT_STYLES.Caution
  const meterColor = data.risk_score > 66 ? '#f87171' : data.risk_score > 33 ? '#fbbf24' : '#4ade80'

  const downloadPDF = async () => {
    if (!selectedFile) return
    const form = new FormData()
    form.append('file', selectedFile)
    const res = await axios.post(`${API}/analyze/pdf`, form, { responseType: 'blob' })
    const url = URL.createObjectURL(res.data)
    const a = document.createElement('a')
    a.href = url
    a.download = `LexAgent_Report_${selectedFile.name}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  const shareWhatsApp = () => {
    const emoji = v.emoji
    let clauses = ''
    ;(data.risky_clauses || []).slice(0, 3).forEach((c, i) => {
      clauses += `\n${i + 1}. ${c.clause_title} — ${c.risk_level} Risk`
    })
    const msg = `${emoji} *LexAgent Contract Analysis*\n\n📄 *Document:* ${data.document_name}\n⚠️ *Verdict:* ${data.overall_verdict}\n📊 *Risk Score:* ${data.risk_score}/100\n\n*Top Risky Clauses:*${clauses}\n\n📝 *Summary:*\n${data.plain_english_summary}\n\n_Analyzed by LexAgent_`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">

      {/* VERDICT */}
      <div className={`${v.bg} border ${v.border} rounded-2xl p-8 text-center mb-6`}>
        <div className="text-5xl mb-3">{v.emoji}</div>
        <div className={`text-3xl font-bold ${v.text} mb-3`}>{data.overall_verdict}</div>
        <p className="text-muted text-sm leading-relaxed max-w-lg mx-auto">{data.summary}</p>
      </div>

      {/* RISK SCORE */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <div className="text-xs text-muted uppercase tracking-widest mb-3">Risk Score</div>
        <div className="h-2 bg-surface rounded-full overflow-hidden mb-2">
          <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${data.risk_score}%`, background: meterColor }} />
        </div>
        <div className="flex justify-between text-xs text-muted">
          <span>Low Risk</span>
          <span style={{ color: meterColor }} className="font-bold">{data.risk_score}/100</span>
          <span>High Risk</span>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <div className="text-xs text-primary font-semibold uppercase tracking-widest mb-4">Document Summary</div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface rounded-xl p-4">
            <div className="text-xs text-muted uppercase tracking-wide mb-2">English</div>
            <p className="text-sm text-gray-300 leading-relaxed">{data.plain_english_summary}</p>
          </div>
          <div className="bg-surface rounded-xl p-4">
            <div className="text-xs text-muted uppercase tracking-wide mb-2">{langLabel}</div>
            <p className="text-sm text-gray-300 leading-relaxed">{data.plain_hindi_summary}</p>
          </div>
        </div>
      </div>

      {/* RISKY CLAUSES */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <div className="text-xs text-primary font-semibold uppercase tracking-widest mb-4">
          Risky Clauses ({data.risky_clauses?.length || 0} found)
        </div>
        {data.risky_clauses?.length > 0 ? data.risky_clauses.map((c, i) => (
          <div key={i} className={`bg-surface border-l-2 ${RISK_COLORS[c.risk_level]} rounded-xl p-4 mb-3 last:mb-0`}>
            <div className="flex justify-between items-center mb-3">
              <span className="text-white font-medium text-sm">{c.clause_title}</span>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${BADGE_COLORS[c.risk_level]}`}>{c.risk_level} Risk</span>
            </div>
            <p className="text-xs text-muted/70 italic mb-3 bg-black/20 p-3 rounded-lg leading-relaxed">"{c.original_text}"</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-black/20 rounded-lg p-3">
                <div className="text-xs text-muted uppercase tracking-wide mb-1">English</div>
                <p className="text-xs text-gray-400 leading-relaxed">{c.explanation_english}</p>
              </div>
              <div className="bg-black/20 rounded-lg p-3">
                <div className="text-xs text-muted uppercase tracking-wide mb-1">{langLabel}</div>
                <p className="text-xs text-gray-400 leading-relaxed">{c.explanation_hindi}</p>
              </div>
            </div>
            <div className="bg-primary/10 rounded-lg p-3 text-xs text-primary">
              <span className="font-semibold">What to do: </span>{c.recommendation}
            </div>
          </div>
        )) : (
          <p className="text-muted text-sm">No major risky clauses found.</p>
        )}
      </div>

      {/* NEGOTIATE */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <div className="text-xs text-primary font-semibold uppercase tracking-widest mb-4">What To Negotiate</div>
        {(data.what_to_negotiate || []).length > 0 ? (
          <ul className="space-y-2">
            {data.what_to_negotiate.map((item, i) => (
              <li key={i} className="flex gap-3 items-start text-sm text-gray-300 py-2 border-b border-border last:border-0">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        ) : <p className="text-muted text-sm">No specific negotiations required.</p>}
      </div>

      {/* GST */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-8">
        <div className="text-xs text-primary font-semibold uppercase tracking-widest mb-4">GST Compliance</div>
        {(data.gst_compliance_issues || []).length > 0 ? (
          <ul className="space-y-2">
            {data.gst_compliance_issues.map((item, i) => (
              <li key={i} className="flex gap-3 items-start text-sm text-gray-300 py-2 border-b border-border last:border-0">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex gap-3 items-start text-sm text-gray-300">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0" />
            No GST compliance issues found.
          </div>
        )}
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Button onClick={downloadPDF}>Download PDF Report</Button>
        <Button variant="whatsapp" onClick={shareWhatsApp}>Share on WhatsApp</Button>
        {(data.overall_verdict === 'Danger' || data.overall_verdict === 'Caution') && (
          <Button variant="outline" onClick={() => navigate('/ca')}>Talk to a CA →</Button>
        )}
        <Button variant="ghost" onClick={() => navigate('/')}>Analyze Another</Button>
      </div>

    </div>
  )
}