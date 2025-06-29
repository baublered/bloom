const Event = require('../models/Event');
const Product = require('../models/Product');

// --- Get all events ---
exports.getAllEvents = async (req, res) => {
    try {
        const events = await Event.find({}).sort({ eventDate: 1 });
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch events." });
    }
};

// --- Create a new event ---
// This now handles an initial down payment correctly.
exports.createEvent = async (req, res) => {
    try {
        const {
            customerName,
            address,
            phone,
            eventType,
            notes,
            eventDate,
            downPayment 
        } = req.body;

        const newEvent = new Event({
            customerName,
            address,
            phone,
            eventType,
            notes,
            eventDate,
        });

        // If a down payment was made during creation, add it to the history
        if (downPayment && parseFloat(downPayment) > 0) {
            newEvent.paymentHistory.push({
                amountPaid: parseFloat(downPayment),
                // Assuming cash for initial creation, can be changed later
                paymentMethod: 'Initial Down Payment' 
            });
        }
        
        // The pre-save hook in the model will automatically calculate totals and status
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

// --- Update an event with products and new payments ---
exports.updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { products, newPayment } = req.body; // Expect products and a new payment object

        const eventToUpdate = await Event.findById(id);
        if (!eventToUpdate) {
            return res.status(404).json({ message: "Event not found." });
        }
        
        // Update product list if provided
        if(products) {
            eventToUpdate.products = products;
        }

        // Add new payment to the history if provided
        if (newPayment && newPayment.amountPaid > 0) {
            eventToUpdate.paymentHistory.push(newPayment);
        }
        
        // The pre-save hook will automatically recalculate all totals and the status
        const updatedEvent = await eventToUpdate.save();

        // After saving, deduct stock for the selected products if they were updated
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
