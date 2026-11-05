import pb from '@/lib/pocketbase/client'
import type { RecordModel } from 'pocketbase'

export type LeadQtdVidas = '1-5' | '6-10' | '11-20' | '21-50' | '50+'
export type LeadSituacao = 'ja-tenho' | 'quero-trocar' | 'primeiro-plano' | 'nao-sei'
export type LeadPrazo = 'imediato' | '30-dias' | '3-meses' | 'pesquisando'
export type LeadStatus = 'novo' | 'em-atendimento' | 'proposta-enviada' | 'fechado' | 'perdido'

export interface LeadRespostas {
  qtd_vidas?: string
  tipo_cnpj?: string
  cnpj?: string
  situacao_plano?: string
  operadora_atual?: string
  prazo_contratacao?: string
  cidade_uf?: string
  [key: string]: unknown
}

export interface LeadRecord extends RecordModel {
  nome: string
  whatsapp: string
  email: string
  empresa?: string
  cnpj?: string
  qtd_vidas: LeadQtdVidas
  situacao_plano: LeadSituacao
  operadora_atual?: string
  cidade_uf: string
  prazo_contratacao: LeadPrazo
  respostas: LeadRespostas | string
  score: number
  status: LeadStatus
  origem: string
  created: string
  updated: string
}

export interface CreateLeadInput {
  nome: string
  whatsapp: string
  email: string
  empresa?: string
  cnpj?: string
  qtd_vidas: LeadQtdVidas
  situacao_plano: LeadSituacao
  operadora_atual?: string
  cidade_uf: string
  prazo_contratacao: LeadPrazo
  respostas: LeadRespostas
  score: number
  origem?: string
}

export async function createLead(data: CreateLeadInput): Promise<LeadRecord> {
  const payload = {
    ...data,
    status: 'novo' as LeadStatus,
    origem: data.origem || 'quiz-pme-porto-saude',
  }
  return (await pb.collection('leads').create(payload)) as LeadRecord
}

export async function listLeads(filter?: string, sort = '-created'): Promise<LeadRecord[]> {
  return (await pb.collection('leads').getFullList({
    filter,
    sort,
  })) as LeadRecord[]
}

export async function updateLeadStatus(id: string, status: LeadStatus): Promise<LeadRecord> {
  return (await pb.collection('leads').update(id, { status })) as LeadRecord
}

export async function deleteLead(id: string): Promise<boolean> {
  return await pb.collection('leads').delete(id)
}
