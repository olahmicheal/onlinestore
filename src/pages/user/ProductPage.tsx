import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useCart } from '../../contexts/CartContext'
import { db, type Product } from '../../lib/supabase'
import { formatPrice } from '../../lib/utils'

export default function ProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) loadProduct(id)
  }, [id])

  const loadProduct = async (productId: string) => {
    try {
      setLoading(true)
      const data = await db.getProduct(productId)
      setProduct(data)
    } catch {
      // Fallback: find from demo data
      const demo = [
        { id: '1', name: 'FLTTW Armless', category: 'tops', price: 70000, original_price: null, image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop', sizes: ['S','M','L','XL'], badge: 'New', description: 'Premium armless top with vintage wash finish', stock: 10, is_active: true, created_at: '', updated_at: '' },
      ]
      setProduct(demo[0])
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!product || !selectedSize) return
    addItem({
      productId: product.id,
      name: product.name,
      size: selectedSize,
      price: product.price,
      imageUrl: product.image_url,
    })
    setSelectedSize(null)
  }

  if (loading) {
    return (
      <div className="max-w-xl mx-auto animate-pulse">
        <div className="aspect-square bg-lit-border/50 dark:bg-nova-border/50" />
        <div className="p-4 space-y-3">
          <div className="h-6 bg-lit-border/50 dark:bg-nova-border/50 rounded w-2/3" />
          <div className="h-4 bg-lit-border/50 dark:bg-nova-border/50 rounded w-1/3" />
        </div>
      </div>
    )
  }

  if (!product) return <div className="p-8 text-center dark:text-white">Product not found</div>

  return (
    <div className="max-w-xl mx-auto">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 p-4 text-sm text-lit-dim dark:text-nova-dim hover:text-lit-text dark:hover:text-nova-text transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Image */}
      <div className="aspect-square bg-lit-border/30 dark:bg-nova-border/30">
        <img 
          src={product.image_url} 
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="p-5">
        <h1 className="text-2xl font-semibold dark:text-white">{product.name}</h1>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xl font-bold dark:text-white">{formatPrice(product.price)}</span>
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
          className={`w-full mt-6 py-4 rounded-xl font-semibold uppercase tracking-wider text-sm transition-all ${
            selectedSize
              ? 'bg-lit-accent dark:bg-nova-accent text-white hover:opacity-90'
              : 'bg-lit-border dark:bg-nova-border text-lit-dim dark:text-nova-dim cursor-not-allowed'
          }`}
        >
          {selectedSize ? 'Add to Cart' : 'Select a size'}
        </button>
      </div>
    </div>
  )
}
