export default function About() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">About LexAgent</h1>
      <p className="text-muted text-sm mb-8">AI Legal Auditor for Indian SMEs</p>
      {[
        { title: 'Our Mission', body: "LexAgent was built to protect India's 63 million small business owners from unfair contracts and legal traps. Most SMEs sign contracts without understanding them — because lawyers are expensive and legal language is complex. We change that." },
        { title: 'What We Do', body: 'We use advanced AI to read your contracts, find risky clauses, explain them in your language, and tell you exactly what to negotiate — in seconds, not days.' },
        { title: 'Why LexAgent', body: 'Built specifically for Indian law — Indian Contract Act, GST compliance, MSME regulations. Available in 8 Indian languages. Priced for Indian businesses.' },
        { title: 'Version', body: 'LexAgent v2.0 • Built with ❤️ in India' },
      ].map(c => (
        <div key={c.title} className="bg-card border border-border rounded-2xl p-5 mb-4">
          <h4 className="font-semibold text-white mb-2">{c.title}</h4>
          <p className="text-sm text-muted leading-relaxed">{c.body}</p>
        </div>
      ))}
    </div>
  )
}