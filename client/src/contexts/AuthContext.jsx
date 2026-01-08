import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session', {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.authenticated) {
        setUser(data.user || null);
        setIsAdmin(data.isAdmin || false);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Session check failed:', error);
      setUser(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const loginAsGuest = async (initials) => {
    const response = await fetch('/api/auth/guest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ initials })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create guest session');
    }

    setUser(data.user);
    return data.user;
  };

  const register = async (initials, pinCode) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ initials, pin_code: pinCode })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to register');
    }

    setUser(data.user);
    return data.user;
  };

  const login = async (initials, pinCode) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ initials, pin_code: pinCode })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Invalid credentials');
    }

    setUser(data.user);
    return data.user;
  };

  const loginWithQR = async (qrCode) => {
    const response = await fetch('/api/auth/login-qr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ qr_code: qrCode })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Invalid QR code');
    }

    setUser(data.user);
    return data.user;
  };

  const loginAsAdmin = async (code) => {
    const response = await fetch('/api/auth/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ code })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Invalid code');
    }

    setIsAdmin(true);
    return true;
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    setUser(null);
    setIsAdmin(false);
  };

  const refreshUser = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/users/me', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const value = {
    user,
    isAdmin,
    isAuthenticated: !!user || isAdmin,
    loading,
    loginAsGuest,
    register,
    login,
    loginWithQR,
    loginAsAdmin,
    logout,
    refreshUser,
    checkSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
