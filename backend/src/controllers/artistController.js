const Artist = require("../models/Artist");
const User = require("../models/User");
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

    res.json(artist);

  } catch (error) {
    console.error("Get artist error:", error);
    res.status(500).json({
      message: "Erro no servidor"
    });
  }
};

exports.addFavoriteArtist = async (req, res) => {
  try {
    const { userId } = req.body;
    const { id } = req.params;

    const user = await User.findById(userId);
    const artist = await Artist.findById(id); 

    if (!user) {
      return res.status(404).json({ message: "User não encontrado" });
    }

    if (!artist) {
      return res.status(404).json({ message: "Artista não encontrado" });
    }

    if (user.favoriteArtist) {
      return res.status(400).json({
        message: "Já tens um artista favorito"
      });
    }

    user.favoriteArtist = artist._id; 
    await user.save();

    res.json({ message: "Artista adicionado como favorito" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro no servidor" });
  }
};

exports.removeFavoriteArtist = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User não encontrado" });
    }

    if (!user.favoriteArtist) {
      return res.status(400).json({
        message: "Não tens artista favorito"
      });
    }

    user.favoriteArtist = null;
    await user.save();

    res.json({ message: "Artista favorito removido" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro no servidor" });
  }
};