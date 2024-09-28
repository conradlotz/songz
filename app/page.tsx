"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { parseCookies, destroyCookie } from 'nookies';
import { useQuery, useQueryClient, QueryClient, QueryClientProvider } from 'react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { signOut } from "next-auth/react";
// import { db } from '@/lib/db'; // Assume this is your database connection?

// Remove the following line if not needed:
// import { FaSpotify } from 'react-icons/fa';

// ... Use FaSpotify in your component, for example:
// <FaSpotify className="text-green-500" />

interface Song {
  [key: string]: string | undefined;
  // ... other specific properties
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
  'Artist Name': string;
  // Add other properties as needed
}

interface Matchup {
  nextId: string | number;
  // ... other properties of currentMatchup
}

let USER_ID = '';

const PLACEHOLDER_IMAGE = '/image/placeholder.webp'; // Adjust the path if needed

const queryClient = new QueryClient();

const SongsWrapper = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Songs />
    </QueryClientProvider>
  );
};

const Songs = () => {
  const [songs, setSongs] = useState<{ song1: Song; song2: Song } | null>(null);
  const [message, setMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [topTracks, setTopTracks] = useState<TopTrack[]>([]);
  const [activeTab, setActiveTab] = useState<string>("match");
  const [currentMatchupId, setCurrentMatchupId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: songsData, isLoading: isSongsLoading, refetch: refetchSongs } = useQuery(
    ['songs', USER_ID],
    () => axios.get('/api/song-match', { params: { userId: USER_ID } }).then(res => res.data),
    { enabled: isAuthenticated }
  );

  const { data: topTracksData, isLoading: isTopTracksLoading } = useQuery(
    'topTracks',
    () => axios.get<SpotifyTrack[]>('/api/top-tracks').then(res => res.data) as Promise<SpotifyTrack[]>,
    { enabled: isAuthenticated }
  );

  const { data: currentMatchup, refetch } = useQuery(
    ['matchup', currentMatchupId],
    () => axios.get(`/api/matchup/${currentMatchupId}`).then(res => res.data),
    { enabled: !!currentMatchupId, onSettled: () => setIsLoading(false) }
  );

  useEffect(() => {
    const cookies = parseCookies();
    if (cookies.cookie_authenticated === 'true') {
      USER_ID = cookies.cookie_user_encrypt_id;
      setIsAuthenticated(true);
      setActiveTab("match");
    } else {
      setActiveTab("signin");
    }
  }, []);

  useEffect(() => {
    if (songsData && typeof songsData === 'object' && 'song1' in songsData && 'song2' in songsData) {
      setSongs(songsData as { song1: Song; song2: Song });
    } else {
      setSongs(null);
    }
  }, [songsData]);

  useEffect(() => {
    if (topTracksData && Array.isArray(topTracksData)) {
      setTopTracks(topTracksData.map((track) => ({
        id: track['Track URI'],
        trackName: track['Track Name'],
        albumImageUrl: track['Album Image URL'],
        artistName: track['Artist Name'] as string,
        rating: (track as any).rating
      })));
    } else {
      console.error('topTracksData is not an array:', topTracksData);
    }
  }, [topTracksData]);

  // useEffect(() => {
  //   if (currentMatchup && typeof currentMatchup === 'object' && 'nextId' in currentMatchup) {
  //     // Preload the next matchup
  //     queryClient.prefetchQuery(['matchup', currentMatchup.nextId as string], () => fetchMatchup(currentMatchup.nextId as string));
  //   }
  // }, [currentMatchup, queryClient]);

  const handleSelectSong = async (winnerId: string, loserId: string) => {
    try {
      await axios.post('/api/song-match', {
        userId: USER_ID,
        winnerId,
        loserId,
      });
      refetchSongs();
    } catch (error) {
      setMessage('Failed to update match.');
    }
  };

  const handleSignOut = () => {
    destroyCookie(null, 'cookie_authenticated');
    destroyCookie(null, 'cookie_user_encrypt_id');
    setIsAuthenticated(false);
  };

  const handleSignIn = async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/signin', { email, password });
      if (response.data && typeof response.data === 'object' && 'success' in response.data) {
        if (response.data.success) {
          setIsAuthenticated(true);
          refetchSongs();
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

  const handleSignUp = async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/signup', { email, password });
      if ((response.data as { success: boolean }).success) {
        setMessage('Sign up successful. Please sign in.');
        setIsAuthenticated(true);
        refetchSongs();
      } else {
        setMessage('Sign up failed. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred during sign up.');
    }
  };

  const handleClick = (newMatchupId: number) => {
    setIsLoading(true);
    setCurrentMatchupId(newMatchupId);
  };

  const handleNext = (newMatchupId: number) => {
    setIsLoading(true);
    setCurrentMatchupId(newMatchupId);
  };

  const handleSkip = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get<{ song1: Song; song2: Song }>('/api/song-match', { params: { userId: USER_ID } });
      if (response.data && 'song1' in response.data && 'song2' in response.data) {
        setSongs(response.data);
      } else {
        setSongs(null);
      }
    } catch (error) {
      console.error('Error skipping matchup:', error);
      setMessage('Failed to get new matchup.');
    } finally {
      setIsLoading(false);
    }
  };

  const openSpotify = (trackUrl: string) => {
    window.open(trackUrl, '_blank');
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Song Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full space-y-6">
            <div className="space-between flex items-center">
              <TabsList>
                {isAuthenticated ? (
                  <>
                    <TabsTrigger value="match">Match</TabsTrigger>
                    <TabsTrigger value="top100">Top 100</TabsTrigger>
                  </>
                ) : (
                  <>
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </>
                )}
              </TabsList>
            </div>
            {isAuthenticated ? (
              <>
                <TabsContent value="match" className="border-none p-0 outline-none">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : isSongsLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : songs && songs.song1 && songs.song2 ? (
                    <div className="space-y-4">
                      <div className="flex flex-row justify-between gap-4">
                        {[songs.song1, songs.song2].map((song, index) => (
                          <div key={index} className="flex-1 min-w-[45%]">
                            <div 
                              className="relative overflow-hidden rounded-lg shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 cursor-pointer"
                              onClick={() => handleSelectSong(
                                (song['Track URI'] as string) ?? '',
                                (songs[index === 0 ? 'song2' : 'song1']['Track URI'] as string) ?? ''
                              )}
                            >
                              <img 
                                src={song["Album Image URL"] || PLACEHOLDER_IMAGE} 
                                alt={song["Track Name"] || 'Unknown Track'} 
                                className="w-full h-auto object-cover aspect-square" 
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end p-2">
                                <div>
                                  <h3 className="text-white text-lg font-bold truncate">
                                    {song["Track Name"]} - {song["Artist Name(s)"]}
                                  </h3>
                                  <p className="text-white text-xs truncate">{song.artist}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-center mt-4">
                        <Button onClick={handleSkip} variant="outline">
                          Skip
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center">No more songs to match.</p>
                  )}
                </TabsContent>
                <TabsContent value="top100" className="border-none p-0 outline-none">
                  {isTopTracksLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <TopTracksContent tracks={topTracks} />
                  )}
                </TabsContent>
              </>
            ) : (
              <>
                <TabsContent value="signin" className="border-none p-0 outline-none">
                  <SignIn onSignIn={handleSignIn} message={message} />
                </TabsContent>
                <TabsContent value="signup" className="border-none p-0 outline-none">
                  <SignUp onSignUp={handleSignUp} message={message} />
                </TabsContent>
              </>
            )}
          </Tabs>
          {isAuthenticated && (
            <Button
              onClick={() => signOut()}
              className="absolute top-4 right-4 text-sm py-1 px-2"
              variant="outline"
            >
              Sign out
            </Button>
          )}
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
  );
};

interface SignUpProps {
  onSignUp: (email: string, password: string) => void;
  message: string;
}

const SignUp: React.FC<SignUpProps> = ({ onSignUp, message }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        onSignUp(email, password);
      } else {
        throw new Error('Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
    }
  };

  return (
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
        Sign Up
      </Button>
    </form>
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
                <Image
                  src={track.albumImageUrl && track.albumImageUrl !== '' ? track.albumImageUrl : PLACEHOLDER_IMAGE}
                  alt={track.trackName || 'Unknown Track'}
                  width={200}
                  height={200}
                  className="w-full h-auto object-cover"
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

// // In your API route
// async function fetchMatchup(id: string) {
//   // Optimize your database query
//   const matchup = await db.matchups.findUnique({
//     where: { id },
//     select: { /* only select necessary fields */ }
//   });
//   return matchup;
// }

export default SongsWrapper;