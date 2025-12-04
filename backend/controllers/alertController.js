import Alert from "../models/Alert.js";

// POST /api/alerts/:userId
export const createAlert = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      type,
      title,
      message,
      severity,
      budgetId,
      categoryId,
      billId,
      amount,
      limit,
      dueDate,
    } = req.body;

    if (!type || !title || !message) {
      return res
        .status(400)
        .json({ message: "type, title, and message are required" });
    }

    const alert = new Alert({
      userId,
      type,
      title,
      message,
      severity: severity || "info",
      budgetId: budgetId || null,
      categoryId: categoryId || null,
      billId: billId || null,
      amount: amount ?? null,
      limit: limit ?? null,
      dueDate: dueDate ? new Date(dueDate) : null,
    });

    const saved = await alert.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Error creating alert:", err);
    res
      .status(500)
      .json({ message: "Error creating alert", error: err.message });
  }
};

// GET /api/alerts/:userId?status=new
export const getAlertsForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;

    const query = { userId };
    if (status) {
      query.status = status;
    }

    const alerts = await Alert.find(query)
      .sort({ createdAt: -1 })
      .lean();

    res.json(alerts);
  } catch (err) {
    console.error("Error fetching alerts:", err);
    res
      .status(500)
      .json({ message: "Error fetching alerts", error: err.message });
  }
};

// PATCH /api/alerts/:userId/:alertId
export const updateAlertStatus = async (req, res) => {
  try {
    const { userId, alertId } = req.params;
    const { status } = req.body;

    if (!["new", "read", "dismissed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const alert = await Alert.findOneAndUpdate(
      { _id: alertId, userId },
      { status },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    res.json(alert);
  } catch (err) {
    console.error("Error updating alert:", err);
    res
      .status(500)
      .json({ message: "Error updating alert", error: err.message });
  }
};

// DELETE /api/alerts/:userId/:alertId (optional)
export const deleteAlert = async (req, res) => {
  try {
    const { userId, alertId } = req.params;
    await Alert.findOneAndDelete({ _id: alertId, userId });
    res.json({ message: "Alert deleted successfully" });
  } catch (err) {
    console.error("Error deleting alert:", err);
    res
      .status(500)
      .json({ message: "Error deleting alert", error: err.message });
  }
};
