import { useState } from 'react'

// Login Component with Google, Gmail, and Mobile Number login options
function Login({ onLogin }) {
  const [loginMethod, setLoginMethod] = useState(null)
  const [mobileNumber, setMobileNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleGoogleLogin = () => {
    // Dummy Google login - simulate authentication
    setTimeout(() => {
      onLogin({ method: 'google', name: 'Google User' })
    }, 500)
  }

  const handleGmailLogin = () => {
    setLoginMethod('gmail')
  }

  const handleMobileLogin = () => {
    setLoginMethod('mobile')
  }

  const handleGmailSubmit = (e) => {
    e.preventDefault()
    // Dummy Gmail login - simulate authentication
    setTimeout(() => {
      onLogin({ method: 'gmail', email: email || 'user@gmail.com', name: 'Gmail User' })
    }, 500)
  }

  const handleMobileSubmit = (e) => {
    e.preventDefault()
    if (!showOtpInput) {
      // Send OTP (simulated)
      setShowOtpInput(true)
    } else {
      // Verify OTP (simulated - accepts any 6-digit code)
      if (otp.length === 6) {
        onLogin({ method: 'mobile', phone: mobileNumber, name: 'Mobile User' })
      }
    }
  }

  const handleBack = () => {
    setLoginMethod(null)
    setShowOtpInput(false)
    setMobileNumber('')
    setOtp('')
    setEmail('')
    setPassword('')
  }

  // Show login method selection
  if (!loginMethod) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
        <div className="glass rounded-2xl p-8 w-full max-w-md">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-nutri-primary to-nutri-accent rounded-2xl flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold gradient-text mb-2">NutriGuard AI</h1>
            <p className="text-slate-400">Smart Food Safety Platform</p>
          </div>

          <h2 className="text-xl font-semibold text-center mb-6">Welcome Back</h2>

          {/* Login Options */}
          <div className="space-y-4">
            {/* Google Login */}
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center px-4 py-3 bg-white hover:bg-gray-100 text-gray-800 font-medium rounded-lg transition group"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            {/* Gmail Login */}
            <button
              onClick={handleGmailLogin}
              className="w-full flex items-center justify-center px-4 py-3 bg-nutri-primary hover:bg-nutri-primary/80 text-white font-medium rounded-lg transition"
            >
              <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
              </svg>
              Continue with Gmail
            </button>

            {/* Mobile Number Login */}
            <button
              onClick={handleMobileLogin}
              className="w-full flex items-center justify-center px-4 py-3 bg-nutri-secondary hover:bg-nutri-secondary/80 text-white font-medium rounded-lg transition"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Continue with Mobile Number
            </button>
          </div>

          <p className="text-slate-500 text-center text-sm mt-6">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    )
  }

  // Gmail Login Form
  if (loginMethod === 'gmail') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
        <div className="glass rounded-2xl p-8 w-full max-w-md">
          <button
            onClick={handleBack}
            className="flex items-center text-slate-400 hover:text-white mb-6 transition"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto mb-4 bg-nutri-primary rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold">Sign in with Gmail</h2>
            <p className="text-slate-400 mt-2">Enter your Gmail credentials</p>
          </div>

          <form onSubmit={handleGmailSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@gmail.com"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg focus:border-nutri-primary focus:ring-1 focus:ring-nutri-primary outline-none transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg focus:border-nutri-primary focus:ring-1 focus:ring-nutri-primary outline-none transition"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-nutri-primary hover:bg-nutri-primary/80 text-white font-semibold rounded-lg transition"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Mobile Number Login Form
  if (loginMethod === 'mobile') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
        <div className="glass rounded-2xl p-8 w-full max-w-md">
          <button
            onClick={handleBack}
            className="flex items-center text-slate-400 hover:text-white mb-6 transition"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto mb-4 bg-nutri-secondary rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold">Sign in with Mobile</h2>
            <p className="text-slate-400 mt-2">
              {showOtpInput ? 'Enter the OTP sent to your phone' : 'Enter your mobile number'}
            </p>
          </div>

          <form onSubmit={handleMobileSubmit} className="space-y-4">
            {!showOtpInput ? (
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">Mobile Number</label>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="+1 234 567 8900"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg focus:border-nutri-secondary focus:ring-1 focus:ring-nutri-secondary outline-none transition"
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">One-Time Password (OTP)</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg focus:border-nutri-secondary focus:ring-1 focus:ring-nutri-secondary outline-none transition text-center text-2xl tracking-widest"
                  maxLength={6}
                  required
                />
                <p className="text-slate-500 text-sm mt-2">OTP sent to {mobileNumber}</p>
              </div>
            )}
            <button
              type="submit"
              className="w-full py-3 bg-nutri-secondary hover:bg-nutri-secondary/80 text-white font-semibold rounded-lg transition"
            >
              {showOtpInput ? 'Verify OTP' : 'Send OTP'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return null
}

export default Login
