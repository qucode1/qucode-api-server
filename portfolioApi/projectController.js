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
         const params = {ACL: 'public-read', Bucket: 'qucode.homepage', Key: `projects/${title}`, Body: data}
         s3.upload(params, (err, data) => {
           if(err) {
             console.error(err)
             res.json(err)
           }
         })
       })
  }).catch((err) => {
    console.error(err)
  })
  await jimp.read(req.file.buffer).then((thumb) => {
    thumb.resize(400, jimp.AUTO)
         .quality(70)
         .getBuffer(jimp.AUTO, (err, data) => {
           const params = {ACL: 'public-read', Bucket: 'qucode.homepage', Key: `projects/thumbnails/${title}`, Body: data}
           s3.upload(params, (err, data) => {
             if(err) {
               console.error(err)
               res.json(err)
             }
           })
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
  // console.log(req.body)
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
                console.log('PROJECT: ' + '\'' + project.name + '\'' + ' CREATED ' + Date())
                res.json(project)
              }
            })
          }
        })
    }
  })
}

exports.deleteProject = (req, res) => {
  Project.findOne({_id: req.params.id}, (err, project) => {
    if(err) {
      console.error(err)
      res.json(err)
    } else {
      const listName = project.active === 'true'
        ? 'Active Projects'
        : 'Inactive Projects'
      List.findOne({name: listName}, (err, list) => {
        if(err) {
          console.error(err)
          res.json(err)
        } else {
          const listItems = list.items
          listItems.splice(listItems.indexOf(project._id), 1)
          list.items = listItems
          list.save((err, list) => {
            if(err) {
              console.error(err)
              res.json(err)
            } else {
              const deleteParams = {
                Bucket: 'qucode.homepage',
                Delete: {
                  Objects: [
                    {
                      Key: `projects/${project.image}`
                    },
                    {
                      Key: `projects/thumbnails/${project.image}`
                    }
                  ]
                }
              }
              s3.deleteObjects(deleteParams, (err, data) => {
                if(err) {
                  console.error(err)
                  res.json(err)
                } else {
                  Project.remove({
                    _id: req.params.id
                  }, (err, project) => {
                    if (err) res.json(err)
                    else {
                      console.log('PROJECT DELETED ' + Date())
                      res.json({ message: 'Project successfully deleted'})
                    }
                  })
                }
              })
            }
          })
        }
      })
    }
  })
}
