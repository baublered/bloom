const express = require('express');
const router = express.Router();
const {
    createEvent,
    getAllEvents,
    updateEvent,
    deleteEvent,
    cancelEvent,
} = require('../controllers/eventController');

// GET /api/events - Fetches all events for the calendar
router.get('/', getAllEvents);

// POST /api/events/create - Creates a new event
router.post('/create', createEvent);

// PUT /api/events/update/:id - Updates an existing event (e.g., adds products or updates status)
router.put('/update/:id', updateEvent);

// DELETE /api/events/:id - Deletes an event
router.delete('/:id', deleteEvent);

// PUT /api/events/:id/cancel - Cancels an event
router.put('/:id/cancel', cancelEvent);

module.exports = router;
