// src/components/InitiativeForm.jsx
import { useState } from 'react';
import { createInitiative } from '../services/apiService';

// The component now accepts a prop to notify its parent when creation is successful
function InitiativeForm({ onInitiativeCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    creator_name: '',
    event_date: '', // Added for the date input
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newInitiative = await createInitiative(formData);
      onInitiativeCreated(newInitiative); // Notify the parent component
      // Clear the form for the next entry
      setFormData({ title: '', description: '', location: '', creator_name: '', event_date: '' });
    } catch (error) {
      console.error("Failed to submit initiative:", error);
      alert("Error: Could not create the initiative.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8 text-gray-800">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Create a New Initiative</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input name="title" value={formData.title} onChange={handleInputChange} placeholder="Initiative Title" className="w-full p-2 border border-gray-300 rounded placeholder:text-gray-500" required />
          <input name="creator_name" value={formData.creator_name} onChange={handleInputChange} placeholder="Your Name" className="w-full p-2 border border-gray-300 rounded placeholder:text-gray-500" required />
        </div>
        <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Describe your initiative..." className="w-full p-2 mb-4 border border-gray-300 rounded placeholder:text-gray-500" required />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="location" value={formData.location} onChange={handleInputChange} placeholder="Location (e.g., Moratuwa Beach)" className="w-full p-2 border border-gray-300 rounded placeholder:text-gray-500" />
            <input type="date" name="event_date" value={formData.event_date} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded text-gray-500" />
        </div>
        <button type="submit" className="w-full mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold">
          Post Initiative
        </button>
      </form>
    </div>
  );
}

export default InitiativeForm;