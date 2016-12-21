angular
.module('inventaireatf',['ui.router', 'ngAnimate', 'toastr','angularMoment','sailsResource','ui.bootstrap','ngStorage'])
.config(['$stateProvider','$urlRouterProvider','$sceDelegateProvider','sailsResourceProvider',function($stateProvider,$urlRouterProvider,$sceDelegateProvider,sailsResourceProvider){
     // We must whitelist the JSONP endpoint that we are using to show that we trust it
  /*$sceDelegateProvider.resourceUrlWhitelist([
    'self',
    'http://localhost:8080/**'
]);*/

  /*sailsResourceProvider.configuration={
      socket: io.socket
};*/
    $stateProvider
    .state('home',{
        url:'/',
        template:'<ui-view></ui-view>',
        //template:'<div>HELLO</div>',
        controller:'MainController',
        resolve:{
            //It's a hook to see if user is connected or not
            isLogged:['AuthService', function($auth){
                console.log('Resolution');
                return $auth.isLoggedIn();
            }],
            
        },
        abstract:true
        //
    })
    .state('home.accueil',{
        url:'public',
        templateUrl:'templates/home.public.html',
        //controller:['$scope',function($scope){}],
        access: {restricted: false}
    })
    .state('home.signed',{
        url:'accueil',
        templateUrl:'templates/home.signed.html',
        resolve:{
            isAdmin:['AuthService','$rootScope', function($auth,$rootScope){
                console.log('resolve admin for roles');console.dir($rootScope.roles);
                return  $auth.isAdmin($rootScope.roles);
            }]
        },
        controller:['$scope','isAdmin',function($scope,isAdmin){
            $scope.isAdmin = isAdmin;
            console.log('HomeSignedController isAdmin:'+isAdmin);
        }],
        access: {restricted: true}
    })
    .state('home.inventaire',{
        url:'inventaire',
        templateUrl:'templates/inventaire.html',
        abstract:true,
        access: {restricted: true}
    })
    .state('home.inventaire.list',{
        url:'/list',
        templateUrl:'templates/inventaire.list.html',
        controller:'InventaireListCtrl',
         access: {restricted: true}
    })
     .state('home.inventaire.new',{
        url:'/new',
        templateUrl:'templates/inventaire.new.html',
        controller:'InventaireNewCtrl',
        resolve:{
            lastDate : ['$http',function($http){
                var url='//localhost:8080/louxor/inventairelastdate.php';
                function formatResult(d){
                    var result= {};
                    if(!angular.isDate(d)){
                        result.date=d;
                        var explode = result.date.split('/');
                        result.year = number(explode[2]);
                        result.monh = number(explode[1]);
                        result.day  = number(explode[0]);
                        result.date = new Date(result.year,result.month,result.day);
                    }else{
                        result.date = d;
                        result.year = d.getYear();
                        result.month = d.getMonth();
                        result.day = d.getDay();
                    }
                    return result;
                }
                return $http.get(url).then(function(response){
                        console.dir(response);
                        try{
                            var result = formatResult(response.data.results[0].datcom);
                            console.dir(result);
                            return  result;
                        }catch(err){
                            return formatResult(new Date());
                        }
                    });
            }]
        },
        access: {restricted: true}
    })


    .state('home.inventaire.saisie',{
        url:'/saisie/:id',
        templateUrl:'templates/inventaire.saisie.html',
        controller:'InventaireSaisieCtrl',
        resolve:{
            mode:function(){return 'create';}
        },
         access: {restricted: true}
    })
     .state('home.inventaire.modifier',{
        url:'/modifier/:id/:aid',
        templateUrl:'templates/inventaire.saisie.html',
        controller:'InventaireSaisieCtrl',
        resolve:{
            mode:function(){return 'modify';}
        },
         access: {restricted: true}
    })
    .state('home.inventaire.detail',{
        url:'/detail/:id/:aid',
        templateUrl:'templates/inventaire.detail.html',
        controller:'InventaireDetailCtrl',
         access: {restricted: true}
    })
    .state('home.inventaire.recap',{
        url:'/recap/:id',
        templateUrl:'templates/inventaire.recap.html',
        controller:'InventaireRecapCtrl',
         access: {restricted: true}
    })
    .state('home.signin',{
        url:'signin',
        templateUrl:'templates/signin.html',
        controller:'SigninController',
        access: {restricted: false}
    })

    .state('home.administration',{
        url:'admin',
        templateUrl:'templates/administration.html',
        access: {
            restricted: true,
            role:'admin'
        }
    })
    .state('home.administration.users',{
        url:'/userslist',
        templateUrl:'templates/admin/users.list.html',
        controller:'AdminUsersListController',
        access: {
            restricted: true,
            role:'admin'
        }
    })

    .state('home.administration.edituser',{
        url:'/useredit/:id',
        templateUrl:'templates/admin/user.edit.html',
        controller:'AdminUsersEditController',
        resolve:{
            user:['sailsResource','$stateParams','$q', function(sailsResource,$stateParams,$q){
                var d=$q.defer();
                var User = sailsResource('user',{
                    get:{method:'GET',url:'/user/:id?populate=roles'}
                },{verbose:true});

                User.get({id:$stateParams.id},
                    function(user){ 
                        d.resolve(user)
                    },function(err){
                        d.reject(undefined);
                    });
                return d.promise;
            }],
            roles:['sailsResource','$q',function(sailsResource,$q){
                var d=$q.defer();
                var Roles = sailsResource('role',{
                    query:{method:'GET',url:'/role?active=true',isArray:true}
                });
                Roles.query(
                    function(roles){
                        d.resolve(roles);
                    },function(err){
                        d.reject([]);
                    });
                return d.promise;
            }]
        },
        access: {
            restricted: true,
            role:'admin'
        }
    })
    .state('home.administration.roles',{
        url:'/roleslist',
        templateUrl:'templates/admin/roles.list.html',
        controller:'AdminRolesListController',
        access: {
            restricted: true,
            role:'admin'
        }
    })

    .state('home.administration.editrole',{
        url:'/roleedit/:id',
        templateUrl:'templates/admin/role.edit.html',
        controller:'AdminRolesEditController',
        resolve:{
            role:['sailsResource','$q', function(sailsResource,$q){
                var d=$q.defer();
                var Role = sailsResource('role',{
                    get:{method:'GET',url:'/role/:id?populate=users,permissions'}
                })
                Role.get({id:$stateParams.id},
                    function(role){
                        d.resolve(role);
                    },function(err){
                        d.reject(undefined);
                    });
                return d.promise
            }]
        },
         access: {
            restricted: true,
            role:'admin'
        }
    })
    .state('home.signup',{
        url:'signup',
        templateUrl:'templates/signup.html',
        controller:'SignupController',
        resolve:{
            user:['AuthService',function($auth){
                return $auth.createUser();
            }]
        },
         access: {restricted: false}
    })

    $urlRouterProvider.otherwise('/');
}])
/*
.controller('BodyController',['$rootScope','$scope','AuthService','$state',function($rootScope,$scope,$auth,$state){
    $scope.logout = function(){
        $auth.logout().then(function(){$state.go('home.accueil')});
    };

    $scope.isAdmin = function(){
        return $auth.isAdmin($rootScope.roles);
        //return _.find(_.map($rootScope.roles,name),function(role){return role=="admin"});
    }
}])*/
.controller('MainController',['$rootScope','$scope','AuthService','toastr','$state','isLogged',function($rootScope,$scope,$auth,toastr,$state,isLogged){

    if(isLogged && $rootScope.user){
        $auth.getRoles($rootScope.user.id).then(
            function(roles){
                $rootScope.roles = roles;
            },
            function(){
                $rootScope.roles = {}
            }
        )
    }


}])

