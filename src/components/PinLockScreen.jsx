import React, { useState, useEffect } from 'react';
import { Shield, Lock } from 'lucide-react';
import { hashPin } from '../utils/helpers';

const CORRECT_PIN_HASH = 'fd68fcf88c30b4df82ec214bb6b559ede1a5d47f3b1f751524177b998bb6bbdd';
const LOCKOUT_KEY = 'hom_pin_lockout';
const FAIL_COUNT_KEY = 'hom_pin_fail_count';

const readLockout = () => {
  try {
    const raw = sessionStorage.getItem(LOCKOUT_KEY);
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
};

const readFailCount = () => {
  try {
    const raw = sessionStorage.getItem(FAIL_COUNT_KEY);
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
};

export default function PinLockScreen({ onUnlockSuccess, triggerToast }) {
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [failCount, setFailCount] = useState(readFailCount);
  const [lockedUntil, setLockedUntil] = useState(readLockout);
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  const isLocked = () => Date.now() < lockedUntil;

  useEffect(() => {
    if (lockedUntil <= Date.now()) return;

    let interval = null;
    setSecondsRemaining(Math.ceil((lockedUntil - Date.now()) / 1000));
    interval = setInterval(() => {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
      if (remaining <= 0) {
        setSecondsRemaining(0);
        setPinError('');
        sessionStorage.removeItem(LOCKOUT_KEY);
        clearInterval(interval);
      } else {
        setSecondsRemaining(remaining);
      }
    }, 1000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [lockedUntil]);

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    if (isLocked()) return;

    const entered = await hashPin(pin);

    if (entered === CORRECT_PIN_HASH) {
      onUnlockSuccess();
      setFailCount(0);
      setLockedUntil(0);
      sessionStorage.removeItem(FAIL_COUNT_KEY);
      sessionStorage.removeItem(LOCKOUT_KEY);
      triggerToast('Welcome back, Dr. Samuel!');
    } else {
      const next = failCount + 1;
      setFailCount(next);
      sessionStorage.setItem(FAIL_COUNT_KEY, String(next));

      if (next >= 5) {
        const until = Date.now() + 30000;
        setLockedUntil(until);
        sessionStorage.setItem(LOCKOUT_KEY, String(until));
        setPinError('Too many failed attempts. Locked for 30 seconds.');
      } else {
        setPinError(`Invalid PIN. ${5 - next} attempt(s) remaining.`);
      }
      setPin('');
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-slate-950">
      <div className="flex-1 flex flex-col justify-center items-center text-center px-4">
        <div className="p-4 bg-emerald-500/10 rounded-full text-emerald-400 mb-6 border border-emerald-500/20">
          <Shield size={48} className="animate-pulse" />
        </div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Samuel HomeoCare</h1>
        <p className="text-slate-400 text-sm mt-2 max-w-xs">
          Enter your secure clinic access PIN to manage patient medical history.
        </p>

        <form onSubmit={handlePinSubmit} className="mt-8 w-full max-w-xs">
          <div className="relative">
            <input
              type="password"
              maxLength={4}
              placeholder="Enter 4-Digit PIN"
              value={pin}
              disabled={isLocked()}
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, ''));
                setPinError('');
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-4 text-center text-2xl font-bold tracking-widest text-emerald-400 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all disabled:opacity-40"
              autoFocus
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600">
              <Lock size={18} />
            </div>
          </div>

          {pinError && (
            <p className="text-rose-400 text-xs mt-2 text-center font-medium">{pinError}</p>
          )}

          {isLocked() && secondsRemaining > 0 && (
            <p className="text-amber-400 text-xs mt-2 text-center font-medium">
              Locked — try again in {secondsRemaining}s
            </p>
          )}

          <button
            type="submit"
            disabled={isLocked()}
            className="w-full mt-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/10 flex justify-center items-center gap-2"
          >
            <Lock size={16} /> Unlock Terminal
          </button>
        </form>
      </div>

      <div className="text-center pb-4 text-xs text-slate-600">
        <p>Patient records stored locally on this device</p>
      </div>
    </div>
  );
}
