import React from 'react'
import portoSaudeLogo from '@/assets/soma-site-porto-saude-conveniologo-menu-c1fcd.png'
import lasacorLogo from '@/assets/lasacor-logo600x200202404170700530000-cf54e.png'

interface BrandLogoProps {
  className?: string
  alt?: string
}

/** Logo oficial da Porto Saúde (símbolo da vela + wordmark "Porto Saúde"). */
export const PortoSaudeLogo: React.FC<BrandLogoProps> = ({
  className = 'h-9 w-auto',
  alt = 'Porto Saúde',
}) => <img src={portoSaudeLogo} alt={alt} className={className} draggable={false} />

/** Logo oficial da Lasacor Corretora de Seguros (losango dourado + wordmark). */
export const LasacorLogo: React.FC<BrandLogoProps> = ({
  className = 'h-8 w-auto',
  alt = 'Lasacor Corretora de Seguros',
}) => <img src={lasacorLogo} alt={alt} className={className} draggable={false} />
