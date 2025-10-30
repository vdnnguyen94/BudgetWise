import Notification from "../models/notification.js";

export const getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications", error: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const updated = await Notification.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });
    if (!updated) return res.status(404).json({ message: "Notification not found" });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error marking notification as read", error: error.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    await Notification.findByIdAndDelete(notificationId);
    res.status(200).json({ message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting notification", error: error.message });
  }
};

