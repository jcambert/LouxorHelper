/**
 * Inventaire.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    date:{
      type:'string',
      required:true,
      unique:true
    },
    articles:{
      collection:'articleInventaire',
      via:'inventaire'
    },
    status:{
      type:'string',
      enum:['Saisie','Demarrage', 'En cours','Erreur','Fini'],
      defaultsTo:'Saisie'
    },
    solde:{
      type:'boolean',
      defaultsTo:false
    }
  }
};

