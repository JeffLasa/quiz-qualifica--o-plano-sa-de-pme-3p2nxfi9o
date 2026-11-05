import React, { useState } from 'react'
import { PortoSaudeLogo, LasacorLogo } from './BrandLogos'
import { LASACOR_CNPJ } from '@/lib/broker'
import { ShieldCheck, Lock } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface HeaderProps {
  showBrokerBadge?: boolean
}

export const Header: React.FC<HeaderProps> = ({ showBrokerBadge = true }) => {
  return (
    <header className="w-full bg-white/90 backdrop-blur-md border-b border-[#D7E4F0] sticky top-0 z-40 transition-all">
      <div className="max-w-4xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
        {/* Lado esquerdo: Logo oficial Porto Saúde */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <PortoSaudeLogo className="h-8 sm:h-9 w-auto shrink-0" alt="Porto Saúde" />
          <div className="hidden sm:flex flex-col leading-tight min-w-0">
            <span className="font-extrabold text-[#04325C] text-[11px] sm:text-lg tracking-tight truncate">
              Plano de Saúde PME
            </span>
            <span className="text-[9px] sm:text-[11px] font-semibold text-[#5A7184] tracking-wide uppercase">
              Cotação para empresas
            </span>
          </div>
        </div>

        {/* Lado direito: Logo oficial da Corretora Lasacor */}
        {showBrokerBadge && (
          <div className="flex items-center shrink-0">
            <div className="border border-[#BFE0F7] px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full flex items-center gap-1.5 shadow-xs bg-inherit">
              <LasacorLogo
                className="h-6 sm:h-7 w-auto object-contain"
                alt="Lasacor Corretora de Seguros"
              />
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export const Footer: React.FC = () => {
  const [lgpdOpen, setLgpdOpen] = useState(false)

  return (
    <footer className="w-full border-t border-[#D7E4F0]/80 bg-white/80 backdrop-blur-xs py-4 px-4 text-center text-xs text-[#5A7184] mt-auto">
      <div className="max-w-md mx-auto space-y-2">
        <div className="flex items-center justify-center gap-3 pt-1">
          <PortoSaudeLogo className="h-7 w-auto" alt="Porto Saúde" />
          <span className="text-[#D7E4F0] font-light">|</span>
          <LasacorLogo className="h-6 w-auto" alt="Lasacor Corretora de Seguros" />
        </div>
        <p className="font-medium text-[#10243A]">
          Lasacor Corretora de Seguros · CNPJ {LASACOR_CNPJ}
        </p>
        <p className="text-[11px]">
          Corretora autorizada para comercialização dos produtos Porto Saúde PME.
        </p>
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setLgpdOpen(true)}
            className="text-[#0066B2] font-semibold hover:underline cursor-pointer inline-flex items-center gap-1"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Termos e Privacidade (LGPD)
          </button>
        </div>
      </div>

      <Dialog open={lgpdOpen} onOpenChange={setLgpdOpen}>
        <DialogContent className="max-w-md p-6 bg-white rounded-2xl border-[#D7E4F0] text-left">
          <DialogHeader className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#E3F0FA] text-[#0066B2] flex items-center justify-center mb-1">
              <Lock className="w-5 h-5" />
            </div>
            <DialogTitle className="text-xl font-bold text-[#04325C]">
              Termos de Privacidade e Proteção de Dados (LGPD)
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5A7184]">
              Compromisso da Lasacor Corretora de Seguros em conformidade com a Lei Federal nº
              13.709/2018.
            </DialogDescription>
          </DialogHeader>

          <div className="text-xs text-[#10243A] space-y-3 max-h-[50vh] overflow-y-auto pr-1 leading-relaxed">
            <p>
              <strong>1. Finalidade da Coleta:</strong> Os dados fornecidos (nome,
              telefone/WhatsApp, e-mail, informações sobre as idades das vidas e CNPJ) têm como
              finalidade exclusiva elaborar estudos comparativos e orçamentos personalizados de
              planos de saúde corporativos (Porto Saúde PME).
            </p>
            <p>
              <strong>2. Sigilo e Confidencialidade:</strong> A Lasacor Corretora e a Porto Saúde
              não comercializam, não alugam e não compartilham suas informações com terceiros
              alheios ao processo de cotação e contratação do benefício.
            </p>
            <p>
              <strong>3. Contato Autorizado:</strong> Ao enviar o formulário, você autoriza
              expressamente o contato de um especialista credenciado via WhatsApp, ligação ou e-mail
              para apresentação da proposta comercial solicitada.
            </p>
            <p>
              <strong>4. Seus Direitos:</strong> Você pode a qualquer momento revogar o
              consentimento, solicitar a exclusão de seus dados ou tirar dúvidas contatando nosso
              encarregado de dados pelo e-mail <em>privacidade@lasacor.com.br</em>.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setLgpdOpen(false)}
              className="bg-[#0066B2] hover:bg-[#04325C] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition"
            >
              Compreendi e Concordo
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </footer>
  )
}
