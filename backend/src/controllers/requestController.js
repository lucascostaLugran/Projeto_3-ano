const Request = require("../models/Request");
const Album = require("../models/Album");
const Notification = require("../models/Notification");

exports.createRequest = async (req, res) => {
  try {
    const { albumId, ean13, format, description } = req.body;

    if (!albumId || !ean13 || !format) {
      return res.status(400).json({ message: "Album, EAN-13 e formato são obrigatórios" });
    }

    const album = await Album.findById(albumId);
    if (!album) {
      return res.status(404).json({ message: "Álbum não encontrado" });
    }

    const versionExists = album.versions.find(v => v.ean13 === ean13);
    if (versionExists) {
      return res.status(400).json({ message: "Esta versão já existe neste álbum" });
    }

    const request = await Request.create({
      user: req.userId,
      album: albumId,
      ean13,
      format,
      description: description || ""
    });

    res.status(201).json({
      message: "Pedido submetido com sucesso",
      request
    });

  } catch (error) {
    console.error("Create request error:", error);
    res.status(500).json({ message: "Erro no servidor" });
  }
};

exports.getUserRequests = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = { user: req.userId };
    if (status) filter.status = status;

    const requests = await Request.find(filter)
      .populate('album', 'title')
      .sort({ createdAt: -1 });

    res.json(requests);

  } catch (error) {
    console.error("Get requests error:", error);
    res.status(500).json({ message: "Erro no servidor" });
  }
};

exports.updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['aceite', 'recusado'].includes(status)) {
      return res.status(400).json({ message: "Estado inválido" });
    }

    const request = await Request.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Pedido não encontrado" });
    }

    if (request.status !== 'em análise') {
      return res.status(400).json({ message: "Este pedido já foi processado" });
    }

    request.status = status;
    await request.save();

    if (status === 'aceite') {
      await Album.findByIdAndUpdate(request.album, {
        $push: {
          versions: {
            ean13: request.ean13,
            format: request.format,
            description: request.description
          }
        }
      });
    }

    await Notification.create({
      user: request.user,
      request: request._id,
      message: status === 'aceite'
        ? `O teu pedido foi aceite e a versão foi adicionada ao álbum`
        : `O teu pedido foi recusado`
    });

    res.json({ message: "Pedido atualizado com sucesso", request });

  } catch (error) {
    console.error("Update request error:", error);
    res.status(500).json({ message: "Erro no servidor" });
  }
};