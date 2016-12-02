/**
 * AuthController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var passport = require('passport'),
    _=require('lodash');

module.exports = {
	_config: {
        actions: false,
        shortcuts: false,
        rest: false
    },

    login: function(req, res) {

        passport.authenticate('local', function(err, user, info) {
            if ((err) || (!user)) {
                return res.send(404,{
                    message: info.message,
                    user: user
                });
            }
            req.logIn(user, function(err) {
                if (err) res.send(err);
               /* return res.send({
                    message: info.message,
                    user: user
                });*/
               // sails.config.inventaire.
               User.findOne({id:req.user.id}).exec(function(err,uuser){
                   if(err)res.send(err);
                   var cloned= _.clone(uuser);
                   delete cloned.password;
                   return res.json({user:cloned});
               });
               
            });

        })(req, res);
    },
    islogin : function(req,res){
        if(req.user)
            User.findOne({id:req.user.id}).exec(function(err,uuser){
                   if(err)res.send(err);
                   var cloned= _.clone(uuser);
                   delete cloned.password;
                   return res.json({user:cloned});
               });
        else
            return res.ok();
    },
    logout: function(req, res) {
        req.logout();
        res.redirect('/#/accueil');
    }
};

