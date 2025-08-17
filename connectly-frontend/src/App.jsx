import { useState, useEffect, useCallback } from 'react';
import InitiativeCard from './components/InitiativeCard.jsx';
import InitiativeForm from './components/InitiativeForm.jsx';
import { getInitiatives } from './services/apiService';
import LoginPage from './pages/LoginPage.jsx'; // <-- Import the new page

function App() {
  const [user, setUser] = useState(null); // <-- New state for the logged-in user
  const [initiatives, setInitiatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInitiatives = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getInitiatives();
      setInitiatives(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only fetch initiatives if a user is logged in
    if (user) {
      fetchInitiatives();
    }
  }, [user, fetchInitiatives]);

  const handleInitiativeCreated = (newInitiative) => {
    fetchInitiatives();
  };

  // --- START NEW LOGIC ---
  // If there is no user, show the login page
  if (!user) {
    // We will pass setUser to the login page in the next step to handle a successful login
    return <LoginPage onLoginSuccess={setUser} />; 
  }
  // --- END NEW LOGIC ---

  // If there IS a user, show the main application
  return (
    <main className="bg-gray-50 min-h-screen">
      <div className="container mx-auto p-4 md:p-8">
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Connectly
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Welcome, {user.name}!
          </p>
        </header>

        {/* Only show the form if the user is an organization */}
        {user.role === 'organization' && (
          <InitiativeForm onInitiativeCreated={handleInitiativeCreated} />
        )}
        
        {loading && <p className="text-center">Loading initiatives...</p>}
        {error && <p className="text-center text-red-500">Error: {error}</p>}
        
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {initiatives.map((initiative) => (
              <InitiativeCard 
                key={initiative.id} 
                initiative={initiative} 
                onJoinSuccess={fetchInitiatives}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default App;