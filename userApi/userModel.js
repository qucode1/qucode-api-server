const mongoose = require('mongoose'),
      bcrypt   = require('bcrypt')

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    index: { unique: true },
    required: "Please enter a valid email address"
  },
  password: {
    type: String,
    required: "Please enter a unique password"
  },
  name: {
    type: String,
    required: "Please enter a username"
  }
})

UserSchema.methods.comparePassword = function comparePassword(password, callback) {
  bcrypt.compare(password, this.password, callback)
}

UserSchema.pre('save', function saveHook(next) {
  const user = this

  if(!user.isModified('password')) return next()

  return bcrypt.genSalt((saltError, salt) => {
    if(saltError) { return next(saltError)}

    return bcrypt.hash(user.password, salt, (hashError, hash) => {
      if (hashError) { return next(hashError)}

      user.password = hash

      return next()
    })
  })
})

module.exports = mongoose.model('User', UserSchema)
