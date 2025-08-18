import { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import InitiativeCard from './components/InitiativeCard.jsx';
import LoginPage from './pages/LoginPage.jsx'; 
import RegisterPage from './pages/RegisterPage.jsx';
import CreateInitiativePage from './pages/CreateInitiativePage.jsx'; // Make sure this is imported

// --- Dummy Data (for UI development) ---
const DUMMY_INITIATIVES = [
  { id: 1, title: "Beach Cleanup", creator_name: "Ocean Conservancy", participants: new Array(15), description: "Test", location: "Moratuwa", event_date: "2025-09-15T09:00:00Z" },
  { id: 2, title: "Park Restoration", creator_name: "Green Spaces Initiative", participants: new Array(20), description: "Test2", location: "Colombo", event_date: "2025-09-15T09:00:00Z" },
  { id: 3, title: "Community Garden", creator_name: "Urban Harvest", participants: new Array(10), description: "Test1", location: "Kandy", event_date: "2025-09-15T09:00:00Z" }
];
const DUMMY_USER_VOLUNTEER = { name: "Alex the Volunteer", role: "volunteer" };
const DUMMY_USER_ORGANIZATION = { name: "Green Future Org", role: "organization" };

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('initiatives');
  const [initiatives, setInitiatives] = useState([]);
  
  useEffect(() => {
    setInitiatives(DUMMY_INITIATIVES);
  }, []);

  const handleInitiativeCreated = () => {
    // This function will be passed to the CreateInitiativePage
    // It will eventually re-fetch data and switch the view back
    alert("Initiative created successfully!"); // Placeholder
    setView('initiatives');
  };

  if (view === 'login') return <LoginPage setView={setView} onLoginSuccess={setUser} />;
  if (view === 'register') return <RegisterPage setView={setView} />;
  if (view === 'create_initiative') return <CreateInitiativePage setView={setView} onInitiativeCreated={handleInitiativeCreated} />;

  return (
    <div className="bg-white min-h-screen">
      <Navbar 
        user={user}
        onLoginClick={() => setView('login')}
        onRegisterClick={() => setView('register')}
        onCreateClick={() => setView('create_initiative')} // Added for Navbar button
        onLogout={() => setUser(null)}
      />
       {/* --- START: User Simulator --- */}
      <div className="bg-yellow-100 p-2 text-center text-sm text-yellow-800">
          <span className="font-semibold">Test Controls:</span>
          <button onClick={() => setUser(DUMMY_USER_VOLUNTEER)} className="ml-2 bg-gray-300 p-1 rounded">Login as Volunteer</button>
          <button onClick={() => setUser(DUMMY_USER_ORGANIZATION)} className="ml-2 bg-gray-300 p-1 rounded">Login as Organization</button>
          <button onClick={() => setUser(null)} className="ml-2 bg-gray-300 p-1 rounded">Logout (Guest)</button>
      </div>
      {/* --- END: User Simulator --- */}
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
              <input 
                type="search"
                placeholder="Search for initiatives..."
                className="w-full px-5 py-3 border border-gray-300 rounded-full shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
        {/* --- END: Conditional Hero Section --- */}

        {/* The "Create Initiative" form is no longer here */}

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Initiatives</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {initiatives.map((initiative) => (
            <InitiativeCard 
              key={initiative.id} 
              initiative={initiative} 
              user={user}
              navigateToLogin={() => setView('login')}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;