import { useState } from 'react'
import { X } from 'lucide-react'
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

  const handleAddToCart = () => {
    if (!selectedSize) return
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

          <p className="text-sm text-lit-dim dark:text-nova-dim mt-3 leading-relaxed">
            {product.description}
          </p>

          {/* Sizes */}
          <div className="mt-5">
            <label className="text-xs text-lit-dim dark:text-nova-dim uppercase tracking-wider font-medium">
              Select Size
            </label>
            <div className="flex flex-wrap gap-2 mt-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-[50px] px-4 py-2.5 border-2 rounded-lg font-medium text-sm transition-all ${
                    selectedSize === size
                      ? 'bg-lit-accent dark:bg-nova-accent text-white border-lit-accent dark:border-nova-accent'
                      : 'border-lit-border dark:border-nova-border dark:text-white hover:border-lit-text dark:hover:border-nova-text'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={!selectedSize}
            className={`w-full mt-5 py-3.5 rounded-xl font-semibold uppercase tracking-wider text-sm transition-all ${
              selectedSize
                ? 'bg-lit-accent dark:bg-nova-accent text-white hover:opacity-90'
                : 'bg-lit-border dark:bg-nova-border text-lit-dim dark:text-nova-dim cursor-not-allowed'
            }`}
          >
            {selectedSize ? 'Add to Cart' : 'Select a size'}
          </button>
        </div>
      </div>
    </div>
  )
}
