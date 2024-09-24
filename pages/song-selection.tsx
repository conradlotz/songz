import { useState, useEffect } from 'react';
import axios from 'axios';

interface Song {
  id: string;
  title: string;
  artist: string;
  eloRating: number;
}

const SongSelection = () => {
  const [matchup, setMatchup] = useState<{ song1: Song; song2: Song } | null>(null);

  useEffect(() => {
    const fetchMatchup = async () => {
      const response = await axios.get('/api/song-match');
      setMatchup(response.data);
    };

    fetchMatchup();
  }, []);

  const handleSelection = async (winnerId: string, loserId: string) => {
    await axios.post('/api/song-match', { winnerId, loserId });
    const response = await axios.get('/api/song-match');
    setMatchup(response.data);
  };

  if (!matchup) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Song Matchup</h1>
      <div>
        <h2>{matchup.song1.title} by {matchup.song1.artist}</h2>
        <button onClick={() => handleSelection(matchup.song1.id, matchup.song2.id)}>Select</button>
      </div>
      <div>
        <h2>{matchup.song2.title} by {matchup.song2.artist}</h2>
        <button onClick={() => handleSelection(matchup.song2.id, matchup.song1.id)}>Select</button>
      </div>
    </div>
  );
};

export default SongSelection;