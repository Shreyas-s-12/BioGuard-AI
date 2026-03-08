import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    name: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleMethodSelect = (method) => {
    setLoginMethod(method);
    setFormData({ email: '', phone: '', name: '' });
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = () => {
    setIsLoading(true);
    // Store user in localStorage
    setTimeout(() => {
      const user = {
        name: formData.name || (formData.email ? formData.email.split('@')[0] : 'User'),
        email: formData.email || '',
        phone: formData.phone || '',
        loginMethod: loginMethod,
        loginTime: new Date().toISOString()
      };
      localStorage.setItem('user', JSON.stringify(user));
      setIsLoading(false);
      navigate('/');
    }, 800);
  };

  const handleBack = () => {
    setLoginMethod(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-nutri-primary to-nutri-accent rounded-2xl flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold gradient-text">NutriGuard AI</h1>
          <p className="text-slate-400 mt-2">Smart Food Safety Platform</p>
        </div>

        {/* Login Card */}
        <div className="glass rounded-2xl p-8">
          {!loginMethod ? (
            <>
              <h2 className="text-2xl font-bold mb-6 text-center">Welcome Back</h2>
              <p className="text-slate-400 text-center mb-8">Sign in to access your analysis history</p>
              
              <div className="space-y-4">
                {/* Google Login */}
                <button
                  onClick={() => handleMethodSelect('google')}
                  className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-white text-gray-800 font-semibold rounded-xl hover:bg-gray-100 transition"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Gmail Login */}
                <button
                  onClick={() => handleMethodSelect('gmail')}
                  className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-nutri-primary text-white font-semibold rounded-xl hover:opacity-90 transition"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
                  </svg>
                  <span>Continue with Gmail</span>
                </button>

                {/* Mobile Number Login */}
                <button
                  onClick={() => handleMethodSelect('mobile')}
                  className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-slate-700 text-white font-semibold rounded-xl hover:bg-slate-600 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span>Continue with Mobile Number</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={handleBack}
                className="flex items-center text-slate-400 hover:text-white mb-6 transition"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>

              <h2 className="text-2xl font-bold mb-6 text-center">
                {loginMethod === 'google' && 'Sign in with Google'}
                {loginMethod === 'gmail' && 'Sign in with Gmail'}
                {loginMethod === 'mobile' && 'Sign in with Mobile'}
              </h2>

              <div className="space-y-4">
                {loginMethod !== 'mobile' ? (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your name"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg focus:border-nutri-primary focus:ring-1 focus:ring-nutri-primary outline-none transition mb-4"
                    />
                    <label className="block text-sm font-medium mb-2 text-slate-300">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder={loginMethod === 'google' ? 'Enter your Google email' : 'Enter your Gmail address'}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg focus:border-nutri-primary focus:ring-1 focus:ring-nutri-primary outline-none transition"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your name"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg focus:border-nutri-primary focus:ring-1 focus:ring-nutri-primary outline-none transition mb-4"
                    />
                    <label className="block text-sm font-medium mb-2 text-slate-300">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 XXXXXXXXXX"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg focus:border-nutri-primary focus:ring-1 focus:ring-nutri-primary outline-none transition"
                    />
                  </div>
                )}

                <button
                  onClick={handleLogin}
                  disabled={isLoading || (!formData.email && !formData.phone)}
                  className="w-full py-3 bg-gradient-to-r from-nutri-primary to-nutri-secondary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <div className="spinner w-5 h-5 mr-2"></div>
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-8">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}

export default Login;
