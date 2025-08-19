import { joinInitiative } from '../services/apiService';

function formatDate(dateString) {
  if (!dateString) return null;
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

function InitiativeCard({ initiative, user, navigateToLogin, onJoinSuccess }) {
  const participantCount = initiative.participants?.length || 0;
  const eventDate = formatDate(initiative.event_date);
  const hasJoined = user && initiative.participants 
    ? initiative.participants.some(p => p.participant_name === user.name) 
    : false;

  const handleJoinClick = async () => {
    if (!user) {
      navigateToLogin();
      return;
    }
    if (hasJoined) return;

    try {
      await joinInitiative(initiative.id);
      // This is the key: call the function passed from App.jsx to trigger a refresh.
      onJoinSuccess();
    } catch (error) {
      console.error("Failed to join:", error);
      alert(error.message);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full">
      {/* Main Content */}
      <div className="flex-grow">
        <p className="text-sm font-semibold text-blue-600 mb-1">{initiative.creator_name}</p>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{initiative.title}</h3>
        <p className="text-gray-600 text-sm mb-4">{initiative.description}</p>
      </div>

      {/* Footer with Details */}
      <div className="pt-4 border-t border-gray-100 space-y-3">
        {initiative.location && (
          <p className="text-sm text-gray-500 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
            </svg>
            {initiative.location}
          </p>
        )}
        {eventDate && (
           <p className="text-sm text-gray-500 flex items-center">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            {eventDate}
           </p>
        )}
        <p className="text-sm font-medium text-gray-800">
          {participantCount} {participantCount === 1 ? 'person is' : 'people are'} in!
        </p>

        {/* Conditional Buttons */}
        {user && user.role === 'volunteer' && (
            <button
                onClick={handleJoinClick}
                disabled={hasJoined}
                className={`w-full mt-2 text-white px-4 py-2 rounded-lg font-semibold transition-colors ${
                  hasJoined 
                    ? 'bg-green-500 cursor-not-allowed' 
                    : 'bg-blue-700 hover:bg-blue-600'
                }`}
            >
                {hasJoined ? 'Joined!' : "I'm In!"}
            </button>
        )}
        {!user && (
            <button
                onClick={navigateToLogin}
                className="w-full mt-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
            >
                Login to Join
            </button>
        )}
      </div>
    </div>
  );
}

export default InitiativeCard;