.controller('SignupController',['$scope','AuthService','user','$state',function($scope,$auth,user,$state){
    $scope.user = user;
    $scope.trySignup = function(){
        $auth.register($scope.user).then(
            function(){
                $state.go('home.signin');
               //$location.path('/login');
            },
            function(err){
                console.dir(err);
                if(angular.isDefined( err.invalidAttributes.email))
                    toastr.error('Cet email existe déja!!');
                else
                    toastr.error(err);
            }
        );

    };

}])

.controller('SigninController',['$scope','AuthService','toastr','$state',function($scope,$auth,toastr,$state){
    $scope.user ={email:'admin@example.com',password:'admin1234'};
     $scope.trySignin = function(){
        $auth.login($scope.user.email,$scope.user.password).then(
            function(user){
                console.dir(user);
                toastr.success('Bonjour '+user.username );
                if($state.current.name=="home.signin")
                    $state.go('home.accueil');
            },
            function(err){
                toastr.error('Email et/ou Mot de passe invalide');
            });
    };
}])
.controller('InventaireListCtrl',['$rootScope', '$scope','sailsResource','moment','toastr','$state','$localStorage', function($rootScope, $scope,$sailsResource,$moment,toastr,$state,$storage){
    $scope.inventaires=[];
    $scope.showSolde = $storage.showSolde || false;

    var Inventaire = $sailsResource('inventaire',{
        list:{method:'GET',url:'/inventaire/list',isArray:false},
        wantInject:{method:'GET',url:'/inventaire/inject/:id/wantstart',isArray:false},
        toto:{method:'GET',url:'/inventaire/toto'}
    },{
       // socket: io.socket,
      //  verbose:true
    });
    $rootScope.$on('$sailsResourceUpdated', function(event, message) {
        console.log(message.model + ' is updated');
        if(message.model == 'inventaire') {
            // some logic for user update messages
        }
    });
   io.socket.on('inventaire',function(data){
        console.dir(data);
    });
    function reload(){
        var params = $scope.showSolde?{}:{solde:false};
        $scope.inventaires = Inventaire.query(params); // params
        console.dir($scope.inventaires);
    }

    $scope.delete = function(id){
        Inventaire.get({id:id},function(item){
            item.$delete(function(){
                toastr.success("L\inventaire du "+ item.date + " est supprimé");
                reload();
            });
        });
    };

    $scope.canModify = function(index){
        var inventaire = $scope.inventaires[index];
        return inventaire.status == 'Saisie';
    };

    $scope.solde = function(index){
        var inventaire = $scope.inventaires[index];
        inventaire.solde = true;
        inventaire.$save(function(){
            toastr.success('L\'inventaire du '+inventaire.date+' est soldé');
        })
        
    };

    $scope.canSolde = function(index){
        var inventaire = $scope.inventaires[index];
        return inventaire.status=='Fini' && inventaire.solde==false ;
    }

    $scope.inject = function(index){
        console.log(index);
        var inventaire = $scope.inventaires[index];
        console.dir(inventaire)
        Inventaire.wantInject({id:inventaire.id},
            function(){
                toastr.success('Demarrage de l\'injection');
                inventaire.status = 'Demarrage';
                console.dir(inventaire);
                inventaire.$save();
            },
            function(err){
                toastr.error(err);
            }
        );
    };

    $scope.canInject = function(index){
        var inventaire = $scope.inventaires[index];
        return inventaire.status=='Saisie';
    }

    $scope.onChange = function(newVal){
      
        $scope.showSolde=newVal;
        $storage.showSolde = newVal;
        reload();
    }
    $scope.$watch('showSolde',function(newVal,oldVal){
        console.log(newVal);
        $storage.showSolde = newVal;
        reload();
    })

    reload();
}])
.controller('InventaireNewCtrl',['$scope','sailsResource','moment','toastr','$state','lastDate', function($scope,$sailsResource,$moment,toastr,$state,lastDate){
   
    var Inventaire = $sailsResource('inventaire',{

    });
     $scope.date= lastDate.date;
     $scope.model = new Inventaire();
     // moment(Date.now()).format('DD/MM/YYYY');
     $scope.createNewInventaire = function(){
        console.log('create new inventaire');
        $scope.model.date = moment($scope.date).format('DD/MM/YYYY');
        console.dir($scope.model);

        $scope.model.$save(
            function(item){
                console.dir(item);
                toastr.success('Inventaire crée');
                $state.go('home.inventaire.saisie',{id:item.id});
            },
            function(err){
                toastr.error(err);
            }
        )
    };
    

}])
.controller('InventaireSaisieCtrl',['$scope','sailsResource','$state','$stateParams','toastr','$http','mode',function($scope,$sailsResource,$state,$stateParams,toastr,$http,mode){
    $scope.loading = true;
    $scope.mode = mode;
    if(!angular.isDefined($stateParams.id)){
        toastr.error('Veuillez fournir un idenfiant pour la saisie d\'un inventaire');
        $state.go('home.inventaire.list');
    }
    if(!angular.isDefined($stateParams.aid) && mode=='modify'){
        toastr.error('Veuillez fournir un idenfiant pour l\'article à modifier');
        $state.go('home.inventaire.detail',{id:$stateParams.id});
    }

    var Inventaire = $sailsResource('inventaire',{

    });

    var ArticleInventaire = $sailsResource('ArticleInventaire',{

    });
    
     Inventaire.get({id:$stateParams.id},
        function(item){
            $scope.inventaire = item;
            
            init();
             

        },
        function(err){
            toastr.error('L\inventaire avec l\id '+$stateParams.id + ' n\'existe pas !!' );
            $state.go('home.inventaire.list');

        }
    );

    function init(){
        if(mode == 'create'){
                $scope.article = new ArticleInventaire();
                $scope.article.inventaire = $scope.inventaire; 
                $scope.codartFocus=true;
                $scope.loading=false;
            }
            else if( mode == 'modify'){
                ArticleInventaire.get({id:$stateParams.aid},
                    function(item){
                        $scope.article = item;
                        $scope.codartFocus=true;
                        $scope.loading=false;
                    },

                    function(err){
                        toastr.error(err);
                        $scope.codartFocus=true;
                        $scope.loading=false;
                    }
                )
            }
    }
   
    $scope.saisirInventaire = function(){
        $scope.loading = true;
        $scope.article.$save(
            function(item){
                toastr.success($scope.article.codart + ' ajouter à l\'inventaire');
                init();
            },
            function(err){
                toastr.error(err);
                $scope.loading=false;
            }
        );
    }
   
    $scope.getArticles = function(val) {
       
        $scope.url='//localhost:8080/louxor/inventaireliste.php';
        var params = {
                date:$scope.inventaire.date,
                ref:val
            };
        return $http.get($scope.url, {
                params: params
            }).then(function(response){
                console.dir(response);
                var result= response.data.results.map(function(item){
                    return item.codart;
                });
                console.dir(result);
                return result;
            });
    };
}])

