'use strict'
const AWS       = require('aws-sdk')
const multer    = require('multer')
const jimp      = require('jimp')
const mongoose  = require('mongoose')
const Project   = mongoose.model('Project')
const List      = mongoose.model('List')

AWS.config.loadFromPath('./variables.json')

const s3 = new AWS.S3({apiVersion: '2006-03-01'})


const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/')
    if(isPhoto) {
      next(null, true)
    } else {
      next({message: 'That filetype isn\'t allowed!'}, false)
    }
  }
}


exports.upload = multer(multerOptions).single('image')

exports.resize = async(req, res, next) => {
  try {
  //check if there is no new file to resize
  if(!req.file) {
    console.log("req.file == false")
    console.log(req.body)
    next()
    return
  }
  // console.log(req.file)
  const extension = req.file.mimetype.split('/')[1]
  const title     = `${Date.now()}-${req.body.name}.${extension}`
  req.body.image  = `${title}`
  // https://s3.eu-central-1.amazonaws.com/qucode.homepage/projects/thumbnails/
  await jimp.read(req.file.buffer).then((img) => {
    img.quality(70)
       .getBuffer(jimp.AUTO, (err, data) => {
         const params = {ACL: 'public-read', Bucket: 'qucode.homepage/projects', Key: `${title}`, Body: data}
         s3.upload(params, (err, data) => console.log({err, data}))
       })
  }).catch((err) => {
    console.error(err)
  })
  await jimp.read(req.file.buffer).then((thumb) => {
    console.log('thumb func')
    thumb.resize(400, jimp.AUTO)
         .quality(70)
         .getBuffer(jimp.AUTO, (err, data) => {
           const params = {ACL: 'public-read', Bucket: 'qucode.homepage/projects/thumbnails', Key: `${title}`, Body: data}
           s3.upload(params, (err, data) => console.log({err, data}))
         })
  }).catch((err) => {
    console.error(err)
  })
  next()
  }
  catch(error) {
    console.log(error)
  }
}

exports.getAllProjects = (req, res) => (
  Project.find({}, (err, projects) => {
    if (err) res.send(err)
    else {
      console.log('all projects requested ' + Date())
      res.json(projects)
    }
  })
)

exports.getActiveProjects = (req, res) => (
  Project.find({active: true}, (err, projects) => {
    if (err) res.send(err)
    else {
      console.log('all active Projects requested ' + Date())
      res.json(projects)
    }
  })
)

exports.getInactiveProjects = (req, res) => (
  Project.find({active: false}, (err, projects) => {
    if (err) res.send(err)
    else {
      console.log('all inactive Projects requested ' + Date())
      res.json(projects)
    }
  })
)

exports.getOneProject = (req, res) => {
  Project
    .findById(req.params.id)
    .exec((err, project) => {
      if(err) {
        console.error(err)
        res.json(err)
      } else {
        project
        ? (
          console.log('Project: ' + project.name + ' requested ' + Date()),
          res.json(project)
        )
        : (console.error('Project not found'), res.json({'error': 'Project not found'}))
      }
    })
}

exports.createProject = (req, res) => {
  const newProject = new Project(req.body)
  console.log(req.body)
  newProject.save((err, project) => {
    if (err) {
      console.log(err)
      res.json(err)
    } else {
      const listName = req.body.active === 'true'
        ? 'Active Projects'
        : 'Inactive Projects'
      List
        .findOne({name: listName})
        .exec((err, list) => {
          if(err) {
            console.error(err)
            res.json(err)
          } else {
            let listItems = list.items
            listItems.push(project._id)
            list.items = listItems
            list.save((err, list) => {
              if(err) {
                console.log(err)
                res.json(err)
              } else {
                console.log(project.name + ' created ' + Date())
                res.json(project)
              }
            })
          }
        })
    }
  })
}
