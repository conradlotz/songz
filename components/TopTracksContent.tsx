import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Image from 'next/image';
import { TopTrack } from '@/interfaces/TopTrack';

const PLACEHOLDER_IMAGE = '/image/placeholder.webp';

const TopTracksContent: React.FC<{ tracks: TopTrack[] }> = ({ tracks }) => {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Top 100 Tracks</h2>
        <div className="relative h-[600px]">
          <ScrollArea className="h-full absolute inset-0">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pr-4 pb-4">
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

export default TopTracksContent;