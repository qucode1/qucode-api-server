'use strict'
var mongoose = require('mongoose')
var Schema = mongoose.Schema

var textSchema = new Schema({
  name: {
    type: String,
    required: 'Please define a text name'
  },
  content: {
    type: String,
    required: 'Please provide some content'
  },
  category: {
    type: String
  },
  created: {
    type: Date,
    default: Date.now()
  }
})

module.exports = mongoose.model('Text', textSchema)
