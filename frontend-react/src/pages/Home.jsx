import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { API } from '../context/AuthContext'
import axios from 'axios'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const LANGUAGES = [
  { id: 'hindi', label: '🇮🇳 Hindi' },
  { id: 'english', label: '🇬🇧 English' },
  { id: 'tamil', label: 'Tamil' },
  { id: 'marathi', label: 'Marathi' },
  { id: 'bengali', label: 'Bengali' },
  { id: 'gujarati', label: 'Gujarati' },
  { id: 'telugu', label: 'Telugu' },
  { id: 'kannada', label: 'Kannada' },
]

export default function Home() {
  const { token, authHeader } = useAuth()
  const { selectedLanguage, setSelectedLanguage, setCurrentReport, setSelectedFile: setCtxFile } = useApp()
  const navigate = useNavigate()
  const fileRef = useRef()

  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFile = (f) => {
    if (!f) return
    if (f.size > 10 * 1024 * 1024) { setError('File too large. Max 10MB.'); return }
    if (!f.name.endsWith('.pdf') && !f.name.endsWith('.txt')) { setError('Only PDF and TXT files supported.'); return }
    setFile(f)
    setError('')
  }

  const analyze = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    const form = new FormData()
    form.append('file', file)
    try {
      const res = await axios.post(`${API}/analyze?language=${selectedLanguage}`, form, {
        headers: { ...authHeader }
      })
      setCurrentReport(res.data)
      setCtxFile(file)
      navigate('/results')
    } catch (err) {
      setError(err.response?.data?.detail || 'Analysis failed. Please try again.')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
        <LoadingSpinner size="lg" />
        <div className="text-center">
          <p className="text-white font-semibold text-lg mb-1">Analyzing your document...</p>
          <p className="text-muted text-sm">Reading clauses, checking GST compliance, finding risks</p>
        </div>
        <div className="flex gap-2 mt-2">
          {['Scanning clauses', 'Checking GST', 'Finding risks', 'Building report'].map((step, i) => (
            <div key={i} className="text-xs text-muted/60 bg-white/5 px-3 py-1 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.3}s` }}>
              {step}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">

      {/* HERO */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-medium px-4 py-2 rounded-full mb-6">
          AI Legal Auditor for Indian SMEs
        </div>
        <h1 className="text-5xl font-bold leading-tight mb-5">
          Understand any contract<br />
          in <span className="text-primary">10 seconds</span>
        </h1>
        <p className="text-muted text-lg leading-relaxed max-w-lg mx-auto">
          Upload your NDA, vendor agreement, or GST document.<br />
          Get a full risk report in Hindi and English — instantly.
        </p>
      </div>

      {/* UPLOAD ZONE */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 mb-4 cursor-pointer ${dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 bg-card'}`}
        onClick={() => fileRef.current.click()}
      >
        <input ref={fileRef} type="file" accept=".pdf,.txt" className="hidden" onChange={e => handleFile(e.target.files[0])} />
        <div className="w-14 h-14 bg-surface rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">📄</div>
        {file ? (
          <div>
            <p className="text-white font-semibold text-lg mb-1">{file.name}</p>
            <p className="text-muted text-sm">{(file.size / 1024).toFixed(1)} KB — ready to analyze</p>
          </div>
        ) : (
          <div>
            <p className="text-white font-semibold text-lg mb-2">Drop your contract here</p>
            <p className="text-muted text-sm mb-4">PDF and TXT files supported • Max 10MB</p>
            <span className="btn-primary text-sm px-5 py-2 rounded-xl inline-block">Choose File</span>
          </div>
        )}
      </div>

      {/* LANGUAGE SELECTOR */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-6">
        <p className="text-sm text-muted mb-3">Select language for analysis report</p>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map(lang => (
            <button
              key={lang.id}
              onClick={() => setSelectedLanguage(lang.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer border-0 ${
                selectedLanguage === lang.id
                  ? 'bg-primary text-white'
                  : 'bg-surface text-muted hover:text-white hover:bg-white/10'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-400 rounded-xl px-4 py-3 text-sm mb-4">
          {error}
        </div>
      )}

      {file && (
        <Button onClick={analyze} size="lg" className="w-full text-center justify-center">
          Analyze Contract →
        </Button>
      )}

      {/* FEATURES */}
      <div className="grid grid-cols-3 gap-4 mt-16">
        {[
          { icon: '⚖️', title: 'Indian Law Focus', desc: 'Built for Indian Contract Act, GST, and MSME regulations' },
          { icon: '🇮🇳', title: '8 Languages', desc: 'Hindi, Tamil, Marathi, Bengali and more' },
          { icon: '🔒', title: 'Private & Secure', desc: 'Documents are never stored on our servers' },
        ].map(f => (
          <div key={f.title} className="bg-card border border-border rounded-2xl p-5 text-center">
            <div className="text-2xl mb-3">{f.icon}</div>
            <div className="text-sm font-semibold text-white mb-1">{f.title}</div>
            <div className="text-xs text-muted leading-relaxed">{f.desc}</div>
          </div>
        ))}
      </div>

    </div>
  )
}