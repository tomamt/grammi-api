const express = require('express');

const router = express.Router();
router.get('/', (req, res) => {
  res.send('Grammi API Version V1');
});
router.use('/venues', require('./venues'));
router.use('/users', require('./users'));
router.use('/user-roles', require('./userRoles'));
router.use('/invitations', require('./invitations'));
router.use('/vendors', require('./vendors'));
router.use('/delivery-locations', require('./deliveryLocations'));
router.use('/delivery-areas', require('./deliveryAreas'));
router.use('/medias', require('./medias'));
router.use('/dropdowns', require('./dropdowns'));
router.use('/deviceIds', require('./deviceIds'));
router.use('/geo-location', require('./geoLocation'));
router.use('/order-delivery-agent-details', require('./orderDeliveryAgentDetails'));
router.use('/vendor-tags', require('./vendorTags'));
router.use('/vendor-menu-sections', require('./vendorMenuSections'));
router.use('/notifications', require('./notifications'));
router.use('/discount-codes', require('./discountCodes'));
router.use('/consumer-discount-codes', require('./consumerDiscountCodes'));
router.use('/issues', require('./issues'));
router.use('/order-items', require('./orderItems'));
router.use('/order-status', require('./orderStatus'));
router.use('/order-history', require('./orderHistory'));
router.use('/menu-items', require('./menuItems'));
router.use('/vendor-operating-hours', require('./vendorOperatingHours'));
router.use('/menu-item-available-hours', require('./menuItemAvailableHours'));
router.use('/menu-item-tags', require('./menuItemTags'));
router.use('/orders', require('./orders'));
router.use('/carts', require('./carts'));
router.use('/currencies', require('./currencies'));
router.use('/otps', require('./otps'));
router.use('/recipients', require('./recipients'));
router.use('/ratings', require('./ratings'));
router.use('/delivery-agents-working-hours', require('./deliveryAgentsWorkingHours'));
router.use('/delivery-agents', require('./deliveryAgents'));
router.use('/transactions', require('./transactions'));
router.use('/noshow', require('./noshow'));
router.use('/analytics', require('./analytics'));
router.use('/default-tags', require('./defaultTags'));

router.use((err, req, res) => {
  if (err) res.status(500).json({ status: false, error: 'Something  went wrong!' });
});

module.exports = router;
