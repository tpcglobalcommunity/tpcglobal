import { useNavigate } from 'react-router-dom'
import { useParams } from 'react-router-dom'

export default function HomePage() {
  const { lang } = useParams()
  const navigate = useNavigate()

  const content = {
    id: {
      heroTitle: 'Selamat Datang di TPC Global',
      heroSubtitle: 'Platform terpercaya untuk transaksi digital Anda',
      buyButton: 'BuyTPC',
      transparencyButton: 'Transparency'
    },
    en: {
      heroTitle: 'Welcome to TPC Global',
      heroSubtitle: 'Your trusted platform for digital transactions',
      buyButton: 'BuyTPC',
      transparencyButton: 'Transparency'
    }
  }

  const currentContent = content[lang as 'id' | 'en'] || content.id

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-yellow-400 bg-clip-text text-transparent">
          {currentContent.heroTitle}
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-12">
          {currentContent.heroSubtitle}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/buy')}
            className="px-8 py-4 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition-colors"
          >
            {currentContent.buyButton}
          </button>
          <button
            onClick={() => navigate('/transparency')}
            className="px-8 py-4 border border-yellow-400 text-yellow-400 font-semibold rounded-lg hover:bg-yellow-400 hover:text-black transition-colors"
          >
            {currentContent.transparencyButton}
          </button>
        </div>
      </div>
    </div>
  )
}
