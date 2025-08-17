// src/services/apiService.js

const API_BASE_URL = "http://localhost:9090"; // Your Ballerina API

export const getInitiatives = async () => {
  const response = await fetch(`${API_BASE_URL}/initiatives`);
  if (!response.ok) {
    throw new Error("Failed to fetch initiatives from the backend.");
  }
  return await response.json();
};

export const createInitiative = async (initiativeData) => {
  // The event_date needs to be in the ISO format the backend expects
  const payload = {
    ...initiativeData,
    event_date: initiativeData.event_date ? new Date(initiativeData.event_date).toISOString() : null,
  };

  const response = await fetch(`${API_BASE_URL}/initiatives`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to create initiative.");
  }
  return await response.json();
};

export const joinInitiative = async (initiativeId, participantName) => {
  const response = await fetch(`${API_BASE_URL}/participants`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      initiative_id: initiativeId,
      participant_name: participantName 
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to join initiative.");
  }
  // This endpoint returns a 201 Created status with no body, so we don't parse JSON.
  return true; 
};

// src/services/apiService.js

// ... (keep the existing functions) ...

export const login = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    // We can make this error more specific later
    throw new Error("Login failed. Please check your credentials.");
  }
  return await response.json();
};