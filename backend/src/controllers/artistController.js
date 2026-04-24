const Artist = require("../models/Artist");
const Album = require("../models/Album");


exports.createArtist = async (req, res) => {
  try {
    const { name, isni, startYear } = req.body;

    if (!name || !isni || !startYear) {
      return res.status(400).json({
        message: "Todos os campos são obrigatórios"
      });
    }

    const artistExists = await Artist.findOne({ isni });

    if (artistExists) {
      return res.status(400).json({
        message: "Já existe um artista com este ISNI"
      });
    }

    const artist = new Artist({
      name,
      isni,
      startYear
    });

    await artist.save();

    res.status(201).json({
      message: "Artista criado com sucesso",
      artist
    });

  } catch (error) {
    console.error("Create artist error:", error);
    res.status(500).json({
      message: "Erro no servidor"
    });
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

    for (const artist of artists) {
      if (!artist.name || !artist.isni || !artist.startYear) {
        return res.status(400).json({
          message: "Todos os artistas devem ter name, isni e startYear"
        });
      }
    }

    const existing = await Artist.find({
      isni: { $in: artists.map(a => a.isni) }
    });

    const existingIsnis = existing.map(a => a.isni);

    const newArtists = artists.filter(
      a => !existingIsnis.includes(a.isni)
    );

    if (newArtists.length === 0) {
      return res.status(400).json({
        message: "Todos os artistas já existem"
      });
    }

    const inserted = await Artist.insertMany(newArtists);

    res.status(201).json({
      message: `${inserted.length} artistas inseridos com sucesso`,
      inserted
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

    const operations = updates.map(item => {
      const updateFields = {};

      if (item.name !== undefined) updateFields.name = item.name;
      if (item.startYear !== undefined) updateFields.startYear = item.startYear;
      if (item.description !== undefined) updateFields.description = item.description;

      return {
        updateOne: {
          filter: { _id: item.id },
          update: { $set: updateFields }
        }
      };
    });

    const result = await Artist.bulkWrite(operations);

    res.json({
      message: "Artistas atualizados com sucesso",
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
      name: { $regex: name, $options: "i" }
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

    const albums = await Album.find({ artist: id });

    res.json({
      artist,
      albums
    });

  } catch (error) {
    console.error("Get artist error:", error);
    return res.status(400).json({
      message: "Já existe um artista com este ISNI"
    });
  }
};