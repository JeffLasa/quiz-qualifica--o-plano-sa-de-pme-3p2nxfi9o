import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { PortoSailLogo } from '@/components/PortoSailLogo'
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)

    const res = await signIn(email.trim(), password)
    setLoading(false)

    if (res.error) {
      setErrorMsg('E-mail ou senha incorretos. Verifique suas credenciais.')
    } else {
      navigate('/leads')
    }
  }

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-[#D7E4F0] shadow-[0_12px_36px_rgba(4,50,92,0.08)]">
        {/* Logo e cabeçalho */}
        <div className="text-center space-y-2 mb-6">
          <div className="flex justify-center mb-1">
            <PortoSailLogo size={52} variant="badge" />
          </div>
          <h1 className="text-2xl font-black text-[#04325C]">Acesso do Corretor</h1>
          <p className="text-xs text-[#5A7184]">Painel de Leads e Gestão PME · Lasacor Corretora</p>
        </div>

        {errorMsg && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#04325C] mb-1">
              E-mail corporativo
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#5A7184] absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jeff.lasa8@gmail.com"
                className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-[#D7E4F0] text-sm text-[#04325C] focus:outline-none focus:border-[#0066B2] focus:ring-2 focus:ring-[#0066B2]/20"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-[#04325C]">Senha</label>
              <Link
                to="/forgot-password"
                className="text-xs text-[#0066B2] hover:underline font-semibold"
              >
                Esqueci minha senha
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#5A7184] absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-[#D7E4F0] text-sm text-[#04325C] focus:outline-none focus:border-[#0066B2] focus:ring-2 focus:ring-[#0066B2]/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-[#0066B2] hover:bg-[#04325C] disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-[0_4px_14px_rgba(0,102,178,0.22)] flex items-center justify-center gap-2 transition cursor-pointer mt-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Entrar no Painel</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#D7E4F0] text-center">
          <Link to="/" className="text-xs text-[#5A7184] hover:text-[#0066B2] font-semibold">
            ← Voltar para o Quiz de Cotação
          </Link>
        </div>
      </div>
    </div>
  )
}
