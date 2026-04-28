const express = require("express");
const router = express.Router();

const Artist = require("../models/Artist");
const Album = require("../models/Album");
const User = require("../models/User");
const bcrypt = require("bcrypt");

router.post("/init", async (req, res) => {
  try {
    await Album.deleteMany();
    await Artist.deleteMany();
    await User.deleteMany();

    const artists = await Artist.insertMany([
      { name: "Travis Scott", isni: "1111", startYear: 2008 },
      { name: "Drake", isni: "2222", startYear: 2006 },
      { name: "Kanye West", isni: "3333", startYear: 2004 },
      { name: "The Weeknd", isni: "4444", startYear: 2010 }
    ]);

    await Album.insertMany([
      {
        title: "Astroworld",
        year: 2018,
        type: "Album",
        artist: artists[0]._id
      },
      {
        title: "Utopia",
        year: 2023,
        type: "Album",
        artist: artists[0]._id
      },
      {
        title: "Views",
        year: 2016,
        type: "Album",
        artist: artists[1]._id
      },
      {
        title: "Scorpion",
        year: 2018,
        type: "Album",
        artist: artists[1]._id
      },
      {
        title: "Donda",
        year: 2021,
        type: "Album",
        artist: artists[2]._id
      },
      {
        title: "After Hours",
        year: 2020,
        type: "Album",
        artist: artists[3]._id
      }
    ]);

    const hashedPass = await bcrypt.hash("Password123", 10);

    const user = await User.create({
      username: "testuser",
      email: "test@test.com",
      password: hashedPass,
      birthDate: new Date("2000-01-01"),
      favoriteArtist: null
    });

    res.json({
      message: "Base de dados inicializada com sucesso",
      login: {
        username: "testuser",
        password: "Password123"
      }
    });

  } catch (error) {
    console.error("INIT ERROR:", error);
    res.status(500).json({
      message: "Erro ao inicializar base de dados"
    });
  }
});

module.exports = router;