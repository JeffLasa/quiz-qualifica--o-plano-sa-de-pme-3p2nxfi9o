import React, { useState, useMemo } from 'react'
import { PortoSaudeLogo, LasacorLogo } from '@/components/BrandLogos'
import { QuizTimer } from '@/components/QuizTimer'
import { ConfettiEffect } from '@/components/ConfettiEffect'
import { createLead, type LeadSituacao, type LeadPrazo } from '@/services/leads'
import {
  maskPhone,
  maskCNPJ,
  isValidEmail,
  isValidPhone,
  isValidCNPJ,
  calculateScore,
  faixaVidas,
  parseIdades,
  formatIdades,
} from '@/lib/masks'
import { LASACOR_CNPJ } from '@/lib/broker'
import {
  Users,
  Plus,
  Trash2,
  Cake,
  Building2,
  FileCheck2,
  CalendarDays,
  MapPin,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Shield,
  Zap,
  Sparkles,
  MessageCircle,
  AlertCircle,
  HelpCircle,
  Layers,
  Repeat,
  HeartHandshake,
} from 'lucide-react'

type QuizStep = 'intro' | 1 | 2 | 3 | 4 | 5 | 6 | 'contact' | 'success'

interface QuizAnswers {
  idades_vidas?: string
  qtd_vidas_key?: string
  tipo_cnpj?: string
  cnpj?: string
  situacao_plano?: string
  situacao_key?: LeadSituacao
  operadora_atual?: string
  prazo_contratacao?: string
  prazo_key?: LeadPrazo
  cidade_uf?: string
  nome?: string
  whatsapp?: string
  email?: string
  empresa?: string
}

