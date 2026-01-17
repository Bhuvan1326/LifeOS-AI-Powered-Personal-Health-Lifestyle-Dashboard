export default function Card({ title, children, className = '', icon: Icon }) {
  return (
    <div className={`card ${className}`}>
      {(title || Icon) && (
        <div className="flex items-center gap-2 mb-4">
          {Icon && <Icon className="w-5 h-5 text-primary-500" />}
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
        </div>
      )}
      {children}
    </div>
  )
}
