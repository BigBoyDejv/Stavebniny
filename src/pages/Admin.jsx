import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Edit, Trash2, Package, Truck, MessageSquare, LogOut } from 'lucide-react'

const Admin = () => {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState('products') // products, rentals, inquiries
  const [data, setData] = useState([])
  
  // Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    
    return () => subscription.unsubscribe()
  }, [])

  // Data fetching
  useEffect(() => {
    if (session) {
      fetchData()
    }
  }, [session, view])

  const fetchData = async () => {
    setLoading(true)
    const table = view === 'products' ? 'products' : view === 'rentals' ? 'rental_items' : 'inquiries'
    const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false })
    if (error) console.error(error)
    else setData(data)
    setLoading(false)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert('Chyba prihlásenia: ' + error.message)
    setLoading(false)
  }

  const handleLogout = () => supabase.auth.signOut()

  const handleDelete = async (id) => {
    if (!confirm('Naozaj chcete vymazať túto položku?')) return
    const table = view === 'products' ? 'products' : view === 'rentals' ? 'rental_items' : 'inquiries'
    const { error } = await supabase.from(table).delete().match({ id })
    if (error) alert(error.message)
    else fetchData()
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface pt-20">
        <div className="bg-white p-10 border border-outline-variant w-full max-w-md">
          <h1 className="text-3xl font-black mb-8">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase mb-2">Email</label>
              <input 
                className="w-full bg-surface-container-low border-none p-4" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-2">Heslo</label>
              <input 
                className="w-full bg-surface-container-low border-none p-4" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary text-on-primary py-4 font-bold uppercase tracking-widest"
            >
              {loading ? 'Pripájam...' : 'Prihlásiť sa'}
            </button>
          </form>
          <p className="mt-8 text-xs text-on-surface-variant">
            Poznámka: Účet si musíte vytvoriť v Supabase Dashboarde.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex pt-20 min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-surface-container flex flex-col fixed h-screen">
        <div className="p-8">
          <span className="text-xl font-bold tracking-tighter">Admin Panel</span>
          <p className="text-[0.65rem] tracking-widest uppercase text-[#546200] mt-1">Stavebniny v1.0</p>
        </div>
        <nav className="flex-1 space-y-1">
          <button 
            onClick={() => setView('products')}
            className={`w-full flex items-center gap-4 px-6 py-3 transition-all ${view === 'products' ? 'bg-primary text-on-primary font-bold' : 'text-outline hover:bg-surface-container-low'}`}
          >
            <Package size={20} />
            <span className="font-headline text-sm">Inventár</span>
          </button>
          <button 
            onClick={() => setView('rentals')}
            className={`w-full flex items-center gap-4 px-6 py-3 transition-all ${view === 'rentals' ? 'bg-primary text-on-primary font-bold' : 'text-outline hover:bg-surface-container-low'}`}
          >
            <Truck size={20} />
            <span className="font-headline text-sm">Požičovňa</span>
          </button>
          <button 
            onClick={() => setView('inquiries')}
            className={`w-full flex items-center gap-4 px-6 py-3 transition-all ${view === 'inquiries' ? 'bg-primary text-on-primary font-bold' : 'text-outline hover:bg-surface-container-low'}`}
          >
            <MessageSquare size={20} />
            <span className="font-headline text-sm">Dopyty</span>
          </button>
        </nav>
        <div className="p-8 border-t border-outline/10">
          <button onClick={handleLogout} className="flex items-center gap-2 text-error font-bold uppercase text-[10px] tracking-widest">
            <LogOut size={14} /> Odhlásiť sa
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-12 bg-surface">
        <header className="flex justify-between items-end mb-12">
          <div>
            <p className="text-xs font-bold text-[#546200] uppercase tracking-widest mb-2">Správa systému</p>
            <h1 className="text-4xl font-black tracking-tight font-headline">
              {view === 'products' ? 'Produkty' : view === 'rentals' ? 'Stroje' : 'Dopyty'}
            </h1>
          </div>
          {view !== 'inquiries' && (
            <button className="bg-primary text-on-primary px-8 py-4 font-bold uppercase tracking-widest text-sm flex items-center gap-2">
              <Plus size={18} /> Pridať novú položku
            </button>
          )}
        </header>

        <div className="bg-white border border-outline/10 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low">
              <tr className="border-b border-outline/10">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-outline">ID / Dátum</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-outline">Názov / Meno</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-outline">Informácie</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-outline">Akcie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {loading ? (
                <tr><td colSpan="4" className="p-10 text-center">Načítavam dáta...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan="4" className="p-10 text-center text-on-surface-variant">Žiadne dáta na zobrazenie.</td></tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-5 text-[10px] font-mono text-outline">
                      {item.id.slice(0, 8)}...<br/>
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-bold">{item.name}</span>
                    </td>
                    <td className="px-6 py-5 text-sm">
                      {view === 'products' ? `${item.price} €` : view === 'rentals' ? `${item.daily_price} €/d` : item.email}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex gap-2">
                        <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-error/10 text-error transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}

export default Admin
