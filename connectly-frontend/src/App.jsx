// src/App.jsx
import { useState, useEffect, useCallback } from 'react'; // Add useCallback
import InitiativeCard from './components/InitiativeCard.jsx';
import InitiativeForm from './components/InitiativeForm.jsx';
import { getInitiatives } from './services/apiService';

function App() {
  const [initiatives, setInitiatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // We define fetchInitiatives so we can reuse it
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
    fetchInitiatives();
  }, [fetchInitiatives]);

  const handleInitiativeCreated = (newInitiative) => {
    // Re-fetch the full list to get the latest data from the database
    fetchInitiatives();
  };

  return (
    <main className="bg-gray-50 min-h-screen">
      <div className="container mx-auto p-4 md:p-8">
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Connectly
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Community initiatives, right in your neighborhood.
          </p>
        </header>

        <InitiativeForm onInitiativeCreated={handleInitiativeCreated} />
        
        {loading && <p className="text-center">Loading initiatives...</p>}
        {error && <p className="text-center text-red-500">Error: {error}</p>}
        
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {initiatives.map((initiative) => (
              <InitiativeCard 
                key={initiative.id} 
                initiative={initiative} 
                onJoinSuccess={fetchInitiatives} // Pass the refresh function to each card
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default App;