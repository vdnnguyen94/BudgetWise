import Subscription from "../models/Subscription.js";

// Get all subscriptions for a user
export const getSubscriptions = async (req, res) => {
  try {
    const { userId } = req.params;
    const subs = await Subscription.find({ userId });
    return res.json(subs);
  } catch (error) {
    console.error("Error loading subscriptions:", error);
    res
      .status(500)
      .json({ message: "Server error while loading subscriptions" });
  }
};

// Create a new subscription
export const createSubscription = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, amount, frequency, nextPaymentDate, isActive } = req.body;

    if (!name || !amount || !nextPaymentDate) {
      return res
        .status(400)
        .json({ message: "Name, amount, and next payment date are required" });
    }

    if (Number(amount) < 0) {
      return res
        .status(400)
        .json({ message: "Amount cannot be negative for a subscription" });
    }

    const newSub = new Subscription({
      userId,
      name,
      amount,
      frequency: frequency || "Monthly",
      nextPaymentDate,
      isActive: typeof isActive === "boolean" ? isActive : true,
    });

    await newSub.save();

    return res.json({
      message: "Subscription created",
      subscription: newSub,
    });
  } catch (error) {
    console.error("Error creating subscription:", error);
    res.status(500).json({ message: "Server error creating subscription" });
  }
};

// Update an existing subscription
export const updateSubscription = async (req, res) => {
  try {
    const { userId, subId } = req.params;
    const { name, amount, frequency, nextPaymentDate, isActive } = req.body;

    const updatedSub = await Subscription.findOneAndUpdate(
      { _id: subId, userId },
      { name, amount, frequency, nextPaymentDate, isActive },
      { new: true }
    );

    if (!updatedSub) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    return res.json({
      message: "Subscription updated",
      subscription: updatedSub,
    });
  } catch (error) {
    console.error("Error updating subscription:", error);
    res.status(500).json({ message: "Server error updating subscription" });
  }
};

// Delete a subscription
export const deleteSubscription = async (req, res) => {
  try {
    const { userId, subId } = req.params;

    const deleted = await Subscription.findOneAndDelete({
      _id: subId,
      userId,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    return res.json({ message: "Subscription deleted" });
  } catch (error) {
    console.error("Error deleting subscription:", error);
    res.status(500).json({ message: "Server error deleting subscription" });
  }
};