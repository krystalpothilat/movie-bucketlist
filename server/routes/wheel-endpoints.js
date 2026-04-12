const express = require('express');
const router = express.Router();

const Wheel = require('../models/Wheel');

//SAVE WHEEL TO DB
router.post('/save-wheel', async (req, res) => {
  try {
    const wheelData = req.body;
    console.log(wheelData);
    const wheel = new Wheel(wheelData); // Create a new Wheel instance
    await wheel.save(); // Save to database

    res.status(200).json(wheel);
  } catch (error) {
    res.status(500).send('Error adding wheel: ' + error.message);
  }
});

// DELETE WHEEL FROM DB
router.delete('/delete-wheel/:id', async (req, res) => {
  try {
    await Wheel.findByIdAndDelete(req.params.id);
    res.status(200).send('Wheel deleted successfully');
  } catch (err) {
    res.status(500).send('Error deleting wheel');
  }
});

// UPDATE WHEEL
router.post('/update-wheel/:id', async (req, res) => {
  try {
    const updatedWheel = await Wheel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).send('Wheel updated successfully');
  } catch (err) {
    res.status(500).send('Error updating wheel');
  }
});

// GET ALL SAVED WHEELS
router.get('/get-saved-wheels', async (req, res) => {
  try {
    const wheels = await Wheel.find();
    res.status(200).json(wheels);
  } catch (err) {
    res.status(500).send('Server error fetching wheels');
  }
});

module.exports = router;
