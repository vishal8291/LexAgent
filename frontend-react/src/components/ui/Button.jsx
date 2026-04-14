export default function Button({
  children, onClick, variant = 'primary',
  size = 'md', disabled = false, className = '', type = 'button'
}) {
  const variants = {
    primary: 'bg-primary hover:bg-primary-dark text-white',
    outline: 'bg-transparent border border-border text-muted hover:border-primary hover:text-primary',
    danger: 'bg-transparent border border-red-800 text-red-400 hover:bg-red-900/20',
    ghost: 'bg-transparent text-muted hover:text-white hover:bg-white/5',
    green: 'bg-green-500 hover:bg-green-600 text-white',
    whatsapp: 'bg-[#25D366] hover:bg-[#128C7E] text-white',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-5 py-2.5 text-sm rounded-xl',
    lg: 'px-8 py-3.5 text-base rounded-xl',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`font-semibold transition-all duration-200 cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  )
}