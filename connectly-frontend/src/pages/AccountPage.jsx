import { useEffect, useState } from 'react';
import { getAccount, leaveInitiative, deleteInitiative } from '../services/apiService';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

function AccountPage({ setView }) {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAccount = async () => {
    setLoading(true);
    try {
      const data = await getAccount();
      setAccount(data);
    } catch (err) {
      setError(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAccount(); }, []);

  const handleLeave = async (initiativeId) => {
    try {
      await leaveInitiative(initiativeId);
      await fetchAccount();
    } catch (err) {
      alert(err.message || 'Could not leave');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this initiative? This cannot be undone.')) return;
    try {
      await deleteInitiative(id);
      await fetchAccount();
    } catch (err) {
      alert(err.message || 'Could not delete');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  const user = account.user;
  const initiatives = account.initiatives || [];

  return (
    <>
      <Navbar onLoginClick={() => setView('login')} onRegisterClick={() => setView('register')} onLogout={() => setView('initiatives')} onHomeClick={() => setView('initiatives')} onAccountClick={() => setView('account')} />
      <div className="container mx-auto px-4 py-8 pb-20">
        <h1 className="text-2xl font-bold mb-4">Account</h1>
        <p className="mb-6">Logged in as <strong>{user.name}</strong> ({user.role})</p>

      {user.role === 'volunteer' && (
        <div>
          <h2 className="text-xl font-semibold mb-3">Joined initiatives</h2>
          {initiatives.length === 0 && <p>No joined initiatives yet.</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {initiatives.map((it) => (
              <div key={it.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full">
                <div className="flex-grow">
                  <p className="text-sm font-semibold text-blue-600 mb-1">{it.creator_name}</p>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{it.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{it.description}</p>
                </div>
                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <p className="text-sm font-medium text-gray-800">{(it.participants ?? []).length} {(it.participants ?? []).length === 1 ? 'person' : 'people'} are in</p>
                  <div>
                    <button onClick={() => handleLeave(it.id)} className="w-full px-4 py-2 bg-red-600 text-white rounded">Leave</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {user.role === 'organization' && (
        <div>
          <h2 className="text-xl font-semibold mb-3">Your initiatives</h2>
          <div className="mb-4">
            <button onClick={() => setView('create_initiative')} className="px-4 py-2 bg-blue-600 text-white rounded">Create New Initiative</button>
          </div>
          {initiatives.length === 0 && <p>No initiatives yet.</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {initiatives.map((it) => (
              <div key={it.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full">
                <div className="flex-grow">
                  <p className="text-sm font-semibold text-blue-600 mb-1">{it.creator_name}</p>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{it.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{it.description}</p>
                </div>
                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <p className="text-sm font-medium text-gray-800">{(it.participants ?? []).length} {(it.participants ?? []).length === 1 ? 'person' : 'people'} are in</p>
                  <div className="flex space-x-2">
                    <button onClick={() => handleDelete(it.id)} className="px-3 py-2 bg-red-600 text-white rounded">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
      <Footer />
    </>
  );
}

export default AccountPage;
