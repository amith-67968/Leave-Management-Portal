const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const { getHolidays, addHoliday, deleteHoliday } = require('../controllers/holiday.controller');

/**
 * @swagger
 * /api/holidays:
 *   get:
 *     tags: [Holidays]
 *     summary: Get company holidays
 *     parameters:
 *       - { in: query, name: year, schema: { type: integer }, description: Year filter }
 *     responses:
 *       200: { description: List of holidays }
 */
router.get('/', getHolidays);

/**
 * @swagger
 * /api/admin/holidays:
 *   post:
 *     tags: [Holidays]
 *     summary: Add a holiday (admin only)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [date, name]
 *             properties:
 *               date: { type: string, format: date }
 *               name: { type: string }
 *               is_optional: { type: boolean }
 *     responses:
 *       201: { description: Holiday added }
 */
router.post('/admin', authenticate, authorize('admin'), addHoliday);

/**
 * @swagger
 * /api/holidays/admin/{id}:
 *   delete:
 *     tags: [Holidays]
 *     summary: Delete a holiday (admin only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Holiday deleted }
 */
router.delete('/admin/:id', authenticate, authorize('admin'), deleteHoliday);

module.exports = router;
