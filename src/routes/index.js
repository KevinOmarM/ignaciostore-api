//RUTAS GLOBALES
//este sera el enrutador para toda nuestra aplicacion
'use strict'
const router= require('express').Router();

router.use('/api', require('./api'));

module.exports = router;