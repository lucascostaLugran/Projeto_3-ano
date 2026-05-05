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

module.exports = {
  getArtistImage
};