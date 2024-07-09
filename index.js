import express from 'express';

const  app = express();
app.use(express.json());
const port = 3001;

let rooms = [];
let bookings = [];

// 1. Create a room
app.post('/rooms', (req, res) => {
    const { name, numberOfSeats, amenities, pricePerHour } = req.body;
    const room = {
        id: rooms.length + 1,
        name,
        numberOfSeats,
        amenities,
        pricePerHour,
        bookedSlots: []
    };
    rooms.push(room);
    res.status(201).send(room);
});

// 2. Book a room
app.post('/bookings', (req, res) => {
    const { customerName, date, startTime, endTime, roomId } = req.body;

    // selected room id...
    const room = rooms.find(r => r.id === roomId);
    if (!room) {
        return res.status(404).send({ error: 'Room not found' });
    }

    // check slot is already booked...
    const bookingConflict = room.bookedSlots.some(slot => 
        slot.date === date && 
        ((startTime >= slot.startTime && startTime < slot.endTime) || 
         (endTime > slot.startTime && endTime <= slot.endTime))
    );

    if (bookingConflict) {
        return res.status(400).send({ error: 'Time slot already booked' });
    }

    const booking = {
        id: bookings.length + 1,
        customerName,
        date,
        startTime,
        endTime,
        roomId,
        bookingDate: new Date(),
        status: 'Booked'
    };

    room.bookedSlots.push({ date, startTime, endTime, customerName });
    bookings.push(booking);
    res.status(201).send(booking);
});

// 3. List all rooms with booked data
app.get('/rooms', (req, res) => {
    const result = rooms.map(room => ({
        name: room.name,
        bookedSlots: room.bookedSlots
    }));
    res.send(result);
});

// 4. List all customers with booked data
app.get('/customers', (req, res) => {
    const result = bookings.map(booking => ({
        customerName: booking.customerName,
        roomName: rooms.find(room => room.id === booking.roomId).name,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime
    }));
    res.send(result);
});


// 5. List how many times a customer has booked the room
app.get('/customers/:name/bookings', (req, res) => {
    const customerName = req.params.name;
    const customerBookings = bookings.filter(booking => booking.customerName === customerName);
    const result = customerBookings.map(booking => ({
        customerName: booking.customerName,
        roomName: rooms.find(room => room.id === booking.roomId).name,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        bookingId: booking.id,
        bookingDate: booking.bookingDate,
        status: booking.status
    }));
    res.send(result);
});


app.listen(port, () => {
    console.log('listening on port ' + port);
})


