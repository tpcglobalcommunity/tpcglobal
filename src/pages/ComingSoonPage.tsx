import { useNavigate } from 'react-router-dom'

export default function ComingSoonPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-yellow-400">
          Coming Soon
        </h1>
        <p className="text-xl text-gray-300 mb-12">
          This page is being prepared.
        </p>
        
        <button
          onClick={() => navigate('/id')}
          className="px-8 py-4 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  )
}
