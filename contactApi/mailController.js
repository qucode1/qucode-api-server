'use strict'

const mongoose = require('mongoose')
const mail = require('./mail')

exports.send = async(req, res) => {
  await mail.send({
    email: req.body.email,
    subject: req.body.subject,
    name: req.body.name,
    message: req.body.message,
    tel: req.body.tel,
    filename: "contact-info"
  }).then((data) => (
    res.json({data: data, body: req.body})
  )).catch((err) =>{
      console.log("ERROR", err)
      res.json(err)
})
}
