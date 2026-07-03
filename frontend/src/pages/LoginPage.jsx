const API_URL = import.meta.env.VITE_API_URL || ""

export default function LoginPage() {
  const handleLogin = () => {
    window.location.href = `${API_URL}/auth/login`
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Pair Scheduling
        </h1>
        <p className="text-gray-600 mb-8">
          Book 1:1 sessions with volunteers
        </p>
        <button
          onClick={handleLogin}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  )
}
