// src/App.jsx
import { useState, useEffect } from 'react';
import InitiativeCard from './components/InitiativeCard.jsx';
import InitiativeForm from './components/InitiativeForm.jsx';
import { getInitiatives } from './services/apiService';

function App() {
  const [initiatives, setInitiatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInitiatives = async () => {
      try {
        const data = await getInitiatives();
        setInitiatives(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInitiatives();
  }, []);

  // This function will be passed to the form component
  const handleInitiativeCreated = (newInitiative) => {
    // Add the new initiative to the top of the existing list
    setInitiatives([newInitiative, ...initiatives]);

    // A small improvement: Fetch the full, updated record from the backend
    // to get the real 'created_at' timestamp from the database.
    getInitiatives().then(setInitiatives).catch(console.error);
  };

  return (
    <main className="bg-gray-50 min-h-screen">
  <div className="w-full max-w-full mx-auto p-4 md:p-8">
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
              <InitiativeCard key={initiative.id} initiative={initiative} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default App;