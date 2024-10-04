export interface Song {
  [key: string]: string | undefined;
  track_uri?: string;
  track_name?: string;
  album_image_url?: string;
  artist_name?: string;
  // Add other specific properties as needed
}