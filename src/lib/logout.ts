export async function handleLogout() {
  try {
    // 1. Call the logout API to destroy the server session and clear cookies
    await fetch('/api/auth/logout', { method: 'POST' });

    // 2. Clear client-side caches
    if (typeof window !== 'undefined') {
      // Clear localStorage (used for generic state caching)
      localStorage.clear();
      
      // Clear sessionStorage
      sessionStorage.clear();
    }

    // 3. Force a hard navigation to /login to ensure Next.js clears its router cache
    // and re-evaluates middleware for protected routes.
    window.location.href = '/login';
  } catch (error) {
    console.error('Logout failed:', error);
    // Even if the API fails, clear local state and force redirect
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/login';
    }
  }
}
