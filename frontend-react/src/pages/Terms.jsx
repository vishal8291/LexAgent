const items = [
  { title: '1. Acceptance of Terms', body: 'By using LexAgent, you agree to these terms. LexAgent provides AI-powered legal document analysis for informational purposes only.' },
  { title: '2. Not Legal Advice', body: 'LexAgent is not a law firm and does not provide legal advice. Our AI analysis is for informational purposes only.' },
  { title: '3. Document Privacy', body: 'Documents you upload are processed securely. We do not store your original documents on our servers after analysis is complete.' },
  { title: '4. Accuracy', body: 'While we strive for accuracy, AI analysis may not catch every issue. Always have important contracts reviewed by a legal professional.' },
  { title: '5. Payments', body: 'Subscription fees are non-refundable. You can cancel your subscription at any time from Settings.' },
]
export default function Terms() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Terms & Conditions</h1>
      <p className="text-muted text-sm mb-8">Please read these terms carefully</p>
      {items.map(c => (
        <div key={c.title} className="bg-card border border-border rounded-2xl p-5 mb-4">
          <h4 className="font-semibold text-white mb-2">{c.title}</h4>
          <p className="text-sm text-muted leading-relaxed">{c.body}</p>
        </div>
      ))}
    </div>
  )
}