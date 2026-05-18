const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const ctrl = require('../controllers/leave.controller');

/**
 * @swagger
 * /api/leaves:
 *   post:
 *     tags: [Leaves]
 *     summary: Apply for leave
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [leave_type_id, from_date, to_date, reason]
 *             properties:
 *               leave_type_id: { type: string }
 *               from_date: { type: string, format: date }
 *               to_date: { type: string, format: date }
 *               reason: { type: string }
 *     responses:
 *       201: { description: Leave request created }
 */
router.post('/', authenticate, ctrl.applyLeave);

/**
 * @swagger
 * /api/leaves/my:
 *   get:
 *     tags: [Leaves]
 *     summary: Get my leave history
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: status, schema: { type: string } }
 *       - { in: query, name: year, schema: { type: integer } }
 *     responses:
 *       200: { description: List of leaves }
 */
router.get('/my', authenticate, ctrl.getMyLeaves);

/**
 * @swagger
 * /api/leaves/balance:
 *   get:
 *     tags: [Leaves]
 *     summary: Get my leave balance per type
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Leave balances }
 */
router.get('/balance', authenticate, ctrl.getMyBalance);

/**
 * @swagger
 * /api/leaves/salary-summary:
 *   get:
 *     tags: [Leaves]
 *     summary: Get my salary deduction summary
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Salary summary }
 */
router.get('/salary-summary', authenticate, ctrl.getSalarySummary);

/**
 * @swagger
 * /api/leaves/team:
 *   get:
 *     tags: [Leaves]
 *     summary: Get team leave requests (manager)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Team leaves }
 */
router.get('/team', authenticate, authorize('manager', 'admin'), ctrl.getTeamLeaves);

router.get('/calendar', authenticate, ctrl.getLeaveCalendar);

/**
 * @swagger
 * /api/leaves/{id}/approve:
 *   patch:
 *     tags: [Leaves]
 *     summary: Approve a leave request
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Leave approved }
 */
router.patch('/:id/approve', authenticate, authorize('manager', 'admin'), ctrl.approveLeave);

/**
 * @swagger
 * /api/leaves/{id}/reject:
 *   patch:
 *     tags: [Leaves]
 *     summary: Reject a leave request (remark required)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [remark]
 *             properties:
 *               remark: { type: string }
 *     responses:
 *       200: { description: Leave rejected }
 */
router.patch('/:id/reject', authenticate, authorize('manager', 'admin'), ctrl.rejectLeave);

/**
 * @swagger
 * /api/leaves/{id}:
 *   delete:
 *     tags: [Leaves]
 *     summary: Cancel a pending/approved leave
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Leave cancelled }
 */
router.delete('/:id', authenticate, ctrl.cancelLeave);

module.exports = router;
