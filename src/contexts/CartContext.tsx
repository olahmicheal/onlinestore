import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import toast from 'react-hot-toast'

export interface CartItem {
  productId: string
  name: string
  size: string
  price: number
  quantity: number
  imageUrl: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeItem: (productId: string, size: string) => void
  updateQuantity: (productId: string, size: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  subtotal: number
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('store-cart')
    return saved ? JSON.parse(saved) : []
  })
  const [isCartOpen, setIsCartOpen] = useState(false)

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === item.productId && i.size === item.size)
      let newItems: CartItem[]
      if (existing) {
        newItems = prev.map(i =>
          i.productId === item.productId && i.size === item.size
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      } else {
        newItems = [...prev, { ...item, quantity }]
      }
      localStorage.setItem('store-cart', JSON.stringify(newItems))
      toast.success('Added to cart!')
      return newItems
    })
  }, [])

  const removeItem = useCallback((productId: string, size: string) => {
    setItems(prev => {
      const newItems = prev.filter(i => !(i.productId === productId && i.size === size))
      localStorage.setItem('store-cart', JSON.stringify(newItems))
      return newItems
    })
  }, [])

  const updateQuantity = useCallback((productId: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, size)
      return
    }
    setItems(prev => {
      const newItems = prev.map(i =>
        i.productId === productId && i.size === size
          ? { ...i, quantity }
          : i
      )
      localStorage.setItem('store-cart', JSON.stringify(newItems))
      return newItems
    })
  }, [removeItem])

  const clearCart = useCallback(() => {
    setItems([])
    localStorage.removeItem('store-cart')
  }, [])

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal, isCartOpen, setIsCartOpen }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}