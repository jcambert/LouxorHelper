/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */
var _ = require('lodash');
module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
  * etc. depending on your default view engine) your home page.              *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  '/': {
    view: 'homepage',
    locals:{
      title:'Louxor Helper v0.1'
    }
  },

  

  /***************************************************************************
  *                                                                          *
  * Custom routes here...                                                    *
  *                                                                          *
  * If a request to a URL doesn't match any of the custom routes above, it   *
  * is matched against Sails route blueprints. See `config/blueprints.js`    *
  * for configuration options and examples.                                  *
  *                                                                          *
  ***************************************************************************/
  
  'get /login': {
       view: 'login'
},

  'get /welcome':function(req,res){
    if(!req.isSocket)
      return res.badRequest();

    sails.sockets.join(req,sails.config.sockets.roomName,
      function(err){
        if(err) return res.serverError(err);

        /*_.forEach(sails.models,function(model){
          model.subscribe(req);
        })*/
        return res.json({message:'Bienvenue sur '+sails.config.sockets.roomName,roomName:sails.config.sockets.roomName});
      })
  },
//  'post /login': 'AuthController.login',
 // 'get /islogin': 'AuthController.islogin',

 // '/logout': 'AuthController.logout',

/*  'get /signup': {
    view: 'signup'
  },*/

  'GET /inventaire/inject/:id/start':'InventaireController.start',
  'GET /inventaire/inject/:id/wantstart':'InventaireController.wantstart',
  'GET /inventaire/inject/:id/end' : 'InventaireController.end',
  'GET /inventaire/inject/:id/error' :'InventaireController.error',
  'GET /inventaire/inject/:id/clear' :'InventaireController.clearstatus',
  'GET /inventaire/toinject':'InventaireController.toinject',
  'GET /inventaire/dateforid/:id':'InventaireController,dateforid',
  'GET /inventaire/list':'InventaireController.list',
  'GET /articleinventaire/byref/:reference':'ArticleInventaireController.byreferences',
  
};
