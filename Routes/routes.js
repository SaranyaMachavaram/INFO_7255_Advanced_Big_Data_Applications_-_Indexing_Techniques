const express = require('express');
const router = express.Router();
const controller = require('../Controllers/controller');
const service = require('../Services/services');

router.post('/create',service.verifyToken, controller.create);
router.get('/getAll', service.verifyToken,controller.get);
router.patch('/patch/:objectId',service.verifyToken,controller.patch);
router.delete('/delete/:objectId',service.verifyToken,controller.Delete);
router.put('/merge/:objectId', service.verifyToken,controller.merge); 
router.post('/createParent', service.verifyToken, controller.createParent);
router.post('/createChild', service.verifyToken, controller.createChild);
router.delete('/deletecasacade/:objectId',service.verifyToken,controller.deleteCasacade);

module.exports = router;
