const API_URL = import.meta.env.VITE_API_URL || ""

export default function LoginPage() {
  const handleLogin = () => {
    window.location.href = `${API_URL}/auth/login`
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-6">Pair Scheduling</h1>
      <p className="text-sm text-gray-500 mb-6">Book 1:1 sessions with volunteers</p>
      <button
        onClick={handleLogin}
        className="border rounded px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer"
      >
        Sign in with Google
      </button>
    </div>
  )
}
