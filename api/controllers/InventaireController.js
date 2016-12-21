/**
 * InventaireController
 *
 * @description :: Server-side logic for managing inventaires
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var request = require('request');
var _ = require('lodash');
var nrc = require('node-run-cmd');
var spawn = require('child_process').spawn;
var updateStatus = function(req,res,status,error){
     Inventaire.findOne({id:req.params.id}).exec(function(err,data){
        if(err)return res.send(404,err);
        data.status=status;
        if(error)    _.extend(data,error);
        data.save(function(err,item){
            if(err)return res.badRequest();
             Inventaire.publishUpdate(data.id,data,req);
            return res.json(data);
           /* setTimeout(function(){
                Inventaire.publishUpdate(data.id,data,req);
                sails.sockets.broadcast(sails.config.sockets.roomName, 'inventaire',data);
                return res.json(data);
            },100);*/
        });
    });
};
module.exports = {
	detail:function(req,res){
        var params={};
        if(req.query.id)
            params.id=req.query.id;
        else if(req.query.date)
            params.date = req.query.date;

        Inventaire.findOne(params).exec(function(err,inventaire){
            if(err)return res.send(404,err);
            if(inventaire == undefined){
                return res.json({inventaire:{articles:[]}});
            }else{
                ArticleInventaire.find({inventaire:inventaire.id}).groupBy('codart').sum('qty').sort('codart ASC').exec(function(err,articles){
                    if(err)return res.send(404,err);
                    _.forEach(articles,function(article){
                        article.date=inventaire.date;

                    })
                    return res.json({inventaire:   {articles:articles,id:inventaire.id}});
                });
            }
            
        });

    },
    list:function(req,res){
         Inventaire.find({solde:false}).exec(function(err,items){
            if(err)res.send(404,err);
            /*if(req.isSocket)
                ArticleInventaire.subscribe(req, _.pluck(items, 'id'));*/
            res.json({inventaires:items});
        });
    },
    wantstart:function(req,res){
        sails.log('wanstart Injection of inventaire No:'+req.params.id);
        //Execute Talend Job

        
        Inventaire.findOne({id:req.params.id}).exec(function(err,inventaire){
            if(err)return res.badRequest(err);
            if(inventaire == undefined){
                return res.badRequest();
            }else{
               inventaire.status = 'Demarrage'; 
               inventaire.save();
               Inventaire.publishUpdate(inventaire.id,inventaire,req);

               var bat = spawn('cmd.exe',['/c', 'MajInventaire_run.bat','--context_param', 'InventaireId='+inventaire.id,'RestServer=192.6.2.72:1337'],{cwd:'c:\\louxor\\scripts\\MajInventaire_0.1\\MajInventaire',env:process.env})
               bat.stdout.on('data', (data) => {
                 console.log(`stdout: ${data}`);
                });

                bat.stderr.on('data', (data) => {
                    console.log(`stderr: ${data}`);
                });

                bat.on('close', (code) => {
                    console.log(`child process exited with code ${code}`);
                });
                bat.on('exit', function (code) {
                    console.log('child process exited with code ' + code);
                });
               
                return res.ok();
              
            }
            
        });
    },
    start:function(req,res){
        sails.log('start injection of inventaire No:'+req.params.id);
        Inventaire.findOne({id:req.params.id}).exec(function(err,inventaire){
            if(err)return res.badRequest(err);
            if(inventaire == undefined){
                return res.badRequest();
            }else{
               inventaire.status = 'En cours'; 
               inventaire.save();
               Inventaire.publishUpdate(inventaire.id,inventaire,req);
               return res.ok();
            }
            
        });
        
        //return updateStatus(req,res,'started');
    },
    end:function(req,res){
        sails.log('end injection of inventaire No:'+req.params.id);
        Inventaire.findOne({id:req.params.id}).exec(function(err,inventaire){
            if(err)return res.badRequest(err);
            if(inventaire == undefined){
                return res.badRequest();
            }else{
               inventaire.status = 'Fini';
               //inventaire.solde = true;
               inventaire.save();
               Inventaire.publishUpdate(inventaire.id,inventaire,req);
               return res.ok();
            }
            
        });
    },
    error:function(req,res){
        sails.log('error injection of inventaire No:'+req.params.id);
        Inventaire.findOne({id:req.params.id}).exec(function(err,inventaire){
            if(err)return res.badRequest(err);
            if(inventaire == undefined){
                return res.badRequest();
            }else{
               inventaire.status = 'Erreur'; 
               inventaire.save();
               Inventaire.publishUpdate(inventaire.id,inventaire,req);
               return res.badRequest(err);
            }
            
        });
    },
    clearstatus:function(req,res){
         sails.log('clearing status of inventaire No:'+req.params.id);
         Inventaire.findOne({id:req.params.id}).exec(function(err,inventaire){
            if(err)return res.badRequest(err);
            if(inventaire == undefined){
                return res.badRequest();
            }else{
               inventaire.status = 'Saisie';
               inventaire.solde = false; 
               inventaire.save();
               Inventaire.publishUpdate(inventaire.id,inventaire,req);
               return res.ok();
            }
            
        });
    },
    toto:function(req,res){
        Inventaire.findOne({id:4}).exec(function(err,data){
            Inventaire.publishUpdate(4,data,req);
            return res.ok(data);
        });
    }
};

