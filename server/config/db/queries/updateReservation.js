var db = require('../config');
var User = require('../../../users/user.model');
var TimeSlot = require('../../../reservations/timeSlot.model');
var Reservation = require('../../../reservations/reservation.model');
var Transaction = require('../../../transactions/transaction.model');
var moment = require('moment');

module.exports = updateReservation = function(req, res){
  var data = req.body;
  // Slot tracking
  var startSlot, endSlot, currentSlot;
  // Date tracking
  var startDate = data.start.date;
  var endDate = data.end.date;
  var currentDate;
  var sameDay = (startDate === endDate);
  // Transaction tracking
  var transactionID;
  // Response
  var status, message;
  if (status && message){
    return res.status(status).send(message);
  }

  // Recursive function updates reservation slots and creates transaction models for each
  // time slot from beginning to end 
  var newReservation = function(user, passedSlot){
    currentSlot = passedSlot;
    currentDate = currentDate || startDate;
    
    var transaction = new Transaction({
      totalEnergy: 0,
      totalCost: 0,
      paid: false
    });
    transaction.save()
    .then(function(newTransaction){
      transactionID = newTransaction.id;

      // Find reservation
      return new Reservation()
      .query({where: {outlet_id: data.outletID, slot_id: currentSlot, date: currentDate} })
      .fetch()

      // Update reservation
      .then(function(newReservation){
        if (!newReservation) {
          // res.status(404).send('No open reservation found');
          status = 404;
          message = 'No open reservation found';
          return;
        } else if (!newReservation.available) {
          // res.status(404).send('Reservation is not available: ', newReservation);
          status = 404;
          message = 'Reservation is not available'
          return;
        } else {
          newReservation.set({
            buyer_id: user,
            available: false,
            transaction_id: transactionID
          }).save();
        }
      })
      // Determine if more reservations need to be updated
      .then(function(){

        // Completion check for same day reservations
        if (sameDay){
          if (++currentSlot <= endSlot){
            newReservation(user, currentSlot);
          } else {
            // res.status(201).send('POST reservations complete');
            status = 201;
            message = 'POST reservations complete';
            return;
          }
        // Completion check for multi-day reservations
        } else {
          currentSlot = currentSlot < 48 ? ++currentSlot : 1;
          currentDate = currentSlot === 1 ? moment(currentDate).add(1, 'days').format('YYYY-MM-DD').toString() : currentDate;
          var difference = moment(currentDate).diff(moment(endDate));
          console.log('startDate: ', startDate, ', endDate: ', endDate, ', currentDate: ', currentDate, ', difference: ', difference);
          if ( difference <= 0 ){
            if ( currentSlot <= endSlot  || difference < 0){
              newReservation(user, currentSlot);
            } else {
              // res.status(201).send('POST reservations complete');
              status = 201;
              message = 'POST reservations complete';
              return;
            }
          }
        }
      });
    });

  };

  // START RESERVATION PROCESS
  // Fetch user by request user id

  return new User({
    username: req.user.id
  }).fetch().then(function(user){
    // Find start timeSlot
    new TimeSlot({
      start: data.start.time
    }).fetch().then(function(slot){
      startSlot = slot.id;
      // Find end timeslot
      new TimeSlot({
        end: data.end.time
      }).fetch()
      // Start making reservations for user
      .then(function(slot2){
        endSlot = slot2.id;
        newReservation(user.id, startSlot)
      });
    });
  });
};