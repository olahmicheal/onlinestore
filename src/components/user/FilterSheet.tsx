import { X } from 'lucide-react'

interface FilterSheetProps {
  isOpen: boolean
  onClose: () => void
  categories: string[]
  activeCategory: string
  onSelectCategory: (category: string) => void
}

export default function FilterSheet({ isOpen, onClose, categories, activeCategory, onSelectCategory }: FilterSheetProps) {
  if (!isOpen) return null

  const allCategories = ['all', ...categories]

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-[200] animate-fade-in"
        onClick={onClose}
      />
      <div className="fixed bottom-0 left-0 right-0 z-[201] bg-lit-surface dark:bg-nova-surface rounded-t-2xl max-w-xl mx-auto animate-slide-up">
        <div className="flex items-center justify-between p-4 border-b border-lit-border dark:border-nova-border">
          <h3 className="font-semibold dark:text-white">Filter and sort</h3>
          <button onClick={onClose} className="p-2">
            <X className="w-5 h-5 dark:text-white" />
          </button>
        </div>
        <div className="p-4">
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                onSelectCategory(cat)
                onClose()
              }}
              className="flex items-center justify-between w-full py-3 border-b border-lit-border dark:border-nova-border last:border-0"
            >
              <span className={`capitalize ${activeCategory === cat ? 'font-semibold dark:text-white' : 'dark:text-nova-dim'}`}>
                {cat === 'all' ? 'All Items' : cat}
              </span>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                activeCategory === cat 
                  ? 'bg-lit-accent dark:bg-nova-accent border-lit-accent dark:border-nova-accent' 
                  : 'border-lit-border dark:border-nova-border'
              }`}>
                {activeCategory === cat && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
