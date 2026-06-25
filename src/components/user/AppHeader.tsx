import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, User, Menu, X, Sun, Moon, Store } from 'lucide-react'
import { useCart } from '../../contexts/CartContext'
import { useTheme } from '../../contexts/ThemeContext'

export default function AppHeader() {
  const { totalItems, setIsCartOpen } = useCart()
  const { theme, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-lit-bg/95 dark:bg-nova-bg/95 backdrop-blur-xl border-b border-lit-border dark:border-nova-border transition-colors duration-300">
      <div className="max-w-xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 leading-none">
          <Store className="w-6 h-6 dark:text-white" />
          <span className="font-bold text-lg tracking-tight dark:text-white">STORE</span>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-lit-border/50 dark:hover:bg-nova-border/50 transition-colors"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5 text-yellow-400" />
            )}
          </button>

          <button className="p-2">
            <User className="w-5 h-5 dark:text-white" />
          </button>

          <button 
            className="p-2 relative"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingBag className="w-5 h-5 dark:text-white" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-lit-accent dark:bg-nova-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>

          <button 
            className="p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <X className="w-5 h-5 dark:text-white" />
            ) : (
              <Menu className="w-5 h-5 dark:text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 right-0 bg-lit-surface dark:bg-nova-surface border-b border-lit-border dark:border-nova-border p-4 animate-fade-in">
          <nav className="flex flex-col gap-3">
            <Link to="/" className="py-2 font-medium dark:text-white" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link to="/" className="py-2 font-medium dark:text-white" onClick={() => setMenuOpen(false)}>Collections</Link>
            <Link to="/" className="py-2 font-medium dark:text-white" onClick={() => setMenuOpen(false)}>About</Link>
            <Link to="/" className="py-2 font-medium dark:text-white" onClick={() => setMenuOpen(false)}>Contact</Link>
          </nav>
        </div>
      )}
    </header>
  )
}