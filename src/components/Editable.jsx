import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { Edit2, Check, X, Loader2, Upload } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import { supabase } from '../lib/supabase'
import { toast } from 'react-hot-toast'
import { compressImage } from '../lib/utils'

export const Editable = ({ 
  settingKey, 
  value, 
  type = 'text', 
  label, 
  children,
  className = "",
  as: Component = 'div'
}) => {
  const { isAdmin } = useAuth()
  const { updateSettingState } = useSettings()
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value || '')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  if (!isAdmin) {
    return <Component className={className}>{children}</Component>
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ key: settingKey, value: editValue })
      
      if (error) throw error
      
      toast.success(`${label || 'Nastavenie'} úspešne upravené!`, {
        style: {
          background: '#2d2f2b',
          color: '#DFFF00',
          borderRadius: '0',
          fontWeight: 'bold',
        }
      })
      updateSettingState(settingKey, editValue)
      setIsEditing(false)
    } catch (err) {
      toast.error('Chyba pri ukladaní: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e) => {
    const rawFile = e.target.files?.[0]
    if (!rawFile) return
    setUploading(true)
    const toastId = toast.loading('Komprimujem a nahrávam fotku...', {
      style: {
        background: '#2d2f2b',
        color: '#DFFF00',
        borderRadius: '0',
        fontWeight: 'bold',
      }
    })
    try {
      const file = await compressImage(rawFile, { maxWidth: 1200, maxHeight: 1200, quality: 0.75 })
      const fileName = `settings_${settingKey}_${Math.random().toString(36).substring(2, 10)}.webp`
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, { cacheControl: '3600', upsert: true })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName)

      setEditValue(publicUrl)
      toast.success('Fotka úspešne nahratá a skomprimovaná!', { id: toastId })
    } catch (err) {
      toast.error('Chyba nahrávania: ' + err.message, { id: toastId })
    } finally {
      setUploading(false)
    }
  }

  return (
    <Component className={`relative group/editable border border-dashed border-transparent hover:border-primary/50 p-1 transition-all duration-300 ${className}`}>
      {/* Pencil edit trigger button */}
      <button
        onClick={() => {
          setEditValue(value || '')
          setIsEditing(true)
        }}
        className="absolute top-2 right-2 z-20 bg-primary text-on-primary hover:bg-[#daf900] hover:scale-110 p-2 rounded-full shadow-xl opacity-0 group-hover/editable:opacity-100 transition-all duration-300"
        title={`Upraviť ${label || ''}`}
      >
        <Edit2 size={14} className="stroke-[2.5]" />
      </button>

      {children}

      {isEditing && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-on-surface">
          <div className="bg-white p-8 border border-outline/10 w-full max-w-md space-y-6 shadow-2xl relative">
            <button 
              onClick={() => setIsEditing(false)} 
              className="absolute top-4 right-4 text-outline hover:text-on-surface transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="border-b border-outline/10 pb-4">
              <h3 className="font-black tracking-tight text-xl uppercase text-[#2d2f2b]">Upraviť: {label}</h3>
              <p className="text-[9px] uppercase tracking-wider text-outline font-bold mt-1">Kľúč: {settingKey}</p>
            </div>
            
            <div className="space-y-4">
              {type === 'text' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-outline">Hodnota</label>
                  <input
                    type="text"
                    className="w-full bg-surface p-4 outline-none border-b-2 border-transparent focus:border-primary text-sm font-bold text-[#2d2f2b]"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    required
                  />
                </div>
              )}
              {type === 'textarea' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-outline">Obsah</label>
                  <textarea
                    className="w-full bg-surface p-4 outline-none border-none focus:ring-1 focus:ring-primary text-sm font-medium min-h-[120px] resize-none text-[#2d2f2b]"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    required
                  />
                </div>
              )}
              {type === 'image' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-outline">URL adresa fotky</label>
                    <input
                      type="text"
                      className="w-full bg-surface p-4 outline-none border-b-2 border-transparent focus:border-primary text-xs font-mono text-outline"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-surface p-4 border border-outline/5">
                    {editValue ? (
                      <img src={editValue} alt="Náhľad" className="w-20 h-20 object-cover border border-outline/10 bg-white" />
                    ) : (
                      <div className="w-20 h-20 bg-white border border-dashed border-outline/25 flex items-center justify-center text-outline/50 text-xs">Bez obrázka</div>
                    )}
                    <label className="flex-1 w-full bg-white border-2 border-dashed border-outline/20 hover:border-primary/50 hover:bg-primary/5 transition-all p-4 text-center cursor-pointer flex flex-col items-center justify-center gap-1.5">
                      {uploading ? (
                        <>
                          <Loader2 size={16} className="animate-spin text-primary" />
                          <span className="text-[9px] font-bold uppercase text-outline">Nahrávam...</span>
                        </>
                      ) : (
                        <>
                          <Upload size={16} className="text-outline" />
                          <span className="text-[9px] font-bold uppercase text-on-surface">Nahrať nový obrázok</span>
                        </>
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={loading || uploading}
                className="flex-1 bg-primary text-on-primary py-4 font-black uppercase tracking-widest text-xs hover:bg-[#daf900] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} ULOŽIŤ
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 bg-[#f7f7f0] border border-outline/15 text-[#2d2f2b] py-4 font-black uppercase tracking-widest text-xs hover:bg-[#e8e9e1] transition-colors"
              >
                ZRUŠIŤ
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </Component>
  )
}
