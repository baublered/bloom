const Event = require('../models/Event');
const Product = require('../models/Product'); // Needed for stock updates

// --- Get all events ---
const getAllEvents = async (req, res) => {
    try {
        const events = await Event.find({});
        res.status(200).json(events);
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ message: "Failed to fetch events." });
    }
};

// --- Create a new event ---
const createEvent = async (req, res) => {
    try {
        const {
            customerName,
            address,
            phone,
            eventType,
            notes,
            eventDate,
        } = req.body;

        const newEvent = new Event({
            customerName,
            address,
            phone,
            eventType,
            notes,
            eventDate,
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

// --- UPDATED: updateEvent function to handle payments and products ---
const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { products, subtotal, discountAmount, downPayment } = req.body;

        const totalAmount = subtotal - discountAmount;
        const remainingBalance = totalAmount - downPayment;
        
        let status = 'Pending';
        if (remainingBalance <= 0) {
            status = 'Fully Paid';
        }

        const updates = {
            products,
            totalAmount,
            subtotal,
            discountAmount,
            downPayment,
            remainingBalance,
            status,
        };

        const updatedEvent = await Event.findByIdAndUpdate(id, updates, { new: true });

        if (!updatedEvent) {
            return res.status(404).json({ message: "Event not found." });
        }
        
        // --- Also deduct stock for the selected products ---
        if (products && products.length > 0) {
             const operations = products.map(item => ({
                updateOne: {
                    filter: { _id: item.productId, quantity: { $gte: item.quantity } },
                    update: { $inc: { quantity: -item.quantity } }
                }
            }));
            await Product.bulkWrite(operations);
        }

        res.status(200).json({
            success: true,
            message: "Event payment details updated successfully!",
            event: updatedEvent,
        });
    } catch (error) {
        console.error("Error updating event:", error);
        res.status(500).json({ message: "Failed to update event." });
    }
};

// --- Delete an event ---
const deleteEvent = async (req, res) => {
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

// Make sure to export all functions
module.exports = {
    createEvent,
    getAllEvents,
    updateEvent,
    deleteEvent,
};
