/**
 * InventaireController
 *
 * @description :: Server-side logic for managing inventaires
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	detail:function(req,res){
         Article.find().groupBy('codart').sum('qty').exec(function(err,data){
            if(err)res.send(404,err);
            res.json({inventaire:data});
        });
    }
};

