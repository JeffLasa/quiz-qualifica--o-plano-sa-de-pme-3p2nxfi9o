import React, { useEffect } from 'react'

export const ConfettiEffect: React.FC = () => {
  useEffect(() => {
    // Pure CSS confetti burst
  }, [])

  const pieces = Array.from({ length: 42 })

  const colors = [
    '#0066B2', // Azul Porto
    '#FFC72C', // Amarelo Vela
    '#0072C6', // Azul claro
    '#1FA971', // Verde sucesso
    '#E3F0FA', // Azul suave
    '#04325C', // Azul profundo
  ]

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20" aria-hidden="true">
      {pieces.map((_, i) => {
        const left = Math.random() * 100
        const delay = Math.random() * 0.4
        const duration = 1.2 + Math.random() * 0.8
        const size = 6 + Math.random() * 8
        const color = colors[i % colors.length]
        const rotate = Math.random() * 360

        return (
          <div
            key={i}
            className="absolute rounded-xs animate-confetti-pop"
            style={{
              left: `${left}%`,
              top: `${10 + Math.random() * 40}%`,
              width: `${size}px`,
              height: `${size * (Math.random() > 0.5 ? 1 : 1.6)}px`,
              backgroundColor: color,
              transform: `rotate(${rotate}deg)`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
            }}
          />
        )
      })}
    </div>
  )
}
