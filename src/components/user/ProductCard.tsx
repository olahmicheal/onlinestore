import { ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatPrice } from '../../lib/utils'
import type { Product } from '../../lib/supabase'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link to={`/product/${product.id}`} className="group block">
      <div className="relative bg-lit-border/30 dark:bg-nova-border/30 aspect-square overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-400"
        />

        {/* Badge */}
        {product.badge && (
          <span className="absolute top-3 left-3 bg-nova-accent text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
            {product.badge}
          </span>
        )}

        {/* Quick Add Button */}
        <div className="absolute bottom-3 right-3">
          <div className="w-10 h-10 rounded-full bg-lit-accent dark:bg-nova-accent text-white flex items-center justify-center shadow-lg">
            <ShoppingBag className="w-4 h-4" />
          </div>
        </div>
      </div>

      <div className="pt-3 pb-2">
        <h3 className="font-medium text-sm dark:text-white">{product.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="font-semibold text-sm dark:text-white">{formatPrice(product.price)}</span>
          {product.original_price && (
            <span className="text-xs text-lit-dim dark:text-nova-dim line-through">
              {formatPrice(product.original_price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
