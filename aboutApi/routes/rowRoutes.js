'use strict'
module.exports = function(app) {
  var row = require('../controllers/rowController')

  app.route('/about/rows')
    .get(row.getAllRows)
    .post(row.createRow)

  // app.route('/skills/:id')
  //   .get(skill.getOneSkill)
    // .post(skill.updateSkill)
    // .delete(skill.deleteSkill)
}
