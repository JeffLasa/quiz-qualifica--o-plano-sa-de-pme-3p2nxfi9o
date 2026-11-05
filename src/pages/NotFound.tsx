import { Link } from 'react-router-dom'
import { PortoSaudeLogo } from '@/components/BrandLogos'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4 text-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#D7E4F0] shadow-sm space-y-4">
        <div className="flex justify-center mb-2">
          <PortoSaudeLogo className="h-16 w-auto" />
        </div>

        <div className="text-4xl font-black text-[#04325C]">404</div>

        <h1 className="text-xl font-extrabold text-[#04325C]">Página não encontrada</h1>

        <p className="text-xs sm:text-sm text-[#5A7184] leading-relaxed">
          O link que você tentou acessar não existe ou foi alterado. Retorne para fazer sua cotação
          de plano de saúde PME.
        </p>

        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-[#0066B2] hover:bg-[#04325C] text-white font-extrabold text-sm px-6 py-3 rounded-xl transition shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Quiz da Porto Saúde</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
