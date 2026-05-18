const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const ctrl = require('../controllers/admin.controller');

// All admin routes require authentication + admin role
router.use(authenticate, authorize('admin'));

/**
 * @swagger
 * /api/admin/leave-types:
 *   get:
 *     tags: [Admin]
 *     summary: Get all leave type configurations
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Leave types list }
 *   post:
 *     tags: [Admin]
 *     summary: Create a new leave type
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Leave type created }
 */
router.get('/leave-types', ctrl.getLeaveTypes);
router.post('/leave-types', ctrl.createLeaveType);
router.put('/leave-types/:id', ctrl.updateLeaveType);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: List all users
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Users list }
 *   post:
 *     tags: [Admin]
 *     summary: Create a new user
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: User created }
 */
router.get('/users', ctrl.getUsers);
router.post('/users', ctrl.createUser);
router.put('/users/:id', ctrl.updateUser);

/**
 * @swagger
 * /api/admin/payroll:
 *   get:
 *     tags: [Admin]
 *     summary: Payroll and salary deduction report
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Payroll report }
 */
router.get('/payroll', ctrl.getPayroll);

/**
 * @swagger
 * /api/admin/leaves:
 *   get:
 *     tags: [Admin]
 *     summary: Complete leave history across organization
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: All leaves }
 */
router.get('/leaves', ctrl.getAllLeaves);

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     tags: [Admin]
 *     summary: Organization-wide statistics
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Stats }
 */
router.get('/stats', ctrl.getStats);

router.post('/holiday-work', ctrl.creditHolidayWork);
router.post('/carry-forward', ctrl.processCarryForward);

module.exports = router;
