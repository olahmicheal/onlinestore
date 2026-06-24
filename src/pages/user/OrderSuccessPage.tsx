import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Check } from 'lucide-react'

export default function OrderSuccessPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const orderId = location.state?.orderId

  useEffect(() => {
    if (!orderId) {
      navigate('/')
    }
  }, [orderId, navigate])

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center">
      <div className="w-20 h-20 bg-lit-accent dark:bg-nova-accent rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
        <Check className="w-10 h-10 text-white" />
      </div>
      <h1 className="text-2xl font-semibold dark:text-white mb-2">Order Confirmed</h1>
      <p className="text-lit-dim dark:text-nova-dim mb-2">
        Thank you for your purchase!
      </p>
      {orderId && (
        <p className="text-sm text-lit-dim dark:text-nova-dim mb-8">
          Order ID: <span className="font-mono font-medium">{orderId}</span>
        </p>
      )}
      <p className="text-sm text-lit-dim dark:text-nova-dim mb-8">
        We'll send you a confirmation email shortly with your tracking details.
      </p>
      <button
        onClick={() => navigate('/')}
        className="px-8 py-3 bg-lit-accent dark:bg-nova-accent text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
      >
        Continue Shopping
      </button>
    </div>
  )
}
