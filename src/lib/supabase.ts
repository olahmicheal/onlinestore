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
  images: string[]
  sizes: string[]
  size_stock: Record<string, number>
  badge: string | null
  description: string
  stock: number  // OLD column - kept for backward compatibility
  is_preorder: boolean
  preorder_date: string | null
  preorder_message: string | null
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

// Helper to normalize product data (handles old stock vs new size_stock)
function normalizeProduct(product: any): Product {
  // If size_stock is empty but stock exists, create a fallback
  const hasSizeStock = product.size_stock && Object.keys(product.size_stock).length > 0
  const size_stock = hasSizeStock
    ? product.size_stock
    : product.sizes?.reduce((acc: Record<string, number>, size: string) => {
        acc[size] = product.stock || 0
        return acc
      }, {}) || {}

  return {
    ...product,
    size_stock,
    images: product.images || [],
    is_preorder: product.is_preorder || false,
    preorder_date: product.preorder_date || null,
    preorder_message: product.preorder_message || null,
  }
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
    return (data || []).map(normalizeProduct) as Product[]
  },

  async getProduct(id: string) {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single()
    if (error) throw error
    return normalizeProduct(data) as Product
  },

  async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'stock'>) {
    // When creating, also update the old stock column for backward compatibility
    const totalStock = Object.values(product.size_stock || {}).reduce((a, b) => a + b, 0)
    const dataWithStock = {
      ...product,
      stock: totalStock,
    }
    const { data, error } = await supabase.from('products').insert(dataWithStock).select().single()
    if (error) throw error
    return normalizeProduct(data) as Product
  },

  async updateProduct(id: string, updates: Partial<Product>) {
    // When updating, also sync the old stock column
    const updateData = { ...updates }
    if (updates.size_stock) {
      updateData.stock = Object.values(updates.size_stock).reduce((a, b) => a + b, 0)
    }
    const { data, error } = await supabase.from('products').update(updateData).eq('id', id).select().single()
    if (error) throw error
    return normalizeProduct(data) as Product
  },

  async deleteProduct(id: string) {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw error
  },

  // Image Upload
  async uploadImage(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, { cacheControl: '3600', upsert: false })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)

    return publicUrl
  },

  async deleteImage(url: string) {
    const path = url.split('/').pop()
    if (!path) return
    const { error } = await supabase.storage.from('product-images').remove([path])
    if (error) throw error
  },

  // Orders
  async createOrder(order: Omit<Order, 'id' | 'status' | 'created_at' | 'updated_at'>) {
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
  async createComplaint(complaint: Omit<Complaint, 'id' | 'status' | 'created_at' | 'updated_at'>) {
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