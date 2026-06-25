import { Link } from 'react-router-dom'
import { Store, Instagram, Twitter, Facebook, Mail, MapPin, Phone, ArrowRight } from 'lucide-react'

export default function SiteFooter() {
  return (
    <footer className="border-t border-lit-border dark:border-nova-border bg-lit-surface dark:bg-nova-surface">
      {/* Main Footer */}
      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Store className="w-6 h-6 dark:text-white" />
              <span className="font-bold text-lg dark:text-white">STORE</span>
            </Link>
            <p className="text-sm text-lit-dim dark:text-nova-dim leading-relaxed">
              Premium streetwear and accessories. Quality meets style in every piece we create.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="w-9 h-9 rounded-full bg-lit-border/50 dark:bg-nova-border/50 flex items-center justify-center hover:bg-lit-accent dark:hover:bg-nova-accent hover:text-white transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-lit-border/50 dark:bg-nova-border/50 flex items-center justify-center hover:bg-lit-accent dark:hover:bg-nova-accent hover:text-white transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-lit-border/50 dark:bg-nova-border/50 flex items-center justify-center hover:bg-lit-accent dark:hover:bg-nova-accent hover:text-white transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold dark:text-white mb-4">Quick Links</h3>
            <nav className="flex flex-col gap-2">
              <Link to="/" className="text-sm text-lit-dim dark:text-nova-dim hover:text-lit-text dark:hover:text-nova-text transition-colors">Home</Link>
              <Link to="/" className="text-sm text-lit-dim dark:text-nova-dim hover:text-lit-text dark:hover:text-nova-text transition-colors">Shop All</Link>
              <Link to="/" className="text-sm text-lit-dim dark:text-nova-dim hover:text-lit-text dark:hover:text-nova-text transition-colors">New Arrivals</Link>
              <Link to="/" className="text-sm text-lit-dim dark:text-nova-dim hover:text-lit-text dark:hover:text-nova-text transition-colors">Sale</Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold dark:text-white mb-4">Contact Us</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-lit-dim dark:text-nova-dim">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>Lagos, Nigeria</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-lit-dim dark:text-nova-dim">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>+234 801 234 5678</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-lit-dim dark:text-nova-dim">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>hello@yourstore.com</span>
              </div>
            </div>

            {/* Newsletter */}
            <div className="mt-4">
              <p className="text-xs text-lit-dim dark:text-nova-dim mb-2">Subscribe for updates</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 text-sm border border-lit-border dark:border-nova-border rounded-lg bg-transparent dark:text-white focus:outline-none focus:ring-1 focus:ring-lit-accent dark:focus:ring-nova-accent"
                />
                <button className="px-3 py-2 bg-lit-accent dark:bg-nova-accent text-white rounded-lg hover:opacity-90 transition-opacity">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-lit-border dark:border-nova-border">
        <div className="max-w-xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-lit-dim dark:text-nova-dim">
            &copy; {new Date().getFullYear()} Your Store. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link to="/" className="text-xs text-lit-dim dark:text-nova-dim hover:text-lit-text dark:hover:text-nova-text transition-colors">Privacy Policy</Link>
            <Link to="/" className="text-xs text-lit-dim dark:text-nova-dim hover:text-lit-text dark:hover:text-nova-text transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
