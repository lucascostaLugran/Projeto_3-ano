const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { username, email, password, birthDate } = req.body;

    if (!username || !email || !password || !birthDate) {
      return res.status(400).json({ message: "Todos os campos são obrigatórios" });
    }

    const usernameRegex = /^[a-zA-Z0-9]+$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({ message: "Username só pode conter letras e números" });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: "Password deve ter pelo menos 8 caracteres, uma maiúscula, uma minúscula e um número"
      });
    }

    const birthDateObj = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const m = today.getMonth() - birthDateObj.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) age--;

    if (age < 13) {
      return res.status(400).json({ message: "Deve ter pelo menos 13 anos" });
    }

    const userExists = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (userExists) {
      return res.status(400).json({ message: "Username ou email já existe" });
    }

    const hashedPass = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      email,
      password: hashedPass,
      birthDate,
      favoriteArtist: null
    });

    await user.save();

    res.status(201).json({ message: "Utilizador criado com sucesso" });

  } catch {
    res.status(500).json({ message: "Erro no servidor" });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username e password são obrigatórios" });
    }

    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "1d" }
    );

    res.json({ message: "Login efetuado com sucesso", token });

  } catch {
    res.status(500).json({ message: "Erro no servidor" });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("favoriteArtist");

    if (!user) {
      return res.status(404).json({ message: "User não encontrado" });
    }

    res.json({
      username: user.username,
      email: user.email,
      birthDate: user.birthDate,
      favoriteArtist: user.favoriteArtist,
      description: user.description,
      avatar: user.avatar
    });

  } catch {
    res.status(500).json({ message: "Erro no servidor" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User não encontrado" });
    }

    const { username, email, password, birthDate, currentPassword } = req.body;

    if (username) user.username = username;
    if (email) user.email = email;
    if (birthDate) user.birthDate = new Date(birthDate);

    if (password) {

      if (!currentPassword) {
        return res.status(400).json({ message: "Password atual é obrigatória" });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);

      if (!isMatch) {
        return res.status(401).json({ message: "Password atual incorreta" });
      }

      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    res.json({ message: "Perfil atualizado com sucesso" });

  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
    res.status(500).json({ message: "Erro no servidor" });
  }
};
exports.addFavoriteArtist = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) return res.status(404).json({ message: "User não encontrado" });

    if (user.favoriteArtist) {
      return res.status(400).json({ message: "Já tens um artista favorito" });
    }

    user.favoriteArtist = req.params.id;
    await user.save();

    res.json({ message: "Adicionado aos favoritos" });

  } catch {
    res.status(500).json({ message: "Erro no servidor" });
  }
};

exports.removeFavoriteArtist = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user || !user.favoriteArtist) {
      return res.status(400).json({ message: "Não tens artista favorito" });
    }

    user.favoriteArtist = null;
    await user.save();

    res.json({ message: "Favorito removido" });

  } catch {
    res.status(500).json({ message: "Erro no servidor" });
  }
};

exports.addToCollection = async (req, res) => {
  try {
    const { albumId, ean13 } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "Utilizador não encontrado" });
    }

    const alreadyInCollection = user.collection.find(
      item => item.album.toString() === albumId
    );

    if (alreadyInCollection) {
      return res.status(400).json({
        message: "Já tens uma versão deste álbum na tua coleção!"
      });
    }

    user.collection.push({ album: albumId, ean13 });

    await user.save();

    res.status(201).json({
      message: "Adicionado à coleção com sucesso!"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro no servidor" });
  }
};

exports.getCollection = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate({
        path: "collection.album",
        populate: {
          path: "artist",
          select: "name"
        }
      });

    if (!user) {
      return res.status(404).json({ message: "Utilizador não encontrado" });
    }

    const collection = user.collection.map(item => {
      const album = item.album;

      const version = album?.versions?.find(v => v.ean13 === item.ean13);

      return {
        albumId: album?._id,
        title: album?.title,
        year: album?.year,
        artist: album?.artist?.name || 'Vários Artistas',
        artistId: album?.artist?._id,
      
        imageUrl: album?.imageUrl,   
      
        ean13: item.ean13,
        format: version?.format || 'N/A',
        description: version?.description || '',
      
        addedAt: item.addedAt
      };
    });

    res.json(collection);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar coleção" });
  }
};
exports.removeFromCollection = async (req, res) => {
  try {
    const { albumId, ean13 } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "Utilizador não encontrado" });
    }

    user.collection = user.collection.filter(
      item => !(item.album.toString() === albumId && item.ean13 === ean13)
    );

    await user.save();

    res.json({ message: "Removido da coleção com sucesso!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao remover da coleção" });
  }
};