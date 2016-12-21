/**
 * ArticleController
 *
 * @description :: Server-side logic for managing articles
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	byreferences : function(req,res,next){
        ArticleInventaire.find({reference:{contains:req.params.reference}}).exec(
            function(err,items){
                 if(err)return res.send(401,err);
                 return res.json(items);
            }
        )
    }
};

