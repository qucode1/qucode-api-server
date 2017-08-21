'use strict'
module.exports = function(app) {
  var text = require('./textController')

  app.route('/texts')
    .get(text.getAllTexts)
    .post(text.createText)

  app.route('/texts/c/:category')
    .get(text.getCategoryTexts)

  app.route('/texts/:id')
    .get(text.getOneText)
    // .post(text.updateText)
    // .delete(text.deleteText)
}