.controller('InventaireDetailCtrl',['$scope','sailsResource','$state','$stateParams','toastr','$http','filterFilter','$localStorage',function($scope,$sailsResource,$state,$stateParams,toastr,$http,$filter,$storage){
    $scope.loading = true;
    
    

    if(!angular.isDefined($stateParams.id)){
        toastr.error('Veuillez fournir un idenfiant pour la saisie d\'un inventaire');
        $state.go('home.inventaire.list');
    }
    

    var Inventaire = $sailsResource('inventaire',{

    });

    var ArticleInventaire = $sailsResource('ArticleInventaire',{

    });

    /* SEARCH AND PAGER */
    $scope.$storage = $storage;
    $scope.itemsPerPage = $scope.$storage.pager_itemsPerPage || 10;
    $scope.filterItemsCount=0;
    $scope.search=angular.isDefined($stateParams.aid)? $stateParams.aid : $scope.$storage.InventaireDetailCtrl_search || '';
    $scope.$watch('search',function(newVal,oldVal){
        $scope.$storage.InventaireDetailCtrl_search=newVal;
    })
    /* END SEARCH AND PAGER */


     Inventaire.get({id:$stateParams.id},
        function(item){
            console.dir(item);
            $scope.inventaire = item;
             $scope.loading=false;
             $scope.totalItems = $scope.inventaire.articles.length;
             $scope.noOfPages = Math.ceil($scope.totalItems / $scope.$storage.pager_itemsPerPage);
        },
        function(err){
            toastr.error('L\inventaire avec l\id '+$stateParams.id + ' n\'existe pas !!' );
            $state.go('home.inventaire.list');

        }
    );
   

    $scope.delete = function(id,index){
         $scope.loading = true;
        ArticleInventaire.get({id:id},
            function(item){
                item.$delete(function(){
                    $scope.inventaire.articles.splice(index,1);
                    toastr.success(item.codart +' supprimer de l\'inventaire');
                    $scope.loading=false;
                });
            }
        );}
}])

