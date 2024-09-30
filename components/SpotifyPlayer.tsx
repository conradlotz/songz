import React from 'react';

interface SpotifyPlayerProps {
  uri: string;
}

const SpotifyPlayer: React.FC<SpotifyPlayerProps> = ({ uri }) => {
  const embedUrl = `https://open.spotify.com/embed/track/${uri.split(':').pop()}`;

  return (
    <div className="w-full flex justify-center mt-2">
      <iframe
        src={embedUrl}
        width="100%"
        height="80"
        frameBorder="0"
        allowTransparency={true}
        allow="encrypted-media"
        title="Spotify Player"
        className="max-w-[300px]"
      ></iframe>
    </div>
  );
};

export default SpotifyPlayer;