const axios = require('axios');

let accessToken = null;
let tokenExpiresAt = 0;

async function getAccessToken() {
  const now = Date.now();

  if (accessToken && now < tokenExpiresAt) {
    return accessToken;
  }

  const response = await axios.post(
    'https://accounts.spotify.com/api/token',
    new URLSearchParams({
      grant_type: 'client_credentials'
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization:
          'Basic ' +
          Buffer.from(
            process.env.SPOTIFY_CLIENT_ID +
            ':' +
            process.env.SPOTIFY_CLIENT_SECRET
          ).toString('base64')
      }
    }
  );

  accessToken = response.data.access_token;
  tokenExpiresAt = now + response.data.expires_in * 1000;

  return accessToken;
}

async function getArtistImage(artistName) {
  const token = await getAccessToken();

  const res = await axios.get(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(
      artistName
    )}&type=artist&limit=1`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const artist = res.data.artists.items[0];

  if (!artist || !artist.images.length) {
    return null;
  }

  return artist.images[0].url;
}

async function getSpotifyArtist(artistName) {
  const token = await getAccessToken();

  const res = await axios.get(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(
      artistName
    )}&type=artist&limit=1`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const artist = res.data.artists.items[0];

  if (!artist) {
    return null;
  }
  return {
    spotifyId: artist.id,
    imageUrl: artist.images?.[0]?.url || "",
    name: artist.name
  };
}


async function getArtistAlbums(artistId) {
  await new Promise(r => setTimeout(r, 500));
  const token = await getAccessToken();

  const albums = [];
  let url = `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album%2Csingle`;

  while (url) {
    const albumsRes = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    for (const album of albumsRes.data.items) {
      await new Promise(r => setTimeout(r, 200));
      const detailsRes = await axios.get(
        `https://api.spotify.com/v1/albums/${album.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const details = detailsRes.data;

      albums.push({
        spotifyId: details.id,
        title: details.name,
        year: parseInt(details.release_date?.split("-")[0]),
        type: details.album_type === "single" ? "single"
            : details.album_type === "compilation" ? "compilation"
            : "album",
        imageUrl: details.images?.[0]?.url || "",
        tracks: details.tracks.items.map(track => ({
          number: track.track_number,
          title: track.name,
          duration: Math.floor(track.duration_ms / 1000)
        }))
      });
    }

    url = albumsRes.data.next || null;
  }

  return albums;
}


module.exports = {
  getArtistImage,
  getSpotifyArtist,
  getArtistAlbums
};