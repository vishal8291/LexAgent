const items = [
  { title: 'Data We Collect', body: 'We collect your email address, name, and analysis history. We do not collect payment card details.' },
  { title: 'Document Security', body: 'Your uploaded documents are sent securely over HTTPS and never stored permanently on our servers.' },
  { title: 'Data Storage', body: 'Your account data is stored in an encrypted MongoDB database hosted in India, compliant with DPDP Act 2023.' },
  { title: 'Your Rights', body: 'You can request deletion of all your data at any time by contacting support@lexagent.in.' },
  { title: 'Third Parties', body: 'We use Groq AI for analysis and Razorpay for payments. We never sell your data.' },
]
export default function Privacy() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-muted text-sm mb-8">How we protect your data</p>
      {items.map(c => (
        <div key={c.title} className="bg-card border border-border rounded-2xl p-5 mb-4">
          <h4 className="font-semibold text-white mb-2">{c.title}</h4>
          <p className="text-sm text-muted leading-relaxed">{c.body}</p>
        </div>
      ))}
    </div>
  )
}