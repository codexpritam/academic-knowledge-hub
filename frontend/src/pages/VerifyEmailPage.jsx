import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();

  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link.');
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/auth/verify-email?token=${encodeURIComponent(token)}`,
          {
            method: 'GET',
            credentials: 'include'
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || 'Email verification failed.'
          );
        }

        setStatus('success');
        setMessage(
          data.message || 'Your email has been verified successfully.'
        );
      } catch (error) {
        setStatus('error');
        setMessage(
          error.message || 'Email verification failed.'
        );
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center">

        {status === 'verifying' && (
          <>
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-slate-200 border-t-primary-600 rounded-full animate-spin" />

            <h1 className="text-xl font-bold text-slate-900">
              Verifying your email...
            </h1>

            <p className="text-sm text-slate-500 mt-2">
              Please wait while we verify your email address.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center rounded-full bg-green-100 text-green-600 text-2xl">
              ✓
            </div>

            <h1 className="text-2xl font-bold text-slate-900">
              Email Verified!
            </h1>

            <p className="text-sm text-slate-500 mt-2">
              {message}
            </p>

            <Link
              to="/login"
              className="inline-block mt-6 px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition"
            >
              Go to Login
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-100 text-red-600 text-2xl">
              !
            </div>

            <h1 className="text-2xl font-bold text-slate-900">
              Verification Failed
            </h1>

            <p className="text-sm text-slate-500 mt-2">
              {message}
            </p>

            <Link
              to="/login"
              className="inline-block mt-6 px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition"
            >
              Go to Login
            </Link>
          </>
        )}

      </div>
    </div>
  );
};

export default VerifyEmailPage;