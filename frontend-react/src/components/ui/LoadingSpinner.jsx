export default function LoadingSpinner({ size = 'md', text }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-10 h-10', lg: 'w-14 h-14' }
  return (
    <div className="flex flex-col items-center gap-4">
      <div className={`${sizes[size]} border-2 border-border border-t-primary rounded-full animate-spin`} />
      {text && <p className="text-muted text-sm">{text}</p>}
    </div>
  )
}