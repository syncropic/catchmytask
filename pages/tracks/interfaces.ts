export interface ITrack {
  id: string;
  name: string;
  artists: string[];
  created_at: Date | string;
  added_at: Date | string;
  updated_at: Date | string;
  popularity: number;
  danceability: number;
  energy: number;
  key: number;
  speechiness: number;
  instrumentalness: number;
  loudness: number;
  genre: string;
  explicit: boolean;
  description: string;
  acousticness: number;
  goes_well_with: string;
  time_signature: number;
  tempo: number;
  valence: number;
  author: string;
  spotify_track_id: string;
  spotify_uri: string;
  spotify_album_image_url: string;
  spotify_duration: number;
  spotify_external_url: string;
  spotify_href: string;
  spotify_key: number;
  spotify_preview_url: string;
}

export interface ITrackLocation {
  id: string;
  track_id: string;
  added_at: Date | string;
  updated_at: Date | string;
  path: string;
  type: string;
  author: string;
}

export interface ITrackAnalysisEmbeddings {
  id: string;
  track_id: string;
  added_at: Date | string;
  updated_at: Date | string;
  description_embedding: string;
}

export interface IArtist {
  id: string;
  name: string;
  added_at: Date | string;
  updated_at: Date | string;
}

export interface IArtistSpotifyInfo {
  id: string;
  artist_id: string;
  added_at: Date | string;
  updated_at: Date | string;
  spotify_artist_id: string;
}

// export a simple react component
const HelloWorld = () => {
  return "hello world!";
};

export default HelloWorld;
