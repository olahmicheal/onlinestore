import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CreditCard, MessageCircle, Copy, Check, Truck, MapPin, Phone, Mail, User } from 'lucide-react'
import { useCart } from '../../contexts/CartContext'
import { db, generateWhatsAppLink, type PaymentSettings, type StoreSettings } from '../../lib/supabase'
import toast from 'react-hot-toast'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, subtotal, clearCart } = useCart()

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  })

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null)
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null)
  const [loading, setLoading] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderData, setOrderData] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  // Load settings
  useState(() => {
    const loadSettings = async () => {
      try {
        const store = await db.getSettings('store') as StoreSettings
        const payment = await db.getSettings('payment') as PaymentSettings
        setStoreSettings(store)
        setPaymentSettings(payment)
      } catch (err) {
        console.error('Failed to load settings:', err)
      }
    }
    loadSettings()
  })

  const shipping = 2500
  const total = subtotal + shipping

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) {
      toast.error('Your cart is empty!')
      return
    }

    setLoading(true)
    try {
      const order = await db.createOrder({
        customer_email: form.email,
        customer_name: form.name,
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
        shipping,
        tax: 0,
        total,
        payment_method: 'bank_transfer',
        payment_status: 'pending',
      })

      setOrderData(order)
      setOrderComplete(true)
      clearCart()
      toast.success('Order placed successfully!')
    } catch (err) {
      console.error('Order failed:', err)
      toast.error('Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyAccountNumber = () => {
    if (paymentSettings?.account_number) {
      navigator.clipboard.writeText(paymentSettings.account_number)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success('Account number copied!')
    }
  }

  const getWhatsAppLink = () => {
    if (!storeSettings?.whatsapp || !orderData) return '#'
    return generateWhatsAppLink(storeSettings.whatsapp, orderData)
  }

  if (orderComplete && orderData) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold dark:text-white mb-2">Order Placed!</h1>
          <p className="text-gray-500 dark:text-gray-400">Order ID: {orderData.id}</p>
        </div>

        {/* Payment Details */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="font-semibold dark:text-white mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Details
          </h2>

          {paymentSettings ? (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Bank</span>
                <span className="font-medium dark:text-white">{paymentSettings.bank_name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Account Name</span>
                <span className="font-medium dark:text-white">{paymentSettings.account_name}</span>
              </div>
              <div className="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <div>
                  <span className="text-gray-500 dark:text-gray-400 block text-xs">Account Number</span>
                  <span className="font-mono font-bold text-lg dark:text-white">{paymentSettings.account_number}</span>
                </div>
                <button
                  onClick={copyAccountNumber}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 dark:text-white" />}
                </button>
              </div>
              {paymentSettings.additional_info && (
                <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
                  {paymentSettings.additional_info}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">Payment details not available. Contact support.</p>
          )}

          <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500 dark:text-gray-400">Amount to Pay</span>
              <span className="font-bold text-lg dark:text-white">₦{total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* WhatsApp Contact */}
        <a
          href={getWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-4 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors mb-4"
        >
          <MessageCircle className="w-5 h-5" />
          Send Payment Receipt via WhatsApp
        </a>

        <p className="text-xs text-center text-gray-500 dark:text-gray-400 mb-6">
          Click the button above to open WhatsApp and send your payment receipt. Include your order ID.
        </p>

        <button
          onClick={() => navigate('/')}
          className="w-full py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Cart
      </button>

      <h1 className="text-2xl font-bold dark:text-white mb-6">Checkout</h1>

      {/* Order Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <h2 className="font-semibold dark:text-white mb-3">Order Summary ({items.length} items)</h2>
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span className="dark:text-gray-300">{item.name} ({item.size}) x{item.quantity}</span>
              <span className="dark:text-white">₦{(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 mt-3 pt-3 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
            <span className="dark:text-white">₦{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Shipping</span>
            <span className="dark:text-white">₦{shipping.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span className="dark:text-white">Total</span>
            <span className="dark:text-white">₦{total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Shipping Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="font-semibold dark:text-white flex items-center gap-2">
          <Truck className="w-5 h-5" />
          Shipping Details
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <User className="w-3 h-3" /> Full Name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full mt-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Phone className="w-3 h-3" /> Phone
            </label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              className="w-full mt-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="+234 801 234 5678"
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Mail className="w-3 h-3" /> Email
          </label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full mt-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="john@example.com"
          />
        </div>

        <div>
          <label className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Address
          </label>
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            required
            className="w-full mt-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="123 Street Name"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400">City</label>
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              required
              className="w-full mt-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Lagos"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400">Postal Code</label>
            <input
              name="postalCode"
              value={form.postalCode}
              onChange={handleChange}
              required
              className="w-full mt-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="100001"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || items.length === 0}
          className="w-full py-4 bg-lit-accent dark:bg-nova-accent text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? 'Placing Order...' : `Place Order - ₦${total.toLocaleString()}`}
        </button>
      </form>
    </div>
  )
}