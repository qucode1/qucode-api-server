'use strict'
var mongoose = require('mongoose')
var Schema = mongoose.Schema

var skillSchema = new Schema({
  name: {
    type: String,
    required: 'Please define a skill name'
  },
  progress: {
    type: String,
    required: 'Please state your progress'
  },
  image: {
    type: String,
    required: 'Please provide a image url'
  },
  color: {
    type: String,
    required: 'Please assign a color'
  }
})

module.exports = mongoose.model('Skill', skillSchema)
