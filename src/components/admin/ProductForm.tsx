import { useState, useRef } from 'react'
import { X, Plus, Upload, ImageIcon, Loader2 } from 'lucide-react'
import { db, type Product } from '../../lib/supabase'
import toast from 'react-hot-toast'

interface ProductFormProps {
  product?: Product | null
  onClose: () => void
  onSuccess: () => void
}

const CATEGORIES = ['tops', 'bottoms', 'hoodies', 'jackets', 'accessories']

export default function ProductForm({ product, onClose, onSuccess }: ProductFormProps) {
  const [form, setForm] = useState<Partial<Product>>({
    name: product?.name || '',
    category: product?.category || 'tops',
    price: product?.price || 0,
    original_price: product?.original_price || null,
    image_url: product?.image_url || '',
    images: product?.images || [],
    sizes: product?.sizes || [],
    size_stock: product?.size_stock || {},
    badge: product?.badge || '',
    description: product?.description || '',
    is_preorder: product?.is_preorder || false,
    preorder_date: product?.preorder_date || '',
    preorder_message: product?.preorder_message || '',
    is_active: product?.is_active ?? true,
  })

  const [newSize, setNewSize] = useState('')
  const [newSizeStock, setNewSizeStock] = useState(0)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setForm(prev => ({ ...prev, [name]: checked }))
    } else {
      setForm(prev => ({
        ...prev,
        [name]: type === 'number' ? Number(value) : value,
      }))
    }
  }

  const addSize = () => {
    if (!newSize || form.sizes?.includes(newSize)) return
    setForm(prev => ({
      ...prev,
      sizes: [...(prev.sizes || []), newSize],
      size_stock: { ...(prev.size_stock || {}), [newSize]: newSizeStock || 0 }
    }))
    setNewSize('')
    setNewSizeStock(0)
  }

  const removeSize = (size: string) => {
    setForm(prev => {
      const newSizes = prev.sizes?.filter(s => s !== size) || []
      const newStock = { ...(prev.size_stock || {}) }
      delete newStock[size]
      return { ...prev, sizes: newSizes, size_stock: newStock }
    })
  }

  const updateSizeStock = (size: string, stock: number) => {
    setForm(prev => ({
      ...prev,
      size_stock: { ...(prev.size_stock || {}), [size]: stock }
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const url = await db.uploadImage(file)
      setForm(prev => ({
        ...prev,
        image_url: prev.image_url || url,
        images: [...(prev.images || []), url]
      }))
      toast.success('Image uploaded!')
    } catch (err) {
      toast.error('Failed to upload image')
      console.error(err)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removeImage = (url: string) => {
    setForm(prev => ({
      ...prev,
      images: prev.images?.filter(img => img !== url) || [],
      image_url: prev.image_url === url ? (prev.images?.find(img => img !== url) || '') : prev.image_url
    }))
  }

  const setPrimaryImage = (url: string) => {
    setForm(prev => ({ ...prev, image_url: url }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = {
        ...form,
        original_price: form.original_price || null,
        badge: form.badge || null,
        preorder_date: form.is_preorder ? form.preorder_date : null,
        preorder_message: form.is_preorder ? form.preorder_message : null,
      }

      if (product) {
        await db.updateProduct(product.id, data)
        toast.success('Product updated!')
      } else {
        await db.createProduct(data as Omit<Product, 'id' | 'created_at' | 'updated_at'>)
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
    <div className="fixed inset-0 bg-black/50 z-[300] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold dark:text-white">
            {product ? 'Edit Product' : 'Add Product'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X className="w-5 h-5 dark:text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium dark:text-gray-300">Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full mt-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium dark:text-gray-300">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium dark:text-gray-300">Price</label>
              <input
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                required
                className="w-full mt-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium dark:text-gray-300">Original Price (optional)</label>
              <input
                name="original_price"
                type="number"
                value={form.original_price || ''}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="text-sm font-medium dark:text-gray-300 mb-2 block">Product Images</label>

            <div className="flex items-center gap-3 mb-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors dark:text-white"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading ? 'Uploading...' : 'Upload Image'}
              </button>
            </div>

            {form.images && form.images.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {form.images.map((url, idx) => (
                  <div key={idx} className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 ${form.image_url === url ? 'border-blue-500' : 'border-gray-200 dark:border-gray-600'}`}>
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      <button type="button" onClick={() => setPrimaryImage(url)} className="p-1 bg-blue-500 rounded text-white" title="Set as primary">
                        <ImageIcon className="w-3 h-3" />
                      </button>
                      <button type="button" onClick={() => removeImage(url)} className="p-1 bg-red-500 rounded text-white">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    {form.image_url === url && (
                      <span className="absolute top-0.5 left-0.5 bg-blue-500 text-white text-[8px] px-1 rounded">PRIMARY</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium dark:text-gray-300">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full mt-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {/* Badge */}
          <div>
            <label className="text-sm font-medium dark:text-gray-300">Badge (optional)</label>
            <input
              name="badge"
              value={form.badge || ''}
              onChange={handleChange}
              placeholder="New, Sale, Hot, Limited..."
              className="w-full mt-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {/* Sizes with Stock */}
          <div>
            <label className="text-sm font-medium dark:text-gray-300 mb-2 block">Sizes & Stock</label>
            <div className="flex gap-2 mb-3">
              <input
                value={newSize}
                onChange={e => setNewSize(e.target.value)}
                placeholder="Size (e.g. S, M, L)"
                className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <input
                type="number"
                value={newSizeStock}
                onChange={e => setNewSizeStock(Number(e.target.value))}
                placeholder="Stock"
                className="w-24 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <button
                type="button"
                onClick={addSize}
                className="px-3 py-2 bg-gray-900 text-white rounded-lg hover:opacity-90"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {form.sizes && form.sizes.length > 0 && (
              <div className="space-y-2">
                {form.sizes.map(size => (
                  <div key={size} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                    <span className="font-medium dark:text-white w-12">{size}</span>
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 dark:text-gray-400">Stock</label>
                      <input
                        type="number"
                        value={form.size_stock?.[size] || 0}
                        onChange={e => updateSizeStock(size, Number(e.target.value))}
                        className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSize(size)}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Preorder Settings */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <label className="flex items-center gap-2 mb-3 cursor-pointer">
              <input
                type="checkbox"
                name="is_preorder"
                checked={form.is_preorder}
                onChange={handleChange}
                className="w-4 h-4 rounded"
              />
              <span className="font-medium dark:text-white">This is a pre-order item</span>
            </label>

            {form.is_preorder && (
              <div className="space-y-3 pl-6">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Available Date</label>
                  <input
                    type="date"
                    name="preorder_date"
                    value={form.preorder_date || ''}
                    onChange={handleChange}
                    className="w-full mt-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Pre-order Message</label>
                  <input
                    name="preorder_message"
                    value={form.preorder_message || ''}
                    onChange={handleChange}
                    placeholder="e.g. Ships in 2-3 weeks"
                    className="w-full mt-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Active */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="is_active"
              checked={form.is_active}
              onChange={handleChange}
              className="w-4 h-4 rounded"
            />
            <span className="dark:text-white">Active</span>
          </label>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border rounded-xl dark:border-gray-600 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}