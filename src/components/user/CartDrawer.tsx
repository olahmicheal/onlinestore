import { X, Minus, Plus, Trash2 } from 'lucide-react'
import { useCart } from '../../contexts/CartContext'
import { useTheme } from '../../contexts/ThemeContext'
import { formatPrice } from '../../lib/utils'
import { Link } from 'react-router-dom'

export default function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeItem, subtotal } = useCart()
  const { theme } = useTheme()

  if (!isCartOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-[200] animate-fade-in"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 w-full max-w-md h-full bg-lit-surface dark:bg-nova-surface z-[201] flex flex-col animate-slide-in border-l border-lit-border dark:border-nova-border">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-lit-border dark:border-nova-border">
          <h2 className="text-lg font-semibold dark:text-white">Your Cart</h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-lit-border/30 dark:hover:bg-nova-border/30 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 dark:text-white" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center py-12 text-lit-dim dark:text-nova-dim">
              <ShoppingBagIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>Your cart is empty</p>
              <p className="text-sm mt-1">Add some fire pieces!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={`${item.productId}-${item.size}`} className="flex gap-3 pb-4 border-b border-lit-border dark:border-nova-border">
                  <img 
                    src={item.imageUrl} 
                    alt={item.name}
                    className="w-16 h-20 object-cover rounded-lg bg-lit-border dark:bg-nova-border"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm dark:text-white truncate">{item.name}</h3>
                    <p className="text-xs text-lit-dim dark:text-nova-dim mt-0.5">Size: {item.size}</p>
                    <p className="font-semibold text-sm mt-1 dark:text-white">{formatPrice(item.price * item.quantity)}</p>

                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border border-lit-border dark:border-nova-border rounded-lg">
                        <button 
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                          className="p-1.5 hover:bg-lit-border/30 dark:hover:bg-nova-border/30 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5 dark:text-white" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium dark:text-white">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                          className="p-1.5 hover:bg-lit-border/30 dark:hover:bg-nova-border/30 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5 dark:text-white" />
                        </button>
                      </div>
                      <button 
                        onClick={() => removeItem(item.productId, item.size)}
                        className="p-1.5 text-lit-dim dark:text-nova-dim hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-lit-border dark:border-nova-border bg-lit-bg dark:bg-nova-bg">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold dark:text-white">Total</span>
              <span className="font-bold text-lg dark:text-white">{formatPrice(subtotal)}</span>
            </div>
            <Link 
              to="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="block w-full py-3 bg-lit-accent dark:bg-nova-accent text-white text-center font-semibold rounded-xl hover:opacity-90 transition-opacity"
            >
              Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  )
}

function ShoppingBagIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  )
}
