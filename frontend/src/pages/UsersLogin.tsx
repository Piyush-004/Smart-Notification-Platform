import { useState } from 'react';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function UserPreferenceLoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError('Invalid email or password');
        return;
      }

      const res = await fetch('http://localhost:8000/api/auth/user/me', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (!res.ok) {
        setError('User not found. Please sign up.');
        await supabase.auth.signOut();
        return;
      }

      const user = await res.json();
      navigate(`/user/${user.user_id}/preferences`);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-4">
      <div className="max-w-md mx-auto py-10">
        <button
          onClick={() => navigate('/')}
          className="mb-6 flex items-center text-pink-600"
        >
          <ArrowLeft size={18} />
          <span className="ml-2">Back</span>
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-center mb-6">
            User Login
          </h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border rounded-lg"
              placeholder="Email"
            />

            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border rounded-lg"
              placeholder="Password"
            />

            {error && (
              <div className="text-sm text-red-600">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pink-600 text-white py-3 rounded-lg"
            >
              {loading ? 'Logging in…' : 'Continue'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="w-full border border-pink-500 text-pink-600 py-3 rounded-lg flex items-center justify-center gap-2"
            >
              <UserPlus size={18} />
              Sign up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
