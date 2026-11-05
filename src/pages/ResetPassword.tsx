import React, { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { PortoSaudeLogo } from '@/components/BrandLogos'
import { Lock, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const { confirmPasswordReset } = useAuth()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (password.length < 8) {
      setErrorMsg('A nova senha deve ter no mínimo 8 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMsg('As senhas digitadas não coincidem.')
      return
    }

    if (!token) {
      setErrorMsg('Token de recuperação inválido ou ausente no link.')
      return
    }

    setLoading(true)
    const res = await confirmPasswordReset(token, password)
    setLoading(false)

    if (res.error) {
      setErrorMsg('Não foi possível redefinir a senha. O token pode ter expirado.')
    } else {
      setSuccess(true)
      setTimeout(() => {
        navigate('/login')
      }, 2500)
    }
  }

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-[#D7E4F0] shadow-[0_12px_36px_rgba(4,50,92,0.08)]">
        <div className="text-center space-y-2 mb-6">
          <div className="flex justify-center mb-1">
            <PortoSaudeLogo className="h-12 w-auto" />
          </div>
          <h1 className="text-2xl font-black text-[#04325C]">Redefinir Senha</h1>
          <p className="text-xs text-[#5A7184]">Crie uma nova senha de no mínimo 8 caracteres</p>
        </div>

        {success ? (
          <div className="text-center space-y-3 py-4 animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-[#E3F0FA] text-[#1FA971] mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <p className="text-sm font-bold text-[#04325C]">Senha redefinida com sucesso!</p>
            <p className="text-xs text-[#5A7184]">Redirecionando para a página de login...</p>
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
              <label className="block text-xs font-bold text-[#04325C] mb-1">Nova senha</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#5A7184] absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-[#D7E4F0] text-sm text-[#04325C] focus:outline-none focus:border-[#0066B2] focus:ring-2 focus:ring-[#0066B2]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#04325C] mb-1">
                Confirmar nova senha
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#5A7184] absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
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
                  <span>Redefinir senha</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <Link
                to="/login"
                className="text-xs text-[#5A7184] hover:text-[#0066B2] font-semibold"
              >
                Cancelar e voltar ao login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
