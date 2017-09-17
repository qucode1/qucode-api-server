'use strict'
module.exports = function(app) {
  var project = require('./projectController')

  app.route('/projects')
    .get(project.getAllProjects)
    .post(project.upload, project.resize, project.createProject)
  //
  // app.route('/projects/:id')
  // .get(project.getOneProject)
  //   .post(project.updateProject)
  //   .delete(project.deleteProject)
}
