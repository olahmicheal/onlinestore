import { Outlet } from 'react-router-dom'
import AppHeader from './AppHeader'
import CartDrawer from './CartDrawer'
import WhatsAppFloat from './WhatsAppFloat'
import SiteFooter from './SiteFooter'

export default function UserLayout() {
  return (
    <div className="min-h-screen bg-lit-bg dark:bg-nova-bg text-lit-text dark:text-nova-text transition-colors duration-300">
      <AppHeader />
      <main>
        <Outlet />
      </main>
      <CartDrawer />
      <WhatsAppFloat />
      <SiteFooter />
    </div>
  )
}
