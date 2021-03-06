var bookshelf = require('../config/db/config');
var User = require('../users/user.model');
var Transaction = require('../transactions/transaction.model');

var Outlet = bookshelf.Model.extend({
  tableName: 'outlets',
  defaults: {
    priceHourly: 3.00,
    priceSuggest: 10.00,
    lat: 37.783624,
    long: -122.408999
  },
  seller: function() {
    return this.belongsTo(User, 'seller_id'); // trying to find converse in User model
  }
  // reservations: function(){
  //   return this.hasMany(Outlet, 'outlet_id');
  // }
});

module.exports = Outlet;
