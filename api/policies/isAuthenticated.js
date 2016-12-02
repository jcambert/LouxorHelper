module.exports = function(req, res, next) {
    console.dir(req);
   if (req.isAuthenticated()) {

       //console.dir(req);
        return next();
    }
    else{
        return res.redirect('/login');
    }
};