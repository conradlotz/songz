"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { parseCookies, destroyCookie } from 'nookies';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface Song {
  id: string;
  title: string;
  artist: string;
  eloRating: number;
  'Album Image URL': string;
  'Track Name': string;
  'Track URI': string;
}

interface TopTrack {
  id: string;
  trackName: string;
  albumImageUrl: string;
  artistName: string;
  rating: number;
}

interface SpotifyTrack {
  'Track URI': string;
  'Track Name': string;
  'Album Image URL': string;
  rating?: number; // or whatever type 'rating' is supposed to be
  // Add other properties as needed
}

let USER_ID = '';

const PLACEHOLDER_IMAGE = '/images/placeholder.webp'; // Adjust the path as needed

const Songs = () => {
  const [songs, setSongs] = useState<{ song1: Song; song2: Song } | null>(null);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('songs');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [topTracks, setTopTracks] = useState<TopTrack[]>([]);

  useEffect(() => {
    const cookies = parseCookies();
    if (cookies.cookie_authenticated === 'true') {
      USER_ID = cookies.cookie_user_encrypt_id;
      setIsAuthenticated(true);
      fetchSongs();
      fetchTopTracks();
    } else {
      setActiveTab('signin');
    }
  }, []);

  const fetchSongs = async () => {
    try {
      const response = await axios.get('/api/song-match', {
        params: { userId: USER_ID }
      });
      setSongs(response.data as { song1: Song; song2: Song });
    } catch (error) {
      setMessage('Failed to fetch songs.');
    }
  };

  const fetchTopTracks = async () => {
    try {
      const response = await axios.get<SpotifyTrack[]>('/api/top-tracks');
      setTopTracks(response.data.map((track) => ({
        id: track['Track URI'],
        trackName: track['Track Name'],
        albumImageUrl: track['Album Image URL'],
        rating: (track as any).rating // Type assertion
      })));
    } catch (error) {
      setMessage('Failed to fetch top tracks.');
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
      if (response.data && typeof response.data === 'object' && 'success' in response.data) {
        if (response.data.success) {
          setIsAuthenticated(true);
          setActiveTab('songs');
          fetchSongs();
        } else {
          setMessage('Sign in failed. Please try again.');
        }
      } else {
        setMessage('Unexpected response from server.');
      }
    } catch (error) {
      setMessage('An error occurred during sign in.');
    }
  };

  if (activeTab === 'signin' || !isAuthenticated) {
    return <SignIn onSignIn={handleSignIn} message={message} />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Song Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="match" className="h-full space-y-6">
            <div className="space-between flex items-center">
              <TabsList>
                <TabsTrigger value="match">Match</TabsTrigger>
                <TabsTrigger value="top100">Top 100</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="match" className="border-none p-0 outline-none">
              {songs ? (
                <div className="flex flex-row justify-between gap-4">
                  {[songs.song1, songs.song2].map((song, index) => (
                    <div key={index} className="flex-1 min-w-[45%]">
                      <div 
                        className="relative overflow-hidden rounded-lg shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 cursor-pointer"
                        onClick={() => handleSelectSong(song['Track URI'], songs[index === 0 ? 'song2' : 'song1']['Track URI'])}
                      >
                        <img 
                          src={song["Album Image URL"] || PLACEHOLDER_IMAGE} 
                          alt={song["Track Name"] || 'Unknown Track'} 
                          className="w-full h-auto object-cover aspect-square" 
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end p-2">
                          <div>
                            <h3 className="text-white text-lg font-bold truncate">{song["Track Name"]}</h3>
                            <p className="text-white text-xs truncate">{song.artist}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center">No more songs to match.</p>
              )}
            </TabsContent>
            <TabsContent value="top100" className="border-none p-0 outline-none">
              <TopTracksContent tracks={topTracks} />
            </TabsContent>
          </Tabs>
          <Button onClick={handleSignOut} variant="destructive" className="mt-4 w-full">
            Sign Out
          </Button>
          {message && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
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
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
          {message && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const TopTracksContent: React.FC<{ tracks: TopTrack[] }> = ({ tracks }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">Top 100 Tracks</h2>
      <ScrollArea className="h-[600px]">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tracks.map((track) => (
            <div key={track.id} className="flex flex-col items-center">
              <div className="relative overflow-hidden rounded-lg shadow-lg transition-transform duration-300 ease-in-out hover:scale-105">
                <img
                  src={track.albumImageUrl || PLACEHOLDER_IMAGE}
                  alt={track.trackName || 'Unknown Track'}
                  className="w-full h-auto object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null; // Prevent infinite loop
                    target.src = PLACEHOLDER_IMAGE;
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end p-2">
                  <p className="text-white text-xs font-semibold">Rating: {track.rating.toFixed(2)}</p>
                </div>
              </div>
              <div className="mt-2 text-center">
                <p className="text-sm font-medium">{track.trackName}</p>
                <p className="text-xs text-gray-500">{track.artistName}</p>
              </div>
            </div>
          ))}
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
};

export default Songs;