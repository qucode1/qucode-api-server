'use strict'

var mongoose = require('mongoose')

const Row = mongoose.model('Row')
const Text = mongoose.model('Text')
const Skill = mongoose.model('Skill')
const List = mongoose.model('List')

exports.getActiveRows = (req, res) => (
  Row
    .find({ active: true })
    .populate('text')
    .populate('skills')
    .exec( (err, rows) => {
      if(err) {
        console.error(err)
        res.send(err)
      } else {
        console.log('all active rows requested at ' + Date())
        res.json(rows)
      }
    })
)

exports.getInactiveRows = (req, res) => (
  Row
    .find({ active: false })
    .populate('text')
    .populate('skills')
    .exec( (err, rows) => {
      if(err) {
        console.error(err)
        res.send(err)
      } else {
        console.log('all inactive rows requested at ' + Date())
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
      Row.create({ name: text.name, text: text._id, active: req.body.active}, (err, row) => {
        if(err) {
          console.error(err)
          res.json(err)
        } else {
          const listName = req.body.active === 'true'
            ? 'Active Rows'
            : 'Inactive Rows'
          List
            .findOne({name: listName})
            .exec((err, list) => {
              if(err) {
                console.error(err)
                res.send(err)
              } else {
                let listItems = list.items
                listItems.push(row._id)
                list.items = listItems
                list.save((err, list) => {
                  if(err) {
                    console.log(err)
                    res.send(err)
                  } else {
                    console.log('New Row created at ' + Date())
                    res.json(row)
                  }
                })
              }
            })

        }
      })
    }
  })
}

exports.getAllRows = (req, res) => (
  Row
    .find({})
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

exports.getOneRow = (req, res) => {
  Row
    .findById(req.params.id)
    .populate('text')
    .populate('skills')
    .exec((err, row) => {
      if(err) {
        console.error(err)
        res.send(err)
      } else {
        row
        ? (
          console.log('Row: ' + row.name + ' requested ' + Date()),
          res.json(row)
        )
        : (console.error('Row not found'), res.send('Row not found'))
      }
    })
}

exports.updateRow = (req, res) => {

  Row.findById(req.params.id, (err, row) => {
    if(err) {
      console.error(err)
      res.send(err)
    } else {
      if(row) {
        if(req.body.content) {
          Text.findOneAndUpdate( {_id: row.text}, {$set:{content: req.body.content}}, {new: true}, (err, text) => {
            if(err) {
              console.log(err)
              res.send(err)
            } else {
              text
              ? console.log('Text: ' + text.name + ' updated in Row: ' + row.name + ' Update ' + Date())
              : (console.error('Text not found, couldn\'t update ' + row.name + ' ' + Date()), res.send('Row Update failed: Text not found') )
            }
          })
        }
        if(req.body.name) {row.name = req.body.name}
        if(req.body.active === true || req.body.active === false) {
          row.active = req.body.active

          function updateList(listname) {
            List.findOne({name: listname}, (err, list) => {
              let items = list.items
              items.indexOf(row._id) > -1
              ? (items.splice(items.indexOf(row._id), 1),
                list.items = items,
                list.save(err => {
                  if(err) {
                    console.error(err)
                    res.send(err)
                  }
                })
              )
              : (items.push(row._id),
                list.items = items,
                list.save(err => {
                  if(err) {
                    console.error(err)
                    res.send(err)
                  }
                })
              )
            })
          }
          updateList('Active Rows')
          updateList('Inactive Rows')
        }
        row.save((err, newRow) => {
          err
          ? (console.error(err), res.send(err))
          : (console.log('Row: ' + newRow.name + ' has been updated ' + Date()), res.send(newRow))
        })
      } else {
        console.error('Row Update failed: Row not found ' + Date())
        res.send('Row Update failed: Row not found')
      }
    }
  })
}

exports.deleteRow = (req, res) => {
  Row.findOne({_id: req.params.id}, (err, row) => {
    if(err) {
      console.error(err)
      res.send(err)
    } else {
      const listName = row.active === 'true'
        ? 'Active Rows'
        : 'Inactive Rows'
      List.findOne({name: listName}, (err, list) => {
        if(err) {
          console.error(err)
          res.send(err)
        } else {
          const listItems = list.items
          listItems.splice(listItems.indexOf(row._id), 1)
          list.items = listItems
          list.save((err, list) => {
            if(err) {
              console.error(err)
              res.send(err)
            } else {
              Row.remove({
                _id: req.params.id
              }, (err, row) => {
                if (err) res.send(err)
                else {
                  console.log('row deleted ' + Date())
                  res.json({ message: 'Row successfully deleted'})
                }
              })
            }
          })
        }
      })
    }
  })
}
