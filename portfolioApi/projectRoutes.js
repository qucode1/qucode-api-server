'use strict'
module.exports = function(app) {
  var project = require('./projectController')

  app.route('/projects')
    .get(project.getAllProjects)
    .post(project.upload, project.resize, project.createProject)

  app.route('/projects/active')
    .get(project.getActiveProjects)

  app.route('/projects/inactive')
    .get(project.getInactiveProjects)

  app.route('/projects/:id')
    .get(project.getOneProject)
  //   .post(project.updateProject)
  //   .delete(project.deleteProject)
}
