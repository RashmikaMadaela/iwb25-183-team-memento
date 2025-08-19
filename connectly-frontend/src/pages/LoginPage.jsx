import { useState } from 'react';
import { login } from '../services/apiService';

function LoginPage({ onLoginSuccess, setView }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await login(email, password);
      // Save the session_id and user data to the browser's storage
      localStorage.setItem('session_id', data.session_id);
      localStorage.setItem('user', JSON.stringify(data.user));
      // Notify the main App component of the successful login
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <button onClick={() => setView('initiatives')} className="text-blue-600 hover:underline mb-4">
              &larr; Back to all initiatives
          </button>
        <h2 className="text-2xl font-bold text-center text-gray-900">Login to Connectly</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input fields remain the same */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Sign in
          </button>
           <p className="text-sm text-center">
                Don't have an account?{' '}
                <button type="button" onClick={() => setView('register')} className="font-medium text-blue-600 hover:underline">
                  Sign up
                </button>
              </p>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;