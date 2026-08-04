import axios from 'axios'
import { supabase } from './supabase'

const API_BASE = '/api'

axios.defaults.withCredentials = true

const isJsonData = (data) => data && typeof data === 'object'

export const api = {
  // Autentifikácia
  auth: {
    getSession: async () => {
      try {
        const res = await axios.get(`${API_BASE}/auth.php?action=session`)
        if (isJsonData(res?.data)) return res.data
      } catch (e) {
        return null
      }
      return null
    },
    login: async (email, password) => {
      const res = await axios.post(`${API_BASE}/auth.php?action=login`, { email, password })
      if (isJsonData(res?.data)) return res.data
      throw new Error('PHP API unavailable')
    },
    logout: async () => {
      try {
        const res = await axios.post(`${API_BASE}/auth.php?action=logout`)
        if (isJsonData(res?.data)) return res.data
      } catch (e) {
        return { success: true }
      }
      return { success: true }
    }
  },

  // Produkty
  products: {
    getAll: async (params = {}) => {
      try {
        const query = new URLSearchParams(params).toString()
        const res = await axios.get(`${API_BASE}/products.php?${query}`)
        if (isJsonData(res?.data)) return res.data
      } catch (e) {
        console.warn('PHP API products.getAll failed, using Supabase fallback:', e.message)
      }
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    },
    create: async (productData) => {
      try {
        const res = await axios.post(`${API_BASE}/products.php`, productData)
        if (isJsonData(res?.data)) return res.data
      } catch (e) {
        console.warn('PHP API products.create failed, using Supabase fallback:', e.message)
      }
      const cleanData = { ...productData }
      delete cleanData.id
      const { data, error } = await supabase.from('products').insert([cleanData]).select()
      if (error) throw error
      return data ? data[0] : null
    },
    update: async (productData) => {
      try {
        const res = await axios.put(`${API_BASE}/products.php`, productData)
        if (isJsonData(res?.data)) return res.data
      } catch (e) {
        console.warn('PHP API products.update failed, using Supabase fallback:', e.message)
      }
      const { data, error } = await supabase.from('products').update(productData).eq('id', productData.id).select()
      if (error) throw error
      return data ? data[0] : null
    },
    delete: async (id) => {
      try {
        const res = await axios.delete(`${API_BASE}/products.php?id=${id}`)
        if (isJsonData(res?.data)) return res.data
      } catch (e) {
        console.warn('PHP API products.delete failed, using Supabase fallback:', e.message)
      }
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) throw error
      return { success: true }
    }
  },

  // Kategórie
  categories: {
    getAll: async (type) => {
      try {
        const query = type ? `?type=${type}` : ''
        const res = await axios.get(`${API_BASE}/categories.php${query}`)
        if (isJsonData(res?.data)) return res.data
      } catch (e) {
        console.warn('PHP API categories.getAll failed, using Supabase fallback:', e.message)
      }
      let query = supabase.from('categories').select('*').order('name', { ascending: true })
      if (type) query = query.eq('type', type)
      const { data, error } = await query
      if (error) throw error
      return data || []
    },
    create: async (categoryData) => {
      try {
        const res = await axios.post(`${API_BASE}/categories.php`, categoryData)
        if (isJsonData(res?.data)) return res.data
      } catch (e) {
        console.warn('PHP API categories.create failed, using Supabase fallback:', e.message)
      }
      const { data, error } = await supabase.from('categories').insert([categoryData]).select()
      if (error) throw error
      return data ? data[0] : null
    },
    delete: async (id) => {
      try {
        const res = await axios.delete(`${API_BASE}/categories.php?id=${id}`)
        if (isJsonData(res?.data)) return res.data
      } catch (e) {
        console.warn('PHP API categories.delete failed, using Supabase fallback:', e.message)
      }
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) throw error
      return { success: true }
    }
  },

  // Objednávky
  orders: {
    getAll: async () => {
      try {
        const res = await axios.get(`${API_BASE}/orders.php`)
        if (isJsonData(res?.data)) return res.data
      } catch (e) {
        console.warn('PHP API orders.getAll failed, using Supabase fallback:', e.message)
      }
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    },
    create: async (orderData) => {
      try {
        const res = await axios.post(`${API_BASE}/orders.php`, orderData)
        if (isJsonData(res?.data)) return res.data
      } catch (e) {
        console.warn('PHP API orders.create failed, using Supabase fallback:', e.message)
      }
      const { data, error } = await supabase.from('orders').insert([orderData]).select()
      if (error) throw error
      return data ? data[0] : null
    },
    updateStatus: async (id, status) => {
      try {
        const res = await axios.put(`${API_BASE}/orders.php`, { id, status })
        if (isJsonData(res?.data)) return res.data
      } catch (e) {
        console.warn('PHP API orders.updateStatus failed, using Supabase fallback:', e.message)
      }
      const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select()
      if (error) throw error
      return data ? data[0] : null
    }
  },

  // Dopyty / Kontakt
  inquiries: {
    getAll: async () => {
      try {
        const res = await axios.get(`${API_BASE}/inquiries.php`)
        if (isJsonData(res?.data)) return res.data
      } catch (e) {
        console.warn('PHP API inquiries.getAll failed, using Supabase fallback:', e.message)
      }
      const { data, error } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    },
    create: async (inquiryData) => {
      try {
        const res = await axios.post(`${API_BASE}/inquiries.php`, inquiryData)
        if (isJsonData(res?.data)) return res.data
      } catch (e) {
        console.warn('PHP API inquiries.create failed, using Supabase fallback:', e.message)
      }
      const { data, error } = await supabase.from('inquiries').insert([inquiryData]).select()
      if (error) throw error
      return data ? data[0] : null
    },
    updateStatus: async (id, status) => {
      try {
        const res = await axios.put(`${API_BASE}/inquiries.php`, { id, status })
        if (isJsonData(res?.data)) return res.data
      } catch (e) {
        console.warn('PHP API inquiries.updateStatus failed, using Supabase fallback:', e.message)
      }
      const { data, error } = await supabase.from('inquiries').update({ status }).eq('id', id).select()
      if (error) throw error
      return data ? data[0] : null
    }
  },

  // Požičovňa
  rental: {
    getItems: async () => {
      try {
        const res = await axios.get(`${API_BASE}/rental.php?action=items`)
        if (isJsonData(res?.data)) return res.data
      } catch (e) {
        console.warn('PHP API rental.getItems failed, using Supabase fallback:', e.message)
      }
      const { data, error } = await supabase.from('rental_items').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    },
    createItem: async (itemData) => {
      try {
        const res = await axios.post(`${API_BASE}/rental.php?action=items`, itemData)
        if (isJsonData(res?.data)) return res.data
      } catch (e) {
        console.warn('PHP API rental.createItem failed, using Supabase fallback:', e.message)
      }
      const { data, error } = await supabase.from('rental_items').insert([itemData]).select()
      if (error) throw error
      return data ? data[0] : null
    },
    updateItem: async (itemData) => {
      try {
        const res = await axios.put(`${API_BASE}/rental.php?action=items`, itemData)
        if (isJsonData(res?.data)) return res.data
      } catch (e) {
        console.warn('PHP API rental.updateItem failed, using Supabase fallback:', e.message)
      }
      const { data, error } = await supabase.from('rental_items').update(itemData).eq('id', itemData.id).select()
      if (error) throw error
      return data ? data[0] : null
    },
    deleteItem: async (id) => {
      try {
        const res = await axios.delete(`${API_BASE}/rental.php?action=items&id=${id}`)
        if (isJsonData(res?.data)) return res.data
      } catch (e) {
        console.warn('PHP API rental.deleteItem failed, using Supabase fallback:', e.message)
      }
      const { error } = await supabase.from('rental_items').delete().eq('id', id)
      if (error) throw error
      return { success: true }
    },
    getBookings: async () => {
      try {
        const res = await axios.get(`${API_BASE}/rental.php?action=bookings`)
        if (isJsonData(res?.data)) return res.data
      } catch (e) {
        console.warn('PHP API rental.getBookings failed, using Supabase fallback:', e.message)
      }
      const { data, error } = await supabase.from('rental_bookings').select('*, rental_items(*)').order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    },
    createBooking: async (bookingData) => {
      try {
        const res = await axios.post(`${API_BASE}/rental.php?action=bookings`, bookingData)
        if (isJsonData(res?.data)) return res.data
      } catch (e) {
        console.warn('PHP API rental.createBooking failed, using Supabase fallback:', e.message)
      }
      const { data, error } = await supabase.from('rental_bookings').insert([bookingData]).select()
      if (error) throw error
      return data ? data[0] : null
    },
    updateBookingStatus: async (id, status) => {
      try {
        const res = await axios.put(`${API_BASE}/rental.php?action=bookings`, { id, status })
        if (isJsonData(res?.data)) return res.data
      } catch (e) {
        console.warn('PHP API rental.updateBookingStatus failed, using Supabase fallback:', e.message)
      }
      const { data, error } = await supabase.from('rental_bookings').update({ status }).eq('id', id).select()
      if (error) throw error
      return data ? data[0] : null
    }
  },

  // Nastavenia
  settings: {
    get: async () => {
      try {
        const res = await axios.get(`${API_BASE}/settings.php`)
        if (isJsonData(res?.data)) return res.data
      } catch (e) {
        console.warn('PHP API settings.get failed, using Supabase fallback:', e.message)
      }
      const { data, error } = await supabase.from('site_settings').select('*')
      if (error || !data) return {}
      const map = {}
      data.forEach(item => { map[item.key] = item.value })
      return map
    },
    update: async (settingsData) => {
      try {
        const res = await axios.post(`${API_BASE}/settings.php`, settingsData)
        if (isJsonData(res?.data)) return res.data
      } catch (e) {
        console.warn('PHP API settings.update failed, using Supabase fallback:', e.message)
      }
      for (const [key, value] of Object.entries(settingsData)) {
        await supabase.from('site_settings').upsert({ key, value: String(value) }, { onConflict: 'key' })
      }
      return { success: true }
    }
  },

  // Nahrávanie obrázkov
  uploadImage: async (file) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await axios.post(`${API_BASE}/upload.php`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      if (isJsonData(res?.data) && res.data.url) return res.data.url
    } catch (e) {
      console.warn('PHP API uploadImage failed, using Supabase Storage fallback:', e.message)
    }
    const ext = file.name.split('.').pop() || 'webp'
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${ext}`
    const { error: sbUploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, { cacheControl: '3600', upsert: true })
    if (sbUploadError) throw sbUploadError
    const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName)
    return urlData.publicUrl
  }
}