.controller('InventaireRecapCtrl',['$scope','sailsResource','$state','$stateParams','toastr','$http','$localStorage',function($scope,$sailsResource,$state,$stateParams,toastr,$http,$storage){
    $scope.loading = true;

    if(!angular.isDefined($stateParams.id)){
        toastr.error('Veuillez fournir un idenfiant pour la saisie d\'un inventaire');
        $state.go('home.inventaire.list');
    }

    /* SEARCH AND PAGER */
    $scope.$storage = $storage;
    $scope.itemsPerPage = $scope.$storage.pager_itemsPerPage || 10;
    $scope.filterItemsCount=0;
    $scope.search=$scope.$storage.InventaireRecapCtrl_search || '';
    $scope.$watch('search',function(newVal,oldVal){
        $scope.$storage.InventaireRecapCtrl_search=newVal;
    })
    /* END SEARCH AND PAGER */

    var Inventaire = $sailsResource('inventaire',{
        recap:{method:'GET',url:'/inventaire/detail/?id=:id',isArray:false}
    });

    
    Inventaire.get({id:$stateParams.id},
        function(inventaire){
            $scope.inventaire = inventaire;
            Inventaire.recap({id:$stateParams.id},
                function(item){
                    console.dir(item);
                    $scope.articles = item.inventaire.articles;
                    $scope.loading=false;

                },
                function(err){
                    toastr.error('L\inventaire avec l\id '+$stateParams.id + ' n\'existe pas !!' );
                    $state.go('home.inventaire.list');

                }
            );
        },function(err){
            toastr.error('L\inventaire avec l\id '+$stateParams.id + ' n\'existe pas !!' );
            $state.go('home.inventaire.list');
        }

    )
     
   
}])

