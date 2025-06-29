const Event = require('../models/Event');

// --- Get all events ---
// Fetches all events from the database to display on the calendar
exports.getAllEvents = async (req, res) => {
    try {
        const events = await Event.find({});
        res.status(200).json(events);
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ message: "Failed to fetch events." });
    }
};

// --- Create a new event ---
// This is called when the user submits the "Add Event" form
exports.createEvent = async (req, res) => {
    try {
        const {
            customerName,
            address,
            phone,
            eventType,
            notes,
            eventDate,
            // We will get product and payment details later
        } = req.body;

        const newEvent = new Event({
            customerName,
            address,
            phone,
            eventType,
            notes,
            eventDate,
            // Other fields like products and totals will be updated later
        });

        await newEvent.save();
        res.status(201).json({
            success: true,
            message: "Event created successfully!",
            event: newEvent,
        });

    } catch (error) {
        console.error("Error creating event:", error);
        res.status(500).json({ message: "Failed to create event." });
    }
};

// --- Update an event (e.g., after product selection or payment) ---
exports.updateEvent = async (req, res) => {
    try {
        const { id } = req.params; // Get the event ID from the URL
        const updates = req.body; // Get the updates from the request body

        const updatedEvent = await Event.findByIdAndUpdate(id, updates, { new: true });

        if (!updatedEvent) {
            return res.status(404).json({ message: "Event not found." });
        }

        res.status(200).json({
            success: true,
            message: "Event updated successfully!",
            event: updatedEvent,
        });
    } catch (error) {
        console.error("Error updating event:", error);
        res.status(500).json({ message: "Failed to update event." });
    }
};


// --- Delete an event ---
exports.deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedEvent = await Event.findByIdAndDelete(id);

        if (!deletedEvent) {
            return res.status(404).json({ message: "Event not found." });
        }

        res.status(200).json({ success: true, message: "Event deleted successfully." });
    } catch (error) {
        console.error("Error deleting event:", error);
        res.status(500).json({ message: "Failed to delete event." });
    }
};
