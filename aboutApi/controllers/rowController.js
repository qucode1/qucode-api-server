'use strict'

var mongoose = require('mongoose')

const Row = mongoose.model('Row')
const Text = mongoose.model('Text')

exports.getAllRows = (req, res) => (
  Row
    .find({ active: true })
    .populate('text')
    .populate('skills')
    .exec( (err, rows) => {
      if(err) {
        console.error(err)
        res.send(err)
      } else {
        console.log('all rows requested at ' + Date())
        res.json(rows)
      }
    })

)

exports.createRow = (req, res) => {
  const textData = {
    name: req.body.name,
    content: req.body.content,
    category: 'about'
  }
  Text.create(textData, (err, text) => {
    if(err) {
      console.error(err)
      res.json(err)
    } else {
      Row.create({ name: text.name, text: text._id, active: true}, (err, row) => {
        if(err) {
          console.error(err)
          res.json(err)
        } else {
          console.log('New Row created at ' + Date())
          res.json(row)
        }
      })
    }
  })
}
