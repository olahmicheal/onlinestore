import { useState, useEffect } from 'react'
import { Eye, Package } from 'lucide-react'
import { db, type Order } from '../../lib/supabase'
import { formatPrice, formatDateTime } from '../../lib/utils'

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const data = await db.getOrders()
      setOrders(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (id: string, status: Order['status']) => {
    try {
      await db.updateOrderStatus(id, status)
      loadOrders()
    } catch (err) {
      console.error(err)
    }
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  return (
    <div>
      <h1 className="text-2xl font-bold dark:text-white mb-6">Orders</h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Order</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Items</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">Loading...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">No orders yet</td></tr>
              ) : (
                orders.map(order => (
                  <tr key={order.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono dark:text-gray-300">{order.id.slice(0, 8)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium dark:text-white">{order.customer_name}</p>
                        <p className="text-xs text-gray-500">{order.customer_email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm dark:text-gray-300">{order.items.length} items</td>
                    <td className="px-4 py-3 text-sm font-semibold dark:text-white">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={e => handleStatusUpdate(order.id, e.target.value as Order['status'])}
                        className={`text-xs font-medium rounded-full px-2 py-1 border-0 cursor-pointer ${statusColors[order.status]}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{formatDateTime(order.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      >
                        <Eye className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="font-semibold dark:text-white">Order Details</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">✕</button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Order ID</p>
                  <p className="font-mono dark:text-white">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Date</p>
                  <p className="dark:text-white">{formatDateTime(selectedOrder.created_at)}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Customer</p>
                  <p className="dark:text-white">{selectedOrder.customer_name}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="dark:text-white">{selectedOrder.customer_phone}</p>
                </div>
              </div>

              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Shipping Address</p>
                <p className="text-sm dark:text-white">{selectedOrder.shipping_address}, {selectedOrder.city}, {selectedOrder.postal_code}</p>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="font-medium mb-2 dark:text-white">Items</p>
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-2">
                    <img src={item.image_url} alt={item.product_name} className="w-12 h-14 object-cover rounded-lg" />
                    <div className="flex-1">
                      <p className="text-sm font-medium dark:text-white">{item.product_name}</p>
                      <p className="text-xs text-gray-500">Size: {item.size} × {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold dark:text-white">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                  <span className="dark:text-white">{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Shipping</span>
                  <span className="dark:text-white">Free</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2">
                  <span className="dark:text-white">Total</span>
                  <span className="dark:text-white">{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
