'use strict'
const AWS       = require('aws-sdk')
const multer    = require('multer')
const jimp      = require('jimp')
const mongoose  = require('mongoose')
const Project   = mongoose.model('Project')

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
  const image     = await jimp.read(req.file.buffer)
  const thumbnail = await jimp.read(req.file.buffer)
  await thumbnail.resize(400, jimp.AUTO)
  await thumbnail.quality(70)
  await image.quality(50)
  // await image.write(`./uploads/${req.body.image}`)
  // await thumbnail.write(`./uploads/thumbnails/${req.body.image}`)
  const imageBuffer = image.getBuffer(jimp.AUTO, (err, data) => {
    const params = {ACL: 'public-read', Bucket: 'qucode.homepage/projects', Key: `${title}`, Body: data}
    s3.upload(params, (err, data) => console.log({err, data}))

  })
  const thumbnailBuffer = thumbnail.getBuffer(jimp.AUTO, (err, data) => {
    const params = {ACL: 'public-read', Bucket: 'qucode.homepage/projects/thumbnails', Key: `${title}`, Body: data}
    s3.upload(params, (err, data) => console.log({err, data}))

  })
  // console.log("resize passed")
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

exports.createProject = (req, res) => {
  const newProject = new Project(req.body)
  console.log(req.body)
  newProject.save((err, project) => {
    if (err) {
      console.log(err)
      res.json(err)
    } else {
    console.log(project.name + ' created ' + Date())
    res.json(project)
  }
  })
}
