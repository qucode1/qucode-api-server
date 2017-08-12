'use strict'
module.exports = function(app) {
  var project = require('./projectController')

  app.route('/projects')
    .get(project.getAllProjects)
    // .post(project.createProject)
  //
  // app.route('/project/:id')
  //   .get(project.getOneProject)
  //   .post(project.updateProject)
  //   .delete(project.deleteProject)
}
