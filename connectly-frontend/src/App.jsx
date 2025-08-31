import { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import InitiativeCard from './components/InitiativeCard.jsx';
import LoginPage from './pages/LoginPage.jsx'; 
import RegisterPage from './pages/RegisterPage.jsx';
import CreateInitiativePage from './pages/CreateInitiativePage.jsx'; // Make sure this is imported
import AccountPage from './pages/AccountPage.jsx';
import { getInitiatives } from './services/apiService.js';


function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('initiatives');
  const [initiatives, setInitiatives] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fetchInitiatives = useCallback(async (term = '') => {
    // We don't need to set loading to true here for re-fetches,
    // as it can cause a jarring flash of the "Loading..." text.
    try {
  const data = await getInitiatives(term);
      setInitiatives(data);
    } catch (err) {
      setError(err.message);
    } finally {
      // Only set initial loading to false.
      if (loading) setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    // Fetch initiatives on the initial load for everyone
    fetchInitiatives();
  }, []);

  useEffect(() => {
    // Re-fetch initiatives every time we navigate to the initiatives view
    if (view === 'initiatives') fetchInitiatives(searchTerm);
  }, [view]);

useEffect(() => {
    // Check if a user session exists in localStorage to stay logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleInitiativeCreated = () => {
    fetchInitiatives();
    setView('initiatives');
  };

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    setView('initiatives');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('session_id');
    setUser(null);
  };

  const handleAccountClick = () => setView('account');

  // --- Main Content Logic ---
  if (view === 'login') {
    return <LoginPage onLoginSuccess={handleLoginSuccess} setView={setView} />;
  }
  if (view === 'register') {
    return <RegisterPage setView={setView} />;
  }
  if (view === 'account') {
    return <AccountPage setView={setView} />;
  }
  if (view === 'create_initiative') {
    return <CreateInitiativePage onInitiativeCreated={handleInitiativeCreated} setView={setView} />;
  }
  return (
    <div className="bg-white min-h-screen pb-20">
      <Navbar 
        user={user}
        onLoginClick={() => setView('login')}
        onRegisterClick={() => setView('register')}
        onCreateClick={() => setView('create_initiative')} // Added for Navbar button
        onLogout={handleLogout}
        onHomeClick={() => setView('initiatives')}
        onAccountClick={handleAccountClick}
      />

  <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* --- START: Conditional Hero Section --- */}
        {user && user.role === 'organization' ? (
          // Hero for Organizations
          <div className="text-center my-8 md:my-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
              Post your new initiative
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
              Inspire change and rally volunteers for your cause.
            </p>
            <div className="mt-6">
              <button 
                onClick={() => setView('create_initiative')}
                className="bg-blue-600 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-blue-700 transition"
              >
                Create a New Initiative
              </button>
            </div>
          </div>
        ) : !user ? (
          // Hero for Guests (Non-logged in users)
          <div className="text-center my-12 md:my-20">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight leading-tight">
                Connect. <span className="text-blue-600">Contribute.</span> Change.
              </h1>
              <p className="mt-6 text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Join a community of passionate volunteers and organizations working together to create positive impact. 
                Find meaningful opportunities or share your cause with those who care.
              </p>
              
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button 
                  onClick={() => setView('register')}
                  className="bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  Start Volunteering
                </button>
                <button 
                  onClick={() => setView('login')}
                  className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-50 transform hover:scale-105 transition-all duration-200"
                >
                  Sign In
                </button>
              </div>
              
              <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="p-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">For Volunteers</h3>
                  <p className="text-gray-600">Discover meaningful opportunities that match your interests and schedule.</p>
                </div>
                
                <div className="p-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">For Organizations</h3>
                  <p className="text-gray-600">Reach dedicated volunteers and amplify your impact in the community.</p>
                </div>
                
                <div className="p-6">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Make Impact</h3>
                  <p className="text-gray-600">Together, we create lasting positive change in our communities.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Hero for Logged-in Volunteers
          <div className="text-center my-8 md:my-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
              Find your next volunteering opportunity
            </h1>
            <div className="mt-6 max-w-2xl mx-auto">
              <div className="flex items-center">
                <input 
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') fetchInitiatives(searchTerm); }}
                  placeholder="Search for initiatives..."
                  className="flex-1 px-5 py-3 border border-gray-300 rounded-l-full shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => fetchInitiatives(searchTerm)}
                  className="ml-2 bg-blue-600 text-white px-4 py-3 rounded-r-full font-semibold hover:bg-blue-700 transition"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        )}
        {/* --- END: Conditional Hero Section --- */}

        {/* The "Create Initiative" form is no longer here */}

        {/* Initiatives Section */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {!user ? "Discover Upcoming Initiatives" : "Upcoming Initiatives"}
            </h2>
            {!user && (
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Browse current volunteer opportunities and see how you can make a difference in your community.
              </p>
            )}
          </div>
          
          {loading && <p className="text-center">Loading...</p>}
          {error && <p className="text-red-500 text-center">{error}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {initiatives.map((initiative) => (
              <InitiativeCard 
                key={initiative.id} 
                initiative={initiative} 
                user={user}
                onJoinSuccess={fetchInitiatives}
                navigateToLogin={() => setView('login')}
              />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;