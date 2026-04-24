const User = require("../models/User");
const Artist = require("../models/Artist");
const bcrypt = require("bcrypt");


exports.register = async (req, res) => {
  try {
    const { username, email, password, birthDate } = req.body;

    if (!username || !email || !password || !birthDate) {
      return res.status(400).json({ message: "Todos os campos são obrigatórios" });
    }

    const usernameRegex = /^[a-zA-Z0-9]+$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        message: "Username só pode conter letras e números"
      });
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

    if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }

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
      birthDate
    });

    await user.save();

    res.status(201).json({
      message: "Utilizador criado com sucesso"
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};


exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username e password são obrigatórios"
      });
    }

    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        message: "Credenciais inválidas"
      });
    }

    res.json({
      message: "Login efetuado com sucesso",
      userId: user._id
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Server error during login"
    });
  }
};


exports.getProfile = async (req, res) => {
  try {
    const { userId } = req.query;

    const user = await User.findById(userId).populate("favoriteArtist");

    if (!user) {
      return res.status(404).json({ message: "User não encontrado" });
    }

    res.json({
      username: user.username,
      email: user.email,
      birthDate: user.birthDate,
      favoriteArtist: user.favoriteArtist
    });

  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ message: "Erro no servidor" });
  }
};


exports.updateProfile = async (req, res) => {
  try {
    const { userId, currentPassword, username, email, password, birthDate } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User não encontrado" });
    }

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.status(401).json({ message: "Password atual incorreta" });
    }

    if (username) {
      const usernameRegex = /^[a-zA-Z0-9]+$/;

      if (!usernameRegex.test(username)) {
        return res.status(400).json({
          message: "Username só pode conter letras e números"
        });
      }

      const existing = await User.findOne({ username });
      if (existing && existing._id.toString() !== userId) {
        return res.status(400).json({
          message: "Username já existe"
        });
      }

      user.username = username;
    }

    if (email) {
      const existing = await User.findOne({ email });

      if (existing && existing._id.toString() !== userId) {
        return res.status(400).json({
          message: "Email já em uso"
        });
      }

      user.email = email;
    }

    if (password) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          message: "Password inválida"
        });
      }

      user.password = await bcrypt.hash(password, 10);
    }

    if (birthDate) {
      const birthDateObj = new Date(birthDate);
      const today = new Date();

      let age = today.getFullYear() - birthDateObj.getFullYear();
      const m = today.getMonth() - birthDateObj.getMonth();

      if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
        age--;
      }

      if (age < 13) {
        return res.status(400).json({
          message: "Deve ter pelo menos 13 anos"
        });
      }

      user.birthDate = birthDate;
    }

    await user.save();

    res.json({ message: "Perfil atualizado com sucesso" });

  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Erro no servidor" });
  }
};