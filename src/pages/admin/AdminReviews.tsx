import { useState, useEffect } from 'react'
import { Check, X, Star, Eye, Trash2, MessageSquare } from 'lucide-react'
import { db, type Review } from '../../lib/supabase'
import toast from 'react-hot-toast'

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all')

  useEffect(() => {
    loadReviews()
  }, [])

  const loadReviews = async () => {
    try {
      setLoading(true)
      const data = await db.getAllReviews()
      setReviews(data)
    } catch (err) {
      console.error('Failed to load reviews:', err)
      toast.error('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string, isApproved: boolean) => {
    try {
      await db.approveReview(id, isApproved)
      toast.success(isApproved ? 'Review approved!' : 'Review rejected')
      await loadReviews()
    } catch (err) {
      toast.error('Failed to update review')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return
    try {
      await db.deleteReview(id)
      toast.success('Review deleted')
      await loadReviews()
    } catch (err) {
      toast.error('Failed to delete review')
    }
  }

  const filteredReviews = reviews.filter(review => {
    if (filter === 'pending') return !review.is_approved
    if (filter === 'approved') return review.is_approved
    return true
  })

  const stats = {
    total: reviews.length,
    pending: reviews.filter(r => !r.is_approved).length,
    approved: reviews.filter(r => r.is_approved).length,
    average: reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0,
  }

  return (
    <div>
      <h1 className="text-2xl font-bold dark:text-white mb-6">Reviews Management</h1>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-2xl font-bold dark:text-white">{stats.total}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Reviews</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Pending</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Approved</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-2xl font-bold dark:text-white">{stats.average.toFixed(1)}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Avg Rating</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {(['all', 'pending', 'approved'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-gray-900 text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Reviews Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Rating</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Review</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" /></td>
                  </tr>
                ))
              ) : filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No reviews found
                  </td>
                </tr>
              ) : (
                filteredReviews.map(review => (
                  <tr key={review.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium dark:text-white">{review.product_id.slice(0, 8)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm dark:text-white">{review.customer_name}</div>
                      <div className="text-xs text-gray-500">{review.customer_email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm dark:text-white max-w-xs truncate">{review.comment}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        review.is_approved
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        {review.is_approved ? (
                          <><Check className="w-3 h-3" /> Approved</>
                        ) : (
                          <><Eye className="w-3 h-3" /> Pending</>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {!review.is_approved && (
                          <button
                            onClick={() => handleApprove(review.id, true)}
                            className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        {review.is_approved && (
                          <button
                            onClick={() => handleApprove(review.id, false)}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(review.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}