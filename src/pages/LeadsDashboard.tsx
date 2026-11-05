import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { PortoSailLogo } from '@/components/PortoSailLogo'
import { listLeads, updateLeadStatus, type LeadRecord, type LeadStatus } from '@/services/leads'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Users,
  Search,
  LogOut,
  Phone,
  Building2,
  Calendar,
  Eye,
  X,
  Sparkles,
  RefreshCw,
  ExternalLink,
} from 'lucide-react'

export default function LeadsDashboard() {
  const { user, signOut, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [leads, setLeads] = useState<LeadRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('todos')
  const [filterVidas, setFilterVidas] = useState<string>('todos')
  const [selectedLead, setSelectedLead] = useState<LeadRecord | null>(null)
  const [statusUpdating, setStatusUpdating] = useState(false)

  // Redireciona se não autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login')
    }
  }, [user, authLoading, navigate])

  // Carrega leads iniciais
  const loadInitialLeads = async () => {
    try {
      setLoading(true)
      const data = await listLeads()
      setLeads(data)
    } catch (err) {
      console.error('Erro ao listar leads:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      loadInitialLeads()
    }
  }, [user])

  // Inscrição em tempo real via SSE
  useRealtime<LeadRecord>(
    'leads',
    (e) => {
      if (e.action === 'create') {
        setLeads((prev) => [e.record, ...prev.filter((l) => l.id !== e.record.id)])
      } else if (e.action === 'update') {
        setLeads((prev) => prev.map((l) => (l.id === e.record.id ? e.record : l)))
        if (selectedLead?.id === e.record.id) {
          setSelectedLead(e.record)
        }
      } else if (e.action === 'delete') {
        setLeads((prev) => prev.filter((l) => l.id !== e.record.id))
        if (selectedLead?.id === e.record.id) {
          setSelectedLead(null)
        }
      }
    },
    Boolean(user),
  )

  // Métricas
  const stats = useMemo(() => {
    const total = leads.length
    const now = new Date()
    const last24h = leads.filter((l) => {
      const created = new Date(l.created)
      return now.getTime() - created.getTime() <= 24 * 60 * 60 * 1000
    }).length

    const avgScore =
      total > 0 ? Math.round(leads.reduce((acc, l) => acc + (l.score || 0), 0) / total) : 0

    const totalVidasEst = leads.reduce((acc, l) => {
      switch (l.qtd_vidas) {
        case '50+':
          return acc + 60
        case '21-50':
          return acc + 35
        case '11-20':
          return acc + 15
        case '6-10':
          return acc + 8
        case '1-5':
        default:
          return acc + 3
      }
    }, 0)

    return { total, last24h, avgScore, totalVidasEst }
  }, [leads])

  // Filtragem
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        searchTerm === '' ||
        lead.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.empresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.whatsapp?.includes(searchTerm) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = filterStatus === 'todos' || lead.status === filterStatus

      const matchesVidas = filterVidas === 'todos' || lead.qtd_vidas === filterVidas

      return matchesSearch && matchesStatus && matchesVidas
    })
  }, [leads, searchTerm, filterStatus, filterVidas])

  const handleUpdateStatus = async (leadId: string, newStatus: LeadStatus) => {
    try {
      setStatusUpdating(true)
      const updated = await updateLeadStatus(leadId, newStatus)
      setLeads((prev) => prev.map((l) => (l.id === leadId ? updated : l)))
      if (selectedLead?.id === leadId) {
        setSelectedLead(updated)
      }
    } catch (err) {
      console.error('Erro ao atualizar status:', err)
    } finally {
      setStatusUpdating(false)
    }
  }

  const getScoreBadge = (score: number) => {
    if (score >= 70) {
      return (
        <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold px-2.5 py-0.5 rounded-full text-xs inline-flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          {score}
        </span>
      )
    }
    if (score >= 40) {
      return (
        <span className="bg-amber-100 text-amber-800 border border-amber-300 font-extrabold px-2.5 py-0.5 rounded-full text-xs inline-flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
          {score}
        </span>
      )
    }
    return (
      <span className="bg-rose-100 text-rose-800 border border-rose-300 font-extrabold px-2.5 py-0.5 rounded-full text-xs inline-flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
        {score}
      </span>
    )
  }

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'novo':
        return (
          <span className="bg-[#E3F0FA] text-[#0066B2] border border-[#BFE0F7] font-bold px-2 py-0.5 rounded-md text-[11px]">
            Novo
          </span>
        )
      case 'em-atendimento':
        return (
          <span className="bg-blue-100 text-blue-800 border border-blue-200 font-bold px-2 py-0.5 rounded-md text-[11px]">
            Em atendimento
          </span>
        )
      case 'proposta-enviada':
        return (
          <span className="bg-purple-100 text-purple-800 border border-purple-200 font-bold px-2 py-0.5 rounded-md text-[11px]">
            Proposta enviada
          </span>
        )
      case 'fechado':
        return (
          <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold px-2 py-0.5 rounded-md text-[11px]">
            Fechado
          </span>
        )
      case 'perdido':
        return (
          <span className="bg-gray-100 text-gray-700 border border-gray-200 font-bold px-2 py-0.5 rounded-md text-[11px]">
            Perdido
          </span>
        )
      default:
        return null
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F8FC]">
        <div className="w-8 h-8 border-3 border-[#0066B2] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F4F8FC] flex flex-col">
      {/* Topbar do Painel */}
      <header className="bg-white border-b border-[#D7E4F0] sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PortoSailLogo size={36} variant="badge" />
            <div>
              <div className="font-extrabold text-[#04325C] text-base leading-tight">
                Painel do Corretor · <span className="text-[#0066B2]">Lasacor</span>
              </div>
              <div className="text-[11px] text-[#5A7184] font-medium">
                Gestão de Cotações PME Porto Saúde
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-[#04325C]">{user?.name || user?.email}</span>
              <span className="text-[10px] text-[#1FA971] font-semibold flex items-center gap-1 justify-end">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1FA971] animate-ping" />
                Tempo Real Conectado
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                signOut()
                navigate('/login')
              }}
              className="bg-[#F4F8FC] hover:bg-[#E3F0FA] text-[#04325C] hover:text-[#0066B2] p-2 rounded-xl border border-[#D7E4F0] flex items-center gap-1.5 text-xs font-bold transition cursor-pointer"
              title="Sair do painel"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 py-6 w-full flex-1 space-y-6">
        {/* Cards de Métricas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-[#D7E4F0] shadow-xs">
            <div className="flex items-center justify-between text-[#5A7184] text-xs font-semibold mb-1">
              <span>Total de Leads</span>
              <Users className="w-4 h-4 text-[#0066B2]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#04325C]">{stats.total}</div>
            <div className="text-[11px] text-[#1FA971] font-medium mt-1">
              Atualizado em tempo real
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#D7E4F0] shadow-xs">
            <div className="flex items-center justify-between text-[#5A7184] text-xs font-semibold mb-1">
              <span>Últimas 24h</span>
              <Sparkles className="w-4 h-4 text-[#FFC72C]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#0066B2]">{stats.last24h}</div>
            <div className="text-[11px] text-[#5A7184] font-medium mt-1">Novas solicitações</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#D7E4F0] shadow-xs">
            <div className="flex items-center justify-between text-[#5A7184] text-xs font-semibold mb-1">
              <span>Vidas Estimadas</span>
              <Building2 className="w-4 h-4 text-[#1FA971]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#04325C]">
              ~{stats.totalVidasEst}
            </div>
            <div className="text-[11px] text-[#5A7184] font-medium mt-1">Potencial em carteira</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#D7E4F0] shadow-xs">
            <div className="flex items-center justify-between text-[#5A7184] text-xs font-semibold mb-1">
              <span>Score Médio</span>
              <Sparkles className="w-4 h-4 text-[#0066B2]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#04325C]">
              {stats.avgScore} <span className="text-sm font-bold text-[#5A7184]">/100</span>
            </div>
            <div className="text-[11px] text-[#5A7184] font-medium mt-1">Qualificação do funil</div>
          </div>
        </div>

        {/* Barra de Filtros e Busca */}
        <div className="bg-white p-4 rounded-2xl border border-[#D7E4F0] shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#5A7184] absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, empresa, WhatsApp ou e-mail..."
              className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-[#D7E4F0] text-sm text-[#04325C] focus:outline-none focus:border-[#0066B2] focus:ring-2 focus:ring-[#0066B2]/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-11 px-3 rounded-xl border border-[#D7E4F0] text-xs font-semibold text-[#04325C] bg-white focus:outline-none focus:border-[#0066B2]"
            >
              <option value="todos">Todos os status</option>
              <option value="novo">Novo</option>
              <option value="em-atendimento">Em atendimento</option>
              <option value="proposta-enviada">Proposta enviada</option>
              <option value="fechado">Fechado</option>
              <option value="perdido">Perdido</option>
            </select>

            <select
              value={filterVidas}
              onChange={(e) => setFilterVidas(e.target.value)}
              className="h-11 px-3 rounded-xl border border-[#D7E4F0] text-xs font-semibold text-[#04325C] bg-white focus:outline-none focus:border-[#0066B2]"
            >
              <option value="todos">Todas as vidas</option>
              <option value="1-5">1 a 5 vidas</option>
              <option value="6-10">6 a 10 vidas</option>
              <option value="11-20">11 a 20 vidas</option>
              <option value="21-50">21 a 50 vidas</option>
              <option value="50+">Mais de 50 vidas</option>
            </select>

            <button
              type="button"
              onClick={loadInitialLeads}
              className="h-11 px-3 bg-[#E3F0FA] text-[#0066B2] rounded-xl hover:bg-[#BFE0F7] transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title="Recarregar"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Atualizar</span>
            </button>
          </div>
        </div>

        {/* Tabela no Desktop / Cards no Mobile */}
        <div className="bg-white rounded-2xl border border-[#D7E4F0] shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-3 border-[#0066B2] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-[#5A7184]">Carregando leads...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="py-16 text-center px-4">
              <Users className="w-10 h-10 text-[#5A7184]/40 mx-auto mb-2" />
              <p className="text-sm font-bold text-[#04325C]">
                Nenhum lead encontrado com os filtros aplicados
              </p>
              <p className="text-xs text-[#5A7184] mt-1">
                Aguarde novas respostas pelo quiz ou limpe a busca.
              </p>
            </div>
          ) : (
            <>
              {/* Tabela Desktop (hidden em mobile) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs text-[#10243A]">
                  <thead className="bg-[#FAFDFE] border-b border-[#D7E4F0] text-[#5A7184] uppercase font-bold text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Lead / Contato</th>
                      <th className="py-3 px-4">Empresa / CNPJ</th>
                      <th className="py-3 px-4">Vidas</th>
                      <th className="py-3 px-4">Operadora Atual</th>
                      <th className="py-3 px-4">Prazo</th>
                      <th className="py-3 px-4 text-center">Score</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D7E4F0]/60">
                    {filteredLeads.map((lead) => {
                      const cleanPhone = lead.whatsapp?.replace(/\D/g, '') || ''
                      const waUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(
                        `Olá ${lead.nome}! Sou da Lasacor Corretora parceira Porto Saúde sobre o estudo de plano para ${lead.empresa || 'sua empresa'}.`,
                      )}`

                      return (
                        <tr key={lead.id} className="hover:bg-[#F4F8FC]/80 transition group">
                          <td className="py-3 px-4">
                            <div className="font-extrabold text-[#04325C] text-sm">{lead.nome}</div>
                            <div className="text-[11px] text-[#5A7184] flex items-center gap-2 mt-0.5">
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#1FA971] hover:underline font-bold inline-flex items-center gap-1"
                              >
                                <Phone className="w-3 h-3" />
                                {lead.whatsapp}
                              </a>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-bold text-[#04325C]">
                              {lead.empresa || 'Não informada'}
                            </div>
                            <div className="text-[11px] text-[#5A7184]">
                              {lead.cnpj || lead.cidade_uf}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-extrabold text-[#04325C] bg-[#E3F0FA] text-[#0066B2] px-2 py-0.5 rounded-md">
                              {lead.qtd_vidas} vidas
                            </span>
                          </td>

                          <td className="py-3 px-4 text-[#5A7184] font-medium">
                            {lead.operadora_atual || 'Sem plano'}
                          </td>

                          <td className="py-3 px-4 text-[#5A7184] font-medium">
                            {lead.prazo_contratacao}
                          </td>

                          <td className="py-3 px-4 text-center">
                            {getScoreBadge(lead.score || 0)}
                          </td>

                          <td className="py-3 px-4">{getStatusBadge(lead.status)}</td>

                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedLead(lead)}
                              className="bg-[#E3F0FA] text-[#0066B2] hover:bg-[#0066B2] hover:text-white px-2.5 py-1.5 rounded-lg font-bold text-xs inline-flex items-center gap-1 transition cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Detalhes</span>
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Cards Mobile (visível apenas em mobile) */}
              <div className="md:hidden divide-y divide-[#D7E4F0]/80">
                {filteredLeads.map((lead) => {
                  const cleanPhone = lead.whatsapp?.replace(/\D/g, '') || ''
                  const waUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(
                    `Olá ${lead.nome}! Sou da Lasacor Corretora parceira Porto Saúde sobre o estudo de plano para ${lead.empresa || 'sua empresa'}.`,
                  )}`

                  return (
                    <div key={lead.id} className="p-4 space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-extrabold text-[#04325C] text-base leading-tight">
                            {lead.nome}
                          </div>
                          <div className="text-xs text-[#5A7184] font-medium">
                            {lead.empresa || lead.cidade_uf}
                          </div>
                        </div>
                        {getScoreBadge(lead.score || 0)}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="bg-[#E3F0FA] text-[#0066B2] font-bold px-2 py-0.5 rounded-md">
                          {lead.qtd_vidas} vidas
                        </span>
                        {getStatusBadge(lead.status)}
                        <span className="text-[#5A7184]">
                          {lead.operadora_atual || 'Sem plano'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[#1FA971] text-white px-3 py-1.5 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 shadow-xs"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => setSelectedLead(lead)}
                          className="bg-[#E3F0FA] text-[#0066B2] px-3 py-1.5 rounded-xl font-bold text-xs inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver Respostas</span>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Drawer / Modal de Detalhes do Lead */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-[#D7E4F0]">
            {/* Header do Drawer */}
            <div className="p-4 sm:p-5 border-b border-[#D7E4F0] flex items-center justify-between bg-[#FAFDFE]">
              <div>
                <h3 className="text-lg font-black text-[#04325C]">Detalhes do Lead</h3>
                <p className="text-xs text-[#5A7184]">
                  Submetido em {new Date(selectedLead.created).toLocaleString('pt-BR')}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="w-8 h-8 rounded-full bg-[#E3F0FA] text-[#04325C] hover:bg-[#D7E4F0] flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Corpo com Respostas */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
              {/* Card de Contato */}
              <div className="bg-[#F4F8FC] p-3.5 rounded-2xl border border-[#D7E4F0] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-[#04325C]">{selectedLead.nome}</span>
                  {getScoreBadge(selectedLead.score || 0)}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[#5A7184]">
                  <div>
                    <span className="font-bold text-[#04325C] block">WhatsApp:</span>
                    <a
                      href={`https://wa.me/55${selectedLead.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1FA971] font-bold hover:underline inline-flex items-center gap-1"
                    >
                      {selectedLead.whatsapp}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div>
                    <span className="font-bold text-[#04325C] block">E-mail:</span>
                    <span className="break-all">{selectedLead.email}</span>
                  </div>
                  <div>
                    <span className="font-bold text-[#04325C] block">Empresa:</span>
                    <span>{selectedLead.empresa || 'Não informada'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-[#04325C] block">CNPJ:</span>
                    <span>{selectedLead.cnpj || 'Não informado'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-[#04325C] block">Cidade/UF:</span>
                    <span>{selectedLead.cidade_uf}</span>
                  </div>
                  <div>
                    <span className="font-bold text-[#04325C] block">Origem:</span>
                    <span>{selectedLead.origem}</span>
                  </div>
                </div>
              </div>

              {/* Status do Atendimento */}
              <div className="space-y-1.5">
                <label className="block font-bold text-[#04325C]">
                  Alterar Status do Atendimento:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      'novo',
                      'em-atendimento',
                      'proposta-enviada',
                      'fechado',
                      'perdido',
                    ] as LeadStatus[]
                  ).map((st) => (
                    <button
                      key={st}
                      type="button"
                      disabled={statusUpdating}
                      onClick={() => handleUpdateStatus(selectedLead.id, st)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                        selectedLead.status === st
                          ? 'bg-[#0066B2] text-white shadow-xs'
                          : 'bg-[#E3F0FA] text-[#0066B2] hover:bg-[#BFE0F7]'
                      }`}
                    >
                      {st === 'novo'
                        ? 'Novo'
                        : st === 'em-atendimento'
                          ? 'Em atendimento'
                          : st === 'proposta-enviada'
                            ? 'Proposta enviada'
                            : st === 'fechado'
                              ? 'Fechado'
                              : 'Perdido'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Todas as respostas brutas */}
              <div className="space-y-2 pt-2 border-t border-[#D7E4F0]">
                <h4 className="font-bold text-[#04325C] text-sm">Respostas do Quiz</h4>
                <div className="bg-[#FAFDFE] rounded-xl p-3 border border-[#D7E4F0] space-y-1.5 text-[#10243A]">
                  {(() => {
                    const raw =
                      typeof selectedLead.respostas === 'string'
                        ? JSON.parse(selectedLead.respostas || '{}')
                        : selectedLead.respostas || {}

                    return Object.entries(raw).map(([k, v]) => (
                      <div
                        key={k}
                        className="flex justify-between py-1 border-b border-[#E3F0FA] last:border-0"
                      >
                        <span className="font-semibold text-[#5A7184] capitalize">
                          {k.replace(/_/g, ' ')}:
                        </span>
                        <span className="font-bold text-[#04325C] text-right">{String(v)}</span>
                      </div>
                    ))
                  })()}
                </div>
              </div>
            </div>

            {/* Footer do Drawer */}
            <div className="p-4 border-t border-[#D7E4F0] bg-[#FAFDFE] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 rounded-xl bg-[#E3F0FA] text-[#0066B2] font-bold hover:bg-[#D7E4F0] transition cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
