'use strict'

var mongoose = require('mongoose')

const Text = mongoose.model('Text')

exports.getAllTexts = (req, res) => (
  Text.find({}, (err, texts) => {
    if (err)
      res.send(err)
    console.log('all texts requested ' + Date())
    res.json(texts)
  })
)

exports.getCategoryTexts = (req, res) => (
  Text.find({category: req.params.category}, (err, texts) => {
    if (err)
      res.send(err)
    console.log('all texts of \"' + req.params.category + '\" requested ' + Date())
    res.json(texts)
  })
)

exports.createText = (req, res) => {
  const newText = new Text(req.body)
  newText.save((err, text) => {
    if (err) res.send(err)
    console.log(text.name + ' created ' + Date())
    res.json(text)
  })
}

exports.getOneText = (req, res) => {
  Text.findById(req.params.id, (err, text) => {
    if (err) res.send(err)
    console.log(text.name + ' requested ' + Date())
    res.json(text)
  })
}

exports.updateText = (req, res) => {
  Text.findOneAndUpdate({_id: req.params.id}, req.body, {new: true}, (err, text) => {
    if(err) res.send(err)
    console.log(text.name + ' updated ' + Date())
    res.json(text)
  })
}

exports.deleteText = (req, res) => {
  Text.remove({
    _id: req.params.id
  }, (err, text) => {
    if (err) res.send(err)
    console.log('text deleted ' + Date())
    res.json({ message: 'Text successfully deleted'})
  })
}