.controller('AdminRolesListController',['$scope', 'sailsResource','$localStorage','$uibModal','toastr', function($scope,sailsResource,$storage,$uibModal,toastr){
    var Role = sailsResource('role',{
        query:{method:'GET',url:'/role?populate=users,permissions',isArray:true}
    });
    $scope.showNonActive = $storage.roleslist_showNonActive || true;
    function reload(){
        console.log('reload');
        var params = $scope.showNonActive?{}:{active:true};
        $scope.items = Role.query(params);
    }
    $scope.onChange = function(newVal){
      
        $scope.showNonActive=newVal;
        $storage.roleslist_shownonActive = newVal;
        reload();
    }
    $scope.$watch('showActive',function(newVal,oldVal){
        console.log(newVal);
        $storage.roleslist_showNonActive=newVal;
        reload();
    })

    $scope.setActiveTo = function(index,val){
        var role = $scope.items[index];
        role.active = val;
        role.$save(
            function(){
                toastr.success('Role sauvegardé');
            },function(err){
                toastr.error(err);
            });
        
    }

    $scope.addNew = function(){
        var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'admin.role.add.html',
            controller: 'AdminRoleAddModalController',
            
            size: 'lg',
            resolve: {
                role: function () {
                    return new Role();
                }
            }
        });

        modalInstance.result.then(function (role) {
            role.$save(
                function(r){
                    $scope.items.push(r);
                    toastr.success('Role '+r.name +' ajouter');
                },function(err){
                    toastr.error(err);
                });

        }, function () {
            //$log.info('Modal dismissed at: ' + new Date());
        });
    }
    reload();


}])

.controller('AdminRoleAddModalController',['$scope','role','$uibModalInstance',function($scope,role,$uibModalInstance){
    $scope.role = role;
    $scope.ok = function () {
        $uibModalInstance.close($scope.role);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}])


.controller('AdminUsersListController',['$scope', 'sailsResource','$localStorage','$uibModal','toastr', function($scope,sailsResource,$storage,$uibModal,toastr){
    var User = sailsResource('user',{
       // query:{method:'GET',url:'/user/?populate=roles,permissions'}
    });
    User.query(
        function(items){
            console.dir(items);
             $scope.items =items;
        },
        function(err){
            toastr.error(err);
        }
    );
}])

.controller('AdminUsersEditController',['$scope','toastr','user','roles','AuthService',function($scope,toastr,user,roles,$auth){
    if(!angular.isDefined(user)){
        toastr.error('Il n\'y a pas d\'utilisateur avec cet identifiant');
        return $state.go('home.administration.users');
    }
    $scope.user=user;
    $scope.roles = _.differenceBy(roles,user.roles,"name");
    $scope.save = function(){
        $scope.user.$save(function(){
            toastr.success($scope.user.username + " sauvegardé")
            $state.go('home.administration.users');
        },function(err){
            toastr.error(err);
        })
    };

    $scope.addRole = function(role){
        $scope.user.roles.push(role);
        $scope.user.$save(
            function(user){
                $scope.user=user;
                $scope.roles = _.differenceBy(roles,user.roles,"name");
                toastr.success('Role '+role.name+' ajouté ');
            },
            function(err){
                toastr.error(err);
            }

        )
    };

    $scope.removeRole = function(index,role){
        $scope.user.roles.splice(index,1);
        $scope.user.$save(
            function(user){
                $scope.user=user;
                $scope.roles = _.differenceBy(roles,user.roles,"name");
                toastr.success('Role '+role.name+' enlevé ');
            },
            function(err){
                toastr.error(err);
            }

        )
    }
}])


.directive('pwCheck', [function () {
    return {
      require: 'ngModel',
      link: function (scope, elem, attrs, ctrl) {
        var firstPassword = '#' + attrs.pwCheck;
        elem.add(firstPassword).on('keyup', function () {
          scope.$apply(function () {
            var v = elem.val()===$(firstPassword).val();
            ctrl.$setValidity('pwmatch', v);
          });
        });
      }
    }
  }])


.directive('ngFocus',['$timeout',function($timeout){
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            scope.$watch(attrs.ngFocus, function (newValue) {
                if (newValue) {
                    $timeout(function () {
                        element[0].focus();
                    }, 100);
                }
            });
            element.bind("blur", function (e) {
                $timeout(function () {
                    scope.$apply(attrs.ngFocus + "=false");
                }, 10);
            });
            element.bind("focus", function (e) {
                $timeout(function () {
                    scope.$apply(attrs.ngFocus + "=true");
                }, 10);
            });
        }
    }
}])

