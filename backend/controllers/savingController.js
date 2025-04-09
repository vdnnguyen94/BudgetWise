import Saving from "../models/Saving.js";

export const createSaving = async (req, res) => {
  try {
    const { userId } = req.params;
    const saving = new Saving({ ...req.body, userId });
    await saving.save();
    res.status(201).json(saving);
  } catch (err) {
    res.status(500).json({ message: "Failed to create saving" });
  }
};

export const getSavings = async (req, res) => {
  try {
    const { userId } = req.params;
    const savings = await Saving.find({ userId });
    res.status(200).json(savings);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch savings" });
  }
};

export const deleteSaving = async (req, res) => {
  try {
    const { savingId } = req.params;
    await Saving.findByIdAndDelete(savingId);
    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete saving" });
  }
};
