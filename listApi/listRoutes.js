'use strict'
module.exports = function(app) {
  var list = require('./listController')

  app.route('/list')
    .get(list.getAllLists)
    .post(list.createList)

  app.route('/list/:id')
    .get(list.getOneList)
    .post(list.updateList)
    .delete(list.deleteList)
}
