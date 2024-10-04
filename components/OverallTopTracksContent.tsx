import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { TopTrack } from '@/interfaces/TopTrack';
import { useState } from 'react';


const PLACEHOLDER_IMAGE = '/image/placeholder.webp';

const OverallTopTracksContent: React.FC<{ tracks: TopTrack[]; isLoading: boolean }> = ({ tracks, isLoading }) => {
    const [loading, setLoading] = useState(true); // Add state to track loading

    if (isLoading) {
      return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }
  
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Overall Top 100 Tracks</h2>
        <div className="relative h-[600px]">
          <ScrollArea className="h-full absolute inset-0">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pr-4 pb-4">
              {tracks.map((track) => (
                <div key={track.id} className="flex flex-col items-center">
                  <div className="relative overflow-hidden rounded-lg shadow-lg transition-transform duration-300 ease-in-out hover:scale-105">
                    {loading && ( // Show placeholder while loading
                      <div className="w-full h-full flex items-center justify-center">
                        <p>Loading...</p> {/* Placeholder content */}
                      </div>
                    )}
                    <Image
                      src={track.albumImageUrl && track.albumImageUrl !== '' ? track.albumImageUrl : PLACEHOLDER_IMAGE}
                      alt={track.trackName || 'Unknown Track'}
                      width={200}
                      height={200}
                      className="w-full h-auto object-cover"
                      onLoad={() => setLoading(false)} // Set loading to false when image loads
                      onError={() => setLoading(false)} // Handle error case
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end p-2">
                      <p className="text-white text-xs font-semibold">Rating: {track.rating.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-xs font-medium">{track.trackName}</p>
                    <p className="text-xs text-gray-500">{track.artistName}</p>
                  </div>
                </div>
              ))}
            </div>
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </div>
      </div>
    );
  };

export default OverallTopTracksContent;