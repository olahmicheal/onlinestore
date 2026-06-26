import { useState, useEffect, useMemo } from 'react'
import { SlidersHorizontal, Tag } from 'lucide-react'
import ProductCard from '../../components/user/ProductCard'
import ProductModal from '../../components/user/ProductModal'
import FilterSheet from '../../components/user/FilterSheet'
import { db, type Product, type Category } from '../../lib/supabase'

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeCollection, setActiveCollection] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // All available collections from products
  const collections = useMemo(() => {
    const allTags = products.flatMap(p => p.tags || [])
    return [...new Set(allTags)].filter(Boolean)
  }, [products])

  // Categories that have at least 1 product
  const categoriesWithProducts = useMemo(() => {
    const productCategories = new Set(products.map(p => p.category))
    return categories.filter(cat => productCategories.has(cat.slug))
  }, [categories, products])

  useEffect(() => {
    loadProducts()
    loadCategories()
  }, [])

  useEffect(() => {
    let filtered = products

    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(p => p.category === activeCategory)
    }

    // Filter by collection/tag
    if (activeCollection) {
      filtered = filtered.filter(p => p.tags?.includes(activeCollection))
    }

    setFilteredProducts(filtered)
  }, [activeCategory, activeCollection, products])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await db.getProducts({ active: true })
      setProducts(data)
      setFilteredProducts(data)
    } catch (err) {
      console.error('Failed to load products:', err)
      // Fallback demo data with ALL new fields
      const demo: Product[] = [
        { id: '1', name: 'FLTTW Armless', category: 'tops', price: 70000, original_price: null, image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop', images: [], sizes: ['S','M','L','XL'], size_stock: { S: 3, M: 5, L: 2, XL: 0 }, badge: 'New', tags: ['New', 'Hot'], description: 'Premium armless top with vintage wash finish', stock: 10, is_preorder: false, preorder_date: null, preorder_message: null, is_active: true, created_at: '', updated_at: '' },
        { id: '2', name: 'FLTTW Cap', category: 'accessories', price: 70000, original_price: null, image_url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&h=500&fit=crop', images: [], sizes: ['One Size'], size_stock: { 'One Size': 15 }, badge: null, tags: ['Bestseller'], description: 'Structured cap with embroidered logo', stock: 15, is_preorder: false, preorder_date: null, preorder_message: null, is_active: true, created_at: '', updated_at: '' },
        { id: '3', name: 'FLTTW Crop Tee', category: 'tops', price: 70000, original_price: null, image_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&h=500&fit=crop', images: [], sizes: ['S','M','L'], size_stock: { S: 8, M: 12, L: 5 }, badge: 'Hot', tags: ['Hot', 'Sale'], description: 'Cropped tee with raw hem', stock: 25, is_preorder: false, preorder_date: null, preorder_message: null, is_active: true, created_at: '', updated_at: '' },
        { id: '4', name: 'Washed Hoodie', category: 'hoodies', price: 85000, original_price: 95000, image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&h=500&fit=crop', images: [], sizes: ['S','M','L','XL'], size_stock: { S: 2, M: 3, L: 0, XL: 1 }, badge: 'Sale', tags: ['Sale'], description: 'Heavyweight cotton hoodie with vintage wash', stock: 6, is_preorder: false, preorder_date: null, preorder_message: null, is_active: true, created_at: '', updated_at: '' },
        { id: '5', name: 'Cargo Pants', category: 'bottoms', price: 95000, original_price: null, image_url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500&h=500&fit=crop', images: [], sizes: ['30','32','34','36'], size_stock: { '30': 4, '32': 6, '34': 2, '36': 0 }, badge: null, tags: ['New'], description: 'Multi-pocket cargo pants in tech fabric', stock: 12, is_preorder: false, preorder_date: null, preorder_message: null, is_active: true, created_at: '', updated_at: '' },
        { id: '6', name: 'Vintage Tee', category: 'tops', price: 55000, original_price: null, image_url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&h=500&fit=crop', images: [], sizes: ['S','M','L','XL'], size_stock: { S: 10, M: 15, L: 8, XL: 5 }, badge: 'New', tags: ['New', 'Bestseller'], description: 'Garment-dyed vintage wash t-shirt', stock: 38, is_preorder: false, preorder_date: null, preorder_message: null, is_active: true, created_at: '', updated_at: '' },
        { id: '7', name: 'Bucket Hat', category: 'accessories', price: 45000, original_price: null, image_url: 'https://images.unsplash.com/photo-1575428652377-a269c6d5f3d6?w=500&h=500&fit=crop', images: [], sizes: ['One Size'], size_stock: { 'One Size': 18 }, badge: null, tags: [], description: 'Reversible bucket hat', stock: 18, is_preorder: false, preorder_date: null, preorder_message: null, is_active: true, created_at: '', updated_at: '' },
        { id: '8', name: 'Track Pants', category: 'bottoms', price: 75000, original_price: 85000, image_url: 'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=500&h=500&fit=crop', images: [], sizes: ['S','M','L','XL'], size_stock: { S: 5, M: 3, L: 2, XL: 0 }, badge: 'Sale', tags: ['Sale', 'Hot'], description: 'Premium track joggers with side stripe', stock: 10, is_preorder: false, preorder_date: null, preorder_message: null, is_active: true, created_at: '', updated_at: '' },
        { id: '9', name: 'Denim Jacket', category: 'jackets', price: 120000, original_price: null, image_url: 'https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=500&h=500&fit=crop', images: [], sizes: ['S','M','L','XL'], size_stock: { S: 1, M: 0, L: 1, XL: 1 }, badge: 'Limited', tags: ['Limited', 'Hot'], description: 'Oversized denim jacket with distressed details', stock: 3, is_preorder: true, preorder_date: '2025-07-15', preorder_message: 'Ships in 2-3 weeks', is_active: true, created_at: '', updated_at: '' },
        { id: '10', name: 'Oversized Tee', category: 'tops', price: 60000, original_price: null, image_url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&h=500&fit=crop', images: [], sizes: ['S','M','L','XL'], size_stock: { S: 8, M: 10, L: 5, XL: 2 }, badge: null, tags: ['Bestseller'], description: 'Boxy fit oversized tee', stock: 25, is_preorder: false, preorder_date: null, preorder_message: null, is_active: true, created_at: '', updated_at: '' },
        { id: '11', name: 'Crossbody Bag', category: 'accessories', price: 80000, original_price: null, image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop', images: [], sizes: ['One Size'], size_stock: { 'One Size': 8 }, badge: 'New', tags: ['New', 'Limited'], description: 'Modular crossbody with MOLLE webbing', stock: 8, is_preorder: false, preorder_date: null, preorder_message: null, is_active: true, created_at: '', updated_at: '' },
        { id: '12', name: 'Bomber Jacket', category: 'jackets', price: 110000, original_price: null, image_url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&h=500&fit=crop', images: [], sizes: ['S','M','L','XL'], size_stock: { S: 2, M: 1, L: 2, XL: 1 }, badge: 'Hot', tags: ['Hot', 'Bestseller'], description: 'Lightweight puffer bomber jacket', stock: 6, is_preorder: false, preorder_date: null, preorder_message: null, is_active: true, created_at: '', updated_at: '' },
        { id: '13', name: 'Cargo Shorts', category: 'shorts', price: 65000, original_price: null, image_url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500&h=500&fit=crop', images: [], sizes: ['S','M','L','XL'], size_stock: { S: 5, M: 8, L: 3, XL: 2 }, badge: 'New', tags: ['New'], description: 'Utility cargo shorts with multiple pockets', stock: 18, is_preorder: false, preorder_date: null, preorder_message: null, is_active: true, created_at: '', updated_at: '' },
      ]
      setProducts(demo)
      setFilteredProducts(demo)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const data = await db.getCategories()
      setCategories(data)
    } catch (err) {
      console.error('Failed to load categories:', err)
      setCategories([
        { id: '1', name: 'Tops', slug: 'tops', created_at: '' },
        { id: '2', name: 'Bottoms', slug: 'bottoms', created_at: '' },
        { id: '3', name: 'Shorts', slug: 'shorts', created_at: '' },
        { id: '4', name: 'Hoodies', slug: 'hoodies', created_at: '' },
        { id: '5', name: 'Jackets', slug: 'jackets', created_at: '' },
        { id: '6', name: 'Accessories', slug: 'accessories', created_at: '' },
      ])
    }
  }

  const openProductModal = (product: Product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* Title */}
      <h1 className="text-3xl font-semibold px-4 pt-6 pb-2 dark:text-white tracking-tight">
        Featured Collections
      </h1>

      {/* Collections Scroll */}
      {collections.length > 0 && (
        <div className="px-4 py-2">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setActiveCollection(null)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                !activeCollection
                  ? 'bg-lit-accent dark:bg-nova-accent text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              All
            </button>
            {collections.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveCollection(activeCollection === tag ? null : tag)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                  activeCollection === tag
                    ? 'bg-lit-accent dark:bg-nova-accent text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Tag className="w-3 h-3" />
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <button 
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center gap-2 text-sm font-medium dark:text-white"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filter and sort
        </button>
        <span className="text-sm text-lit-dim dark:text-nova-dim">
          {filteredProducts.length} products
        </span>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3 px-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-lit-border/50 dark:bg-nova-border/50 rounded-lg" />
              <div className="h-4 bg-lit-border/50 dark:bg-nova-border/50 rounded mt-2 w-3/4" />
              <div className="h-4 bg-lit-border/50 dark:bg-nova-border/50 rounded mt-1 w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-4 pb-8">
          {filteredProducts.map((product) => (
            <div key={product.id} onClick={() => openProductModal(product)}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <ProductModal 
        product={selectedProduct} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      <FilterSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        categories={categoriesWithProducts}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
      />
    </div>
  )
}