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

exports.deleteImagesFromS3 = (req, res, next) => {
  if(!req.file) {
    next()
    return
  }
  Project.findOne({_id: req.params.id}).exec()
  .then((project) => {
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
        console.log('S3 Images ' + project.image + ' DELETED ' + Date())
        next()
        return
      }
    })
  })
  .catch((err) => {
    console.error(err)
    res.json({'error': err})
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

exports.updateProject = (req, res) => {


  // done in upload and resize funcs:
  // check if image is truthy, if it is
  // delete old image on s3, upload new image


  let newStatus = false
  // convert status string to boolean
  req.body.active = req.body.active === 'true' ? true : false

  const findProject = Project.findOne({_id: req.params.id}).exec()

  const compareStatus = (project) => {
    console.log({'formStatus': req.body, 'projectData': project})
    if(req.body.active !== project.active) {
      console.log("formStatus != project.status")
      newStatus = true
    }
  }

  const updateList = (project, list, status) => {
    console.log("updateList")
    console.log({project, list, status})
    List.findOne({name: list}).exec()
    .then((list) => {
      let items = list.items

      items.indexOf(project._id) > -1
      ? (items.splice(items.indexOf(project._id), 1),
        list.items = items,
        list.save()
      )
      : (items.push(project._id),
        list.items = items,
        list.save()
      )
    })
    .catch((err) => {
      console.error(err)
      res.json({'error': err})
    })
  }

  const saveProject = (project) => {
    console.log({'saveProject': project})
    project.name        = req.body.name
    project.description = req.body.description
    if(req.body.image !== 'undefined'){
      project.image     = req.body.image
    }
    // project.tags        = req.body.tags
    // project.liveURL     = req.body.liveURL
    // project.github      = req.body.github
    project.active      = req.body.active

    return project.save()
  }

  // find project
  findProject.then((project) => {
    // compare active status...
    compareStatus(project)
    console.log({'updateList': newStatus})
    // if it changed, update active and inactive list
    if(newStatus) {
      updateList(project, 'Active Projects', req.body.active)
      updateList(project, 'Inactive Projects', req.body.active)
    }
    // save project with new data
    saveProject(project)
    res.json({'status': 'success', 'message': `Project '${project.name}' has been updated`})
  })
  // catch errors
  .catch((err) => {
    console.error(err)
    res.json(err)
  })

}
