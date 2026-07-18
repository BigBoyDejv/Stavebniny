import axios from 'axios'

const API_BASE = '/api'

axios.defaults.withCredentials = true

export const api = {
  // Autentifikácia
  auth: {
    getSession: async () => {
      const res = await axios.get(`${API_BASE}/auth.php?action=session`)
      return res.data
    },
    login: async (email, password) => {
      const res = await axios.post(`${API_BASE}/auth.php?action=login`, { email, password })
      return res.data
    },
    logout: async () => {
      const res = await axios.post(`${API_BASE}/auth.php?action=logout`)
      return res.data
    }
  },

  // Produkty
  products: {
    getAll: async (params = {}) => {
      const query = new URLSearchParams(params).toString()
      const res = await axios.get(`${API_BASE}/products.php?${query}`)
      return res.data
    },
    create: async (productData) => {
      const res = await axios.post(`${API_BASE}/products.php`, productData)
      return res.data
    },
    update: async (productData) => {
      const res = await axios.put(`${API_BASE}/products.php`, productData)
      return res.data
    },
    delete: async (id) => {
      const res = await axios.delete(`${API_BASE}/products.php?id=${id}`)
      return res.data
    }
  },

  // Kategórie
  categories: {
    getAll: async (type) => {
      const query = type ? `?type=${type}` : ''
      const res = await axios.get(`${API_BASE}/categories.php${query}`)
      return res.data
    },
    create: async (categoryData) => {
      const res = await axios.post(`${API_BASE}/categories.php`, categoryData)
      return res.data
    },
    delete: async (id) => {
      const res = await axios.delete(`${API_BASE}/categories.php?id=${id}`)
      return res.data
    }
  },

  // Objednávky
  orders: {
    getAll: async () => {
      const res = await axios.get(`${API_BASE}/orders.php`)
      return res.data
    },
    create: async (orderData) => {
      const res = await axios.post(`${API_BASE}/orders.php`, orderData)
      return res.data
    },
    updateStatus: async (id, status) => {
      const res = await axios.put(`${API_BASE}/orders.php`, { id, status })
      return res.data
    }
  },

  // Dopyty / Kontakt
  inquiries: {
    getAll: async () => {
      const res = await axios.get(`${API_BASE}/inquiries.php`)
      return res.data
    },
    create: async (inquiryData) => {
      const res = await axios.post(`${API_BASE}/inquiries.php`, inquiryData)
      return res.data
    },
    updateStatus: async (id, status) => {
      const res = await axios.put(`${API_BASE}/inquiries.php`, { id, status })
      return res.data
    }
  },

  // Požičovňa
  rental: {
    getItems: async () => {
      const res = await axios.get(`${API_BASE}/rental.php?action=items`)
      return res.data
    },
    createItem: async (itemData) => {
      const res = await axios.post(`${API_BASE}/rental.php?action=items`, itemData)
      return res.data
    },
    updateItem: async (itemData) => {
      const res = await axios.put(`${API_BASE}/rental.php?action=items`, itemData)
      return res.data
    },
    deleteItem: async (id) => {
      const res = await axios.delete(`${API_BASE}/rental.php?action=items&id=${id}`)
      return res.data
    },
    getBookings: async () => {
      const res = await axios.get(`${API_BASE}/rental.php?action=bookings`)
      return res.data
    },
    createBooking: async (bookingData) => {
      const res = await axios.post(`${API_BASE}/rental.php?action=bookings`, bookingData)
      return res.data
    },
    updateBookingStatus: async (id, status) => {
      const res = await axios.put(`${API_BASE}/rental.php?action=bookings`, { id, status })
      return res.data
    }
  },

  // Nastavenia
  settings: {
    get: async () => {
      const res = await axios.get(`${API_BASE}/settings.php`)
      return res.data
    },
    update: async (settingsData) => {
      const res = await axios.post(`${API_BASE}/settings.php`, settingsData)
      return res.data
    }
  },

  // Nahrávanie obrázkov
  uploadImage: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await axios.post(`${API_BASE}/upload.php`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return res.data.url
  }
}
