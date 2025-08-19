import { useState } from 'react';
import { createInitiative } from '../services/apiService';

function InitiativeForm({ onInitiativeCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    event_date: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // This now calls the real API function
      await createInitiative(formData);
      alert("Initiative created successfully!");
      onInitiativeCreated(); // Notify the parent component to refresh
    } catch (error) {
      console.error("Failed to submit initiative:", error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-md space-y-4">
      <h2 className="text-2xl font-bold text-center text-gray-900">Create a New Initiative</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Initiative Title</label>
          <input id="title" name="title" required onChange={handleInputChange} className="w-full mt-1 px-4 py-3 border border-gray-200 bg-gray-100 rounded-md text-gray-900 placeholder:text-gray-500" />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea id="description" name="description" required rows="4" onChange={handleInputChange} className="w-full mt-1 px-4 py-3 border border-gray-200 bg-gray-100 rounded-md text-gray-900 placeholder:text-gray-500" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
            <input id="location" name="location" onChange={handleInputChange} className="w-full mt-1 px-4 py-3 border border-gray-200 bg-gray-100 rounded-md text-gray-900 placeholder:text-gray-500" />
          </div>
          <div>
            <label htmlFor="event_date" className="block text-sm font-medium text-gray-700">Date of Event</label>
            <input id="event_date" type="date" name="event_date" onChange={handleInputChange} className="w-full mt-1 px-4 py-3 border border-gray-200 bg-gray-100 rounded-md text-gray-900" />
          </div>
        </div>
        <button type="submit" className="w-full py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 font-semibold">
          Post Initiative
        </button>
      </form>
    </div>
  );
}

export default InitiativeForm;