.directive('pager',[function(){
    return{
        restrict:'E',
        template:'<ul uib-pagination total-items="totalItems" ng-model="currentPage" max-size="maxSize" items-per-page="itemsPerPage" class="pagination-sm" boundary-link-numbers="true" next-text="Suivant" previous-text="Precedent"></ul>',
    
        //replace:true,
        scope:{
            totalItems:'=?',
            maxSize:'=',
            itemsPerPage:'=',
            search:'=',
            filtered:'=',
            tableModel:'=',
            currentPage:'='
        },
        controller:['$scope','$localStorage','filterFilter',function($scope,$storage,$filter){
            $scope.$storage = $storage;
            $scope.$storage.pager_maxSize = $scope.maxSize || $storage.pager_maxSize || 5;
            $scope.$storage.pager_itemsPerPage = $scope.itemsPerPage || $scope.$storage.pager_itemsPerPage || 10;
            $scope.currentPage=  1;
            console.dir($scope.tableModel);
            console.dir($scope.filtered);
            function reload(){
                
                if(!angular.isDefined($scope.tableModel))return;
                $scope.filtered = $filter($scope.tableModel, $scope.search);console.dir($scope.filtered);
                $scope.totalItems = $scope.filtered.length;console.log('total items:'+ $scope.totalItems)
                $scope.noOfPages = Math.ceil($scope.totalItems / $scope.itemsPerPage);console.log('Nombre de pages:'+$scope.noOfPages);
                $scope.currentPage = 1;
            }
            $scope.setItemsPerPage = function(num) {
                console.log('itemsPerPage:'+num);
                //$scope.$storage.pager_itemsPerPage = num;
                $scope.currentPage = 1; //reset to first page
                $scope.noOfPages = Math.ceil($scope.totalItems / num);console.log('Nombre de pages:'+$scope.noOfPages);
            }
            $scope.$watch('tableModel',function(newVal,oldVal){
                reload();
            });
            $scope.$watch('maxSize',function(newVal,oldVal){
                $scope.$storage.pager_maxSize = newVal;
                reload();
            });
            $scope.$watch('itemsPerPage',function(newVal,oldVal){
                console.log(newVal);
                $scope.setItemsPerPage(newVal);
                reload();
            });
            $scope.$watch('search', function (newVal, oldVal) {
                reload();
            }, true);
            $scope.setPage = function (pageNo) {
                $scope.currentPage = pageNo;
            };

            $scope.pageChanged = function() {
                console.log('Page changed to: ' + $scope.currentPage);
            };
            reload();
        }]
    }
}])

.directive('itemPerPageDropdown',[function(){
    return{
        restrict:'E',
        replace:true,
        template:function(){
            return '<div class="btn-group" uib-dropdown is-open="status.isopen">\
                            <button id="single-button" type="button" class="btn btn-primary" uib-dropdown-toggle ng-disabled="disabled">\
                                {{itemsPerPage}} <span class="caret"></span>\
                            </button>\
                            <ul class="dropdown-menu" uib-dropdown-menu role="menu" aria-labelledby="single-button">\
                                <li role="menuitem" ng-repeat="p in steps"><a ng-click="setItemsPerPage(p)">{{p}}</a></li>\
                            </ul>\
                        </div>';
        },
        scope:{
            steps:'=',
            itemsPerPage:'=',
            totalItems:'='
        },
        controller:['$scope','$localStorage',function($scope,$storage){
            $scope.setItemsPerPage = function(i){
                $scope.itemsPerPage = i;
            };
            $scope.$watch('itemsPerPage',function(newVal,oldVal){
                $storage.pager_itemsPerPage = newVal;
            });
            $scope.$watch('totalItems',function(newVal,oldVal){

            });
        }]
    }
}])

