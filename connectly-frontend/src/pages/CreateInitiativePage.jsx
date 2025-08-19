import InitiativeForm from '../components/InitiativeForm.jsx';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

function CreateInitiativePage({ onInitiativeCreated, setView }) {
  return (
    <>
  <Navbar onLoginClick={() => setView('login')} onRegisterClick={() => setView('register')} onLogout={() => setView('initiatives')} onHomeClick={() => setView('initiatives')} />
  <div className="bg-gray-50 min-h-screen py-12 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <button onClick={() => setView('initiatives')} className="text-blue-600 hover:underline mb-4">
                &larr; Back to all initiatives
            </button>
            <InitiativeForm onInitiativeCreated={onInitiativeCreated} />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default CreateInitiativePage;