var User = require('../../../users/user.model.js');
var Outlet = require('../../../outlets/outlet.model.js');
var Promise = require('bluebird');
var Reservation = require('../../../reservations/reservation.model.js');
var Transaction = require('../../../transactions/transaction.model.js');

<<<<<<< HEAD
module.exports = setRealtimeData = function(req){
  var transactionId = req.body.id;
  var totalKwh = req.body.total;
  var watts = req.body.watts;
  var priceKwh = req.body.outlet.priceEnergy;
  var priceHourly = req.body.outlet.priceHourly;
  var totalCost = totalKwh * priceKwh + priceHourly/(60*60)*10;

    
  return new Transaction({
    id: transactionId
  }).fetch()
  .then(function(transaction) {
    transaction.totalCost 
  })

  save({totalCost: totalCost, totalEnergy: totalkWh },{patch: true});
  // .then(function(transaction){
  //   return transaction.set('current', true);
  // });
=======
module.exports = setRealtimeData = function(data) {
  console.log('data in the query for transactions --------------')
  console.log(data);
  var transactionId = data.clientData.id;
  var totalKwh = data.totalKwh || 0;
  var watts = data.avgWatts || 0;
  var kwh = data.kwh || 0;
  var priceKwh = data.clientData.outlet.priceEnergy;
  var priceHourly = data.clientData.outlet.priceHourly;
  var totalCost = kwh * priceKwh + priceHourly/(60*60)*10;
  console.log("WATTS: ", watts, "TOTALWKWBF:   ", totalKwh);

  // return new Transaction({
  //   id: transactionId
  // }).fetch()
  return new Transaction()
    .query({ where: {id: transactionId} })
    .fetch()
    .then(function(transaction) {
      console.log('IN THE NEW TRANSACTION BEFORE CALCULATIONS WITH TRANSACTION: ', transaction)
      totalCost += transaction.get('totalCost');
      totalKwh += transaction.get('totalEnergy');
      console.log("in the new transaction realtimedata query --------------")
      console.log("total cost: ", totalCost, "  total Energy: ", totalKwh)
      transaction.set({
        totalCost: totalCost,
        totalEnergy: totalKwh  
      }).save()
    .then(function(){
      console.log(transaction);
    });
  });
>>>>>>> (server posts transactions to db every 10sec

};