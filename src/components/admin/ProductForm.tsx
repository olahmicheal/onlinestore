import { useState, useEffect } from 'react'
import { X, Plus, Minus } from 'lucide-react'
import { db, type Product } from '../../lib/supabase'
import toast from 'react-hot-toast'

interface ProductFormProps {
  product?: Product | null
  onClose: () => void
  onSuccess: () => void
}

export default function ProductForm({ product, onClose, onSuccess }: ProductFormProps) {
  const [form, setForm] = useState({
    name: '',
    category: 'tops',
    price: 0,
    original_price: 0,
    image_url: '',
    sizes: ['S', 'M', 'L'] as string[],
    badge: '',
    description: '',
    stock: 0,
    is_active: true,
  })
  const [newSize, setNewSize] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        category: product.category,
        price: product.price,
        original_price: product.original_price || 0,
        image_url: product.image_url,
        sizes: product.sizes,
        badge: product.badge || '',
        description: product.description,
        stock: product.stock,
        is_active: product.is_active,
      })
    }
  }, [product])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }))
  }

  const addSize = () => {
    if (newSize && !form.sizes.includes(newSize)) {
      setForm(prev => ({ ...prev, sizes: [...prev.sizes, newSize] }))
      setNewSize('')
    }
  }

  const removeSize = (size: string) => {
    setForm(prev => ({ ...prev, sizes: prev.sizes.filter(s => s !== size) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = {
        ...form,
        original_price: form.original_price || null,
        badge: form.badge || null,
      }

      if (product) {
        await db.updateProduct(product.id, data)
        toast.success('Product updated!')
      } else {
        await db.createProduct(data)
        toast.success('Product created!')
      }
      onSuccess()
      onClose()
    } catch (err) {
      toast.error('Failed to save product')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold dark:text-white">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X className="w-5 h-5 dark:text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-sm font-medium dark:text-gray-300">Product Name</label>
            <input
              type="text"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium dark:text-gray-300">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="tops">Tops</option>
                <option value="bottoms">Bottoms</option>
                <option value="hoodies">Hoodies</option>
                <option value="jackets">Jackets</option>
                <option value="accessories">Accessories</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium dark:text-gray-300">Badge</label>
              <select
                name="badge"
                value={form.badge}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="">None</option>
                <option value="New">New</option>
                <option value="Sale">Sale</option>
                <option value="Hot">Hot</option>
                <option value="Limited">Limited</option>
                <option value="Best Seller">Best Seller</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium dark:text-gray-300">Price (₦)</label>
              <input
                type="number"
                name="price"
                required
                value={form.price}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="text-sm font-medium dark:text-gray-300">Original Price (₦)</label>
              <input
                type="number"
                name="original_price"
                value={form.original_price}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium dark:text-gray-300">Image URL</label>
            <input
              type="url"
              name="image_url"
              required
              value={form.image_url}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="text-sm font-medium dark:text-gray-300">Sizes</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {form.sizes.map(size => (
                <span key={size} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm dark:text-white">
                  {size}
                  <button type="button" onClick={() => removeSize(size)} className="hover:text-red-500">
                    <Minus className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={newSize}
                onChange={e => setNewSize(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addSize())}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                placeholder="Add size (e.g. XL)"
              />
              <button type="button" onClick={addSize} className="px-3 py-2 bg-gray-900 text-white rounded-lg hover:opacity-90">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium dark:text-gray-300">Description</label>
            <textarea
              name="description"
              rows={3}
              value={form.description}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium dark:text-gray-300">Stock</label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={e => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm dark:text-gray-300">Active</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gray-900 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
          </button>
        </form>
      </div>
    </div>
  )
}
