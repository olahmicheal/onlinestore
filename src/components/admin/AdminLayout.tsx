import { Outlet } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <AdminSidebar />
      <main className="flex-1 ml-0 lg:ml-64 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
