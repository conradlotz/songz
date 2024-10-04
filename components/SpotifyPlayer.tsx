import React from 'react';

interface SpotifyPlayerProps {
  uri: string;
}

const SpotifyPlayer: React.FC<SpotifyPlayerProps> = ({ uri }) => {
  const embedUrl = `https://open.spotify.com/embed/track/${uri.split(':').pop()}`;

  return (
    <div className="w-full flex justify-center mt-4 mb-4">
      <iframe
        src={embedUrl}
        width="100%"
        height="60"  // Height remains the same
        allow="encrypted-media"
        title="Spotify Player"
        className="w-full max-w-[300px] h-auto"  // Adjusted max width
      ></iframe>
    </div>
  );
};

export default SpotifyPlayer;