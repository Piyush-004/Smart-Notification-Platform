import { useState } from 'react';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function SignupPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [city, setCity] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'prefer_not_to_say'>(
    'prefer_not_to_say'
  );
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1️⃣ Supabase Auth signup
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError || !data.session) {
        setError(authError?.message || 'Signup failed');
        return;
      }

      const accessToken = data.session.access_token;

      // 2️⃣ Create user in backend
      const res = await fetch('http://localhost:8000/api/users/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name,
          email,
          phone_number: phoneNumber,
          city,
          gender,
        }),
      });

      if (!res.ok) {
        setError('Failed to create user profile');
        await supabase.auth.signOut();
        return;
      }

      const user = await res.json();

      // 3️⃣ Redirect to preferences
      navigate(`/user/${user.user_id}/preferences`);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <button
          onClick={() => navigate('/login')}
          className="mb-6 flex items-center text-pink-600"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-center mb-6">
            User Signup
          </h2>

          <form onSubmit={handleSignup} className="space-y-4">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="Full Name"
              className="w-full px-4 py-3 border rounded-lg"
            />

            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="Email"
              className="w-full px-4 py-3 border rounded-lg"
            />

            <input
              type="tel"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              required
              placeholder="Phone Number"
              className="w-full px-4 py-3 border rounded-lg"
            />

            <input
              value={city}
              onChange={e => setCity(e.target.value)}
              required
              placeholder="City"
              className="w-full px-4 py-3 border rounded-lg"
            />

            <select
              value={gender}
              onChange={e => setGender(e.target.value as any)}
              className="w-full px-4 py-3 border rounded-lg"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="prefer_not_to_say">
                Prefer not to say
              </option>
            </select>

            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="Password"
              className="w-full px-4 py-3 border rounded-lg"
            />

            {error && (
              <div className="text-sm text-red-600">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pink-600 text-white py-3 rounded-lg"
            >
              {loading ? 'Creating account…' : 'Sign Up'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
