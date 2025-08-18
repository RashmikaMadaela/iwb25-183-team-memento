import InitiativeForm from '../components/InitiativeForm.jsx';

function CreateInitiativePage({ onInitiativeCreated, setView }) {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => setView('initiatives')} className="text-blue-600 hover:underline mb-4">
              &larr; Back to all initiatives
          </button>
          <InitiativeForm onInitiativeCreated={onInitiativeCreated} />
        </div>
      </div>
    </div>
  );
}

export default CreateInitiativePage;