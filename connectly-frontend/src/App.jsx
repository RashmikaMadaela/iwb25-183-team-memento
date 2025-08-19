import { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import InitiativeCard from './components/InitiativeCard.jsx';
import LoginPage from './pages/LoginPage.jsx'; 
import RegisterPage from './pages/RegisterPage.jsx';
import CreateInitiativePage from './pages/CreateInitiativePage.jsx'; // Make sure this is imported
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

  // --- Main Content Logic ---
  if (view === 'login') {
    return <LoginPage onLoginSuccess={handleLoginSuccess} setView={setView} />;
  }
  if (view === 'register') {
    return <RegisterPage setView={setView} />;
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
        ) : (
          // Hero for Guests and Volunteers
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

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Initiatives</h2>
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
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
      </main>
      <Footer />
    </div>
  );
}

export default App;