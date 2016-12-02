/**
 * Article.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    codart:{
      type:'string',
      required:true
    },
    qty:{
      type:'float',
      required:true
    },
    operator:{
      type:'string'
    },
    date:{
      type:'string',
      required:true,
      defaultsTo:Date.now
    }

  }
};

