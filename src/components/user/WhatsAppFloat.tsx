import { MessageCircle } from 'lucide-react'

export default function WhatsAppFloat() {
  return (
    <a
      href="https://wa.me/2348012345678"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25d366] text-white px-4 py-3 rounded-full shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:-translate-y-0.5 transition-all duration-300"
    >
      <MessageCircle className="w-5 h-5 fill-white" />
      <span className="font-medium text-sm">Chat with us</span>
    </a>
  )
}
