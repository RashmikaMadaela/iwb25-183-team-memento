import { useState } from 'react';
//import { register } from '../services/apiService';

function RegisterPage({ setView }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'volunteer', // Default role
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

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      setSuccess("Registration successful! Please log in.");
      setTimeout(() => setView('login'), 2000);
    } catch (err) {
      setError(err.message);
    }
  };
  
  // --- START NEW LOGIC ---
  // Conditionally set the label and placeholder based on the selected role
  const nameLabel = formData.role === 'organization' ? 'Organization Name' : 'Full Name';
  const namePlaceholder = formData.role === 'organization' ? 'Enter your organization name' : 'Enter your full name';
  // --- END NEW LOGIC ---

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                {/* --- START NEW CODE --- */}
        <div className="text-left">
          <button onClick={() => setView('initiatives')} className="text-sm font-medium text-blue-600 hover:underline">
            &larr; Back to Initiatives
          </button>
        </div>
        {/* --- END NEW CODE --- */}
        <h2 className="text-3xl font-bold text-center text-gray-900">Create an Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">I am a...</label>
            <select name="role" onChange={handleInputChange} value={formData.role} className="w-full px-3 py-3 border border-gray-200 bg-gray-100 rounded-md text-gray-900">
              <option value="volunteer">Volunteer</option>
              <option value="organization">Organization</option>
            </select>
          </div>

          <div>
            <input id="name" name="name" placeholder={namePlaceholder} required onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 bg-gray-100 rounded-md text-gray-900 placeholder:text-gray-500" />
          </div>

          <input name="email" type="email" placeholder="Enter your email" required onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 bg-gray-100 rounded-md text-gray-900 placeholder:text-gray-500" />
          <input name="password" type="password" placeholder="Create a password" required onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 bg-gray-100 rounded-md text-gray-900 placeholder:text-gray-500" />
          <input name="confirmPassword" type="password" placeholder="Confirm your password" required onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 bg-gray-100 rounded-md text-gray-900 placeholder:text-gray-500" />
          
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          {success && <p className="text-sm text-green-600 text-center">{success}</p>}

          <button type="submit" className="w-full py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 font-semibold">
            Register
          </button>
          <p className="text-sm text-center text-gray-600">
            Already have an account?{' '}
            <button type="button" onClick={() => setView('login')} className="font-medium text-blue-600 hover:underline">
              Login
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;