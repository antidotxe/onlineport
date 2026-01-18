import type { APIRoute } from 'astro';

const DISCORD_USER_ID = import.meta.env.DISCORD_USER_ID || '629344560203431977';

export const GET: APIRoute = async () => {
  try {
    const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`);
    const data = await response.json();

    console.log('Lanyard response:', JSON.stringify(data, null, 2));

    if (!data.success) {
      return new Response(JSON.stringify({ isPlaying: false, error: 'Lanyard API returned unsuccessful' }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const presence = data.data;
    const spotify = presence.spotify;

    console.log('Spotify data:', spotify);
    console.log('Listening to Spotify:', presence.listening_to_spotify);

    if (spotify && presence.listening_to_spotify) {
      return new Response(
        JSON.stringify({
          isPlaying: true,
          title: spotify.song,
          artist: spotify.artist,
          album: spotify.album,
          albumImageUrl: spotify.album_art_url,
          songUrl: `https://open.spotify.com/track/${spotify.track_id}`,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=15',
          },
        }
      );
    }

    return new Response(JSON.stringify({ 
      isPlaying: false, 
      debug: {
        hasSpotify: !!spotify,
        listeningToSpotify: presence.listening_to_spotify,
        activities: presence.activities
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Lanyard error:', error);
    return new Response(JSON.stringify({ isPlaying: false, error: String(error) }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
