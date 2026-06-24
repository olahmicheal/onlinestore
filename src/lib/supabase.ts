import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Types
export interface Product {
  id: string
  name: string
  category: string
  price: number
  original_price: number | null
  image_url: string
  sizes: string[]
  badge: string | null
  description: string
  stock: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  customer_email: string
  customer_name: string
  customer_phone: string
  shipping_address: string
  city: string
  postal_code: string
  items: OrderItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface OrderItem {
  product_id: string
  product_name: string
  size: string
  price: number
  quantity: number
  image_url: string
}

export interface Complaint {
  id: string
  customer_name: string
  customer_email: string
  order_id: string | null
  subject: string
  message: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  created_at: string
  updated_at: string
}

export interface AdminUser {
  id: string
  email: string
  role: 'admin' | 'super_admin'
  created_at: string
}

// Database helper functions
export const db = {
  // Products
  async getProducts(filters?: { category?: string; active?: boolean }) {
    let query = supabase.from('products').select('*').order('created_at', { ascending: false })

    if (filters?.category && filters.category !== 'all') {
      query = query.eq('category', filters.category)
    }
    if (filters?.active !== undefined) {
      query = query.eq('is_active', filters.active)
    }

    const { data, error } = await query
    if (error) throw error
    return data as Product[]
  },

  async getProduct(id: string) {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single()
    if (error) throw error
    return data as Product
  },

  async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase.from('products').insert(product).select().single()
    if (error) throw error
    return data as Product
  },

  async updateProduct(id: string, updates: Partial<Product>) {
    const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data as Product
  },

  async deleteProduct(id: string) {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw error
  },

  // Orders
  async createOrder(order: Omit<Order, 'id' | 'created_at' | 'updated_at' | 'status'>) {
    const { data, error } = await supabase.from('orders').insert({
      ...order,
      status: 'pending'
    }).select().single()
    if (error) throw error
    return data as Order
  },

  async getOrders() {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return data as Order[]
  },

  async updateOrderStatus(id: string, status: Order['status']) {
    const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select().single()
    if (error) throw error
    return data as Order
  },

  // Complaints
  async createComplaint(complaint: Omit<Complaint, 'id' | 'created_at' | 'updated_at' | 'status'>) {
    const { data, error } = await supabase.from('complaints').insert({
      ...complaint,
      status: 'open'
    }).select().single()
    if (error) throw error
    return data as Complaint
  },

  async getComplaints() {
    const { data, error } = await supabase.from('complaints').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return data as Complaint[]
  },

  async updateComplaintStatus(id: string, status: Complaint['status']) {
    const { data, error } = await supabase.from('complaints').update({ status }).eq('id', id).select().single()
    if (error) throw error
    return data as Complaint
  },

  // Categories
  async getCategories() {
    const { data, error } = await supabase.from('categories').select('*').order('name')
    if (error) throw error
    return data as { id: string; name: string; slug: string; created_at: string }[]
  },

  async createCategory(category: { name: string; slug: string }) {
    const { data, error } = await supabase.from('categories').insert(category).select().single()
    if (error) throw error
    return data
  },

  async deleteCategory(id: string) {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) throw error
  },

  // Stats
  async getStats() {
    const { data: products } = await supabase.from('products').select('id', { count: 'exact', head: true })
    const { data: orders } = await supabase.from('orders').select('total', { count: 'exact' })
    const { data: complaints } = await supabase.from('complaints').select('id', { count: 'exact', head: true })
    const { data: revenue } = await supabase.from('orders').select('total')

    const totalRevenue = revenue?.reduce((sum, o) => sum + (o.total || 0), 0) || 0

    return {
      totalProducts: products?.length || 0,
      totalOrders: orders?.length || 0,
      totalComplaints: complaints?.length || 0,
      totalRevenue,
      pendingOrders: 0,
    }
  }
}
