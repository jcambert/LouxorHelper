/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
var Passwords = require('machinepack-passwords');

module.exports = {

  attributes: {
    email:{
      type:'email',
      required:true,
      unique:true
    },

    password:{
      type:'string',
      minLength:6,
      required:true
    },
    firstname:{
      type:'string',
      required:true
    },
    lastname:{
      type:'string',
      required:true
    },
    toJSON: function() {
        var obj = this.toObject();
        delete obj.password;
        return obj;
    },
    
  },

  beforeCreate: function(user,cb){
      Passwords.encryptPassword({
        password: user.password,
      }).exec({
      // An unexpected error occurred.
        error: function (err){
          console.log(err);
          cb(err);
       },
      // OK.
        success: function (result){
          user.password = result;
          cb();
        },
      });
    }
};

