'use client';

import { useState } from 'react';
import Link from 'next/link';
import CookiePreferences from '@/components/CookiePreferences';

const footerStyle: React.CSSProperties = {
  borderTop: '1px solid #333',
  padding: '2rem 1.5rem',
  fontSize: '0.85rem',
  color: '#595959', // 7:1 contrast on white — meets WCAG AA and AAA
  textAlign: 'center',
};

const navStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  gap: '1.5rem',
  flexWrap: 'wrap',
  marginBottom: '1rem',
};

const linkStyle: React.CSSProperties = {
  color: '#595959', // 7:1 contrast on white — meets WCAG AA and AAA
  textDecoration: 'underline',
};

const buttonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#595959', // 7:1 contrast on white — meets WCAG AA and AAA
  cursor: 'pointer',
  fontSize: '0.85rem',
  padding: 0,
  textDecoration: 'underline',
};

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10000,
};

export default function Footer() {
  const [showPreferences, setShowPreferences] = useState(false);

  return (
    <footer style={footerStyle}>
      <nav aria-label="Footer navigation" style={navStyle}>
        <Link href="/privacy" style={linkStyle}>
          Privacy Policy
        </Link>
        <Link href="/terms" style={linkStyle}>
          Terms of Service
        </Link>
        <button
          type="button"
          style={buttonStyle}
          onClick={() => setShowPreferences(true)}
        >
          Cookie Preferences
        </button>
      </nav>
      <p style={{ margin: 0 }}>
        &copy; {new Date().getFullYear()} Lusk Technologies, Inc. All rights
        reserved.
      </p>

      {showPreferences && (
        <div style={overlayStyle}>
          <CookiePreferences
            onPreferencesChange={() => setShowPreferences(false)}
          />
        </div>
      )}
    </footer>
  );
}
