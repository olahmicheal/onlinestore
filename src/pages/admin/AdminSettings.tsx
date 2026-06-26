import { useState, useEffect } from 'react'
import { Save, Store, Bell, Shield, LogOut, CreditCard, MessageCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { db, type StoreSettings, type PaymentSettings } from '../../lib/supabase'
import toast from 'react-hot-toast'

export default function AdminSettings() {
  const { logout } = useAuth()

  // Store settings
  const [storeName, setStoreName] = useState('Your Store')
  const [whatsappNumber, setWhatsappNumber] = useState('2348012345678')
  const [currency, setCurrency] = useState('NGN')

  // Payment settings
  const [bankName, setBankName] = useState('First Bank')
  const [accountName, setAccountName] = useState('Your Store Ltd')
  const [accountNumber, setAccountNumber] = useState('1234567890')
  const [additionalInfo, setAdditionalInfo] = useState('Please include your order ID as reference')

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [orderNotifications, setOrderNotifications] = useState(true)

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const store = await db.getSettings('store') as StoreSettings
      const payment = await db.getSettings('payment') as PaymentSettings

      if (store) {
        setStoreName(store.name || 'Your Store')
        setWhatsappNumber(store.whatsapp || '2348012345678')
        setCurrency(store.currency || 'NGN')
      }

      if (payment) {
        setBankName(payment.bank_name || 'First Bank')
        setAccountName(payment.account_name || 'Your Store Ltd')
        setAccountNumber(payment.account_number || '1234567890')
        setAdditionalInfo(payment.additional_info || 'Please include your order ID as reference')
      }
    } catch (err) {
      console.error('Failed to load settings:', err)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await db.updateSettings('store', {
        name: storeName,
        whatsapp: whatsappNumber,
        currency,
      })

      await db.updateSettings('payment', {
        bank_name: bankName,
        account_name: accountName,
        account_number: accountNumber,
        additional_info: additionalInfo,
      })

      toast.success('Settings saved!')
    } catch (err) {
      toast.error('Failed to save settings')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
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
              <label className="text-sm font-medium dark:text-gray-300 flex items-center gap-1">
                <MessageCircle className="w-3 h-3" /> WhatsApp Number
              </label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={e => setWhatsappNumber(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="2348012345678"
              />
              <p className="text-xs text-gray-500 mt-1">Format: 2348012345678 (no + sign)</p>
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

        {/* Payment Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="font-semibold dark:text-white">Payment Details</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium dark:text-gray-300">Bank Name</label>
              <input
                type="text"
                value={bankName}
                onChange={e => setBankName(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="First Bank"
              />
            </div>
            <div>
              <label className="text-sm font-medium dark:text-gray-300">Account Name</label>
              <input
                type="text"
                value={accountName}
                onChange={e => setAccountName(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="Your Store Ltd"
              />
            </div>
            <div>
              <label className="text-sm font-medium dark:text-gray-300">Account Number</label>
              <input
                type="text"
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="1234567890"
              />
            </div>
            <div>
              <label className="text-sm font-medium dark:text-gray-300">Additional Info</label>
              <textarea
                value={additionalInfo}
                onChange={e => setAdditionalInfo(e.target.value)}
                rows={2}
                className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="Instructions for customers..."
              />
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

          <button className="text-sm text-blue-600 hover:underline mb-4 block">
            Change admin password
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}