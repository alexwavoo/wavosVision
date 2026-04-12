import React, { useCallback, useId, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { getStoreUrl } from '../config/externalUrls';
import '../styles/store-gate.css';

const STORE_PASSWORD = 'WavosVision1978';

function LockIcon({ size = 52 }) {
  return (
    <svg
      className="store-gate__lock"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export default function StoreGate() {
  const inputId = useId();
  const [value, setValue] = useState('');
  const [showError, setShowError] = useState(false);

  const flashError = useCallback(() => {
    setShowError(true);
    window.setTimeout(() => setShowError(false), 450);
  }, []);

  const trySubmit = useCallback(() => {
    if (value === STORE_PASSWORD) {
      window.location.assign(getStoreUrl());
      return;
    }
    flashError();
    setValue('');
  }, [value, flashError]);

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      trySubmit();
    }
  };

  return (
    <main className="store-gate">
      <Helmet>
        <title>Store | Wavo&apos;s Vision</title>
      </Helmet>
      <LockIcon />
      <label
        htmlFor={inputId}
        className={`store-gate__box${showError ? ' store-gate__box--error' : ''}`}
      >
        <input
          id={inputId}
          className="store-gate__field"
          type="password"
          autoComplete="off"
          aria-label="Store access"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
        />
      </label>
    </main>
  );
}
