angular
.module('inventaireatf',['ui.router', 'ngAnimate', 'toastr'])
.config(['$stateProvider','$urlRouterProvider',function($stateProvider,$urlRouterProvider){
    $stateProvider
    .state('home',{
        url:'/',
        template:'<ui-view></ui-view>',
        abstract:true
        //
    })
    .state('home.accueil',{
        url:'accueil',
        templateUrl:'templates/home.html'
    })
    .state('home.inventaire',{
        url:'inventaire',
        templateUrl:'templates/inventaire.html'
    })
    .state('signin',{
        url:'signin',
        templateUrl:'templates/signin.html'
    })
    .state('signup',{
        url:'signup',
        templateUrl:'templates/signup.html'
    })

    $urlRouterProvider.otherwise('/');
}])
.controller('MainCtrl',['$rootScope','$scope','$http','$location','toastr','$state',function($rootScope,$scope,$http,$location,toastr,$state){
    $scope.user={isLogged:false};
    $scope.trySignup = function(){
        $http.post("/user",$scope.user).then(
            function(){
                $location.path('/login');
            },function(err){
                console.dir(err);
                try{
                    if(err.data.invalidAttributes.email)
                        toastr.error('Cet email  existe déja!!');
                }catch(e){
                    toastr.error(err);
                }
               
            });
    };

  
    $scope.trySignin = function(){
        toastr.success('Essaye de m\'identifer');
        $http.post("/login",$scope.user).then(
            function(data){
                
                console.dir(data.data);
                $rootScope.user = data.data.user;
                $rootScope.user.isLogged = true;
                toastr.success('Bonjour '+$rootScope.user.firstname + ' '+$rootScope.user.lastname);
                if($state.current.name=="signin")
                    $state.go('home.accueil');
            },function(err){
                toastr.error('Email et/ou Mot de passe invalide');
            })
    };

    $scope.logout = function(){
        window.location='/logout';
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
  .run(['$rootScope','$http','toastr','$state', function($rootScope,$http,toastr,$state){
      $http.get("/islogin",$rootScope.user).then(
            function(data){
                try{
                console.dir(data.data);
                $rootScope.user = data.data.user;
                $rootScope.user.isLogged = true;
                toastr.success('Bonjour '+$rootScope.user.firstname + ' '+$rootScope.user.lastname);
                console.dir(data);
                }catch(e){
                    delete $rootScope.user;
                }
                $state.go('home.accueil');
            },function(err){
                //toastr.error('Email et/ou Mot de passe invalide');
                delete $rootScope.user;
            });
  }])
;
