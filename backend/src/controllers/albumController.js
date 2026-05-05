const Album = require("../models/Album");
const Artist = require("../models/Artist");

exports.createAlbum = async (req, res) => {
  try {
    const { mbid, title, year, type, artist } = req.body;

    if (!mbid || !title || !year || !type) {
      return res.status(400).json({
        message: "Campos obrigatórios em falta"
      });
    }

    const exists = await Album.findOne({ mbid });

    if (exists) {
      return res.status(400).json({
        message: "Já existe um álbum com este MBID"
      });
    }

    if (artist) {
      const artistExists = await Artist.findById(artist);
      if (!artistExists) {
        return res.status(404).json({
          message: "Artista não encontrado"
        });
      }
    }

    const album = new Album({
      mbid,
      title,
      year,
      type,
      artist: artist || null
    });

    await album.save();

    res.status(201).json({
      message: "Álbum criado com sucesso",
      album
    });

  } catch (error) {
    console.error("Create album error:", error);
    res.status(500).json({ message: "Erro no servidor" });
  }
};

exports.createAlbumsBulk = async (req, res) => {
  try {
    const albums = req.body;

    if (!Array.isArray(albums) || albums.length === 0) {
      return res.status(400).json({
        message: "Deve enviar um array de álbuns"
      });
    }

    for (const album of albums) {
      if (!album.mbid || !album.title || !album.year || !album.type) {
        return res.status(400).json({
          message: "Todos os álbuns devem ter mbid, title, year e type"
        });
      }
    }

    const existing = await Album.find({
      mbid: { $in: albums.map(a => a.mbid) }
    });

    const existingMbids = existing.map(a => a.mbid);

    const newAlbums = albums.filter(
      a => !existingMbids.includes(a.mbid)
    );

    if (newAlbums.length === 0) {
      return res.status(400).json({
        message: "Todos os álbuns já existem"
      });
    }

    const inserted = await Album.insertMany(newAlbums);

    res.status(201).json({
      message: `${inserted.length} álbuns inseridos com sucesso`,
      inserted
    });

  } catch (error) {
    console.error("Bulk album error:", error);
    res.status(500).json({
      message: "Erro no servidor"
    });
  }
};

exports.searchAlbums = async (req, res) => {
  try {
    const { title } = req.query;
    if (!title) {
      return res.status(400).json({ message: "O título é obrigatório para a pesquisa." });
    }
    const albums = await Album.find({ 
      title: { $regex: title, $options: 'i' } 
    }).populate('artist', 'name'); 

    if (albums.length === 0) {
      return res.status(200).json({ message: "Nenhum álbum encontrado.", results: [] });
    }

    res.status(200).json(albums);
  }
  catch (error) {
    console.error("Search album error:", error);
    res.status(500).json({ message: "Erro ao realizar pesquisa." });
  }
};

exports.getAlbumById = async (req, res) => {
  try {
    const album = await Album.findById(req.params.id).populate('artist');
    
    if (!album) {
      return res.status(404).json({ message: "Álbum não encontrado." });
    }

    res.status(200).json(album);
  } catch (error) {
    console.error("Get album detail error:", error);
    res.status(500).json({ message: "Erro ao carregar detalhes do álbum." });
  }
};