const API_BASE_URL = "http://localhost:9090";

export const getInitiatives = async (searchTerm = '') => {
  // Append the search term as a query parameter if it exists
  const url = new URL(`${API_BASE_URL}/initiatives`);
  if (searchTerm) {
    url.searchParams.append('search', searchTerm);
  }
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Failed to fetch initiatives.");
  }
  return await response.json();
};

export const createInitiative = async (initiativeData) => {
  const sessionId = localStorage.getItem('session_id');
  if (!sessionId) throw new Error("No session found. Please log in.");

  const payload = {
    ...initiativeData,
    event_date: initiativeData.event_date ? new Date(initiativeData.event_date).toISOString() : null,
  };

  const response = await fetch(`${API_BASE_URL}/initiatives`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x_session_id': sessionId // Use the session ID header
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to create initiative.");
  }
  return true;
};

export const joinInitiative = async (initiativeId) => {
  const sessionId = localStorage.getItem('session_id');
  if (!sessionId) throw new Error("No session found. Please log in.");

  const response = await fetch(`${API_BASE_URL}/participants`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x_session_id': sessionId // Use the session ID header
    },
    body: JSON.stringify({ 
      initiative_id: initiativeId
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to join initiative.");
  }
  return true; 
};

export const login = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Login failed. Please check your credentials.");
  }
  return await response.json();
};

export const register = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error("Registration failed. The email might already be in use.");
  }
  return true;
};

export const getAccount = async () => {
  const sessionId = localStorage.getItem('session_id');
  if (!sessionId) throw new Error('No session found');
  const response = await fetch(`${API_BASE_URL}/account`, {
    headers: { 'x_session_id': sessionId }
  });
  if (!response.ok) throw new Error('Failed to fetch account');
  return await response.json();
};

export const leaveInitiative = async (initiativeId) => {
  const sessionId = localStorage.getItem('session_id');
  if (!sessionId) throw new Error('No session found');
  const response = await fetch(`${API_BASE_URL}/participants`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', 'x_session_id': sessionId },
    body: JSON.stringify({ initiative_id: initiativeId })
  });
  if (!response.ok) throw new Error('Failed to leave initiative');
  return true;
};

export const deleteInitiative = async (id) => {
  const sessionId = localStorage.getItem('session_id');
  if (!sessionId) throw new Error('No session found');
  const response = await fetch(`${API_BASE_URL}/initiatives`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', 'x_session_id': sessionId },
    body: JSON.stringify({ id })
  });
  if (!response.ok) throw new Error('Failed to delete initiative');
  return true;
};