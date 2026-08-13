import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export default function AuthModal({ isOpen, onClose }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [user, setUser] = useState(null);

  // Load user from Supabase or localStorage
  useEffect(() => {
    const checkUser = async () => {
      if (!supabase) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user) {
        setUser({
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
        });
      } else {
        const saved = localStorage.getItem('yuktaa_user');
        if (saved) setUser(JSON.parse(saved));
      }
    };
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && session.user) {
        setUser({
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
        });
      } else {
        const saved = localStorage.getItem('yuktaa_user');
        setUser(saved ? JSON.parse(saved) : null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const userData = { email, name: name || email.split('@')[0] };
    localStorage.setItem('yuktaa_user', JSON.stringify(userData));
    setUser(userData);
    alert(isSignUp ? 'Account created successfully!' : 'Signed in successfully!');
    onClose();
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err) {
      console.error('Google Sign In Error:', err.message);
      alert('Error signing in with Google: ' + err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error(err);
    }
    localStorage.removeItem('yuktaa_user');
    setUser(null);
    alert('Logged out successfully.');
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '30px',
        width: '90%',
        maxWidth: '400px',
        position: 'relative',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            border: 'none',
            background: 'none',
            fontSize: '1.2rem',
            cursor: 'pointer',
            color: '#888'
          }}
        >
          ✕
        </button>

        {user ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-accent-light)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 15px auto',
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}>
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <h2 style={{ margin: '0 0 5px 0', fontSize: '1.4rem' }}>Welcome, {user.name}!</h2>
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '20px' }}>{user.email}</p>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: 'var(--color-primary)',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div>
            <h2 style={{ margin: '0 0 10px 0', color: 'var(--color-primary)', textAlign: 'center' }}>
              {isSignUp ? 'Create Account' : 'Sign In'}
            </h2>
            <p style={{ textAlign: 'center', color: '#666', fontSize: '0.85rem', marginBottom: '20px' }}>
              Access your saved wishlist, orders & exclusive vouchers
            </p>

            <button
              onClick={handleGoogleSignIn}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#fff',
                color: '#444',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: 'pointer',
                marginBottom: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '18px' }} />
              Sign in with Google
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#eee' }}></div>
              <span style={{ fontSize: '0.8rem', color: '#999', textTransform: 'uppercase' }}>or</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#eee' }}></div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {isSignUp && (
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '0.95rem'
                  }}
                />
              )}
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '0.95rem'
                }}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '0.95rem'
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '12px',
                  backgroundColor: 'var(--color-primary)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  marginTop: '5px'
                }}
              >
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '0.85rem', color: '#666' }}>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <span
                onClick={() => setIsSignUp(!isSignUp)}
                style={{ color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
