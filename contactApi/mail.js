'use strict';
const nodemailer = require('nodemailer')
const promisify = require('es6-promisify')
const pug = require('pug')
const htmlToText = require('html-to-text')
const juice = require('juice')

const variables = require('../variables.json')

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: process.env.MAILHOST || variables.MAIL_HOST,
    port: process.env.MAILPORT || variables.MAIL_PORT,
    secure: true, // secure:true for port 465, secure:false for port 587
    auth: {
        user: process.env.MAILUSER || variables.MAIL_USER,
        pass: process.env.MAILPW || variables.MAIL_PW
    }
});

const generateHTML = (filename, options = {}) => {
  const html = pug.renderFile(`${__dirname}/${filename}.pug`, options)
  const inlined = juice(html)
  return inlined
}

exports.send = async (options) => {
  const html = generateHTML(options.filename, options)
  const text = htmlToText.fromString(html)

  const mailOptions = {
    from: '"QuCode | Contact-Form" <noreply@qucode.eu>', // sender address
    to: "info@qucode.eu", // list of receivers
    replyTo: `'${options.name}' <${options.email}>`,
    subject: `Web-Contact-Form: ${options.subject}`, // Subject line
    text: text, // plain text body
    html// html body
  }
  const sendMail = promisify(transporter.sendMail, transporter)
  return sendMail(mailOptions)
}
