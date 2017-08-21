'use strict'

var mongoose = require('mongoose')

const Skill = mongoose.model('Skill')

exports.getAllSkills = (req, res) => (
  Skill.find({}, (err, skills) => {
    if (err) res.send(err)
    else {
      console.log('all skills requested ' + Date())
      res.json(skills)
    }
  })
)

exports.createSkill = (req, res) => {
  const newSkill = new Skill(req.body)
  newSkill.save((err, skill) => {
    if (err) res.send(err)
    else {
      console.log(skill.name + ' created ' + Date())
      res.json(skill)
    }
  })
}

exports.getOneSkill = (req, res) => {
  Skill.findById(req.params.id, (err, skill) => {
    if (err) res.send(err)
    else {
      console.log(skill.name + ' requested ' + Date())
      res.json(skill)
    }
  })
}

exports.updateSkill = (req, res) => {
  Skill.findOneAndUpdate({_id: req.params.id}, req.body, {new: true}, (err, skill) => {
    if(err) res.send(err)
    else {
      console.log(skill.name + ' updated ' + Date())
      res.json(skill)
    }
  })
}

exports.deleteSkill = (req, res) => {
  Skill.remove({
    _id: req.params.id
  }, (err, skill) => {
    if (err) res.send(err)
    else {
      console.log('skill deleted ' + Date())
      res.json({ message: 'Skill successfully deleted'})
    }
  })
}
