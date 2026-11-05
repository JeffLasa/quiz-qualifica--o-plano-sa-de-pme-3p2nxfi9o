import type { LeadQtdVidas } from '@/services/leads'

// Máscaras e validações utilitárias

export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (!digits) return ''
  if (digits.length <= 2) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
}

export function maskCNPJ(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 14)
  if (!digits) return ''
  if (digits.length <= 2) return digits
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`
  if (digits.length <= 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`
  }
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '')
  return digits.length >= 10 && digits.length <= 11
}

export function isValidCNPJ(cnpj: string): boolean {
  const digits = cnpj.replace(/\D/g, '')
  if (digits.length !== 14) return false
  if (/^(\d)\1{13}$/.test(digits)) return false

  let tamanho = digits.length - 2
  let numeros = digits.substring(0, tamanho)
  const digitos = digits.substring(tamanho)
  let soma = 0
  let pos = tamanho - 7

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i), 10) * pos--
    if (pos < 2) pos = 9
  }
  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11)
  if (resultado !== parseInt(digitos.charAt(0), 10)) return false

  tamanho = tamanho + 1
  numeros = digits.substring(0, tamanho)
  soma = 0
  pos = tamanho - 7
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i), 10) * pos--
    if (pos < 2) pos = 9
  }
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11)
  if (resultado !== parseInt(digitos.charAt(1), 10)) return false

  return true
}

/** Interpreta a lista de idades digitada (ex.: "43,38,20,12,45"). Idades válidas: inteiros de 0 a 99. */
export function parseIdades(value: string): { valid: number[]; invalid: string[] } {
  const tokens = value
    .split(/[,;\s]+/)
    .map((t) => t.trim().replace(/[^0-9]/g, ''))
    .filter((t) => t.length > 0)

  const valid: number[] = []
  const invalid: string[] = []
  for (const token of tokens) {
    const n = parseInt(token, 10)
    if (Number.isNaN(n) || n < 0 || n > 99) {
      invalid.push(token)
    } else {
      valid.push(n)
    }
  }
  return { valid, invalid }
}

/** Formata a lista de idades para exibição/gravação (ex.: "43, 38, 20, 12, 45"). */
export function formatIdades(idades: number[]): string {
  return idades.join(', ')
}

/** Faixa de nº de vidas a partir da quantidade de idades informadas (mantém o campo `qtd_vidas`). */
export function faixaVidas(qtd: number): LeadQtdVidas {
  if (qtd >= 51) return '50+'
  if (qtd >= 21) return '21-50'
  if (qtd >= 11) return '11-20'
  if (qtd >= 6) return '6-10'
  return '1-5'
}

export function calculateScore(answers: {
  qtdVidasKey?: string
  situacaoKey?: string
  prazoKey?: string
  hasCNPJ?: boolean
}): number {
  let score = 30 // Base

  // Vidas: mais vidas = maior prioridade
  switch (answers.qtdVidasKey) {
    case '50+':
      score += 35
      break
    case '21-50':
      score += 30
      break
    case '11-20':
      score += 24
      break
    case '6-10':
      score += 18
      break
    case '1-5':
    default:
      score += 10
      break
  }

  // Prazo: imediato / 30 dias = maior urgência
  switch (answers.prazoKey) {
    case 'imediato':
      score += 20
      break
    case '30-dias':
      score += 15
      break
    case '3-meses':
      score += 8
      break
    case 'pesquisando':
    default:
      score += 2
      break
  }

  // Situação: já tem e quer trocar/comparar = alta propensão
  switch (answers.situacaoKey) {
    case 'quero-trocar':
      score += 15
      break
    case 'ja-tenho':
      score += 12
      break
    case 'primeiro-plano':
      score += 8
      break
    case 'nao-sei':
    default:
      score += 4
      break
  }

  // Bônus se tem CNPJ preenchido
  if (answers.hasCNPJ) {
    score += 5
  }

  return Math.min(100, Math.max(10, score))
}
