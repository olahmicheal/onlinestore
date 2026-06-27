import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, Minus, Plus } from 'lucide-react'
import { useCart } from '../../contexts/CartContext'
import { db, type Product } from '../../lib/supabase'
import { formatPrice } from '../../lib/utils'

export default function ProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
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
      // Fallback: find from demo data with ALL new fields
      const demo: Product[] = [
        { id: '1', name: 'FLTTW Armless', category: 'tops', price: 70000, original_price: null, image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop', images: [], sizes: ['S','M','L','XL'], size_stock: { S: 3, M: 5, L: 2, XL: 0 }, badge: 'New', description: 'Premium armless top with vintage wash finish', stock: 10, is_preorder: false, preorder_date: null, preorder_message: null, is_active: true, created_at: '', updated_at: '' },
        { id: '2', name: 'FLTTW Cap', category: 'accessories', price: 70000, original_price: null, image_url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&h=500&fit=crop', images: [], sizes: ['One Size'], size_stock: { 'One Size': 15 }, badge: null, description: 'Structured cap with embroidered logo', stock: 15, is_preorder: false, preorder_date: null, preorder_message: null, is_active: true, created_at: '', updated_at: '' },
        { id: '9', name: 'Denim Jacket', category: 'jackets', price: 120000, original_price: null, image_url: 'https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=500&h=500&fit=crop', images: [], sizes: ['S','M','L','XL'], size_stock: { S: 1, M: 0, L: 1, XL: 1 }, badge: 'Limited', description: 'Oversized denim jacket with distressed details', stock: 3, is_preorder: true, preorder_date: '2025-07-15', preorder_message: 'Ships in 2-3 weeks', is_active: true, created_at: '', updated_at: '' },
      ]
      const found = demo.find(p => p.id === productId)
      setProduct(found || demo[0])
    } finally {
      setLoading(false)
    }
  }

  const getSizeStock = (size: string) => product?.size_stock?.[size] ?? 0
  const isOutOfStock = (size: string) => getSizeStock(size) <= 0

  // Only show sizes that are in stock
  const availableSizes = product?.sizes.filter(size => !isOutOfStock(size)) || []

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => {
      const newQty = prev + delta
      if (newQty < 1) return 1
      if (selectedSize && newQty > getSizeStock(selectedSize)) {
        return getSizeStock(selectedSize)
      }
      return newQty
    })
  }

  const handleAddToCart = () => {
    if (!product || !selectedSize) return
    addItem({
      productId: product.id,
      name: product.name,
      size: selectedSize,
      price: product.price,
      imageUrl: product.image_url,
    }, quantity)
    setSelectedSize(null)
    setQuantity(1)
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
      <div className="relative aspect-square bg-lit-border/30 dark:bg-nova-border/30">
        <img 
          src={product.image_url} 
          alt={product.name}
          className="w-full h-full object-cover"
        />
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
        <h1 className="text-2xl font-semibold dark:text-white">{product.name}</h1>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xl font-bold dark:text-white">{formatPrice(product.price)}</span>
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

        {/* Sizes - Only show available (in-stock) sizes */}
        {availableSizes.length > 0 && (
          <div className="mt-5">
            <label className="text-xs text-lit-dim dark:text-nova-dim uppercase tracking-wider font-medium">
              Select Size
            </label>
            <div className="flex flex-wrap gap-2 mt-2">
              {availableSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => {
                    setSelectedSize(size)
                    setQuantity(1)
                  }}
                  className={`min-w-[60px] px-4 py-2.5 border-2 rounded-lg font-medium text-sm transition-all ${
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
        )}

        {availableSizes.length === 0 && !product.is_preorder && (
          <div className="mt-5 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This item is currently unavailable.
            </p>
          </div>
        )}

        {/* Quantity Selector */}
        {selectedSize && (
          <div className="mt-5">
            <label className="text-xs text-lit-dim dark:text-nova-dim uppercase tracking-wider font-medium">
              Quantity
            </label>
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="w-10 h-10 rounded-lg border border-lit-border dark:border-nova-border flex items-center justify-center disabled:opacity-30 dark:text-white hover:bg-lit-border/20 dark:hover:bg-nova-border/20 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-semibold dark:text-white">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(1)}
                className="w-10 h-10 rounded-lg border border-lit-border dark:border-nova-border flex items-center justify-center dark:text-white hover:bg-lit-border/20 dark:hover:bg-nova-border/20 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

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
          {product.is_preorder ? 'Pre-order Now' : 'Add to Cart'}
        </button>
      </div>
    </div>
  )
}