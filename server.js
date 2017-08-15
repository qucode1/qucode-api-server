const express = require('express'),
      mongoose = require('mongoose'),
      bodyParser = require('body-parser'),
      variables = require('./variables.json'),
      cors = require('cors'),
      app = express(),
      Skill = require('./aboutApi/models/skillModel'),
      Text = require('./textApi//textModel'),
      Project = require('./portfolioApi/projectModel'),
      mail = require('./contactApi/mailController')
      port = variables.PORT,

// require('dotenv').config({ path: 'variables.env' });

mongoose.Promise = global.Promise
mongoose.connect(variables.DATABASE, {
  useMongoClient: true
})
mongoose.connection.on('error', (err) => {
  console.error(`🙅 🚫 🙅 🚫 🙅 🚫 🙅 🚫 → ${err.message}`);
});

app.use(cors({origin: ['http://localhost:3005', 'https://qucode.eu']}));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

var skillRoutes   = require('./aboutApi/routes/skillRoutes')
var textRoutes    = require('./textApi/textRoutes')
var projectRoutes = require('./portfolioApi/projectRoutes')

app.route('/contact')
  .post(mail.send)

skillRoutes(app)
textRoutes(app)
projectRoutes(app)

app.listen(port, (err) => {
  if(err) console.log(err.message)
  console.log('api server is running on port: ' + port)
})
