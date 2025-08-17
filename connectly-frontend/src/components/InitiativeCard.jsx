// src/components/InitiativeCard.jsx
import { joinInitiative } from '../services/apiService';

// The component now accepts the 'onJoinSuccess' function as a prop
function InitiativeCard({ initiative, onJoinSuccess }) {
  const participantCount = initiative.participants?.length || 0;

  const handleJoinClick = async () => {
    const name = prompt("Please enter your name to join:");
    if (name) {
      try {
        await joinInitiative(initiative.id, name);
        alert("Thanks for joining!");
        onJoinSuccess(); // Trigger the data refresh in the App component
      } catch (error) {
        console.error("Failed to join:", error);
        alert("Error: Could not join the initiative.");
      }
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6 flex flex-col">
      <h2 className="text-xl font-bold text-gray-800 mb-2">{initiative.title}</h2>
      <p className="text-sm text-gray-500 mb-4">
        Posted by: <span className="font-semibold">{initiative.creator_name}</span>
      </p>
      <p className="text-gray-700 flex-grow mb-4">{initiative.description}</p>
      
      {initiative.location && (
        <p className="text-sm text-gray-600 mb-4">
          📍 {initiative.location}
        </p>
      )}

      <div className="mt-auto pt-4 border-t border-gray-200">
        <p className="font-semibold text-gray-800 mb-3">
          {participantCount} {participantCount === 1 ? 'person is' : 'people are'} in!
        </p>
        <button 
          onClick={handleJoinClick}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold"
        >
          I'm In!
        </button>
      </div>
    </div>
  );
}

export default InitiativeCard;