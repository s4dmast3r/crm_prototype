import { useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowRight, Building2, LockKeyhole, Mail } from 'lucide-react'
import { demoUsers } from '../data/demoData'

export function LoginPage({ onLogin }: { onLogin: (email: string, password: string) => boolean }) {
  const [email, setEmail] = useState('admin@ipsdemo.com')
  const [password, setPassword] = useState('123456')
  const [error, setError] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const ok = onLogin(email, password)
    setError(ok ? '' : 'Credenciales demo no validas.')
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <section className="flex flex-col justify-between bg-[linear-gradient(140deg,#0f766e_0%,#0f172a_55%,#14532d_100%)] p-8 md:p-12">
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-xl bg-white/12 ring-1 ring-white/25">
              <Building2 />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-100">alphaMediSAS</p>
              <h1 className="text-2xl font-bold">MVP Comercial IPS</h1>
            </div>
          </div>

          <div className="max-w-2xl py-16">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-200">Demo empresarial</p>
            <h2 className="mt-5 text-4xl font-black leading-tight md:text-6xl">
              CRM centralizado para captar, priorizar y seguir oportunidades.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-200">
              Una primera version enfocada en el proceso comercial de la IPS, con agente IA mock,
              datos demo y base lista para crecer hacia nomina, documentos, facturacion y dashboard gerencial.
            </p>
          </div>

          <div className="grid gap-3 text-sm text-slate-200 sm:grid-cols-3">
            <div className="rounded-lg bg-white/10 p-4 ring-1 ring-white/15">CRM comercial</div>
            <div className="rounded-lg bg-white/10 p-4 ring-1 ring-white/15">IA demostrativa</div>
            <div className="rounded-lg bg-white/10 p-4 ring-1 ring-white/15">Persistencia local</div>
          </div>
        </section>

        <section className="flex items-center justify-center bg-slate-50 p-6 text-slate-950">
          <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-7 shadow-xl">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">Ingreso demo</p>
              <h3 className="mt-2 text-2xl font-bold">Entrar al sistema</h3>
            </div>

            <label className="mt-8 block">
              <span className="text-sm font-semibold text-slate-700">Correo</span>
              <span className="mt-2 flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-3">
                <Mail size={18} className="text-slate-400" />
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full outline-none"
                  type="email"
                />
              </span>
            </label>

            <label className="mt-4 block">
              <span className="text-sm font-semibold text-slate-700">Contrasena</span>
              <span className="mt-2 flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-3">
                <LockKeyhole size={18} className="text-slate-400" />
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full outline-none"
                  type="password"
                />
              </span>
            </label>

            {error && <p className="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>}

            <button type="submit" className="btn btn-primary mt-6 w-full justify-center">
              Entrar al MVP
              <ArrowRight size={17} />
            </button>

            <div className="mt-6 rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-700">Usuarios demo</p>
              <div className="mt-3 space-y-2 text-xs text-slate-600">
                {demoUsers.map((user) => (
                  <button
                    key={user.email}
                    type="button"
                    onClick={() => {
                      setEmail(user.email)
                      setPassword(user.password)
                    }}
                    className="block w-full rounded-md bg-white px-3 py-2 text-left ring-1 ring-slate-200 hover:ring-teal-300"
                  >
                    {user.email} / {user.password}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </section>
      </div>
    </main>
  )
}
