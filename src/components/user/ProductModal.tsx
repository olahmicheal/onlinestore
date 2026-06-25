import { useState } from 'react'
import { X, Clock, AlertTriangle } from 'lucide-react'
import { useCart } from '../../contexts/CartContext'
import { formatPrice } from '../../lib/utils'
import type { Product } from '../../lib/supabase'

interface ProductModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

export default function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const { addItem } = useCart()

  if (!isOpen || !product) return null

  const getSizeStock = (size: string) => product.size_stock?.[size] ?? 0
  const isOutOfStock = (size: string) => getSizeStock(size) <= 0
  const isLowStock = (size: string) => getSizeStock(size) > 0 && getSizeStock(size) <= 3

  const handleAddToCart = () => {
    if (!selectedSize || isOutOfStock(selectedSize)) return
    addItem({
      productId: product.id,
      name: product.name,
      size: selectedSize,
      price: product.price,
      imageUrl: product.image_url,
    })
    setSelectedSize(null)
    onClose()
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-[200] flex items-end justify-center animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl bg-lit-surface dark:bg-nova-surface rounded-t-2xl max-h-[85vh] overflow-y-auto animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Image */}
        <div className="relative aspect-square bg-lit-border/30 dark:bg-nova-border/30">
          <img 
            src={product.image_url} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 dark:bg-nova-surface/90 flex items-center justify-center shadow-lg"
          >
            <X className="w-5 h-5 dark:text-white" />
          </button>

          {/* Preorder Badge */}
          {product.is_preorder && (
            <div className="absolute top-4 left-4 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <Clock className="w-3 h-3" />
              PRE-ORDER
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-5">
          <h2 className="text-xl font-semibold dark:text-white">{product.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-lg font-bold dark:text-white">{formatPrice(product.price)}</span>
            {product.original_price && (
              <span className="text-sm text-lit-dim dark:text-nova-dim line-through">
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>

          {/* Preorder Info */}
          {product.is_preorder && (
            <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-sm font-medium">
                <Clock className="w-4 h-4" />
                Pre-order Item
              </div>
              {product.preorder_date && (
                <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                  Available: {new Date(product.preorder_date).toLocaleDateString()}
                </p>
              )}
              {product.preorder_message && (
                <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
                  {product.preorder_message}
                </p>
              )}
            </div>
          )}

          <p className="text-sm text-lit-dim dark:text-nova-dim mt-3 leading-relaxed">
            {product.description}
          </p>

          {/* Sizes with Stock */}
          <div className="mt-5">
            <label className="text-xs text-lit-dim dark:text-nova-dim uppercase tracking-wider font-medium">
              Select Size
            </label>
            <div className="flex flex-wrap gap-2 mt-2">
              {product.sizes.map((size) => {
                const stock = getSizeStock(size)
                const outOfStock = stock <= 0
                const lowStock = stock > 0 && stock <= 3

                return (
                  <button
                    key={size}
                    onClick={() => !outOfStock && setSelectedSize(size)}
                    disabled={outOfStock}
                    className={`relative min-w-[60px] px-4 py-2.5 border-2 rounded-lg font-medium text-sm transition-all ${
                      selectedSize === size
                        ? 'bg-lit-accent dark:bg-nova-accent text-white border-lit-accent dark:border-nova-accent'
                        : outOfStock
                          ? 'border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed bg-gray-50 dark:bg-gray-800/50'
                          : lowStock
                            ? 'border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400 hover:border-orange-400 dark:hover:border-orange-600'
                            : 'border-lit-border dark:border-nova-border dark:text-white hover:border-lit-text dark:hover:border-nova-text'
                    }`}
                  >
                    <span>{size}</span>
                    {outOfStock && (
                      <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] px-1 rounded-full">OUT</span>
                    )}
                    {lowStock && !outOfStock && (
                      <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[8px] px-1 rounded-full">{stock}</span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Stock Alert */}
            {selectedSize && isLowStock(selectedSize) && (
              <div className="flex items-center gap-1.5 mt-2 text-orange-600 dark:text-orange-400 text-xs">
                <AlertTriangle className="w-3.5 h-3.5" />
                Only {getSizeStock(selectedSize)} left in stock!
              </div>
            )}
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={!selectedSize || isOutOfStock(selectedSize)}
            className={`w-full mt-5 py-3.5 rounded-xl font-semibold uppercase tracking-wider text-sm transition-all ${
              selectedSize && !isOutOfStock(selectedSize)
                ? 'bg-lit-accent dark:bg-nova-accent text-white hover:opacity-90'
                : 'bg-lit-border dark:bg-nova-border text-lit-dim dark:text-nova-dim cursor-not-allowed'
            }`}
          >
            {product.is_preorder ? 'Pre-order Now' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  )
}