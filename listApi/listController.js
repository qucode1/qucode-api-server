'use strict'

var mongoose = require('mongoose')

const List = mongoose.model('List')

exports.getAllLists = (req, res) => (
  List.find({}, (err, lists) => {
    if (err) res.send(err)
    else {
      console.log('all lists requested ' + Date())
      res.json(lists)
    }
  })
)

exports.createList = (req, res) => {
  const newList = new List(req.body)
  newList.save((err, list) => {
    if (err) res.send(err)
    else {
      console.log(list.name + ' created ' + Date())
      res.json(list)
    }
  })
}

exports.getOneList = (req, res) => {
  List.findById(req.params.id, (err, list) => {
    if (err) res.send(err)
    else {
      console.log(list.name + ' requested ' + Date())
      res.json(list)
    }
  })
}

exports.updateList = (req, res) => {
  List.findOneAndUpdate({_id: req.params.id}, {$set:{items: req.body.items}}, {new: true}, (err, list) => {
    if(err) res.send(err)
    else {
      console.log(list.name + ' updated ' + Date())
      res.json(list)
    }
  })
}

exports.deleteList = (req, res) => {
  List.remove({
    _id: req.params.id
  }, (err, list) => {
    if (err) res.send(err)
    else {
      console.log('list deleted ' + Date())
      res.json({ message: 'List successfully deleted'})
    }
  })
}