.directive('searchField',[function(){
    return {
        restrict:'E',
        replace:true,
        template:function(){
            return '<div class="input-group">\
                        <span class="input-group-addon"><i class="fa fa-search" aria-hidden="true"></i></span>\
                        <input type="text" name="filtre" id="filtre" ng-model="search"  placeholder="{{placeholder}}" uib-tooltip="{{tooltipText}}" class="form-control" >\
                        <span class="input-group-addon" id="basic-addon2" ><i class="fa fa-refresh " ng-click="search=\'\'" ng-bind="filterItemsCount"></i></span>\
                    </div>';
        },
        scope:{
            search:'=',
            placeholder:'@?',
            tooltipText:'@?',
            filterItemsCount:'='
        },
        controller:['$scope',function($scope){
            if(!angular.isDefined($scope.placeholder))$scope.placeholder='Rechercher';
            if(!angular.isDefined($scope.tooltipText))$scope.tooltipText='Saisissez un code article à filtrer'
        }]
    }
}])

/* Font Awesome Animation directive helper */
.directive('faa',[function(){
    return{
        restrict:'A',
        link:function($scope,$element,attrs){
            var elt=$element;
            $element.addClass('faa-parent animated-hover');
            $element.children('i:first-child').addClass('faa-'+attrs.faa);
        } 
    }
}])

