import { useMemo, useState } from 'react'
import { Activity, BarChart3, Bot, FileText, Megaphone, RefreshCcw, Trash2, Users } from 'lucide-react'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { ProspectsPage } from './pages/ProspectsPage'
import { CampaignsPage } from './pages/CampaignsPage'
import { ContentGeneratorPage } from './pages/ContentGeneratorPage'
import { RoadmapPage } from './pages/RoadmapPage'
import { demoUsers } from './data/demoData'
import {
  clearAllData,
  clearCurrentUser,
  getAppData,
  getCurrentUser,
  initializeDemoData,
  restoreDemoData,
  saveCampaigns,
  saveInteractions,
  saveProspects,
  setCurrentUser,
} from './services/storageService'
import type { Campaign, DemoUser, Interaction, Prospect, ViewKey } from './types'
import './index.css'

const navigation = [
  { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { key: 'prospects', label: 'CRM Prospectos', icon: Users },
  { key: 'campaigns', label: 'Campanas', icon: Megaphone },
  { key: 'content', label: 'Contenido IA', icon: Bot },
  { key: 'roadmap', label: 'Sistema centralizado', icon: FileText },
] satisfies Array<{ key: ViewKey; label: string; icon: typeof BarChart3 }>

function App() {
  const [initialData] = useState(() => {
    initializeDemoData()
    return getAppData()
  })
  const [currentUser, setUser] = useState<DemoUser | null>(() => {
    const storedEmail = getCurrentUser()
    return demoUsers.find((user) => user.email === storedEmail) ?? null
  })
  const [activeView, setActiveView] = useState<ViewKey>('dashboard')
  const [prospects, setProspects] = useState<Prospect[]>(initialData.prospects)
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialData.campaigns)
  const [interactions, setInteractions] = useState<Interaction[]>(initialData.interactions)

  const dataActions = useMemo(
    () => ({
      updateProspects(next: Prospect[]) {
        setProspects(next)
        saveProspects(next)
      },
      updateCampaigns(next: Campaign[]) {
        setCampaigns(next)
        saveCampaigns(next)
      },
      updateInteractions(next: Interaction[]) {
        setInteractions(next)
        saveInteractions(next)
      },
      restore() {
        restoreDemoData()
        const data = getAppData()
        setProspects(data.prospects)
        setCampaigns(data.campaigns)
        setInteractions(data.interactions)
      },
      clear() {
        clearAllData()
        setProspects([])
        setCampaigns([])
        setInteractions([])
      },
    }),
    [],
  )

  function handleLogin(email: string, password: string) {
    const user = demoUsers.find((item) => item.email === email && item.password === password)
    if (!user) return false
    setCurrentUser(user.email)
    setUser(user)
    return true
  }

  function handleLogout() {
    clearCurrentUser()
    setUser(null)
    setActiveView('dashboard')
  }

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-slate-200 bg-white lg:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-slate-200 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-xl bg-teal-600 text-white shadow-sm">
                <Activity size={23} />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">IPS Demo</p>
                <h1 className="text-lg font-bold">alphaMedi CRM</h1>
              </div>
            </div>
          </div>
          <nav className="flex-1 space-y-1 px-4 py-5">
            {navigation.map((item) => {
              const Icon = item.icon
              const selected = activeView === item.key
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveView(item.key)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-semibold transition ${
                    selected ? 'bg-teal-50 text-teal-800 ring-1 ring-teal-100' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              )
            })}
          </nav>
          <div className="border-t border-slate-200 p-4">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-bold">{currentUser.name}</p>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{currentUser.role}</p>
              <button type="button" onClick={handleLogout} className="mt-3 text-sm font-semibold text-teal-700">
                Cerrar sesion
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">Sistema comercial IPS</p>
              <h2 className="text-2xl font-bold">Centro de control comercial</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={dataActions.restore} className="btn btn-secondary">
                <RefreshCcw size={16} />
                Restaurar datos demo
              </button>
              {currentUser.role === 'admin' && (
                <button type="button" onClick={dataActions.clear} className="btn btn-danger">
                  <Trash2 size={16} />
                  Limpiar datos
                </button>
              )}
            </div>
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto lg:hidden">
            {navigation.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveView(item.key)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
                  activeView === item.key ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </header>

        <section className="px-4 py-6 md:px-8">
          {activeView === 'dashboard' && (
            <DashboardPage prospects={prospects} campaigns={campaigns} interactions={interactions} />
          )}
          {activeView === 'prospects' && (
            <ProspectsPage
              prospects={prospects}
              campaigns={campaigns}
              interactions={interactions}
              onChangeProspects={dataActions.updateProspects}
              onChangeInteractions={dataActions.updateInteractions}
            />
          )}
          {activeView === 'campaigns' && (
            <CampaignsPage campaigns={campaigns} onChangeCampaigns={dataActions.updateCampaigns} />
          )}
          {activeView === 'content' && <ContentGeneratorPage />}
          {activeView === 'roadmap' && <RoadmapPage />}
        </section>
      </main>
    </div>
  )
}

export default App
