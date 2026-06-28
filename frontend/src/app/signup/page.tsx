"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Signup failed');
      }

      setSuccess('Signup successful! Redirecting to login page...');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: 'var(--bg-primary)',
      padding: '1.5rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '450px',
        padding: '2.5rem',
        boxShadow: 'var(--shadow-neon-cyan), var(--shadow-glass)',
        border: '1px solid var(--border-glass-active)',
        borderRadius: '16px'
      }}>
        {/* LOGO */}
        <div className="logo-wrapper" style={{ justifyContent: 'center', marginBottom: '2rem' }}>
          <div className="logo-icon" style={{ background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))' }}>A</div>
          <div className="logo-text" style={{ fontSize: '1.6rem' }}>AeroAssess</div>
        </div>

        <h2 style={{
          textAlign: 'center',
          fontSize: '1.5rem',
          fontWeight: 600,
          color: 'var(--text-main)',
          marginBottom: '0.5rem'
        }}>Create Account</h2>
        <p style={{
          textAlign: 'center',
          fontSize: '0.9rem',
          color: 'var(--text-muted)',
          marginBottom: '2rem'
        }}>Join AeroAssess to experience next-generation AI interviewing</p>

        {error && (
          <div className="glass-panel" style={{
            backgroundColor: 'rgba(255, 70, 70, 0.1)',
            borderColor: 'var(--accent-red)',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            color: 'var(--accent-red)',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div className="glass-panel" style={{
            backgroundColor: 'rgba(145, 255, 145, 0.1)',
            borderColor: 'var(--accent-green)',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            color: 'var(--accent-green)',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                backgroundColor: 'hsla(230, 25%, 8%, 0.6)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-main)',
                fontSize: '0.95rem',
                transition: 'var(--transition-smooth)'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent-cyan)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-glass)'}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                backgroundColor: 'hsla(230, 25%, 8%, 0.6)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-main)',
                fontSize: '0.95rem',
                transition: 'var(--transition-smooth)'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent-cyan)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-glass)'}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              minLength={6}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                backgroundColor: 'hsla(230, 25%, 8%, 0.6)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-main)',
                fontSize: '0.95rem',
                transition: 'var(--transition-smooth)'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent-cyan)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-glass)'}
            />
          </div>

          <button
            type="submit"
            className="btn btn-accent"
            disabled={loading}
            style={{
              marginTop: '1rem',
              width: '100%',
              padding: '0.85rem',
              borderRadius: '8px',
              fontSize: '1rem'
            }}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          fontSize: '0.85rem',
          color: 'var(--text-dim)',
          marginTop: '2rem'
        }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--accent-purple)', fontWeight: 600, textDecoration: 'none' }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
