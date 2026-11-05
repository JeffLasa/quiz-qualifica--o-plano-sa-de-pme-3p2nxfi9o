import React from 'react'

interface PortoSailLogoProps {
  size?: number | string
  className?: string
  variant?: 'badge' | 'plain' | 'white'
}

/**
 * Vela da Porto Saúde recriada fielmente em SVG inline próprio:
 * Dois triângulos curvos entrelaçados formando a clássica vela náutica da Porto,
 * sobre quadrado arredondado em azul Porto (#0066B2) ou transparente.
 */
export const PortoSailLogo: React.FC<PortoSailLogoProps> = ({
  size = 36,
  className = '',
  variant = 'badge',
}) => {
  const isBadge = variant === 'badge'
  const isWhite = variant === 'white'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Vela Porto Saúde"
    >
      <defs>
        {/* Gradiente azul Porto característico */}
        <linearGradient id="portoBgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0072C6" />
          <stop offset="100%" stopColor="#005299" />
        </linearGradient>

        {/* Gradiente vela principal (brilho suave) */}
        <linearGradient id="sailMainGradient" x1="20%" y1="10%" x2="80%" y2="90%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E2F0FA" />
        </linearGradient>

        {/* Gradiente vela de apoio (reflexo e sobreposição) */}
        <linearGradient id="sailSecondaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#BFE0F7" stopOpacity="0.85" />
        </linearGradient>

        {/* Sombra sutil interna */}
        <filter id="sailShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#04325C" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Fundo badge quadrado com cantos arredondados (estilo app icon da Porto) */}
      {isBadge && <rect x="4" y="4" width="92" height="92" rx="22" fill="url(#portoBgGradient)" />}

      <g filter={isBadge ? 'url(#sailShadow)' : undefined}>
        {/* Vela maior / mastro principal - triângulo curvo dinâmico */}
        <path
          d="M 52 18
             C 52 18, 58 44, 78 62
             C 74 68, 56 68, 48 64
             C 48 48, 50 30, 52 18 Z"
          fill={isWhite ? '#FFFFFF' : isBadge ? 'url(#sailMainGradient)' : '#0066B2'}
        />

        {/* Vela menor / proa entrelaçada - triângulo curvo oposto formando a curvatura da vela */}
        <path
          d="M 44 26
             C 44 26, 42 48, 22 68
             C 28 72, 44 72, 54 66
             C 48 54, 46 38, 44 26 Z"
          fill={isWhite ? '#E3F0FA' : isBadge ? 'url(#sailSecondaryGradient)' : '#0072C6'}
        />

        {/* Linha/base da quilha de suporte da embarcação */}
        <path
          d="M 28 75
             C 42 81, 62 80, 74 72
             C 68 76, 48 78, 32 74 Z"
          fill={isWhite ? '#FFFFFF' : isBadge ? '#FFFFFF' : '#005299'}
          opacity="0.9"
        />
      </g>
    </svg>
  )
}

export default PortoSailLogo
