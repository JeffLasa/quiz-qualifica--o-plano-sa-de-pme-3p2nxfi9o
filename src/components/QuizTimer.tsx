import React, { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

interface QuizTimerProps {
  initialSeconds?: number
  onExpire?: () => void
  isStarted: boolean
}

export const QuizTimer: React.FC<QuizTimerProps> = ({
  initialSeconds = 120,
  onExpire,
  isStarted,
}) => {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [hasExpired, setHasExpired] = useState(false)

  useEffect(() => {
    if (!isStarted) return

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          if (!hasExpired) {
            setHasExpired(true)
            onExpire?.()
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isStarted, hasExpired, onExpire])

  const minutes = Math.floor(seconds / 60)
  const remSeconds = seconds % 60
  const formatted = `${String(minutes).padStart(2, '0')}:${String(remSeconds).padStart(2, '0')}`

  const isUrgent = seconds > 0 && seconds <= 30
  const isZero = seconds === 0

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-xs ${
        isZero
          ? 'bg-amber-100 text-amber-800 border border-amber-300'
          : isUrgent
            ? 'bg-[#FFC72C]/20 text-[#04325C] border border-[#FFC72C] animate-timer-pulse'
            : 'bg-[#E3F0FA] text-[#0066B2] border border-[#BFE0F7]'
      }`}
    >
      <Clock className={`w-3.5 h-3.5 ${isUrgent ? 'text-amber-600 animate-spin' : ''}`} />
      <span>
        {isZero ? (
          'Tempo estimado atingido'
        ) : (
          <>
            Duração de 2min: <span className="font-extrabold">{formatted}</span>
          </>
        )}
      </span>
    </div>
  )
}
