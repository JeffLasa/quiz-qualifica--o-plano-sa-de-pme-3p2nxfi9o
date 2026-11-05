import React, { useState } from 'react'
import { PortoSailLogo } from './PortoSailLogo'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { ShieldCheck, Lock, FileText } from 'lucide-react'

interface HeaderProps {
  showBrokerBadge?: boolean
  hideLasacorMobile?: boolean
}

export const Header: React.FC<HeaderProps> = ({ showBrokerBadge = true }) => {
  return (
    <header className="w-full bg-white/90 backdrop-blur-md border-b border-[#D7E4F0] sticky top-0 z-40 transition-all">
      <div className="max-w-4xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
        {/* Lado esquerdo: Marca Porto Saúde */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <PortoSailLogo size={34} variant="badge" className="shrink-0 shadow-sm" />
          <div className="flex flex-col leading-tight">
            <span className="font-extrabold text-[#04325C] text-base sm:text-lg tracking-tight">
              Porto <span className="text-[#0066B2]">Saúde</span>
            </span>
            <span className="text-[10px] sm:text-[11px] font-semibold text-[#5A7184] tracking-wide uppercase">
              Plano de Saúde PME
            </span>
          </div>
        </div>

        {/* Lado direito: Badge discreto da Corretora Lasacor */}
        {showBrokerBadge && (
          <div className="flex items-center">
            <div className="bg-[#E3F0FA] border border-[#BFE0F7] text-[#04325C] px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full flex items-center gap-1.5 text-xs font-semibold shadow-xs">
              <span className="inline-block w-2 h-2 rounded-full bg-[#1FA971] animate-pulse" />
              <span className="hidden sm:inline">Corretora parceira:</span>
              <span className="text-[#0066B2] font-bold">Lasacor</span>
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
      <div className="max-w-md mx-auto space-y-1.5">
        <p className="font-medium text-[#10243A]">
          Lasacor — Corretora de Seguros · CNPJ 00.000.000/0001-00 · Susep
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
              telefone/WhatsApp, e-mail, informações sobre quantidade de vidas e CNPJ) têm como
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
