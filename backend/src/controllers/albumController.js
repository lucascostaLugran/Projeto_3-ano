const Album = require("../models/Album");
const Artist = require("../models/Artist");

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
      return res.status(404).json({ message: "Nenhum álbum encontrado." });
    }
    res.status(200).json(albums);
  } catch (error) {
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