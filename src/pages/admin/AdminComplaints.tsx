import { useState, useEffect } from 'react'
import { Mail, User, Clock } from 'lucide-react'
import { db, type Complaint } from '../../lib/supabase'
import { formatDateTime } from '../../lib/utils'

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadComplaints()
  }, [])

  const loadComplaints = async () => {
    try {
      setLoading(true)
      const data = await db.getComplaints()
      setComplaints(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (id: string, status: Complaint['status']) => {
    try {
      await db.updateComplaintStatus(id, status)
      loadComplaints()
    } catch (err) {
      console.error(err)
    }
  }

  const statusColors: Record<string, string> = {
    open: 'bg-red-100 text-red-700',
    in_progress: 'bg-yellow-100 text-yellow-700',
    resolved: 'bg-green-100 text-green-700',
    closed: 'bg-gray-100 text-gray-600',
  }

  return (
    <div>
      <h1 className="text-2xl font-bold dark:text-white mb-6">Complaints</h1>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-8 text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            No complaints yet
          </div>
        ) : (
          complaints.map(complaint => (
            <div key={complaint.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium dark:text-white">{complaint.customer_name}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Mail className="w-3 h-3" />
                      <span>{complaint.customer_email}</span>
                    </div>
                  </div>
                </div>
                <select
                  value={complaint.status}
                  onChange={e => handleStatusUpdate(complaint.id, e.target.value as Complaint['status'])}
                  className={`text-xs font-medium rounded-full px-3 py-1 border-0 cursor-pointer ${statusColors[complaint.status]}`}
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mt-3">
                <p className="font-medium text-sm mb-1 dark:text-white">{complaint.subject}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{complaint.message}</p>
              </div>

              {complaint.order_id && (
                <p className="text-xs text-gray-400 mt-3">Related Order: {complaint.order_id}</p>
              )}

              <div className="flex items-center gap-1 text-xs text-gray-400 mt-3">
                <Clock className="w-3 h-3" />
                <span>{formatDateTime(complaint.created_at)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
