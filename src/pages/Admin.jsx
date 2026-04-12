import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { 
  Plus, Edit, Trash2, Package, Truck, MessageSquare, 
  LogOut, LayoutDashboard, Settings, Search, Filter, 
  ChevronRight, AlertCircle, CheckCircle2, X
} from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs) {
  return twMerge(clsx(inputs))
}

const Admin = () => {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState('dashboard') // dashboard, products, orders, inquiries
  const [data, setData] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState({ products: 0, orders: 0, inquiries: 0, stock: 0 })
  
  // Form State for Products
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    sku: '',
    stock_quantity: 0,
    category: '',
    image_url: ''
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session) {
       fetchData()
       if (view === 'dashboard') fetchStats()
    }
  }, [session, view])

  const fetchStats = async () => {
    const { count: p } = await supabase.from('products').select('*', { count: 'exact', head: true })
    const { count: o } = await supabase.from('orders').select('*', { count: 'exact', head: true })
    const { count: i } = await supabase.from('inquiries').select('*', { count: 'exact', head: true })
    const { data: s } = await supabase.from('products').select('id').lt('stock_quantity', 5)
    setStats({ products: p || 0, orders: o || 0, inquiries: i || 0, stock: s?.length || 0 })
  }

  const fetchData = async () => {
    setLoading(true)
    let query;
    if (view === 'dashboard') {
      // Fetch stats summary (just counts for now)
      setLoading(false)
      return
    }
    
    const table = view === 'products' ? 'products' : view === 'orders' ? 'orders' : 'inquiries'
    query = supabase.from(table).select('*').order('created_at', { ascending: false })
    
    const { data, error } = await query
    if (error) console.error(error)
    else setData(data || [])
    setLoading(false)
  }

  const handleSaveProduct = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingItem) {
        const { error } = await supabase.from('products').update(formData).match({ id: editingItem.id })
        if (error) throw error
      } else {
        const { error } = await supabase.from('products').insert([formData])
        if (error) throw error
      }
      setShowModal(false)
      fetchData()
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Naozaj vymazať?')) return
    const table = view === 'products' ? 'products' : view === 'orders' ? 'orders' : 'inquiries'
    await supabase.from(table).delete().match({ id })
    fetchData()
  }

  if (!session) return <LoginComponent setSession={setSession} />

  return (
    <div className="flex pt-20 min-h-screen bg-[#f7f7f0]">
      {/* Sidebar navigation */}
      <aside className="w-64 bg-white border-r border-outline/10 fixed h-screen overflow-y-auto">
        <div className="p-8">
          <span className="text-xl font-black tracking-tighter">STAVEBNINY PRO</span>
          <p className="text-[10px] uppercase tracking-widest text-[#546200] font-bold mt-1">Admin v2.0</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <NavItem icon={<LayoutDashboard size={18}/>} label="Dashboard" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
          <NavItem icon={<Package size={18}/>} label="Produkty & Sklad" active={view === 'products'} onClick={() => setView('products')} />
          <NavItem icon={<Truck size={18}/>} label="Objednávky" active={view === 'orders'} onClick={() => setView('orders')} />
          <NavItem icon={<MessageSquare size={18}/>} label="Zákaznícke dopyty" active={view === 'inquiries'} onClick={() => setView('inquiries')} />
          <div className="pt-8 pb-4 px-4 text-[10px] font-bold uppercase text-outline tracking-wider">Nastavenia</div>
          <NavItem icon={<Settings size={18}/>} label="Systém" active={view === 'settings'} onClick={() => setView('settings')} />
        </nav>

        <div className="p-8 mt-auto border-t border-outline/10">
          <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-2 text-error text-[10px] font-black uppercase tracking-widest">
            <LogOut size={14} /> Odhlásiť sa
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 ml-64 p-12">
        <header className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tight capitalize">
              {view === 'products' ? 'Správa Inventára' : view === 'orders' ? 'Objednávky' : view === 'dashboard' ? 'Prehľad' : view}
            </h1>
          </div>
          {view === 'products' && (
            <button 
              onClick={() => { setEditingItem(null); setFormData({name:'', description:'', price:0, sku:'', stock_quantity:0, category:'', image_url:''}); setShowModal(true); }}
              className="bg-primary text-on-primary px-6 py-3 font-bold uppercase text-xs flex items-center gap-2 hover:bg-[#daf900] transition-colors"
            >
              <Plus size={16} /> Pridať produkt
            </button>
          )}
        </header>

        {view === 'dashboard' && <DashboardStats stats={stats} />}
        
        {view !== 'dashboard' && (
          <div className="bg-white border border-outline/10 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-outline/10 flex gap-4">
               <div className="relative flex-1">
                 <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                 <input 
                   placeholder="Hľadať..." 
                   className="pl-10 pr-4 py-2 bg-surface text-sm w-full border-none focus:ring-1 focus:ring-primary"
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                 />
               </div>
               <button className="flex items-center gap-2 px-4 py-2 border border-outline/20 text-xs font-bold uppercase"><Filter size={14}/> Filtre</button>
            </div>
            
            <table className="w-full text-left">
              <thead className="bg-[#f0eded]">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-outline">Položka</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-outline">Status / Detaily</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-outline">Hodnota / Sklad</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-outline text-right">Akcie</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/5">
                {loading ? (
                  <tr><td colSpan={4} className="p-20 text-center font-bold text-outline animate-pulse">NAČÍTAVAM...</td></tr>
                ) : data.filter(item => (item.name || item.id).toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
                  <tr key={item.id} className="hover:bg-surface transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        {item.image_url && <img src={item.image_url} className="w-10 h-10 object-cover bg-surface" />}
                        <div>
                          <p className="font-bold text-sm">{item.name || item.id.slice(0,8)}</p>
                          <p className="text-[10px] text-outline font-mono uppercase">{item.sku || 'No SKU'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {view === 'products' ? (
                        <span className="text-[10px] bg-surface-container px-2 py-1 uppercase font-bold text-outline">{item.category || 'Materiál'}</span>
                      ) : (
                        <span className="text-[10px] bg-primary/20 text-[#546200] px-2 py-1 uppercase font-bold">{item.status || 'Doručené'}</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <span className="font-black text-sm">{item.price || item.total_price || 0} €</span>
                        {item.stock_quantity !== undefined && (
                          <span className={cn(
                            "text-[10px] font-bold px-2 py-0.5 uppercase",
                            item.stock_quantity < 5 ? "bg-error/10 text-error" : "bg-emerald-100 text-emerald-700"
                          )}>
                             {item.stock_quantity} ks
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => { setEditingItem(item); setFormData(item); setShowModal(true); }}
                          className="p-2 hover:bg-primary/20 text-on-surface transition-colors"
                        ><Edit size={16}/></button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 hover:bg-error/10 text-error transition-colors"
                        ><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Product Modal */}
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl p-10 shadow-2xl relative">
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-6 right-6 text-outline hover:text-on-surface transition-colors"
              ><X size={24}/></button>
              
              <h2 className="text-3xl font-black tracking-tight mb-8">
                {editingItem ? 'Upraviť produkt' : 'Nový produkt'}
              </h2>
              
              <form onSubmit={handleSaveProduct} className="grid grid-cols-2 gap-6">
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold uppercase text-outline">Názov produktu</label>
                  <input 
                    className="w-full bg-surface p-4 border-none focus:ring-1 focus:ring-primary"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-outline">SKU Kód</label>
                  <input 
                    className="w-full bg-surface p-4 border-none focus:ring-1 focus:ring-primary"
                    value={formData.sku}
                    onChange={e => setFormData({...formData, sku: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-outline">Kategória</label>
                  <input 
                    className="w-full bg-surface p-4 border-none focus:ring-1 focus:ring-primary"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-outline">Cena (€)</label>
                  <input 
                    type="number" step="0.01"
                    className="w-full bg-surface p-4 border-none focus:ring-1 focus:ring-primary"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-outline">Množstvo na sklade</label>
                  <input 
                    type="number"
                    className="w-full bg-surface p-4 border-none focus:ring-1 focus:ring-primary"
                    value={formData.stock_quantity}
                    onChange={e => setFormData({...formData, stock_quantity: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold uppercase text-outline">URL obrázka</label>
                  <input 
                    className="w-full bg-surface p-4 border-none focus:ring-1 focus:ring-primary"
                    value={formData.image_url}
                    onChange={e => setFormData({...formData, image_url: e.target.value})}
                  />
                </div>
                <div className="col-span-2 pt-4">
                  <button 
                    disabled={loading}
                    className="w-full bg-primary text-on-primary py-4 font-black uppercase tracking-widest hover:bg-[#daf900] disabled:opacity-50"
                  >
                    {loading ? 'UKLADÁM...' : 'ULOŽIŤ PRODUKT'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

const NavItem = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-4 px-4 py-3 transition-all",
      active ? "bg-primary font-bold text-on-primary" : "text-outline hover:bg-surface-container-low"
    )}
  >
    {icon}
    <span className="text-sm font-headline">{label}</span>
    {active && <ChevronRight size={14} className="ml-auto" />}
  </button>
)

const DashboardStats = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
    <StatCard label="Produkty Celkom" value={stats.products} />
    <StatCard label="Nové Objednávky" value={stats.orders} highlight />
    <StatCard label="Nízky Stav Skladu" value={stats.stock} danger />
    <StatCard label="Zákaznícke Dopyty" value={stats.inquiries} />
  </div>
)

const StatCard = ({ label, value, change, highlight, danger }) => (
  <div className={cn(
    "p-6 bg-white border-l-4 shadow-sm",
    highlight ? "border-primary" : danger ? "border-error" : "border-outline/20"
  )}>
    <p className="text-[10px] uppercase font-black tracking-widest text-outline mb-1">{label}</p>
    <div className="flex items-baseline gap-2">
      <p className="text-2xl font-black">{value}</p>
      {change && <span className="text-[10px] font-bold text-emerald-600">{change}</span>}
    </div>
  </div>
)

const LoginComponent = ({ setSession }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert(error.message)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface pt-20">
      <div className="bg-white p-12 border border-outline/10 shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-black mb-10 tracking-tighter">ADMIN PRÍSTUP</h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
             <label className="text-xs uppercase font-bold text-outline">Pracovný Email</label>
             <input className="w-full bg-surface p-4 border-none focus:ring-1 focus:ring-primary" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
             <label className="text-xs uppercase font-bold text-outline">Heslo</label>
             <input className="w-full bg-surface p-4 border-none focus:ring-1 focus:ring-primary" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button className="w-full bg-primary text-on-primary py-4 font-black uppercase tracking-widest mt-4">Prihlásiť sa</button>
        </form>
      </div>
    </div>
  )
}

export default Admin
