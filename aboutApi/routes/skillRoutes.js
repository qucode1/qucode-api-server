'use strict'
module.exports = function(app) {
  var skill = require('../controllers/skillController')

  app.route('/skills')
    .get(skill.getAllSkills)
    // .post(skill.createSkill)

  app.route('/skills/:id')
    .get(skill.getOneSkill)
    .post(skill.updateSkill)
    .delete(skill.deleteSkill)
}
