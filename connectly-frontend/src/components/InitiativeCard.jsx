// src/components/InitiativeCard.jsx

// This component receives a single 'initiative' object as a prop
function InitiativeCard({ initiative }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6 flex flex-col">
      <h2 className="text-xl font-bold text-gray-800 mb-2">{initiative.title}</h2>
      <p className="text-sm text-gray-500 mb-4">
        Posted by: <span className="font-semibold">{initiative.creator_name}</span>
      </p>
      <p className="text-gray-700 flex-grow">{initiative.description}</p>

      {initiative.location && (
        <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
          📍 {initiative.location}
        </div>
      )}
    </div>
  );
}

export default InitiativeCard;