export default function Index() {
  const [step, setStep] = useState<QuizStep>('intro')
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')
  const [timerStarted, setTimerStarted] = useState(false)
  const [timerExpiredNotice, setTimerExpiredNotice] = useState(false)

  // Respostas acumuladas
  const [answers, setAnswers] = useState<QuizAnswers>({})

  // Estado da pergunta 1 (idades das vidas a serem cobertas)
  const [idadesInput, setIdadesInput] = useState<string>('')
  const [idadesError, setIdadesError] = useState<string>('')
  const [idadesConfirmadas, setIdadesConfirmadas] = useState<number[]>([])
  // Lista de entradas individuais por vida para máxima conveniência mobile
  const [listaIdades, setListaIdades] = useState<string[]>([''])
  // Modo de inserção: 'individual' (entradas por vida) ou 'rapido' (texto separado por vírgula)
  const [modoEntradaIdades, setModoEntradaIdades] = useState<'individual' | 'rapido'>('individual')

  // Estado da pergunta 2 (CNPJ opcional)
  const [selectedCnpjType, setSelectedCnpjType] = useState<string>('')
  const [cnpjInput, setCnpjInput] = useState<string>('')
  const [cnpjError, setCnpjError] = useState<string>('')

  // Estado da pergunta 6 (Cidade/UF)
  const [cidadeInput, setCidadeInput] = useState<string>('')
  const [cidadeError, setCidadeError] = useState<string>('')

  // Estado do formulário de contato
  const [nome, setNome] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [lgpdConsent, setLgpdConsent] = useState(true)

  const [formErrors, setFormErrors] = useState<{
    nome?: string
    whatsapp?: string
    email?: string
    lgpd?: string
    submit?: string
  }>({})

  const [submitting, setSubmitting] = useState(false)
  const [finalScore, setFinalScore] = useState<number>(75)
  const [leadCreatedId, setLeadCreatedId] = useState<string>('')

  // Efeito de seleção rápida
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)

  const handleStart = () => {
    setTimerStarted(true)
    setDirection('forward')
    setStep(1)
  }

  const goBack = () => {
    setDirection('backward')
    if (step === 1) setStep('intro')
    else if (step === 2) setStep(1)
    else if (step === 3) setStep(2)
    else if (step === 4) setStep(3)
    else if (step === 5) setStep(4)
    else if (step === 6) setStep(5)
    else if (step === 'contact') setStep(6)
  }

  // Avanço automático com delay visual estilo Inlead
  const handleSelectOption = (nextStep: QuizStep, updateFn: () => void, optionId: string) => {
    setSelectedOptionId(optionId)
    updateFn()
    setTimeout(() => {
      setSelectedOptionId(null)
      setDirection('forward')
      setStep(nextStep)
    }, 320)
  }

  // Pergunta 1: idades das vidas a serem cobertas
  // Cálculo baseado no modo ativo
  const idadesFromLista = useMemo(() => {
    const valid: number[] = []
    const invalid: string[] = []
    listaIdades.forEach((val) => {
      const trimmed = val.trim()
      if (!trimmed) return
      const n = parseInt(trimmed, 10)
      if (Number.isNaN(n) || n < 0 || n > 99) {
        invalid.push(trimmed)
      } else {
        valid.push(n)
      }
    })
    return { valid, invalid }
  }, [listaIdades])

  const idadesParsedRapido = parseIdades(idadesInput)

  const idadesParsedAtual =
    modoEntradaIdades === 'individual' ? idadesFromLista : idadesParsedRapido
  const qtdVidasDetectada = idadesParsedAtual.valid.length
  const idadesConfirmadasTexto = formatIdades(idadesConfirmadas)

  const handleAddVida = () => {
    setListaIdades((prev) => [...prev, ''])
  }

  const handleRemoveVida = (index: number) => {
    setListaIdades((prev) => {
      if (prev.length <= 1) return ['']
      return prev.filter((_, i) => i !== index)
    })
    setIdadesError('')
  }

  const handleUpdateVida = (index: number, val: string) => {
    const digitsOnly = val.replace(/\D/g, '').slice(0, 2)
    setListaIdades((prev) => {
      const next = [...prev]
      next[index] = digitsOnly
      return next
    })
    setIdadesError('')
  }

  // Preenche a lista com um exemplo prático
  const handleUsarExemplo = () => {
    setListaIdades(['43', '38', '20', '12', '45'])
    setIdadesInput('43, 38, 20, 12, 45')
    setIdadesError('')
  }

  const handleConfirmStep1 = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const activeParsed = modoEntradaIdades === 'individual' ? idadesFromLista : idadesParsedRapido

    if (activeParsed.valid.length === 0) {
      setIdadesError(
        modoEntradaIdades === 'individual'
          ? 'Informe a idade de ao menos uma vida para continuar.'
          : 'Informe as idades separadas por vírgula (Exemplo: 43, 38, 20, 12, 45).',
      )
      return
    }
    if (activeParsed.invalid.length > 0) {
      setIdadesError('Cada idade deve ser um número entre 0 e 99. Verifique os valores informados.')
      return
    }
    setIdadesError('')
    setIdadesConfirmadas(activeParsed.valid)
    setAnswers((prev) => ({
      ...prev,
      idades_vidas: formatIdades(activeParsed.valid),
      qtd_vidas_key: faixaVidas(activeParsed.valid.length),
    }))
    // Sincroniza ambos os modos para consistência
    setIdadesInput(formatIdades(activeParsed.valid))
    setListaIdades(activeParsed.valid.map(String))
    setDirection('forward')
    setStep(2)
  }

  // Pergunta 2: CNPJ
  const cnpjTypes = [
    { id: 'cnpj', label: 'Sim, possuo CNPJ', sub: 'Empresa ME, EPP, Ltda ou S/A' },
    { id: 'mei', label: 'Sou MEI', sub: 'Microempreendedor Individual (a partir de 6 meses)' },
    { id: 'sem_cnpj', label: 'Ainda não tenho', sub: 'Pretendo abrir ou consultar viabilidade' },
  ]

  const handleConfirmStep2 = () => {
    if (!selectedCnpjType) return

    if (selectedCnpjType === 'sem_cnpj') {
      setAnswers((prev) => ({
        ...prev,
        tipo_cnpj: 'Ainda não tenho',
        cnpj: '',
      }))
      setDirection('forward')
      setStep(3)
      return
    }

    // Se informou CNPJ, valida se estiver preenchido
    if (cnpjInput && cnpjInput.length > 0) {
      if (!isValidCNPJ(cnpjInput)) {
        setCnpjError('Por favor, informe um CNPJ válido com 14 dígitos.')
        return
      }
    }

    const labelTipo = selectedCnpjType === 'mei' ? 'Sou MEI' : 'Sim, possuo CNPJ'
    setAnswers((prev) => ({
      ...prev,
      tipo_cnpj: labelTipo,
      cnpj: cnpjInput || '',
    }))
    setCnpjError('')
    setDirection('forward')
    setStep(3)
  }

  // Pergunta 3: Situação atual do plano
  const situacaoOptions: { label: string; key: LeadSituacao; icon: typeof Repeat; sub: string }[] =
    [
      {
        label: 'Já tenho plano e quero trocar',
        key: 'quero-trocar',
        icon: Repeat,
        sub: 'Busca redução de custo ou melhoria de rede',
      },
      {
        label: 'Tenho plano, mas quero comparar preços',
        key: 'ja-tenho',
        icon: Layers,
        sub: 'Manter a mesma qualidade pagando menos',
      },
      {
        label: 'Primeiro plano da empresa',
        key: 'primeiro-plano',
        icon: Sparkles,
        sub: 'Primeira contratação para os colaboradores',
      },
      {
        label: 'Não sei informar',
        key: 'nao-sei',
        icon: HelpCircle,
        sub: 'Quero orientação de um especialista Porto',
      },
    ]

  // Pergunta 4: Operadora atual
  const operadoras = [
    'Bradesco Saúde',
    'SulAmérica',
    'Amil',
    'Unimed',
    'Hapvida / Notredame Intermédica',
    'Não temos plano',
  ]

  // Pergunta 5: Prazo
  const prazos: { label: string; key: LeadPrazo; sub: string }[] = [
    { label: 'O quanto antes', key: 'imediato', sub: 'Máxima prioridade na emissão' },
    { label: 'Nos próximos 30 dias', key: '30-dias', sub: 'Início no próximo mês' },
    { label: 'Em até 3 meses', key: '3-meses', sub: 'Planejando transição de contrato' },
    {
      label: 'Só pesquisando preços',
      key: 'pesquisando',
      sub: 'Analisando viabilidade orçamentária',
    },
  ]

  // Pergunta 6: Cidade / UF
  const handleConfirmCidade = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!cidadeInput.trim()) {
      setCidadeError('Informe a cidade da sede da sua empresa (Ex: São Paulo / SP)')
      return
    }
    setCidadeError('')
    setAnswers((prev) => ({ ...prev, cidade_uf: cidadeInput.trim() }))
    setDirection('forward')
    setStep('contact')
  }

  // Submissão do contato
  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault()
    const errors: typeof formErrors = {}

    if (!nome.trim() || nome.trim().split(' ').length < 2) {
      errors.nome = 'Informe seu nome e sobrenome completos.'
    }
    if (!isValidPhone(whatsapp)) {
      errors.whatsapp = 'Informe um WhatsApp válido com DDD (10 ou 11 dígitos).'
    }
    if (!isValidEmail(email)) {
      errors.email = 'Informe um endereço de e-mail corporativo ou pessoal válido.'
    }
    if (!lgpdConsent) {
      errors.lgpd = 'É necessário autorizar o contato para receber a cotação.'
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setFormErrors({})
    setSubmitting(true)

    // Calcula score
    const score = calculateScore({
      qtdVidasKey: answers.qtd_vidas_key,
      situacaoKey: answers.situacao_key,
      prazoKey: answers.prazo_key,
      hasCNPJ: Boolean(answers.cnpj || answers.tipo_cnpj === 'Sim, possuo CNPJ'),
    })
    setFinalScore(score)

    const idadesTexto = formatIdades(idadesConfirmadas)

    const fullRespostas = {
      ...answers,
      idades_vidas: idadesTexto,
      qtd_vidas: `${idadesConfirmadas.length} ${idadesConfirmadas.length === 1 ? 'vida' : 'vidas'}`,
      nome: nome.trim(),
      whatsapp: whatsapp.trim(),
      email: email.trim(),
      empresa: empresa.trim() || undefined,
    }

    try {
      const created = await createLead({
        nome: nome.trim(),
        whatsapp: whatsapp.trim(),
        email: email.trim(),
        empresa: empresa.trim() || undefined,
        cnpj: answers.cnpj || undefined,
        qtd_vidas: faixaVidas(idadesConfirmadas.length),
        idades_vidas: idadesTexto,
        situacao_plano: answers.situacao_key || 'ja-tenho',
        operadora_atual: answers.operadora_atual || 'Não informada',
        cidade_uf: answers.cidade_uf || 'São Paulo / SP',
        prazo_contratacao: answers.prazo_key || '30-dias',
        respostas: fullRespostas,
        score,
        origem: 'quiz-pme-porto-saude',
      })

      setLeadCreatedId(created.id)
      setDirection('forward')
      setStep('success')
    } catch (err: unknown) {
      console.error('Erro ao enviar lead para o PocketBase:', err)
      setFormErrors({
        submit:
          'Ocorreu um erro temporário ao enviar seus dados. Por favor, verifique sua conexão e tente novamente.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Progresso em porcentagem
  const getProgressPercentage = () => {
    if (step === 'intro') return 0
    if (step === 1) return 15
    if (step === 2) return 30
    if (step === 3) return 45
    if (step === 4) return 60
    if (step === 5) return 75
    if (step === 6) return 90
    if (step === 'contact') return 96
    if (step === 'success') return 100
    return 0
  }

  const stepNumber = typeof step === 'number' ? step : step === 'contact' ? 7 : 0

  return (
    <div className="relative min-h-[calc(100vh-120px)] flex flex-col items-center justify-start py-3 sm:py-8 px-3 sm:px-4">
      {/* Background decorativo desktop estilo Porto Saúde */}
      <div className="hidden lg:block absolute inset-0 -z-10 bg-radial from-[#E3F0FA]/60 via-[#F4F8FC] to-[#E2EAF2] opacity-80" />
      <div className="hidden lg:block absolute top-20 right-20 -z-10 opacity-5 pointer-events-none">
        <PortoSaudeLogo className="w-[420px] h-auto" alt="" />
      </div>

      {/* Card Principal Mobile-First: 0-480px ocupa a tela toda; Desktop fica centralizado com max-w-[480px] */}
      <div className="w-full max-w-[480px] bg-white rounded-3xl shadow-[0_12px_36px_rgba(4,50,92,0.08)] border border-[#D7E4F0] flex flex-col overflow-hidden min-h-[580px] sm:min-h-[620px] transition-all">
        {/* Barra de Progresso e Timer (nas etapas ativas do quiz) */}
        {step !== 'intro' && step !== 'success' && (
          <div className="bg-[#FAFDFE] border-b border-[#E3F0FA] px-4 py-2.5">
            <div className="flex items-center justify-between gap-2 mb-2">
              <button
                type="button"
                onClick={goBack}
                className="text-[#04325C] hover:text-[#0066B2] text-xs font-semibold flex items-center gap-1 p-1 -ml-1 transition"
                aria-label="Voltar pergunta anterior"
              >
                <ArrowLeft className="w-4 h-4 text-[#0066B2]" />
                <span>Voltar</span>
              </button>

              <QuizTimer isStarted={timerStarted} onExpire={() => setTimerExpiredNotice(true)} />

              <span className="text-[11px] font-bold text-[#0066B2] bg-[#E3F0FA] px-2 py-0.5 rounded-full">
                {step === 'contact' ? 'Final' : `${stepNumber}/6`}
              </span>
            </div>

            {/* Barra animada */}
            <div className="w-full bg-[#E3F0FA] h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#0066B2] to-[#008BEB] h-full transition-all duration-300 ease-out rounded-full"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>

            {timerExpiredNotice && (
              <p className="text-[11px] text-amber-700 bg-amber-50 rounded-lg px-2 py-1 mt-2 text-center animate-fade-in">
                ⏱️ Não se preocupe! Você ainda pode finalizar e garantir seu estudo personalizado.
              </p>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TELA DE INTRO / BOAS-VINDAS */}
        {/* ============================================================ */}
        {step === 'intro' && (
          <div className="p-5 sm:p-7 flex-1 flex flex-col justify-between text-center animate-fade-in">
            <div className="space-y-4 pt-2">
              {/* Logo Porto Saúde em destaque */}
              <div className="flex justify-center mb-1">
                <div className="p-3 bg-[#E3F0FA]/80 rounded-2xl shadow-inner">
                  <PortoSaudeLogo className="h-16 w-auto" />
                </div>
              </div>

              {/* Tag de destaque */}
              <div className="inline-flex items-center gap-1.5 bg-[#E3F0FA] text-[#0066B2] px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-[#FFC72C] fill-[#FFC72C]" />
                Cotação PME com CNPJ ou MEI
              </div>

              <h1 className="text-2xl sm:text-[27px] font-black text-[#04325C] leading-tight tracking-tight">
                FAÇA A COTAÇÃO DO SEU PLANO DE SAÚDE ATRAVÉS DO{' '}
                <span className="text-[#0066B2] underline decoration-[#FFC72C] decoration-4 underline-offset-3">
                  CNPJ OU MEI
                </span>{' '}
                DE FORMA RÁPIDA!
              </h1>

              <p className="text-[#5A7184] text-sm sm:text-[15px] leading-relaxed font-medium">
                Em alguns minutos vamos montar um estudo personalizado que vem ajudando empresários
                a obter uma redução de custo na contratação de novos planos de saúde, mantendo ou
                melhorando sua rede de atendimento.
              </p>
            </div>

            {/* Benefícios / Trust Bar */}
            <div className="grid grid-cols-3 gap-2 py-4 my-2 border-y border-[#D7E4F0]/80">
              <div className="flex flex-col items-center text-center p-2 rounded-xl bg-[#F4F8FC]">
                <Shield className="w-4 h-4 text-[#0066B2] mb-1" />
                <span className="text-[11px] font-bold text-[#04325C]">Sem compromisso</span>
              </div>
              <div className="flex flex-col items-center text-center p-2 rounded-xl bg-[#F4F8FC]">
                <Zap className="w-4 h-4 text-[#FFC72C] fill-[#FFC72C] mb-1" />
                <span className="text-[11px] font-bold text-[#04325C]">Online</span>
              </div>
              <div className="flex flex-col items-center text-center p-2 rounded-xl bg-[#F4F8FC]">
                <HeartHandshake className="w-4 h-4 text-[#1FA971] mb-1" />
                <span className="text-[11px] font-bold text-[#04325C]">100% Gratuito</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={handleStart}
                className="w-full min-h-[58px] bg-[#0066B2] hover:bg-[#04325C] active:scale-[0.98] text-white font-extrabold text-base sm:text-lg rounded-2xl shadow-[0_8px_20px_rgba(0,102,178,0.28)] flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <span>INICIAR COTAÇÃO</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={handleStart}
                className="text-xs font-semibold text-[#0066B2] hover:underline cursor-pointer block mx-auto py-1"
              >
                Já tenho um plano e quero comparar valores →
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* PERGUNTA 1: IDADES DAS VIDAS A SEREM COBERTAS */}
        {/* ============================================================ */}
        {step === 1 && (
          <form
            onSubmit={handleConfirmStep1}
            className={`p-4 sm:p-6 flex-1 flex flex-col justify-between ${
              direction === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[#0066B2] font-bold text-xs uppercase tracking-wider">
                <Cake className="w-4 h-4" />
                Pergunta 1 de 6
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-[#04325C] leading-snug">
                Quais as idades das vidas a serem cobertas?
              </h2>

              <p className="text-xs sm:text-sm text-[#5A7184]">
                Informe as idades das pessoas que entrarão no plano (titulares, dependentes e
                sócios).
              </p>

              {/* Botão de Exemplo rápido */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-[#5A7184]">
                  Exemplo: <strong>43, 38, 20, 12, 45</strong>
                </span>
                <button
                  type="button"
                  onClick={handleUsarExemplo}
                  className="text-[11px] font-bold text-[#0066B2] hover:underline bg-[#E3F0FA] hover:bg-[#D7E4F0] px-2.5 py-1 rounded-lg transition cursor-pointer"
                >
                  Usar exemplo (5 vidas)
                </button>
              </div>

              {/* Alternador de Modo de Entrada: Entradas por Vida vs Digitação Rápida */}
              <div className="flex bg-[#F4F8FC] p-1 rounded-xl border border-[#D7E4F0] text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setModoEntradaIdades('individual')
                    setIdadesError('')
                  }}
                  className={`flex-1 py-1.5 rounded-lg transition cursor-pointer text-center ${
                    modoEntradaIdades === 'individual'
                      ? 'bg-white text-[#0066B2] shadow-xs'
                      : 'text-[#5A7184] hover:text-[#04325C]'
                  }`}
                >
                  Entradas por vida
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModoEntradaIdades('rapido')
                    // Preenche input rápido com valores atuais da lista
                    const validos = listaIdades
                      .map((v) => parseInt(v.trim(), 10))
                      .filter((n) => !Number.isNaN(n) && n >= 0 && n <= 99)
                    if (validos.length > 0) {
                      setIdadesInput(formatIdades(validos))
                    }
                    setIdadesError('')
                  }}
                  className={`flex-1 py-1.5 rounded-lg transition cursor-pointer text-center ${
                    modoEntradaIdades === 'rapido'
                      ? 'bg-white text-[#0066B2] shadow-xs'
                      : 'text-[#5A7184] hover:text-[#04325C]'
                  }`}
                >
                  Digitar tudo junto (vírgulas)
                </button>
              </div>

              {/* MODO 1: ENTRADAS NUMÉRICAS POR VIDA (Mobile-first, botões grandes) */}
              {modoEntradaIdades === 'individual' && (
                <div className="space-y-2.5 pt-1">
                  <div className="max-h-[36vh] overflow-y-auto space-y-2 pr-1">
                    {listaIdades.map((idade, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-[#FAFDFE] p-2 rounded-xl border border-[#D7E4F0]"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#E3F0FA] text-[#0066B2] font-black text-xs flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </div>
                        <div className="flex-1">
                          <label htmlFor={`idade-vida-${idx}`} className="sr-only">
                            Idade da vida {idx + 1}
                          </label>
                          <input
                            id={`idade-vida-${idx}`}
                            type="tel"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={idade}
                            onChange={(e) => handleUpdateVida(idx, e.target.value)}
                            placeholder="Idade (ex: 35)"
                            maxLength={2}
                            className="w-full h-11 px-3 rounded-lg border border-[#D7E4F0] bg-white text-base font-bold text-[#04325C] focus:outline-none focus:border-[#0066B2] focus:ring-2 focus:ring-[#0066B2]/20"
                          />
                        </div>
                        <span className="text-xs text-[#5A7184] font-medium shrink-0">anos</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveVida(idx)}
                          disabled={listaIdades.length <= 1 && !idade}
                          className="w-9 h-9 rounded-lg text-[#5A7184] hover:text-[#E5484D] hover:bg-red-50 flex items-center justify-center transition disabled:opacity-30 cursor-pointer shrink-0"
                          title="Remover esta vida"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddVida}
                    className="w-full h-11 border-2 border-dashed border-[#0066B2]/40 hover:border-[#0066B2] hover:bg-[#E3F0FA]/40 text-[#0066B2] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar outra vida</span>
                  </button>
                </div>
              )}

              {/* MODO 2: DIGITAÇÃO SEPARADA POR VÍRGULA */}
              {modoEntradaIdades === 'rapido' && (
                <div className="space-y-2 pt-1">
                  <label htmlFor="idades-input" className="block text-xs font-bold text-[#04325C]">
                    Idades (separadas por vírgula):
                  </label>
                  <input
                    id="idades-input"
                    type="text"
                    inputMode="numeric"
                    value={idadesInput}
                    onChange={(e) => {
                      setIdadesInput(e.target.value)
                      setIdadesError('')
                    }}
                    placeholder="Ex.: 43, 38, 20, 12, 45"
                    className={`w-full h-12 px-3.5 rounded-2xl border bg-white text-base font-semibold text-[#04325C] focus:outline-none focus:ring-2 ${
                      idadesError
                        ? 'border-[#E5484D] focus:ring-[#E5484D]/20'
                        : 'border-[#D7E4F0] focus:border-[#0066B2] focus:ring-[#0066B2]/20'
                    }`}
                  />
                  <p className="text-[11px] text-[#5A7184]">
                    Digite números de 0 a 99 separados por vírgula. Exemplo: 43, 38, 20, 12, 45
                  </p>
                </div>
              )}

              {/* Contagem de vidas detectada */}
              {qtdVidasDetectada > 0 && idadesParsedAtual.invalid.length === 0 && (
                <div className="bg-[#E3F0FA]/70 border border-[#BFE0F7] rounded-xl px-3.5 py-2.5 flex items-center gap-2 animate-fade-in">
                  <Users className="w-4 h-4 text-[#0066B2] shrink-0" />
                  <span className="text-sm font-bold text-[#04325C]">
                    {qtdVidasDetectada} {qtdVidasDetectada === 1 ? 'vida' : 'vidas'}
                  </span>
                  <span className="text-xs text-[#5A7184] ml-auto font-medium truncate max-w-[180px]">
                    {formatIdades(idadesParsedAtual.valid)}
                  </span>
                </div>
              )}

              {idadesError && (
                <p className="text-xs text-[#E5484D] font-semibold flex items-center gap-1 animate-fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {idadesError}
                </p>
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={qtdVidasDetectada === 0}
                className="w-full min-h-[58px] bg-[#0066B2] hover:bg-[#04325C] disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-base rounded-2xl shadow-[0_8px_20px_rgba(0,102,178,0.22)] flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <span>Continuar</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>
        )}

        {/* ============================================================ */}
        {/* PERGUNTA 2: CNPJ OU MEI */}
        {/* ============================================================ */}
        {step === 2 && (
          <div
            className={`p-4 sm:p-6 flex-1 flex flex-col justify-between ${
              direction === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[#0066B2] font-bold text-xs uppercase tracking-wider">
                <Building2 className="w-4 h-4" />
                Pergunta 2 de 6
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-[#04325C] leading-snug">
                A empresa possui CNPJ?
              </h2>

              <p className="text-xs sm:text-sm text-[#5A7184]">
                Planos com CNPJ ou MEI têm até 40% de desconto em relação a planos individuais.
              </p>

              <div className="space-y-2.5 pt-2">
                {cnpjTypes.map((opt) => {
                  const isSelected = selectedCnpjType === opt.id

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setSelectedCnpjType(opt.id)
                        setCnpjError('')
                      }}
                      className={`w-full min-h-[64px] px-4 py-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#0066B2] bg-[#E3F0FA] shadow-[0_4px_16px_rgba(0,102,178,0.18)]'
                          : 'border-[#D7E4F0] bg-white hover:border-[#0066B2]/50 hover:bg-[#F4F8FC]'
                      }`}
                    >
                      <div>
                        <div className="font-extrabold text-[#04325C] text-base leading-tight">
                          {opt.label}
                        </div>
                        <div className="text-xs text-[#5A7184] font-medium leading-tight mt-0.5">
                          {opt.sub}
                        </div>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                          isSelected
                            ? 'border-[#0066B2] bg-[#0066B2] text-white'
                            : 'border-[#D7E4F0] bg-white'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Campo opcional com máscara se Sim ou MEI */}
              {(selectedCnpjType === 'cnpj' || selectedCnpjType === 'mei') && (
                <div className="bg-[#FAFDFE] border border-[#BFE0F7] rounded-2xl p-3.5 space-y-2 animate-fade-in mt-3">
                  <label htmlFor="cnpj-input" className="block text-xs font-bold text-[#04325C]">
                    Digite o número do seu CNPJ{' '}
                    <span className="text-[#5A7184] font-normal">
                      (opcional para agilizar o estudo)
                    </span>
                    :
                  </label>
                  <input
                    id="cnpj-input"
                    type="tel"
                    inputMode="numeric"
                    value={cnpjInput}
                    onChange={(e) => {
                      setCnpjInput(maskCNPJ(e.target.value))
                      setCnpjError('')
                    }}
                    placeholder="00.000.000/0000-00"
                    maxLength={18}
                    className="w-full h-12 px-3.5 rounded-xl border border-[#D7E4F0] bg-white text-base font-semibold text-[#04325C] focus:outline-none focus:border-[#0066B2] focus:ring-2 focus:ring-[#0066B2]/20"
                  />
                  {cnpjError && (
                    <p className="text-xs text-[#E5484D] font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {cnpjError}
                    </p>
                  )}
                  <p className="text-[11px] text-[#5A7184]">
                    Usamos o CNPJ apenas para consultar a elegibilidade do plano PME da Porto Saúde.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4">
              <button
                type="button"
                disabled={!selectedCnpjType}
                onClick={handleConfirmStep2}
                className="w-full min-h-[58px] bg-[#0066B2] hover:bg-[#04325C] disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-base rounded-2xl shadow-[0_8px_20px_rgba(0,102,178,0.22)] flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <span>Continuar</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* PERGUNTA 3: SITUAÇÃO ATUAL */}
        {/* ============================================================ */}
        {step === 3 && (
          <div
            className={`p-4 sm:p-6 flex-1 flex flex-col justify-between ${
              direction === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[#0066B2] font-bold text-xs uppercase tracking-wider">
                <FileCheck2 className="w-4 h-4" />
                Pergunta 3 de 6
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-[#04325C] leading-snug">
                Qual a situação atual do plano da empresa?
              </h2>

              <p className="text-xs sm:text-sm text-[#5A7184]">
                Isso nos ajuda a calcular a melhor carência e desconto por portabilidade.
              </p>

              <div className="space-y-2.5 pt-2">
                {situacaoOptions.map((opt) => {
                  const isSelected =
                    selectedOptionId === opt.key || answers.situacao_key === opt.key

                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() =>
                        handleSelectOption(
                          4,
                          () =>
                            setAnswers((prev) => ({
                              ...prev,
                              situacao_plano: opt.label,
                              situacao_key: opt.key,
                            })),
                          opt.key,
                        )
                      }
                      className={`w-full min-h-[64px] px-4 py-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer active:scale-[0.98] ${
                        isSelected
                          ? 'border-[#0066B2] bg-[#E3F0FA] shadow-[0_4px_16px_rgba(0,102,178,0.18)] scale-[1.01]'
                          : 'border-[#D7E4F0] bg-white hover:border-[#0066B2]/50 hover:bg-[#F4F8FC]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-[#0066B2] text-white' : 'bg-[#E3F0FA] text-[#0066B2]'
                          }`}
                        >
                          <opt.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-extrabold text-[#04325C] text-base leading-tight">
                            {opt.label}
                          </div>
                          <div className="text-xs text-[#5A7184] font-medium leading-tight mt-0.5">
                            {opt.sub}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                          isSelected
                            ? 'border-[#0066B2] bg-[#0066B2] text-white'
                            : 'border-[#D7E4F0] bg-white'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <p className="text-[11px] text-center text-[#5A7184] pt-3">
              ⚡ Toque na opção desejada para avançar automaticamente
            </p>
          </div>
        )}

        {/* ============================================================ */}
        {/* PERGUNTA 4: OPERADORA ATUAL */}
        {/* ============================================================ */}
        {step === 4 && (
          <div
            className={`p-4 sm:p-6 flex-1 flex flex-col justify-between ${
              direction === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[#0066B2] font-bold text-xs uppercase tracking-wider">
                <Building2 className="w-4 h-4" />
                Pergunta 4 de 6
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-[#04325C] leading-snug">
                Com qual operadora a empresa está hoje?
              </h2>

              <p className="text-xs sm:text-sm text-[#5A7184]">
                A Porto Saúde possui regras flexíveis de redução ou isenção de carências para quem
                já tem plano.
              </p>

              <div className="space-y-2 pt-2">
                {operadoras.map((op, idx) => {
                  const isSelected =
                    selectedOptionId === `op-${idx}` || answers.operadora_atual === op

                  return (
                    <button
                      key={op}
                      type="button"
                      onClick={() =>
                        handleSelectOption(
                          5,
                          () =>
                            setAnswers((prev) => ({
                              ...prev,
                              operadora_atual: op,
                            })),
                          `op-${idx}`,
                        )
                      }
                      className={`w-full min-h-[58px] px-4 py-2.5 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer active:scale-[0.98] ${
                        isSelected
                          ? 'border-[#0066B2] bg-[#E3F0FA] shadow-[0_4px_16px_rgba(0,102,178,0.18)] scale-[1.01]'
                          : 'border-[#D7E4F0] bg-white hover:border-[#0066B2]/50 hover:bg-[#F4F8FC]'
                      }`}
                    >
                      <span className="font-extrabold text-[#04325C] text-[15px]">{op}</span>

                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                          isSelected
                            ? 'border-[#0066B2] bg-[#0066B2] text-white'
                            : 'border-[#D7E4F0] bg-white'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <p className="text-[11px] text-center text-[#5A7184] pt-2">
              ⚡ Mesmo se não tiver plano, avançamos para o prazo de contratação
            </p>
          </div>
        )}

        {/* ============================================================ */}
        {/* PERGUNTA 5: PRAZO DE CONTRATAÇÃO */}
        {/* ============================================================ */}
        {step === 5 && (
          <div
            className={`p-4 sm:p-6 flex-1 flex flex-col justify-between ${
              direction === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[#0066B2] font-bold text-xs uppercase tracking-wider">
                <CalendarDays className="w-4 h-4" />
                Pergunta 5 de 6
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-[#04325C] leading-snug">
                Quando a empresa pretende contratar?
              </h2>

              <p className="text-xs sm:text-sm text-[#5A7184]">
                Organizamos a data de vigência conforme a necessidade da sua empresa.
              </p>

              <div className="space-y-2.5 pt-2">
                {prazos.map((p) => {
                  const isSelected = selectedOptionId === p.key || answers.prazo_key === p.key

                  return (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() =>
                        handleSelectOption(
                          6,
                          () =>
                            setAnswers((prev) => ({
                              ...prev,
                              prazo_contratacao: p.label,
                              prazo_key: p.key,
                            })),
                          p.key,
                        )
                      }
                      className={`w-full min-h-[64px] px-4 py-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer active:scale-[0.98] ${
                        isSelected
                          ? 'border-[#0066B2] bg-[#E3F0FA] shadow-[0_4px_16px_rgba(0,102,178,0.18)] scale-[1.01]'
                          : 'border-[#D7E4F0] bg-white hover:border-[#0066B2]/50 hover:bg-[#F4F8FC]'
                      }`}
                    >
                      <div>
                        <div className="font-extrabold text-[#04325C] text-base leading-tight">
                          {p.label}
                        </div>
                        <div className="text-xs text-[#5A7184] font-medium leading-tight mt-0.5">
                          {p.sub}
                        </div>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                          isSelected
                            ? 'border-[#0066B2] bg-[#0066B2] text-white'
                            : 'border-[#D7E4F0] bg-white'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <p className="text-[11px] text-center text-[#5A7184] pt-3">
              ⚡ Toque na opção desejada para avançar automaticamente
            </p>
          </div>
        )}

        {/* ============================================================ */}
        {/* PERGUNTA 6: CIDADE / UF */}
        {/* ============================================================ */}
        {step === 6 && (
          <form
            onSubmit={handleConfirmCidade}
            className={`p-4 sm:p-6 flex-1 flex flex-col justify-between ${
              direction === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#0066B2] font-bold text-xs uppercase tracking-wider">
                <MapPin className="w-4 h-4" />
                Pergunta 6 de 6
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-[#04325C] leading-snug">
                Qual a cidade da sede da empresa?
              </h2>

              <p className="text-xs sm:text-sm text-[#5A7184]">
                A tabela de preços da Porto Saúde varia conforme o município e a rede de hospitais
                credenciados da região.
              </p>

              <div className="pt-2 space-y-2">
                <label htmlFor="cidade-input" className="block text-xs font-bold text-[#04325C]">
                  Cidade e Estado:
                </label>
                <div className="relative">
                  <MapPin className="w-5 h-5 text-[#0066B2] absolute left-3.5 top-3.5" />
                  <input
                    id="cidade-input"
                    type="text"
                    value={cidadeInput}
                    onChange={(e) => {
                      setCidadeInput(e.target.value)
                      setCidadeError('')
                    }}
                    placeholder="Ex.: São Paulo / SP"
                    className="w-full h-12 pl-11 pr-4 rounded-2xl border border-[#D7E4F0] bg-white text-base font-semibold text-[#04325C] focus:outline-none focus:border-[#0066B2] focus:ring-2 focus:ring-[#0066B2]/20"
                    autoFocus
                  />
                </div>
                {cidadeError && (
                  <p className="text-xs text-[#E5484D] font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {cidadeError}
                  </p>
                )}

                <div className="flex flex-wrap gap-1.5 pt-2">
                  <span className="text-[11px] text-[#5A7184] font-medium mr-1">
                    Exemplos rápidos:
                  </span>
                  {[
                    'São Paulo / SP',
                    'Campinas / SP',
                    'Santo André / SP',
                    'Rio de Janeiro / RJ',
                  ].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setCidadeInput(s)
                        setCidadeError('')
                      }}
                      className="text-[11px] bg-[#E3F0FA] text-[#0066B2] font-semibold px-2 py-0.5 rounded-md hover:bg-[#BFE0F7] transition cursor-pointer"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={!cidadeInput.trim()}
                className="w-full min-h-[58px] bg-[#0066B2] hover:bg-[#04325C] disabled:opacity-40 text-white font-extrabold text-base rounded-2xl shadow-[0_8px_20px_rgba(0,102,178,0.22)] flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <span>Avançar para Proposta</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>
        )}

        {/* ============================================================ */}
        {/* TELA DE CONTATO: DADOS DO LEAD COM LGPD OBRIGATÓRIO */}
        {/* ============================================================ */}
        {step === 'contact' && (
          <form
            onSubmit={handleSubmitLead}
            className={`p-4 sm:p-6 flex-1 flex flex-col justify-between ${
              direction === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[#0066B2] font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-[#1FA971]" />
                Quase lá! Último passo
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-[#04325C] leading-tight">
                Onde enviamos a sua proposta?
              </h2>

              <p className="text-xs text-[#5A7184]">
                🔒 Seus dados estão seguros e não serão compartilhados.
              </p>

              {formErrors.submit && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{formErrors.submit}</span>
                </div>
              )}

              <div className="space-y-2.5 pt-1">
                {/* Nome Completo */}
                <div>
                  <label
                    htmlFor="lead-nome"
                    className="block text-xs font-bold text-[#04325C] mb-1"
                  >
                    Nome completo *
                  </label>
                  <input
                    id="lead-nome"
                    type="text"
                    value={nome}
                    onChange={(e) => {
                      setNome(e.target.value)
                      if (formErrors.nome) setFormErrors((p) => ({ ...p, nome: undefined }))
                    }}
                    placeholder="Ex.: Carlos Mendes"
                    className={`w-full h-11 px-3.5 rounded-xl border bg-white text-sm font-medium text-[#04325C] focus:outline-none focus:ring-2 ${
                      formErrors.nome
                        ? 'border-[#E5484D] focus:ring-[#E5484D]/20'
                        : 'border-[#D7E4F0] focus:border-[#0066B2] focus:ring-[#0066B2]/20'
                    }`}
                  />
                  {formErrors.nome && (
                    <p className="text-[11px] text-[#E5484D] font-semibold mt-1">
                      {formErrors.nome}
                    </p>
                  )}
                </div>

                {/* WhatsApp */}
                <div>
                  <label
                    htmlFor="lead-whatsapp"
                    className="block text-xs font-bold text-[#04325C] mb-1"
                  >
                    WhatsApp (com DDD) *
                  </label>
                  <input
                    id="lead-whatsapp"
                    type="tel"
                    inputMode="numeric"
                    value={whatsapp}
                    onChange={(e) => {
                      setWhatsapp(maskPhone(e.target.value))
                      if (formErrors.whatsapp) setFormErrors((p) => ({ ...p, whatsapp: undefined }))
                    }}
                    placeholder="(11) 98765-4321"
                    maxLength={15}
                    className={`w-full h-11 px-3.5 rounded-xl border bg-white text-sm font-semibold text-[#04325C] focus:outline-none focus:ring-2 ${
                      formErrors.whatsapp
                        ? 'border-[#E5484D] focus:ring-[#E5484D]/20'
                        : 'border-[#D7E4F0] focus:border-[#0066B2] focus:ring-[#0066B2]/20'
                    }`}
                  />
                  {formErrors.whatsapp && (
                    <p className="text-[11px] text-[#E5484D] font-semibold mt-1">
                      {formErrors.whatsapp}
                    </p>
                  )}
                </div>

                {/* E-mail */}
                <div>
                  <label
                    htmlFor="lead-email"
                    className="block text-xs font-bold text-[#04325C] mb-1"
                  >
                    E-mail para envio da tabela *
                  </label>
                  <input
                    id="lead-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (formErrors.email) setFormErrors((p) => ({ ...p, email: undefined }))
                    }}
                    placeholder="carlos@suaempresa.com.br"
                    className={`w-full h-11 px-3.5 rounded-xl border bg-white text-sm font-medium text-[#04325C] focus:outline-none focus:ring-2 ${
                      formErrors.email
                        ? 'border-[#E5484D] focus:ring-[#E5484D]/20'
                        : 'border-[#D7E4F0] focus:border-[#0066B2] focus:ring-[#0066B2]/20'
                    }`}
                  />
                  {formErrors.email && (
                    <p className="text-[11px] text-[#E5484D] font-semibold mt-1">
                      {formErrors.email}
                    </p>
                  )}
                </div>

                {/* Nome da Empresa (Opcional) */}
                <div>
                  <label
                    htmlFor="lead-empresa"
                    className="block text-xs font-bold text-[#04325C] mb-1"
                  >
                    Nome da empresa <span className="text-[#5A7184] font-normal">(opcional)</span>
                  </label>
                  <input
                    id="lead-empresa"
                    type="text"
                    value={empresa}
                    onChange={(e) => setEmpresa(e.target.value)}
                    placeholder="Ex.: Padaria Estrela Ltda"
                    className="w-full h-11 px-3.5 rounded-xl border border-[#D7E4F0] bg-white text-sm font-medium text-[#04325C] focus:outline-none focus:border-[#0066B2] focus:ring-2 focus:ring-[#0066B2]/20"
                  />
                </div>

                {/* Consentimento LGPD Obrigatório */}
                <div className="pt-1">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={lgpdConsent}
                      onChange={(e) => {
                        setLgpdConsent(e.target.checked)
                        if (formErrors.lgpd) setFormErrors((p) => ({ ...p, lgpd: undefined }))
                      }}
                      className="mt-0.5 w-4 h-4 rounded text-[#0066B2] border-[#D7E4F0] focus:ring-[#0066B2] accent-[#0066B2]"
                    />
                    <span className="text-[11px] leading-tight text-[#5A7184]">
                      Autorizo o contato da <strong>Lasacor</strong> / <strong>Porto Saúde</strong>{' '}
                      e concordo com a{' '}
                      <span className="text-[#0066B2] underline">
                        Política de Privacidade (LGPD)
                      </span>
                      .
                    </span>
                  </label>
                  {formErrors.lgpd && (
                    <p className="text-[11px] text-[#E5484D] font-semibold mt-1">
                      {formErrors.lgpd}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={submitting}
                className="w-full min-h-[58px] bg-[#0066B2] hover:bg-[#04325C] disabled:opacity-60 text-white font-extrabold text-base rounded-2xl shadow-[0_8px_20px_rgba(0,102,178,0.22)] flex items-center justify-center gap-2 transition cursor-pointer"
              >
                {submitting ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Gerando estudo...
                  </span>
                ) : (
                  <>
                    <span>Receber minha proposta</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ============================================================ */}
        {/* TELA DE SUCESSO */}
        {/* ============================================================ */}
        {step === 'success' && (
          <div className="relative p-6 sm:p-8 flex-1 flex flex-col items-center justify-between text-center animate-fade-in">
            <ConfettiEffect />

            <div className="space-y-4 pt-4 z-10 w-full">
              {/* Checkmark animado em círculo azul */}
              <div className="w-20 h-20 rounded-full bg-[#E3F0FA] text-[#0066B2] mx-auto flex items-center justify-center border-2 border-[#0066B2] shadow-[0_8px_24px_rgba(0,102,178,0.20)]">
                <svg
                  className="w-12 h-12 text-[#0066B2]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline
                    points="20 6 9 17 4 12"
                    style={{
                      strokeDasharray: 48,
                      strokeDashoffset: 0,
                      animation: 'check-draw 0.6s ease-out forwards',
                    }}
                  />
                </svg>
              </div>

              <div className="space-y-1.5">
                <span className="bg-[#E3F0FA] text-[#0066B2] text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                  Cotação Iniciada com Sucesso
                </span>
                <h2 className="text-2xl sm:text-[26px] font-black text-[#04325C]">
                  Tudo pronto, {nome.split(' ')[0] || 'Empresário'}!
                </h2>
              </div>

              <p className="text-sm sm:text-base text-[#5A7184] leading-relaxed max-w-sm mx-auto">
                Recebemos as respostas da sua empresa. Um especialista <strong>Porto Saúde</strong>{' '}
                da <strong>Lasacor</strong> entrará em contato pelo WhatsApp de forma{' '}
                <strong>Online</strong> com o seu comparativo.
              </p>

              {/* Card resumo */}
              <div className="bg-[#FAFDFE] border border-[#BFE0F7] rounded-2xl p-4 text-left text-xs space-y-1.5 max-w-sm mx-auto shadow-xs">
                <div className="flex justify-between">
                  <span className="text-[#5A7184]">Vidas:</span>
                  <span className="font-bold text-[#04325C]">
                    {idadesConfirmadas.length > 0
                      ? `${idadesConfirmadas.length} ${
                          idadesConfirmadas.length === 1 ? 'vida' : 'vidas'
                        } · ${idadesConfirmadasTexto}`
                      : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5A7184]">Localidade:</span>
                  <span className="font-bold text-[#04325C]">
                    {answers.cidade_uf || 'São Paulo / SP'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5A7184]">WhatsApp cadastrado:</span>
                  <span className="font-bold text-[#0066B2]">{whatsapp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5A7184]">Corretora:</span>
                  <span className="font-bold text-[#04325C]">Lasacor · CNPJ {LASACOR_CNPJ}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-[#D7E4F0]">
                  <span className="text-[#5A7184]">Status do estudo:</span>
                  <span className="font-bold text-[#1FA971] flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#1FA971] animate-ping" />
                    Em análise pelo corretor
                  </span>
                </div>
              </div>
            </div>

            {/* Ação imediata: Chamar no WhatsApp */}
            <div className="w-full space-y-2.5 pt-4 z-10">
              {(() => {
                const cleanPhone = '5511999999999' // Central Lasacor
                const encodedMsg = encodeURIComponent(
                  `Olá! Acabei de preencher o quiz da Porto Saúde pela Lasacor para a empresa ${empresa || nome} (${idadesConfirmadas.length} vidas). Gostaria de receber meu estudo!`,
                )
                const waUrl = `https://wa.me/${cleanPhone}?text=${encodedMsg}`

                return (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full min-h-[58px] bg-[#1FA971] hover:bg-[#188c5d] text-white font-extrabold text-base rounded-2xl shadow-[0_8px_20px_rgba(31,169,113,0.3)] flex items-center justify-center gap-2.5 transition active:scale-[0.98]"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Falar agora no WhatsApp</span>
                  </a>
                )
              })()}

              <button
                type="button"
                onClick={() => {
                  setStep('intro')
                  setAnswers({})
                  setNome('')
                  setWhatsapp('')
                  setEmail('')
                  setEmpresa('')
                  setCnpjInput('')
                  setSelectedCnpjType('')
                  setCidadeInput('')
                  setIdadesInput('')
                  setIdadesError('')
                  setIdadesConfirmadas([])
                  setLgpdConsent(true)
                }}
                className="text-xs font-semibold text-[#5A7184] hover:text-[#0066B2] transition block mx-auto py-1"
              >
                Fazer nova cotação para outro CNPJ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
