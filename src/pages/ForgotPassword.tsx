import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { PortoSailLogo } from '@/components/PortoSailLogo'
import { Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react'

export default function ForgotPassword() {
  const { requestPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)

    const res = await requestPasswordReset(email.trim())
    setLoading(false)

    if (res.error) {
      setErrorMsg('Não foi possível enviar o e-mail de recuperação. Tente novamente.')
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-[#D7E4F0] shadow-[0_12px_36px_rgba(4,50,92,0.08)]">
        <div className="text-center space-y-2 mb-6">
          <div className="flex justify-center mb-1">
            <PortoSailLogo size={48} variant="badge" />
          </div>
          <h1 className="text-2xl font-black text-[#04325C]">Recuperar Senha</h1>
          <p className="text-xs text-[#5A7184]">
            Enviaremos um link de redefinição para o seu e-mail cadastrado
          </p>
        </div>

        {sent ? (
          <div className="text-center space-y-4 animate-fade-in py-2">
            <div className="w-12 h-12 rounded-full bg-[#E3F0FA] text-[#0066B2] mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-[#1FA971]" />
            </div>
            <p className="text-sm text-[#04325C] font-semibold">
              Enviamos um link de recuperação para seu e-mail!
            </p>
            <p className="text-xs text-[#5A7184]">
              Verifique sua caixa de entrada e spam ({email}).
            </p>
            <Link
              to="/login"
              className="inline-block mt-4 text-xs font-bold text-[#0066B2] hover:underline"
            >
              ← Voltar para o Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#04325C] mb-1">
                E-mail cadastrado
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

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#0066B2] hover:bg-[#04325C] disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-[0_4px_14px_rgba(0,102,178,0.22)] flex items-center justify-center gap-2 transition cursor-pointer"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Enviar link de recuperação</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <Link
                to="/login"
                className="text-xs text-[#5A7184] hover:text-[#0066B2] font-semibold"
              >
                Lembrou a senha? Fazer login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
