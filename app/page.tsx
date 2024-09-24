"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { parseCookies, destroyCookie } from 'nookies';

interface Song {
  id: string;
  title: string;
  artist: string;
  eloRating: number;
  'Album Image URL': string;
  'Track Name': string;
  'Track URI': string;
}

let USER_ID = '';

const PLACEHOLDER_IMAGE = 'https://example.com/placeholder.jpg'; // Replace with your actual placeholder image URL

const Songs = () => {
  const [songs, setSongs] = useState<{ song1: Song; song2: Song } | null>(null);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('songs');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const cookies = parseCookies();
    if (cookies.cookie_authenticated === 'true') {
      USER_ID = cookies.cookie_user_encrypt_id;
      setIsAuthenticated(true);
      fetchSongs();
    } else {
      setActiveTab('signin');
    }
  }, []);

  const fetchSongs = async () => {
    try {
      const response = await axios.get('/api/song-match', {
        params: { userId: USER_ID }
      });
      setSongs(response.data);
    } catch (error) {
      setMessage('Failed to fetch songs.');
    }
  };

  const handleSelectSong = async (winnerId: string, loserId: string) => {
    try {
      await axios.post('/api/song-match', {
        userId: USER_ID,
        winnerId,
        loserId,
      });
      fetchSongs(); // Fetch new songs after updating
    } catch (error) {
      setMessage('Failed to update match.');
    }
  };

  const handleSignOut = () => {
    destroyCookie(null, 'cookie_authenticated');
    destroyCookie(null, 'cookie_user_encrypt_id');
    setIsAuthenticated(false);
    setActiveTab('signin');
  };

  const handleSignIn = async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/signin', { email, password });
      if (response.data.success) {
        setIsAuthenticated(true);
        setActiveTab('songs');
        fetchSongs();
      } else {
        setMessage('Sign in failed. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred during sign in.');
    }
  };

  if (activeTab === 'signin' || !isAuthenticated) {
    return <SignIn onSignIn={handleSignIn} message={message} />;
  }

  return (
    <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Song Selection</h1>
      {songs ? (
        <div className="flex justify-between">
          <div>
            <img 
              src={songs.song1["Album Image URL"] || PLACEHOLDER_IMAGE} 
              alt={songs.song1["Track Name"] || 'Unknown Track'} 
              className="w-32 h-32" 
            />
            <button onClick={() => handleSelectSong(songs.song1['Track URI'], songs.song2['Track URI'])} className="mt-2 bg-blue-500 text-white p-2 rounded">
              Select
            </button>
          </div>
          <div>
            <img 
              src={songs.song2["Album Image URL"] || PLACEHOLDER_IMAGE} 
              alt={songs.song2["Track Name"] || 'Unknown Track'} 
              className="w-32 h-32" 
            />
            <button onClick={() => handleSelectSong(songs.song2['Track URI'], songs.song1['Track URI'])} className="mt-2 bg-blue-500 text-white p-2 rounded">
              Select
            </button>
          </div>
        </div>
      ) : (
        <p>No more songs to match.</p>
      )}
      <button onClick={handleSignOut} className="mt-4 bg-red-500 text-white p-2 rounded">
        Sign Out
      </button>
      {message && <p className="mt-4 text-center text-red-500">{message}</p>}
    </div>
  );
};

interface SignInProps {
  onSignIn: (email: string, password: string) => void;
  message: string;
}

const SignIn: React.FC<SignInProps> = ({ onSignIn, message }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSignIn(email, password);
  };

  return (
    <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-2 mb-4 border border-gray-300 rounded"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-2 mb-4 border border-gray-300 rounded"
          required
        />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors">
          Sign In
        </button>
      </form>
      {message && <p className="mt-4 text-center text-red-500">{message}</p>}
    </div>
  );
};

export default Songs;
