import { useState } from 'react'
import { Save, Store, Bell, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminSettings() {
  const [storeName, setStoreName] = useState('LIT GANG')
  const [whatsappNumber, setWhatsappNumber] = useState('2348012345678')
  const [currency, setCurrency] = useState('NGN')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [orderNotifications, setOrderNotifications] = useState(true)

  const handleSave = () => {
    toast.success('Settings saved!')
  }

  return (
    <div>
      <h1 className="text-2xl font-bold dark:text-white mb-6">Settings</h1>

      <div className="space-y-6 max-w-2xl">
        {/* Store Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="font-semibold dark:text-white">Store Settings</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium dark:text-gray-300">Store Name</label>
              <input
                type="text"
                value={storeName}
                onChange={e => setStoreName(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="text-sm font-medium dark:text-gray-300">WhatsApp Number</label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={e => setWhatsappNumber(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="text-sm font-medium dark:text-gray-300">Currency</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="NGN">Nigerian Naira (₦)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="GBP">British Pound (£)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="font-semibold dark:text-white">Notifications</h2>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm dark:text-gray-300">Email notifications</span>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={e => setEmailNotifications(e.target.checked)}
                className="w-4 h-4 rounded"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm dark:text-gray-300">New order alerts</span>
              <input
                type="checkbox"
                checked={orderNotifications}
                onChange={e => setOrderNotifications(e.target.checked)}
                className="w-4 h-4 rounded"
              />
            </label>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="font-semibold dark:text-white">Security</h2>
          </div>

          <button className="text-sm text-blue-600 hover:underline">
            Change admin password
          </button>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:opacity-90 transition-opacity"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>
    </div>
  )
}
