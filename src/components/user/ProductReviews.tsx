import { useState, useEffect } from 'react'
import { Star, Send, User } from 'lucide-react'
import { db, type Review } from '../../lib/supabase'
import toast from 'react-hot-toast'

interface ProductReviewsProps {
  productId: string
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Review form
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [hoverRating, setHoverRating] = useState(0)

  useEffect(() => {
    loadReviews()
  }, [productId])

  const loadReviews = async () => {
    try {
      setLoading(true)
      const data = await db.getProductReviews(productId)
      setReviews(data)
    } catch (err) {
      console.error('Failed to load reviews:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !comment.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    setSubmitting(true)
    try {
      await db.createReview({
        product_id: productId,
        customer_name: name,
        customer_email: email,
        rating,
        comment,
      })
      toast.success('Review submitted! It will appear after approval.')
      setName('')
      setEmail('')
      setRating(5)
      setComment('')
      await loadReviews()
    } catch (err) {
      toast.error('Failed to submit review')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 : 0
  }))

  return (
    <div className="mt-8 pt-8 border-t border-lit-border dark:border-nova-border">
      <h3 className="text-xl font-semibold dark:text-white mb-6">Customer Reviews</h3>

      {/* Rating Summary */}
      <div className="flex items-center gap-6 mb-8">
        <div className="text-center">
          <div className="text-4xl font-bold dark:text-white">{averageRating.toFixed(1)}</div>
          <div className="flex gap-0.5 mt-1">
            {[1, 2, 3, 4, 5].map(star => (
              <Star
                key={star}
                className={`w-4 h-4 ${star <= Math.round(averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
              />
            ))}
          </div>
          <div className="text-xs text-gray-500 mt-1">{reviews.length} reviews</div>
        </div>

        <div className="flex-1 space-y-1">
          {ratingCounts.map(({ star, count, percentage }) => (
            <div key={star} className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-3">{star}</span>
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 w-6 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review List */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4 mb-8">
          {reviews.map(review => (
            <div key={review.id} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <div className="font-medium text-sm dark:text-white">{review.customer_name}</div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className={`w-3 h-3 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="ml-auto text-xs text-gray-400">
                  {new Date(review.created_at).toLocaleDateString()}
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">{review.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">No reviews yet. Be the first to review!</p>
      )}

      {/* Submit Review Form */}
      <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
        <h4 className="font-medium dark:text-white mb-4">Write a Review</h4>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400">Name</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full mt-1 px-3 py-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full mt-1 px-3 py-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400">Rating</label>
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1"
                >
                  <Star
                    className={`w-6 h-6 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400">Review</label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              required
              rows={3}
              className="w-full mt-1 px-3 py-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Share your experience with this product..."
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-4 py-2 bg-lit-accent dark:bg-nova-accent text-white rounded-lg hover:opacity-90 disabled:opacity-50 text-sm"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  )
}