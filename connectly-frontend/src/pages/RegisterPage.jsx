import { useState } from 'react';
import { register } from '../services/apiService';

function RegisterPage({ setView }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'volunteer',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await register(formData);
      setSuccess("Registration successful! You can now log in.");
      // Redirect to login after a short delay
      setTimeout(() => setView('login'), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">Create an Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="name" placeholder="Full Name or Organization Name" required onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400" />
          <input name="email" type="email" placeholder="Email Address" required onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400" />
          <input name="password" type="password" placeholder="Password" required onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400" />
          <div>
            <label className="block text-sm font-medium text-gray-700">Register as a...</label>
            <select name="role" onChange={handleInputChange} value={formData.role} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md text-gray-900">
              <option value="volunteer">Volunteer</option>
              <option value="organization">Organization</option>
            </select>
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          {success && <p className="text-sm text-green-600 text-center">{success}</p>}

          <button type="submit" className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">
            Register
          </button>
          <p className="text-sm text-center">
            Already have an account?{' '}
            <button type="button" onClick={() => setView('login')} className="font-medium text-blue-600 hover:underline">
              Sign in
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;