import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useCart } from '../../contexts/CartContext'
import { db } from '../../lib/supabase'
import { formatPrice } from '../../lib/utils'
import toast from 'react-hot-toast'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, subtotal, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    setLoading(true)
    try {
      const order = await db.createOrder({
        customer_email: form.email,
        customer_name: `${form.firstName} ${form.lastName}`,
        customer_phone: form.phone,
        shipping_address: form.address,
        city: form.city,
        postal_code: form.postalCode,
        items: items.map(item => ({
          product_id: item.productId,
          product_name: item.name,
          size: item.size,
          price: item.price,
          quantity: item.quantity,
          image_url: item.imageUrl,
        })),
        subtotal,
        shipping: 0,
        tax: 0,
        total: subtotal,
      })

      clearCart()
      navigate('/order-success', { state: { orderId: order.id } })
    } catch (err) {
      toast.error('Failed to place order. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto p-8 text-center">
        <p className="text-lit-dim dark:text-nova-dim">Your cart is empty</p>
        <button 
          onClick={() => navigate('/')}
          className="mt-4 text-lit-accent dark:text-nova-accent font-medium"
        >
          Continue Shopping
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-lit-dim dark:text-nova-dim mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to shop
      </button>

      <h1 className="text-2xl font-semibold dark:text-white mb-6">Checkout</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs text-lit-dim dark:text-nova-dim uppercase tracking-wider">Email</label>
          <input
            type="email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full mt-1 px-4 py-3 border border-lit-border dark:border-nova-border rounded-xl bg-lit-surface dark:bg-nova-surface2 dark:text-white focus:outline-none focus:border-lit-accent dark:focus:border-nova-accent transition-colors"
            placeholder="you@example.com"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-lit-dim dark:text-nova-dim uppercase tracking-wider">First Name</label>
            <input
              type="text"
              name="firstName"
              required
              value={form.firstName}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-3 border border-lit-border dark:border-nova-border rounded-xl bg-lit-surface dark:bg-nova-surface2 dark:text-white focus:outline-none focus:border-lit-accent dark:focus:border-nova-accent"
              placeholder="John"
            />
          </div>
          <div>
            <label className="text-xs text-lit-dim dark:text-nova-dim uppercase tracking-wider">Last Name</label>
            <input
              type="text"
              name="lastName"
              required
              value={form.lastName}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-3 border border-lit-border dark:border-nova-border rounded-xl bg-lit-surface dark:bg-nova-surface2 dark:text-white focus:outline-none focus:border-lit-accent dark:focus:border-nova-accent"
              placeholder="Doe"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-lit-dim dark:text-nova-dim uppercase tracking-wider">Address</label>
          <input
            type="text"
            name="address"
            required
            value={form.address}
            onChange={handleChange}
            className="w-full mt-1 px-4 py-3 border border-lit-border dark:border-nova-border rounded-xl bg-lit-surface dark:bg-nova-surface2 dark:text-white focus:outline-none focus:border-lit-accent dark:focus:border-nova-accent"
            placeholder="123 Street Name"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-lit-dim dark:text-nova-dim uppercase tracking-wider">City</label>
            <input
              type="text"
              name="city"
              required
              value={form.city}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-3 border border-lit-border dark:border-nova-border rounded-xl bg-lit-surface dark:bg-nova-surface2 dark:text-white focus:outline-none focus:border-lit-accent dark:focus:border-nova-accent"
              placeholder="Lagos"
            />
          </div>
          <div>
            <label className="text-xs text-lit-dim dark:text-nova-dim uppercase tracking-wider">Postal Code</label>
            <input
              type="text"
              name="postalCode"
              required
              value={form.postalCode}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-3 border border-lit-border dark:border-nova-border rounded-xl bg-lit-surface dark:bg-nova-surface2 dark:text-white focus:outline-none focus:border-lit-accent dark:focus:border-nova-accent"
              placeholder="100001"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-lit-dim dark:text-nova-dim uppercase tracking-wider">Phone</label>
          <input
            type="tel"
            name="phone"
            required
            value={form.phone}
            onChange={handleChange}
            className="w-full mt-1 px-4 py-3 border border-lit-border dark:border-nova-border rounded-xl bg-lit-surface dark:bg-nova-surface2 dark:text-white focus:outline-none focus:border-lit-accent dark:focus:border-nova-accent"
            placeholder="+234 80 1234 5678"
          />
        </div>

        {/* Order Summary */}
        <div className="bg-lit-surface dark:bg-nova-surface border border-lit-border dark:border-nova-border rounded-xl p-4 mt-6">
          <h3 className="font-semibold dark:text-white mb-3">Order Summary</h3>
          {items.map(item => (
            <div key={`${item.productId}-${item.size}`} className="flex items-center gap-3 py-2 border-b border-lit-border dark:border-nova-border last:border-0">
              <img src={item.imageUrl} alt={item.name} className="w-12 h-14 object-cover rounded-lg" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium dark:text-white truncate">{item.name}</p>
                <p className="text-xs text-lit-dim dark:text-nova-dim">Qty: {item.quantity} · Size: {item.size}</p>
              </div>
              <p className="text-sm font-semibold dark:text-white">{formatPrice(item.price * item.quantity)}</p>
            </div>
          ))}
          <div className="flex justify-between pt-3 mt-2 border-t border-lit-border dark:border-nova-border">
            <span className="font-semibold dark:text-white">Total</span>
            <span className="font-bold dark:text-white">{formatPrice(subtotal)}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-lit-accent dark:bg-nova-accent text-white font-semibold uppercase tracking-wider rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Place Order'}
        </button>
      </form>
    </div>
  )
}
