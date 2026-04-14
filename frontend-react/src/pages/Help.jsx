const faqs = [
  { q: 'What file types are supported?', a: 'PDF and TXT files up to 10MB.' },
  { q: 'Is my document safe?', a: 'Yes. Documents are analyzed and never stored permanently.' },
  { q: 'How accurate is the analysis?', a: 'Our AI is trained on Indian contract law. Always verify important contracts with a CA.' },
  { q: 'Can I cancel my subscription?', a: 'Yes. Cancel anytime from Settings. No questions asked.' },
]
export default function Help() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Help & Support</h1>
      <p className="text-muted text-sm mb-8">We are here to help you</p>
      <div className="bg-card border border-border rounded-2xl p-5 mb-4">
        <h4 className="font-semibold text-white mb-1">📧 Email Support</h4>
        <p className="text-sm text-muted">vishaltiwari101999@gmail.com — We respond within 24 hours on business days.</p>
         <p className="text-sm text-muted">8291569470 -You can call 24hrs.</p>
      </div>
      <div className="bg-card border border-border rounded-2xl p-5 mb-4">
        <h4 className="font-semibold text-white mb-4">❓ Frequently Asked Questions</h4>
        {faqs.map(f => (
          <div key={f.q} className="py-3 border-b border-border last:border-0">
            <p className="text-sm font-medium text-white mb-1">{f.q}</p>
            <p className="text-sm text-muted">{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  )
}