const { Router } = require('express');
const routes = Router();

const TruckController = require('./controller/truckController');
const DriverController = require('./controller/driverController');
const DeliveryController = require('./controller/deliveryController');

routes.get('/trucks', TruckController.getAll);
routes.post('/trucks', TruckController.create);
routes.get('/trucks/infor', TruckController.getTruckStats);
routes.get('/trucks/:id', TruckController.getById);

routes.get('/drivers/:id', DriverController.getById);
routes.get('/drivers', DriverController.getAll);
routes.post('/drivers', DriverController.create);


routes.get('/deliveries', DeliveryController.getAll);
routes.get('/deliveries/earnings', DeliveryController.calculateDailyEarnings);
routes.post('/deliveries', DeliveryController.create);
routes.patch('/deliveries/:id', DeliveryController.update)
routes.delete('/deliveries/:id', DeliveryController.delete);
;

module.exports = routes;