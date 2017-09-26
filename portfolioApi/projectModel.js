'use strict'
var mongoose = require('mongoose')
var Schema = mongoose.Schema

var projectSchema = new Schema({
  name: {
    type: String,
    required: 'Please define a project name'
  },
  description: {
    type: String,
    required: 'Please provide a description'
  },
  image: {
    type: String,
    required: 'Please add an image'
  },
  tags: {
    type: [String]
  },
  url: {
    type: String
  },
  liveUrl: {
    type: String
  },
  github: {
    type: String
  },
  active: {
    type: Boolean,
    required: 'Please define if the Project should be public or not'
  },
  created: {
    type: Date,
    default: Date.now()
  }
})

module.exports = mongoose.model('Project', projectSchema)
