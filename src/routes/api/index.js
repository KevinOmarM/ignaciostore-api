//RUTAS API
//sera el enrutador unico para las rutas de la API
const router= require('express').Router();


router.use('/users', require('./user'));
router.use('/products', require('./products'));
router.use('/auth', require('./auth'));

//router.use('/buys', require('./buy.route'));
//router.use('/logs', require('./log.route'));

module.exports = router;