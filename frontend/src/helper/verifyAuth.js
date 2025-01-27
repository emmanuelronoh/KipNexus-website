export default async function validateAuthStatus() {
  // GET request
  // ask the server to check or verify the access cookie's signature. and user's payload for authentication purposes
  try {
    const sessionId = localStorage.getItem('sessionId');
    const headers = {
      'Content-Type': 'application/json',
      ...(sessionId && { 'X-Session-ID': sessionId }), // Add session ID if it exists
    };
    const response = await fetch(`${import.meta.env.VITE_API_URL}user`, {
      headers: headers,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // Handle both JWT and session responses
    return {
      access: data.access || null,
      refresh: data.refresh || null,
      isAuthenticated: response.ok,
      sessionId: data.sessionId,
    };
  } catch (error) {
    console.error('Auth error:', error);
    return { isAuthenticated: false };
  }
}
