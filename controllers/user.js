// USER: GET INFORMATION
const router = require('express').Router();
const { NOW } = require('sequelize');
const { Location, User, Vehicle, Reservation } = require('../models');

// USER: DELETE USER
router.delete('/:id', async (req, res) => {
    const dbUserData = await User.destroy({
        where: { id: req.params.id }
    })
//Returns 200 status if record deleted, 400 status if no record deleted
//Records = value of records deleted | 1 deleted or 0 deleted
    dbUserData > 0
        ? res.status(200).json({ records: dbUserData })
        : res.status(400).json({ records: dbUserData })
});

// USER: UPDATE INFORMATION
router.put('/:id', async (req, res) => {
    //NEED TO VALIDATE BODY INFORMATION
    const dbUserData = await User.update(req.body, {
        where: { id: req.params.id }
    })

    dbUserData > 0
    ? res.status(200).json( {records: dbUserData, data: req.body })
    : res.status(400).json( {records: dbUserData, data: req.body })
})


router.post('/:id', async (req, res) => {
    //NEED TO VALIDATE BODY INFORMATION
    const dbUserData = await User.create(req.body)

    dbUserData > 0
    ? res.status(200).json( {records: dbUserData, data: req.body })
    : res.status(400).json( {records: dbUserData, data: req.body })
})


module.exports = router;