.directive('fa',[function(){
    return{
        restrict:'E',
        replace:true,
        transclude:true,
        template:'<i class="fa" ng-transclude></i>',
        link:function($scope,$element,attrs){
            if(angular.isDefined(attrs.icon))
                $element.addClass("fa-"+attrs.icon);
        }

    }
}])
/* bootstrap Toggle */
.directive('uibToggle',function(){
    return{
        restrict:'E',
        replace:true,
        template:'<input type="checkbox" data-toggle="toggle">',
        require:'ngModel',
        scope:{
            on:'@?',
            off:'@?',
            size:'@?',
            onstyle:'@?',
            offstyle:'@?',
            style:'@?',
            width:'@?',
            height:'@?',
            onChange:'&?'

        },
        link:function($scope,$element,attrs,ctrls){
            //console.dir(ctrls);
            var  ngModelCtrl = ctrls;
            var options={
                on:$scope.on || "Oui",
                off:$scope.off || "Non",
                size:$scope.size || "normal",
                onstyle:$scope.onstyle || "primary",
                offstyle:$scope.offstyle || "default"
            };
            if(angular.isDefined($scope.style))options.syle=$scope.style;
            if(angular.isDefined($scope.width))options.width = $scope.width;
            if(angular.isDefined($scope.height))options.height = $scope.height;

            function getValue() {
                return $element.prop('checked');
            }

        

            function getCheckboxValue(attribute, defaultValue) {
                return angular.isDefined(attribute) ? scope.$eval(attribute) : defaultValue;
            }

            //model -> UI
            ngModelCtrl.$render = function() {
                console.dir(ngModelCtrl.$modelValue);
                if(ngModelCtrl.$modelValue)
                    $element.bootstrapToggle('on');
                else
                    $element.bootstrapToggle('off');
            };

            //ui->model
            $element.change(function() {
              
                if (attrs.disabled) {
                    return;
                }
               
                console.dir(getValue());
                $scope.ngModel = getValue();
                if(angular.isDefined($scope.onChange))
                    $scope.onChange( {value:$scope.ngModel});
                
            })
            $element.bootstrapToggle(options);
        }
    };
})
  .service('AuthService',['$q','$http', '$rootScope','sailsResource',function($q,$http,$rootScope,sailsResource){
        var User = sailsResource('user',{});

        
        // return available functions for use in the controllers
        return ({
            isLoggedIn: isLoggedIn,
            login: login, //Login user
            logout: logout, //Logout user
            register: register, //register new User
            createUser:createUser, //Create new Blank User,
            getRoles:getRoles, //Get role for a user
            isAdmin:isAdmin, //Say if admin is in roles 
        });


        function isLoggedIn() {
            var d=$q.defer();
            $http.get('/user/me').then(
                function(user){
                    console.dir(user);
                    console.log('user identified as '+user.data.username);
                    $rootScope.user = user.data;
                    $rootScope.isLogged  = true;
                    getRoles($rootScope.user.id).then(
                        function(roles){
                            $rootScope.roles = roles;
                            d.resolve(true);
                        },
                        function(){
                            d.resolve(true);
                        });
                },
                function(err){
                    console.log('user not identified');
                    $rootScope.isLogged = false;
                    delete $rootScope.user;
                    d.resolve(false);
                }
            );
            return d.promise;
            
        }
        
        function getRoles(id){
            console.log('Get roles for user '+id);
            var d=$q.defer();
            $http.get('/user/'+id+'/roles').then(
                function(roles){
                    console.dir(roles);
                    d.resolve(roles.data);
                },
                function(err){
                    d.reject();
                }
            );
            return d.promise;
        }

        function login(email, password) {
            var d = $q.defer();
            // create a new instance of deferred
           //var deferred = $q.defer();
            
            $http.post('/auth/local',{identifier:email,password:password}).then(
                function(user){
                    $rootScope.user=user.data;
                    $rootScope.isLogged  = true;
                    getRoles(user.id).then(
                        function(roles){
                            $rootScope.roles = role;
                            d.resolve(user.data);
                        },
                        function(){
                            d.resolve(user.data);
                        });
                    
                } ,
                function(err){
                    delete $rootScope.user;
                    delete $rootScope.roles;
                    $rootScope.isLogged  = false;
                    d.reject(err);
                } 
            );
            return d.promise;
        }

        function logout() {
            var d = $q.defer();
            $http.get('/logout').then(
                function(){
                    delete $rootScope.user;
                    delete $rootScope.roles;
                    d.resolve();
                }
            );
            return d.promise;
        }

        function createUser(){
            return new User();
        }

        function register(user) {
            var d=$q.defer();
            user.$save(
                function(user){
                    d.resolve();
                },
                function(err){
                    d.reject(err);
                }
            );
            return d.promise;
        }

        function isAdmin(roles){
            console.log('Check admin roles for');
            console.dir(roles);
            console.dir(_.map(roles,"name"));
            return $q(function(resolve,reject){
                 var res = _.findIndex(_.map(roles,"name"),function(role){return role=="admin"});
                console.log(res>-1);
                resolve(res>-1);
            });
        }
  }])

  .filter('startFrom',function(){
    return function(input,start){
        if (input) {
			start = +start;
			return input.slice(start);
		}
		return [];
    }
  })

  .filter('solde',function(){
      return function(input,value){
          console.log(input,value);
          if(angular.isArray(input)){

            console.log('filtering');
            var result= _.filter(input,function(inp){
                console.dir(inp);
                return inp.solde == !value
            });
            console.dir(result);
            return result;
          }
          return [];
      }
  })
  .run(['$rootScope','$http','toastr','$state','$location','sailsResource','AuthService','$interval', function($rootScope,$http,toastr,$state,$location,$sailsResource,$auth,$interval){
     
     $rootScope.socketState='disconnected';

    io.socket.on('connect',function(){
        toastr.success('Vous etes connecté au serveur !!');
        $rootScope.message = 'Vous etes connecté au serveur !!';
        $rootScope.socketState = 'connected';
        
        
  }); 
    io.socket.get('/welcome', function serverResponded (data, JWR) {

            // JWR ==> "JSON WebSocket Response"
            //console.log('Sails responded with: ', body);
            console.log(data.message);
            $rootScope.roomName = data.roomName;
           // console.log('with headers: ', JWR.headers);
            //console.log('and with status code: ', JWR.statusCode);
            io.socket.on('inventaire',function(data){
                console.dir(data);
            })
            // first argument `body` === `JWR.body`
            // (just for convenience, and to maintain familiar usage, a la `JQuery.get()`)
  });
    io.socket.on('disconnect',function(){
        $state.go('home.accueil');
        toastr.warning('Vous etes déconnecté du serveur !!');
        $rootScope.message = 'Vous etes déconnecté du serveur !!';
        $rootScope.socketState = 'disconnected';
    }) ;

    $rootScope.$on('$stateChangeStart',
        
        function (event, toState, toParams, fromState, fromParams) {
            console.log('want go to state:'+toState.name);
            if(! toState.access.restricted  ) return;
            if($rootScope.socketState=='disconnected')return $state.go('home.accueil');
            $auth.isLoggedIn().then(
                function(val){
                    if(!val && toState.access.restricted  ){
                        console.log('user not logged and try acces restricted area => redirect');
                        return $state.go('home.accueil');
                    }
                }
            );
                
    });

    $rootScope.logout = function(){
        $auth.logout().then(function(){$state.go('home.accueil')});
    }
    //$state.go('home.signed');
    console.log('Application running toto');
}])
;
