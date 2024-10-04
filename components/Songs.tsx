"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { parseCookies, destroyCookie } from 'nookies';
import { useQuery, useQueryClient } from 'react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import SpotifyPlayer from '@/components/SpotifyPlayer';
import BeatBattleIcon from '@/components/BeatBattleIcon';
import SignIn from './SignIn';
import SignUp from './SignUp';
import TopTracksContent from './TopTracksContent';
import OverallTopTracksContent from './OverallTopTracksContent';
import LeaderboardContent from './LeaderboardContent';
import { Song } from '@/interfaces/Song';
import { TopTrack } from '@/interfaces/TopTrack';
import { SpotifyTrack } from '@/interfaces/SpotifyTrack';
import { Leaderboard } from '@/interfaces/Leaderboard';
import AuthMessage from '@/components/AuthMessage';
import SelectMessage from '@/components/SelectMessage';
import Confetti from 'react-confetti';

let USER_ID = '';

const PLACEHOLDER_IMAGE = '/image/placeholder.webp';

interface SongsProps {
  isAuthenticated: boolean;
}

const Songs: React.FC<SongsProps> = ({ isAuthenticated: initialIsAuthenticated }) => {
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(initialIsAuthenticated);
  const [songs, setSongs] = useState<{ song1: Song; song2: Song } | null>(null);
  const [message, setMessage] = useState('');
  const [topTracks, setTopTracks] = useState<TopTrack[]>([]);
  const [activeTab, setActiveTab] = useState<string>("match");
  const [isLoading, setIsLoading] = useState(false);
  const [overallTopTracks, setOverallTopTracks] = useState<TopTrack[]>([]);
  const [userLeaderboard] = useState<{ name: string; selections: number }[]>([]);
  const [isLeaderboardLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const { data: songsData, isLoading: isSongsLoading } = useQuery(
    ['songs', USER_ID],
    () => axios.get('/api/song-match', { params: { userId: USER_ID } }).then(res => res.data),
    { enabled: isAuthenticated }
  );

  const { data: topTracksData, isLoading: isTopTracksLoading } = useQuery(
    'topTracks',
    () => axios.get<SpotifyTrack[]>('/api/top-tracks').then(res => res.data) as Promise<SpotifyTrack[]>,
    { enabled: isAuthenticated }
  );

  const { data: overallTopTracksData, isLoading: isOverallTopTracksLoading } = useQuery(
    'overallTopTracks',
    () => axios.get<SpotifyTrack[]>('/api/overall-top-tracks').then(res => res.data) as Promise<SpotifyTrack[]>,
    { enabled: isAuthenticated }
  );

  const { data: userLeaderboardData } = useQuery(
    'userLeaderboard',
    () => axios.get<Leaderboard[]>('/api/user-leaderboard').then(res => res.data) as Promise<Leaderboard[]>,
    { enabled: isAuthenticated }
  );


  useEffect(() => {
    const cookies = parseCookies();
    if (cookies.cookie_authenticated === 'true') {
      console.log("cookies", cookies);
      USER_ID = cookies.cookie_user_encrypt_id;
      setActiveTab("match");
      setIsAuthenticated(true);
    } else {
      setActiveTab("signin");
      setIsAuthenticated(false);
    }
  }, [refreshKey]);

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
        id: track.track_uri,
        trackName: track.track_name,
        albumImageUrl: track.album_image_url,
        artistName: track.artist_name,
        rating: (track as any).rating
      })));
    } else {
      console.error('topTracksData is not an array:', topTracksData);
    }
  }, [topTracksData]);

  useEffect(() => {
    if (overallTopTracksData && Array.isArray(overallTopTracksData)) {
      setOverallTopTracks(overallTopTracksData.map((track) => ({
        id: track.track_uri,
        trackName: track.track_name,
        albumImageUrl: track.album_image_url,
        artistName: track.artist_name,
        rating: (track as any).rating
      })));
    }
  }, [overallTopTracksData]);


  const handleSignIn = async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/signin', { email, password });
      if (response.data && typeof response.data === 'object' && 'success' in response.data) {
        if (response.data.success) {
          setIsAuthenticated(true);
          queryClient.invalidateQueries(['songs', 'topTracks', 'overallTopTracks', 'userLeaderboard']);
          setActiveTab("match");
          setRefreshKey(prev => prev + 1);
          return true;
        } else {
          setMessage('Sign in failed. Please try again.');
          return false;
        }
      } else {
        setMessage('Unexpected response from server.');
        return false;
      }
    } catch (error) {
      setMessage('An error occurred during sign in.');
      return false;
    }
  };

  const handleSignOut = () => {
    destroyCookie(null, 'cookie_authenticated');
    destroyCookie(null, 'cookie_user_encrypt_id');
    setIsAuthenticated(false);
    setActiveTab("signin");
    queryClient.clear();
    setRefreshKey(prev => prev + 1);
  };

  const handleSignUp = async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/signup', { email, password });
      if ((response.data as { success: boolean }).success) {
        // setMessage('Sign up successful. Please sign in.');
        setActiveTab("match");
        setRefreshKey(prev => prev + 1);
      } else {
        setMessage('Sign up failed. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred during sign up.');
    }
  };

  const handleSelectSong = async (winnerId: string, loserId: string) => {
    try {
      await axios.post('/api/song-match', {
        userId: USER_ID,
        winnerId,
        loserId,
      });
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000); // Hide confetti after 3 seconds
      queryClient.invalidateQueries('songs');
    } catch (error) {
      setMessage('Failed to update match.');
    }
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

  return (
    <div className="flex items-start justify-center min-h-screen p-4 pt-8 sm:pt-16">
      {showConfetti && <Confetti recycle={false} numberOfPieces={50} />}
      <Card className="w-full max-w-4xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold flex items-center">
            <BeatBattleIcon className="mr-2 w-6 h-6" />
            Beat Battle
          </CardTitle>
          {isAuthenticated && (
            <Button
              onClick={handleSignOut}
              className="text-sm py-1 px-2"
              variant="outline"
            >
              Sign out
            </Button>
          )}
        </CardHeader>
        <CardContent>
        <SelectMessage isAuthenticated={isAuthenticated} />
        <AuthMessage isAuthenticated={isAuthenticated} />
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full space-y-6">
            <div className="space-between flex items-center">
              <TabsList className="hidden sm:flex">
                {isAuthenticated ? (
                  <>
                    <TabsTrigger value="match">Match</TabsTrigger>
                    <TabsTrigger value="top100">Your Top 100</TabsTrigger>
                    <TabsTrigger value="overallTop100">Overall Top 100</TabsTrigger>
                    <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
                  </>
                ) : (
                  <>
                    
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </>
                )}
              </TabsList>
              <div className="sm:hidden w-full">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    {isAuthenticated ? (
                      <>
                        <DropdownMenuItem onSelect={() => setActiveTab("match")}>Match</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setActiveTab("top100")}>Your Top 100</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setActiveTab("overallTop100")}>Overall Top 100</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setActiveTab("leaderboard")}>Leaderboard</DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem onSelect={() => setActiveTab("signin")}>Sign In</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setActiveTab("signup")}>Sign Up</DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            {isAuthenticated ? (
              <>
                <TabsContent value="match" className="border-none p-0 outline-none">
                  {isLoading || isSongsLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : songs?.song1 && songs?.song2 ? (
                    <div className="space-y-4">
                      <div className="flex flex-row justify-between gap-4">
                        {[songs.song1, songs.song2].map((song, index) => (
                          <div key={index} className="flex-1 min-w-[45%] flex flex-col">
                            <div 
                              className="relative overflow-hidden rounded-lg shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 cursor-pointer"
                              onClick={async () => {
                                await handleSelectSong(
                                  (song.track_uri as string) ?? '',
                                  (songs[index === 0 ? 'song2' : 'song1']['track_uri'] as string) ?? ''
                                );
                              }}
                            >
                              <button
                                onClick={() => {
                                  queryClient.invalidateQueries('songs');
                                }}
                                tabIndex={0} // Make the button focusable
                              >
                                <img
                                  src={song.album_image_url || PLACEHOLDER_IMAGE} 
                                  alt={song.track_name || 'Unknown Track'} 
                                  className="w-full h-auto object-cover aspect-square" 
                                />
                              </button>
                              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end p-2">
                                <div>
                                  <p className="text-white text-xs xs:text-base font-bold truncate">
                                    {song.track_name}
                                  </p>
                                  <p className="text-white text-xs xs:text-xs truncate">{song.artist_name}</p>
                                </div>
                              </div>
                            </div>
                            <SpotifyPlayer uri={`spotify:track:${song.track_uri}`} />
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
                <TabsContent value="overallTop100" className="border-none p-0 outline-none">
                  <OverallTopTracksContent tracks={overallTopTracks} isLoading={isOverallTopTracksLoading} />
                </TabsContent>
                <TabsContent value="leaderboard" className="border-none p-0 outline-none">
                  <LeaderboardContent leaderboard={userLeaderboard} isLoading={isLeaderboardLoading} />
                </TabsContent>
              </>
            ) : (
              <>
                <TabsContent value="signin" className="border-none p-0 outline-none">
                  <SignIn 
                    onSignIn={handleSignIn} 
                    isAuthenticated={isAuthenticated} 
                  />
                </TabsContent>
                <TabsContent value="signup" className="border-none p-0 outline-none">
                  <SignUp onSignUp={handleSignUp} message={message} />
                </TabsContent>
              </>
            )}
          </Tabs>
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
export default Songs;