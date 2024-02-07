const router = require('express').Router();
const sequelize = require('../config/connection.js');
const { NOW } = require('sequelize');
const { Location, User, Vehicle, Reservation } = require('../models');
const locationRoute = require('./location.js');
const vehicleRoute = require('./vehicle.js');
const userRoute = require('./user.js');
const reservationRoute = require('./reservation.js');
const withAuth = require('../utils/auth');



router.use('/location', locationRoute)
router.use('/user', userRoute)
router.use('/vehicle', vehicleRoute)
router.use('/reservation', reservationRoute)

//Show All Vehicles Route
router.get('/vehicles', async (req, res) => {
    const dbVehicleData = await Vehicle.findAll({
        order: ['location_id'],
        include: {
            model: Location,
            attributes: ['name']
        }
    })
    const vehicleData = dbVehicleData.map((data) => data.get({plain: true}))

    console.log(vehicleData)
    vehicleData===null 
        ? res.render('home', {authenticated: req.session.authenticated, message: 'No vehicles found.', layout: 'error' })
        : res.render('vehicle', {vehicleData, authenticated: req.session.authenticated, layout: 'hero'})
});
//END show all vehicles


// API GET ALL LOCATIONS
router.get('/locations', async (req, res) => {
    const dbLocationData = await Location.findAll({
        include: { 
            model: Vehicle,
            attributes: ['brand', 'model', 'year']
        }
    })

    const locData = dbLocationData.map((data) => data.get({plain: true}))

    locData===null 
    ? res.render('home', {authenticated: req.session.authenticated, message: 'No locations found.', layout: 'error' })
    : res.render('locations', {locData, authenticated: req.session.authenticated,  layout: 'hero'})
});


// RESERVATION: Get Reservation(s)
router.get('/reservations', withAuth, async (req, res) => {
    console.log("Reservation", req.session.user_id)
    const dbReservationData = await Reservation.findAll({
        where: { user_id: req.session.user_id }, 
        attributes: ['id', 'check_out', 'check_in'],
        include: [{
            model: User,
            attributes: ['name'],
        },
        {
            model: Vehicle,
            attributes: ['brand', 'model', 'year']
        },
        {
            model: Location,
            attributes: ['name', 'address']
        }]
    })

    const reservationData = dbReservationData.map((data) => data.get({ plain: true }));
    console.log(reservationData)
    reservationData===null 
        ? res.render('home', {authenticated: req.session.authenticated, message: 'No reservations found.', layout: 'error' })
        : res.render('reservation', {reservationData, authenticated: req.session.authenticated, layout: 'main'})
})


// PROFILE(DASHBOARD) ROUTE
    router.get('/profile', withAuth, async (req, res) => {
        const dbUserData = await User.findByPk(req.session.user_id, {
            include: {
                model: Location,
                attributes: ['id', 'name']
            },
            attributes: {
                exclude: ['password']
            }
        })
        const userData = dbUserData.get({plain: true});

        const dbReservationData = await Reservation.findOne({
            where: {
                user_id: req.session.user_id
            }
        })

        let reservationData;

        dbReservationData == null
        ? reservationData = null
        : reservationData = dbReservationData.get({plain: true});

        //set authenticated to saved session variable for true/false - Navigation partial shows 'Account' or 'Login'
        res.render('dashboard', { userData, reservationData, authenticated: req.session.authenticated , layout: 'main'});
    });
// END PROFILE(DASHBOARD) ROUTE

// HOMEPAGE ROUTE
    router.get('/', async (req, res) => {
        const dbLocData = await Location.findAll()
        const locData = dbLocData.map((data) => data.get({ plain: true }));
        console.log(locData);
        res.render('home', { locData , authenticated: req.session.authenticated , layout: 'hero'});
    });
// END HOMEPAGE ROUTE

// LOGIN ROUTE
router.get('/login', async (req, res) => {

    res.render('form', { form: true, authenticated: req.session.authenticated, layout: 'main'});
});
// END LOGIN ROUTE


router.post('/login', async (req, res) => {
    try {
      // Find the user who matches the posted e-mail address
      const userData = await User.findOne({ where: { email: req.body.email } });
  
      if (!userData) {
        res
          .status(400)
          .json({ message: 'Incorrect email or password, please try again' });
        return;
      }
  
      // Verify the posted password with the password store in the database
      //const validPassword = await userData.validatePW(req.body.password);
  
    //   if (!validPassword) {
    //     res
    //       .status(400)
    //       .json({ message: 'Incorrect email or password, please try again' });
    //     return;
    //   }
  
      // Create session variables based on the logged in user
      req.session.save(() => {
        req.session.user_id = userData.id;
        req.session.location_id = userData.location_id;
        req.session.authenticated = true;
        
        res.render('home', {authenticated: req.session.authenticated, layout: 'hero'})
      });
  
    } catch (err) {
        res.render('home', {authenticated: req.session.authenticated, layout: 'error'})
    }
  });

// SIGNUP ROUTE
router.get('/signup', async (req, res) => {

    res.render('form', {form: false, authenticated: req.session.authenticated, layout: 'main'});
});
// END SIGNUP ROUTE


// CATCH ALL FOR ROUTING
    // router.get('*', (req, res) => {
    //     res.render('home', { authenticated: req.session.authenticated, layout: 'error' })
    // });
// END CATCH ALL

module.exports = router;
