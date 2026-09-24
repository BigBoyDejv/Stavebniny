import axios from 'axios'

const API_BASE = '/api'

axios.defaults.withCredentials = true

const isJsonData = (data) => data && typeof data === 'object' && !data.error

export const api = {
  // Autentifikácia
  auth: {
    getSession: async () => {
      try {
        const res = await axios.get(`${API_BASE}/auth.php?action=session`)
        if (isJsonData(res?.data)) return res.data
      } catch (e) {
        console.error('API getSession error:', e)
      }
      return null
    },
    login: async (email, password) => {
      const res = await axios.post(`${API_BASE}/auth.php?action=login`, { email, password })
      if (isJsonData(res?.data)) return res.data
      throw new Error(res?.data?.error || 'Prihlásenie zlyhalo')
    },
    logout: async () => {
      try {
        const res = await axios.post(`${API_BASE}/auth.php?action=logout`)
        if (isJsonData(res?.data)) return res.data
      } catch (e) {
        console.error('API logout error:', e)
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
        if (Array.isArray(res?.data)) return res.data
      } catch (e) {
        console.error('API products getAll error:', e)
      }
      return []
    },
    create: async (productData) => {
      const res = await axios.post(`${API_BASE}/products.php`, productData)
      if (isJsonData(res?.data)) return res.data
      throw new Error(res?.data?.error || 'Failed to create product')
    },
    update: async (productData) => {
      const res = await axios.put(`${API_BASE}/products.php`, productData)
      if (isJsonData(res?.data)) return res.data
      throw new Error(res?.data?.error || 'Failed to update product')
    },
    delete: async (id) => {
      const res = await axios.delete(`${API_BASE}/products.php?id=${id}`)
      if (isJsonData(res?.data)) return res.data
      throw new Error(res?.data?.error || 'Failed to delete product')
    }
  },

  // Kategórie
  categories: {
    getAll: async (type) => {
      try {
        const query = type ? `?type=${type}` : ''
        const res = await axios.get(`${API_BASE}/categories.php${query}`)
        if (Array.isArray(res?.data)) return res.data
      } catch (e) {
        console.error('API categories getAll error:', e)
      }
      return []
    },
    create: async (categoryData) => {
      const res = await axios.post(`${API_BASE}/categories.php`, categoryData)
      if (isJsonData(res?.data)) return res.data
      throw new Error(res?.data?.error || 'Failed to create category')
    },
    delete: async (id) => {
      const res = await axios.delete(`${API_BASE}/categories.php?id=${id}`)
      if (isJsonData(res?.data)) return res.data
      throw new Error(res?.data?.error || 'Failed to delete category')
    }
  },

  // Objednávky / Dopyty z katalógu
  orders: {
    getAll: async () => {
      try {
        const res = await axios.get(`${API_BASE}/orders.php`)
        if (Array.isArray(res?.data)) return res.data
      } catch (e) {
        console.error('API orders getAll error:', e)
      }
      return []
    },
    create: async (orderData) => {
      const res = await axios.post(`${API_BASE}/orders.php`, orderData)
      if (isJsonData(res?.data)) return res.data
      throw new Error(res?.data?.error || 'Failed to create order')
    },
    updateStatus: async (id, status) => {
      const res = await axios.put(`${API_BASE}/orders.php`, { id, status })
      if (isJsonData(res?.data)) return res.data
      throw new Error(res?.data?.error || 'Failed to update order status')
    },
    delete: async (id) => {
      const res = await axios.delete(`${API_BASE}/orders.php?id=${id}`)
      if (isJsonData(res?.data)) return res.data
      throw new Error(res?.data?.error || 'Failed to delete order')
    }
  },

  // Dopyty / Správy z webu
  inquiries: {
    getAll: async () => {
      try {
        const res = await axios.get(`${API_BASE}/inquiries.php`)
        if (Array.isArray(res?.data)) return res.data
      } catch (e) {
        console.error('API inquiries getAll error:', e)
      }
      return []
    },
    create: async (inquiryData) => {
      const res = await axios.post(`${API_BASE}/inquiries.php`, inquiryData)
      if (isJsonData(res?.data)) return res.data
      throw new Error(res?.data?.error || 'Failed to create inquiry')
    },
    updateStatus: async (id, status) => {
      const res = await axios.put(`${API_BASE}/inquiries.php`, { id, status })
      if (isJsonData(res?.data)) return res.data
      throw new Error(res?.data?.error || 'Failed to update inquiry status')
    },
    delete: async (id) => {
      const res = await axios.delete(`${API_BASE}/inquiries.php?id=${id}`)
      if (isJsonData(res?.data)) return res.data
      throw new Error(res?.data?.error || 'Failed to delete inquiry')
    }
  },

  // Požičovňa
  rental: {
    getItems: async () => {
      try {
        const res = await axios.get(`${API_BASE}/rental.php?action=items`)
        if (Array.isArray(res?.data)) return res.data
      } catch (e) {
        console.error('API rental getItems error:', e)
      }
      return []
    },
    createItem: async (itemData) => {
      const res = await axios.post(`${API_BASE}/rental.php?action=items`, itemData)
      if (isJsonData(res?.data)) return res.data
      throw new Error(res?.data?.error || 'Failed to create rental item')
    },
    updateItem: async (itemData) => {
      const res = await axios.put(`${API_BASE}/rental.php?action=items`, itemData)
      if (isJsonData(res?.data)) return res.data
      throw new Error(res?.data?.error || 'Failed to update rental item')
    },
    deleteItem: async (id) => {
      const res = await axios.delete(`${API_BASE}/rental.php?action=items&id=${id}`)
      if (isJsonData(res?.data)) return res.data
      throw new Error(res?.data?.error || 'Failed to delete rental item')
    },
    getBookings: async () => {
      try {
        const res = await axios.get(`${API_BASE}/rental.php?action=bookings`)
        if (Array.isArray(res?.data)) return res.data
      } catch (e) {
        console.error('API rental getBookings error:', e)
      }
      return []
    },
    createBooking: async (bookingData) => {
      const res = await axios.post(`${API_BASE}/rental.php?action=bookings`, bookingData)
      if (isJsonData(res?.data)) return res.data
      throw new Error(res?.data?.error || 'Failed to create booking')
    },
    updateBookingStatus: async (id, status) => {
      const res = await axios.put(`${API_BASE}/rental.php?action=bookings`, { id, status })
      if (isJsonData(res?.data)) return res.data
      throw new Error(res?.data?.error || 'Failed to update booking status')
    },
    deleteBooking: async (id) => {
      const res = await axios.delete(`${API_BASE}/rental.php?action=bookings&id=${id}`)
      if (isJsonData(res?.data)) return res.data
      throw new Error(res?.data?.error || 'Failed to delete booking')
    }
  },

  // Nastavenia
  settings: {
    get: async () => {
      try {
        const res = await axios.get(`${API_BASE}/settings.php`)
        if (isJsonData(res?.data)) return res.data
      } catch (e) {
        console.error('API settings get error:', e)
      }
      return {}
    },
    update: async (settingsData) => {
      const res = await axios.post(`${API_BASE}/settings.php`, settingsData)
      if (isJsonData(res?.data)) return res.data
      throw new Error(res?.data?.error || 'Failed to update settings')
    }
  },

  // Nahrávanie obrázkov
  uploadImage: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await axios.post(`${API_BASE}/upload.php`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    if (isJsonData(res?.data) && res.data.url) return res.data.url
    throw new Error(res?.data?.error || 'Failed to upload image')
  }
}
