// Deprecated route - remove in v2

const express = require('express');

const router = express.Router();
// const notifications = require('../controllers/notifications');
// const middlewareReponse = require('../middleware/response');

/* Redirect to API for notifications. */
/* router.post('/', notifications.saveNotification, middlewareReponse.saveResponse);
router.get('/:notificationsId', notifications.getNotification, middlewareReponse.getByIdResponse);
router.get('/', notifications.getAllNotification, middlewareReponse.getAllResponse);
router.put('/:notificationsId', notifications.updateNotification, middlewareReponse.updateResponse);
router.patch('/:notificationsId', notifications.updatePartialNotification,
middlewareReponse.updateResponse);
router.delete('/:notificationsId', notifications.deleteNotification,
middlewareReponse.deleteResponse); */

module.exports = router;
