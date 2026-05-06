const Artist = require("../models/Artist");
const Album = require("../models/Album");
const {
  getSpotifyArtist,
  getArtistAlbums
} = require("../services/spotifyService");

exports.createArtist = async (req, res) => {
  try {
    const { name, isni, startYear, description } = req.body;

    if (!name || !isni || !startYear) {
      return res.status(400).json({ message: "Todos os campos são obrigatórios" });
    }

    const artistExists = await Artist.findOne({ isni });
    if (artistExists) {
      return res.status(400).json({ message: "Já existe um artista com este ISNI" });
    }

    let imageUrl = "";
    let spotifyId = "";

    try {
      const spotifyArtist = await getSpotifyArtist(name);
      if (spotifyArtist) {
        imageUrl = spotifyArtist.imageUrl;
        spotifyId = spotifyArtist.spotifyId;
      }
    } catch (err) {
      console.log("Spotify fetch error:", err.message);
    }

    const artist = new Artist({ name, isni, startYear, description, imageUrl, spotifyId });
    await artist.save();

    if (spotifyId) {
      try {
        console.log("A buscar álbuns para spotifyId:", spotifyId);
        const spotifyAlbums = await getArtistAlbums(spotifyId); 
        console.log("Álbuns encontrados:", spotifyAlbums.length);
        const allVersions = [
          { format: "CD", description: "" },
          { format: "CD", description: "Deluxe" },
          { format: "Vinyl", description: "180g" },
          { format: "Vinyl", description: "Deluxe Edition" },
          { format: "Vinyl", description: "Remastered" },
          { format: "Cassette", description: "Limited Edition" }
        ];
        
        const generateEAN = () =>
          Math.floor(Math.random() * 1e13).toString().padStart(13, "0");
        
        const shuffle = (array) => array.sort(() => Math.random() - 0.5);

        const albumsToInsert = spotifyAlbums.map(album => {


          const shuffled = shuffle([...allVersions]);
          const numVersions = Math.floor(Math.random() * 4) + 1;
        
          const selected = shuffled.slice(0, numVersions);

          const versions = selected.map(v => ({
            ean13: generateEAN(),
            format: v.format,
            description: v.description
          }));
        
          return {
            spotifyId: album.spotifyId,
            mbid: album.spotifyId,
            title: album.title,
            year: album.year,
            type: album.type,
            imageUrl: album.imageUrl,
            tracks: album.tracks,
            artist: artist._id,
            versions 
          };
        });

        if (albumsToInsert.length > 0) {
          await Album.insertMany(albumsToInsert, { ordered: false });
          console.log("Álbuns inseridos:", albumsToInsert.length);
        }
      } catch (err) {
        console.error("Erro ao buscar/inserir álbuns:", err.message);
      }
    }

    res.status(201).json({ message: "Artista e álbuns criados com sucesso", artist });

  } catch (error) {
    console.error("Create artist error:", error);
    res.status(500).json({ message: "Erro no servidor" });
  }
};

exports.createArtistsBulk = async (req, res) => {

  try {

    const artists = req.body;

    if (!Array.isArray(artists) || artists.length === 0) {
      return res.status(400).json({
        message: "Deve enviar um array de artistas"
      });
    }

    const insertedArtists = [];

    for (const item of artists) {

      if (!item.name || !item.isni || !item.startYear) {
        continue;
      }

      const exists = await Artist.findOne({
        isni: item.isni
      });

      if (exists) {
        continue;
      }

      let imageUrl = "";
      let spotifyId = "";

      try {

        const spotifyArtist = await getSpotifyArtist(item.name);

        if (spotifyArtist) {
          imageUrl = spotifyArtist.imageUrl;
          spotifyId = spotifyArtist.spotifyId;
        }

      } catch (err) {
        console.log("Spotify fetch error:", err.message);
      }

      const artist = await Artist.create({
        name: item.name,
        isni: item.isni,
        startYear: item.startYear,
        description: item.description || "",
        imageUrl,
        spotifyId
      });

      insertedArtists.push(artist);

      if (spotifyId) {

        const spotifyAlbums = await getArtistAlbums(spotifyId);

        const albumsToInsert = spotifyAlbums.map(album => ({
          spotifyId: album.spotifyId,
          title: album.title,
          year: album.year,
          type: album.type,
          imageUrl: album.imageUrl,
          tracks: album.tracks,
          artist: artist._id
        }));

        if (albumsToInsert.length > 0) {

          await Album.insertMany(albumsToInsert, {
            ordered: false
          });

        }
      }
    }

    res.status(201).json({
      message: `${insertedArtists.length} artistas inseridos com sucesso`,
      inserted: insertedArtists
    });

  } catch (error) {

    console.error("Bulk insert error:", error);

    res.status(500).json({
      message: "Erro no servidor"
    });
  }
};



exports.updateArtistsBulk = async (req, res) => {
  try {
    const updates = req.body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        message: "Deve enviar um array de atualizações"
      });
    }

    for (const item of updates) {
      if (!item.id) {
        return res.status(400).json({
          message: "Cada item deve ter um 'id'"
        });
      }
    }

    const operations = [];

    for (const item of updates) {
      const updateFields = {};

      if (item.name !== undefined) updateFields.name = item.name;
      if (item.startYear !== undefined) updateFields.startYear = item.startYear;
      if (item.description !== undefined) updateFields.description = item.description;

      const artist = await Artist.findById(item.id);
      const artistName = item.name || artist?.name;

      let imageUrl = null;
      try {
        imageUrl = await getArtistImage(artistName);
      } catch (err) {
        console.log("Spotify fetch error:", err.message);
      }

      if (imageUrl) {
        updateFields.imageUrl = imageUrl;
      }

      operations.push({
        updateOne: {
          filter: { _id: item.id },
          update: { $set: updateFields }
        }
      });
    }

    const result = await Artist.bulkWrite(operations);

    res.json({
      message: "Artistas atualizados com imagem automaticamente",
      result
    });

  } catch (error) {
    console.error("Bulk update error:", error);
    res.status(500).json({
      message: "Erro no servidor"
    });
  }
};

exports.searchArtists = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({
        message: "Parâmetro de pesquisa obrigatório"
      });
    }

    const artists = await Artist.find({
      name: { $regex: `^${name}`, $options: "i" }
    }).limit(10);

    if (artists.length === 0) {
      return res.status(404).json({
        message: "Nenhum artista encontrado"
      });
    }

    res.json(artists);

  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      message: "Erro no servidor"
    });
  }
};


exports.getArtistById = async (req, res) => {
  try {
    const { id } = req.params;

    const artist = await Artist.findById(id);

    if (!artist) {
      return res.status(404).json({
        message: "Artista não encontrado"
      });
    }

    const albums = await Album.find({ artist: id })
      .sort({ year: -1 });

    res.json({
      artist,
      albums
    });

  } catch (error) {
    console.error("Get artist error:", error);
    return res.status(500).json({
      message: "Erro no servidor"
    });
  }
};
exports.getArtistAlbums = async (req, res) => {
  try {
    const { id } = req.params;

    const albums = await Album.find({ artist: id })
      .sort({ year: -1 });

    if (albums.length === 0) {
      return res.status(404).json({
        message: "Nenhum álbum encontrado"
      });
    }

    res.json(albums);

  } catch (error) {
    console.error("Get artist albums error:", error);
    res.status(500).json({
      message: "Erro no servidor"
    });
  }
};