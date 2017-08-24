'use strict'
module.exports = function(app) {
  var row = require('../controllers/rowController')

  app.route('/about/rows')
    .get(row.getAllRows)
    .post(row.createRow)

  app.route('/about/rows/active')
    .get(row.getActiveRows)

  app.route('/about/rows/inactive')
    .get(row.getInactiveRows)

  app.route('/about/rows/:id')
    .get(row.getOneRow)
    .post(row.updateRow)
    .delete(row.deleteRow)
}
