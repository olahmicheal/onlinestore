import { Lock } from 'lucide-react'

export default function SiteFooter() {
  return (
    <footer className="border-t border-lit-border dark:border-nova-border py-6">
      <div className="max-w-xl mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-1.5 text-lit-dim dark:text-nova-dim text-sm">
          <Lock className="w-3.5 h-3.5" />
          <span>litgangcollection.com</span>
        </div>
        <div className="w-32 h-1 bg-lit-text dark:bg-nova-text rounded-full mx-auto mt-4" />
      </div>
    </footer>
  )
}
