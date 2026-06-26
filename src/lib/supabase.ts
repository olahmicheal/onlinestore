import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY 

export const supabase = createClient(supabaseUrl, supabaseKey)


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
  tags: string[]           // NEW: Collections like ["Sale", "Hot", "New"]
  description: string
  stock: number            // OLD column - kept for backward compatibility
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
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'completed'
  payment_method: string
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
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

export interface Review {
  id: string
  product_id: string
  customer_name: string
  customer_email: string
  rating: number
  comment: string
  is_approved: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface AdminUser {
  id: string
  email: string
  role: 'admin' | 'super_admin'
  created_at: string
}

export interface StoreSettings {
  name: string
  whatsapp: string
  currency: string
}

export interface PaymentSettings {
  bank_name: string
  account_name: string
  account_number: string
  additional_info: string
}

// ============================================
// HELPERS
// ============================================

function normalizeProduct(product: any): Product {
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
    tags: product.tags || [],
    is_preorder: product.is_preorder || false,
    preorder_date: product.preorder_date || null,
    preorder_message: product.preorder_message || null,
  }
}

// ============================================
// DATABASE FUNCTIONS
// ============================================

export const db = {
  // ========== PRODUCTS ==========
  async getProducts(filters?: { category?: string; active?: boolean; tag?: string }) {
    let query = supabase.from('products').select('*').order('created_at', { ascending: false })

    if (filters?.category && filters.category !== 'all') {
      query = query.eq('category', filters.category)
    }
    if (filters?.active !== undefined) {
      query = query.eq('is_active', filters.active)
    }
    if (filters?.tag) {
      query = query.contains('tags', [filters.tag])
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
    const totalStock = Object.values(product.size_stock || {}).reduce((a, b) => a + b, 0)
    const dataWithStock = { ...product, stock: totalStock }
    const { data, error } = await supabase.from('products').insert(dataWithStock).select().single()
    if (error) throw error
    return normalizeProduct(data) as Product
  },

  async updateProduct(id: string, updates: Partial<Product>) {
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

  // ========== CATEGORIES (Dynamic) ==========
  async getCategories() {
    const { data, error } = await supabase.from('categories').select('*').order('name')
    if (error) throw error
    return (data || []) as Category[]
  },

  async createCategory(category: { name: string; slug: string }) {
    const { data, error } = await supabase.from('categories').insert(category).select().single()
    if (error) throw error
    return data as Category
  },

  async deleteCategory(id: string) {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) throw error
  },

  // ========== IMAGE UPLOAD ==========
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

  // ========== ORDERS ==========
  async createOrder(order: Omit<Order, 'id' | 'status' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase.from('orders').insert({
      ...order,
      status: 'pending',
      payment_status: 'pending'
    }).select().single()
    if (error) throw error
    return data as Order
  },

  async getOrders() {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return (data || []) as Order[]
  },

  async updateOrderStatus(id: string, status: Order['status']) {
    const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select().single()
    if (error) throw error
    return data as Order
  },

  async updatePaymentStatus(id: string, payment_status: Order['payment_status']) {
    const { data, error } = await supabase.from('orders').update({ payment_status }).eq('id', id).select().single()
    if (error) throw error
    return data as Order
  },

  // ========== COMPLAINTS ==========
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
    return (data || []) as Complaint[]
  },

  async updateComplaintStatus(id: string, status: Complaint['status']) {
    const { data, error } = await supabase.from('complaints').update({ status }).eq('id', id).select().single()
    if (error) throw error
    return data as Complaint
  },

  // ========== REVIEWS ==========
  async createReview(review: Omit<Review, 'id' | 'is_approved' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase.from('reviews').insert({
      ...review,
      is_approved: false
    }).select().single()
    if (error) throw error
    return data as Review
  },

  async getProductReviews(productId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data || []) as Review[]
  },

  async getAllReviews() {
    const { data, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return (data || []) as Review[]
  },

  async approveReview(id: string, is_approved: boolean) {
    const { data, error } = await supabase.from('reviews').update({ is_approved }).eq('id', id).select().single()
    if (error) throw error
    return data as Review
  },

  async deleteReview(id: string) {
    const { error } = await supabase.from('reviews').delete().eq('id', id)
    if (error) throw error
  },

  // ========== SETTINGS ==========
  async getSettings(key: string) {
    const { data, error } = await supabase.from('settings').select('value').eq('key', key).single()
    if (error) throw error
    return data?.value || {}
  },

  async updateSettings(key: string, value: any) {
    const { data, error } = await supabase.from('settings').update({ value }).eq('key', key).select().single()
    if (error) throw error
    return data
  },

  // ========== STATS ==========
  async getStats() {
    const { data: products } = await supabase.from('products').select('id', { count: 'exact', head: true })
    const { data: orders } = await supabase.from('orders').select('total', { count: 'exact' })
    const { data: complaints } = await supabase.from('complaints').select('id', { count: 'exact', head: true })
    const { data: reviews } = await supabase.from('reviews').select('id', { count: 'exact', head: true })
    const { data: revenue } = await supabase.from('orders').select('total')

    const totalRevenue = revenue?.reduce((sum, o) => sum + (o.total || 0), 0) || 0

    return {
      totalProducts: products?.length || 0,
      totalOrders: orders?.length || 0,
      totalComplaints: complaints?.length || 0,
      totalReviews: reviews?.length || 0,
      totalRevenue,
      pendingOrders: 0,
    }
  }
}

// ============================================
// WHATSAPP HELPER
// ============================================

export function generateWhatsAppLink(phone: string, order: Order): string {
  const message = encodeURIComponent(
    `Hi! I just placed an order on your store.\n\n` +
    `Order ID: ${order.id}\n` +
    `Name: ${order.customer_name}\n` +
    `Total: ₦${order.total.toLocaleString()}\n\n` +
    `I have made the payment and would like to send my receipt.\n\n` +
    `Thank you!`
  )
  return `https://wa.me/${phone}?text=${message}`
}