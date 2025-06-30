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
        const { 
            products, 
            newPayment, 
            totalAmount, 
            subtotal, 
            discountAmount, 
            discountPercentage 
        } = req.body;

        console.log('🔍 updateEvent received:', {
            eventId: id,
            products,
            newPayment,
            totalAmount,
            subtotal,
            discountAmount,
            discountPercentage
        });

        const eventToUpdate = await Event.findById(id);
        if (!eventToUpdate) {
            return res.status(404).json({ message: "Event not found." });
        }
        
        console.log('📋 Event BEFORE update:', {
            totalAmount: eventToUpdate.totalAmount,
            totalPaid: eventToUpdate.totalPaid,
            remainingBalance: eventToUpdate.remainingBalance,
            paymentHistory: eventToUpdate.paymentHistory
        });
        
        // Update product list if provided
        if(products) {
            eventToUpdate.products = products;
        }

        // If totalAmount is provided (which includes discount), override the calculated total
        if (totalAmount !== undefined) {
            eventToUpdate.totalAmount = totalAmount;
            
            // Store discount information
            eventToUpdate.subtotal = subtotal || 0;
            eventToUpdate.discountAmount = discountAmount || 0;
            eventToUpdate.discountPercentage = discountPercentage || 0;
        }

        // Add new payment to the history if provided
        if (newPayment && newPayment.amountPaid > 0) {
            eventToUpdate.paymentHistory.push(newPayment);
            console.log('💰 Added new payment:', newPayment);
        }
        
        // Store discount information if provided
        if (totalAmount !== undefined) {
            eventToUpdate.subtotal = subtotal || 0;
            eventToUpdate.discountAmount = discountAmount || 0;
            eventToUpdate.discountPercentage = discountPercentage || 0;
        }
        
        // Store the previous status before saving
        const previousStatus = eventToUpdate.status;
        
        // Save the event - the pre-save hook will handle all calculations
        const updatedEvent = await eventToUpdate.save();

        console.log('🚀 Updated event AFTER save:', {
            previousStatus: previousStatus,
            newStatus: updatedEvent.status,
            totalAmount: updatedEvent.totalAmount,
            totalPaid: updatedEvent.totalPaid,
            remainingBalance: updatedEvent.remainingBalance,
            paymentHistory: updatedEvent.paymentHistory
        });

        // ONLY deduct inventory when status changes from 'Pending' to 'Fully Paid'
        if (previousStatus === 'Pending' && updatedEvent.status === 'Fully Paid' && updatedEvent.products.length > 0) {
            console.log('💰 Event is now fully paid! Deducting inventory for products:', updatedEvent.products);
            console.log('💰 Previous status:', previousStatus, '-> New status:', updatedEvent.status);
            
            try {
                // Log each product before deduction
                for (const product of updatedEvent.products) {
                    const inventoryItem = await Product.findById(product.productId);
                    if (inventoryItem) {
                        console.log(`📦 BEFORE: ${inventoryItem.productName} = ${inventoryItem.quantity} units`);
                    }
                }
                
                const operations = updatedEvent.products.map(item => ({
                    updateOne: {
                        filter: { _id: item.productId, quantity: { $gte: item.quantity } },
                        update: { $inc: { quantity: -item.quantity } }
                    }
                }));
                
                const bulkResult = await Product.bulkWrite(operations);
                console.log('📦 Inventory deduction result:', bulkResult);
                
                // Log each product after deduction
                for (const product of updatedEvent.products) {
                    const inventoryItem = await Product.findById(product.productId);
                    if (inventoryItem) {
                        console.log(`📦 AFTER: ${inventoryItem.productName} = ${inventoryItem.quantity} units`);
                    }
                }
                
                // Check if any products couldn't be deducted (insufficient stock)
                if (bulkResult.modifiedCount < updatedEvent.products.length) {
                    console.warn('⚠️ Some products may have insufficient stock');
                } else {
                    console.log('✅ All products successfully deducted from inventory');
                }
            } catch (inventoryError) {
                console.error('❌ Error deducting inventory:', inventoryError);
                // Note: We don't fail the payment if inventory deduction fails
                // This is a business decision - you might want to handle this differently
            }
        } else if (products && products.length > 0 && updatedEvent.status !== 'Fully Paid') {
            console.log('📝 Products updated but event not fully paid yet. Inventory will be deducted when fully paid.');
        } else {
            console.log('🔍 No inventory deduction needed:', {
                previousStatus,
                newStatus: updatedEvent.status,
                hasProducts: updatedEvent.products.length > 0
            });
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

// --- Cancel an event ---
exports.cancelEvent = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the event first to check its current status
    const eventToCancel = await Event.findById(id);
    if (!eventToCancel) {
      return res.status(404).json({ message: "Event not found." });
    }
    
    // If the event was fully paid, restore the inventory
    if (eventToCancel.status === 'Fully Paid' && eventToCancel.products.length > 0) {
      console.log('🔄 Restoring inventory for cancelled fully paid event:', eventToCancel.products);
      
      try {
        const operations = eventToCancel.products.map(item => ({
          updateOne: {
            filter: { _id: item.productId },
            update: { $inc: { quantity: item.quantity } } // Add back the quantity
          }
        }));
        
        const bulkResult = await Product.bulkWrite(operations);
        console.log('📦 Inventory restoration result:', bulkResult);
      } catch (inventoryError) {
        console.error('❌ Error restoring inventory:', inventoryError);
        // Continue with cancellation even if inventory restoration fails
      }
    }
    
    // Update the event status to 'Cancelled'
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { status: 'Cancelled' },
      { new: true }
    );
    
    console.log('🚫 Event cancelled:', {
      eventId: id,
      previousStatus: eventToCancel.status,
      newStatus: updatedEvent.status
    });
    
    res.status(200).json({ success: true, event: updatedEvent });
  } catch (error) {
    console.error('Error cancelling event:', error);
    res.status(500).json({ message: "Failed to cancel event." });
  }
};
