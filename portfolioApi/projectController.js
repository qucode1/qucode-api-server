'use strict'

var mongoose = require('mongoose')

const Project = mongoose.model('Project')

exports.getAllProjects = (req, res) => (
  Project.find({}, (err, projects) => {
    if (err) res.send(err)
    else {
      console.log('all projects requested ' + Date())
      res.json(projects)
    }
  })
)

exports.createProject = (req, res) => {
  const newProject = new Project(req.body)
  console.log(req.body)
  newProject.save((err, project) => {
    if (err) {
      console.log(err)
      res.send(err)
    } else {
    console.log(project.name + ' created ' + Date())
    res.json(project)
  }
  })
}
