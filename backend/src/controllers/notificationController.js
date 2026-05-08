const Notification = require("../models/Notification");

exports.getNotifications = async (req, res) => {
  try {

    const notifications = await Notification.find({
      user: req.userId
    })

    .populate({
      path: 'request',
      model: 'Request',
      populate: {
        path: 'album',
        model: 'Album',
        select: 'title imageUrl _id'
      }
    })

    .sort({ createdAt: -1 });

    console.log(JSON.stringify(notifications, null, 2));

    res.json(notifications);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro no servidor" });
  }
};
exports.markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ message: "Notificação marcada como lida" });
  } catch (error) {
    res.status(500).json({ message: "Erro no servidor" });
  }
};

exports.deleteNotification = async (req, res) => {
  try {

    await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    res.json({
      message: "Notificação removida"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erro no servidor"
    });
  }
};

exports.clearNotifications = async (req, res) => {
  try {

    await Notification.deleteMany({
      user: req.userId
    });

    res.json({
      message: "Notificações removidas"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erro no servidor"
    });
  }
};