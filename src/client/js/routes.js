angular
  .module('app')
  .config(['$stateProvider', '$urlRouterProvider', '$ocLazyLoadProvider', '$breadcrumbProvider', function($stateProvider, $urlRouterProvider, $ocLazyLoadProvider, $breadcrumbProvider) {

    $urlRouterProvider.otherwise('/login');

    $ocLazyLoadProvider.config({
      // Set to true if you want to see what and when is dynamically loaded
      debug: false
    });

    $breadcrumbProvider.setOptions({
      prefixStateName: 'app.main',
      includeAbstract: true,
      template: '<li class="breadcrumb-item" ng-repeat="step in steps" ng-class="{active: $last}" ng-switch="$last || !!step.abstract"><a ng-switch-when="false" href="{{step.ncyBreadcrumbLink}}">{{step.ncyBreadcrumbLabel}}</a><span ng-switch-when="true">{{step.ncyBreadcrumbLabel}}</span></li>'
    });

    $stateProvider
      .state('app', {
        abstract: true,
        templateUrl: 'views/common/layouts/full.html',
        //page title goes here
        ncyBreadcrumb: {
          label: 'Root',
          skip: true
        },
        resolve: {
          loadCSS: ['$ocLazyLoad', function($ocLazyLoad) {
            // you can lazy load CSS files
            return $ocLazyLoad.load([{
              serie: true,
              name: 'Font Awesome',
              files: ['css/font-awesome.min.css']
            }, {
              serie: true,
              name: 'Simple Line Icons',
              files: ['css/simple-line-icons.css']
            }]);
          }],
          loadPlugin: ['$ocLazyLoad', function($ocLazyLoad) {
            // you can lazy load files for an existing module
            return $ocLazyLoad.load([{
              files: [
                'js/factories/common.js',
                'js/controllers/logout.js',
              ]
            }, {
              serie: true,
              name: 'chart.js',
              files: [
                'bower_components/chart.js/dist/Chart.min.js',
                'bower_components/angular-chart.js/dist/angular-chart.min.js'
              ]
            }]);
          }]
        }
      })
      .state('app.main', {
        url: '/dashboard',
        templateUrl: 'views/main.html',
        //page title goes here
        ncyBreadcrumb: {
          label: 'Inicio',
        },
        resolve: {
          loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
            // you can lazy load controllers
            return $ocLazyLoad.load({
              files: ['js/controllers/main.js']
            });
          }]
        },
        data: {
          isAdminRequired: true
        }
      })
      // SURVEY BUILDER RELATED
      .state('app.survey-builder', {
        url: "/survey-builder",
        abstract: true,
        template: '<ui-view></ui-view>',
        ncyBreadcrumb: {
          label: 'Encuesta'
        },
        controller: 'surveyBuilderController',
        resolve: {
          loadCSS: ['$ocLazyLoad', function($ocLazyLoad) {
            // you can lazy load CSS files
            return $ocLazyLoad.load([{
              serie: true,
              name: 'bootstrap-date-picker',
              files: ['bower_components/bootstrap-datepicker/dist/css/bootstrap-datepicker.min.css']
            }]);
          }],
          loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
            // you can lazy load controllers
            return $ocLazyLoad.load({
              files: ['js/controllers/survey/survey-builder.js']
            });
          }]
        }
      })
      .state('app.survey-builder.create', {
        url: '/form',
        params: {
          survey: null
        },
        templateUrl: 'views/components/survey-builder/index.html',
        //page title goes here
        ncyBreadcrumb: {
          label: 'Formulario',
        },
        controller: 'surveyBuilderController',
        data: {
          isAdminRequired: true
        }
      })
      .state('app.survey-builder.edit', {
        url: '/form/:id',
        params: {
          survey: null
        },
        templateUrl: 'views/components/survey-builder/index.html',
        //page title goes here
        ncyBreadcrumb: {
          label: 'Formulario',
        },
        controller: 'surveyBuilderController',
        data: {
          isAdminRequired: true
        }
      })
      .state('app.survey-builder.relations', {
        url: '/relations',
        params: {
          survey: null
        },
        templateUrl: 'views/components/survey-builder/surveyRelations.html',
        //page title goes here
        ncyBreadcrumb: {
          label: 'Relacione',
        },
        controller: 'surveyRelationsController',
        data: {
          isAdminRequired: true
        },
        resolve: {
          loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
            // you can lazy load controllers
            return $ocLazyLoad.load({
              files: ['js/controllers/survey/survey-relations.js']
            });
          }]
        }
      })
      .state('app.survey-builder.stats', {
        url: '/:id/stats/',
        params: {
          survey: null
        },
        templateUrl: 'views/components/survey-builder/surveyStats.html',
        //page title goes here
        ncyBreadcrumb: {
          label: 'Estadisticas',
        },
        controller: 'surveyStatsController',
        data: {
          isAdminRequired: true
        },
        resolve: {
          loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
            // you can lazy load controllers
            return $ocLazyLoad.load({
              files: ['js/controllers/survey/survey-stats.js']
            });
          }]
        }
      })
      //ADMINISTRATOR
      .state('app.admin', {
        url: "/admin",
        abstract: true,
        template: '<ui-view></ui-view>',
        ncyBreadcrumb: {
          label: 'Admin'
        }
      })
      .state('app.admin.clients', {
        url: '/clientes',
        templateUrl: 'views/components/clients.html',
        ncyBreadcrumb: {
          label: 'Clientes'
        },
        controller: 'clientsController',
        resolve: {
          loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
            // you can lazy load files for an existing module
            return $ocLazyLoad.load({
              files: ['js/controllers/admin/clients.js']
            });
          }]
        },
        data: {
          isAdminRequired: true
        }
      })
      .state('app.admin.departments', {
        url: '/departamentos',
        templateUrl: 'views/components/departments.html',
        ncyBreadcrumb: {
          label: 'Departamentos'
        },
        controller: 'departmentsController',
        resolve: {
          loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
            // you can lazy load files for an existing module
            return $ocLazyLoad.load({
              files: ['js/controllers/admin/departments.js']
            });
          }]
        },
        data: {
          isAdminRequired: true
        }
      })
      .state('app.admin.jobs', {
        url: '/posiciones-de-trabajo',
        templateUrl: 'views/components/jobs.html',
        ncyBreadcrumb: {
          label: 'Posiciones de Trabajo'
        },
        controller: 'jobsController',
        resolve: {
          loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
            // you can lazy load files for an existing module
            return $ocLazyLoad.load({
              files: ['js/controllers/admin/job.js']
            });
          }]
        },
        data: {
          isAdminRequired: true
        }
      })
      .state('app.admin.business', {
        url: '/empresas',
        templateUrl: 'views/components/business.html',
        ncyBreadcrumb: {
          label: 'Empresas'
        },
        controller: 'businessController',
        resolve: {
          loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
            // you can lazy load files for an existing module
            return $ocLazyLoad.load({
              files: ['js/controllers/admin/business.js']
            });
          }]
        },
        data: {
          isAdminRequired: true
        }
      })
      .state('app.admin.services', {
        url: '/service',
        templateUrl: 'views/components/services.html',
        ncyBreadcrumb: {
          label: 'Servicios'
        },
        controller: 'serviceController',
        resolve: {
          loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
            // you can lazy load files for an existing module
            return $ocLazyLoad.load({
              files: ['js/controllers/admin/service.js']
            });
          }]
        },
        data: {
          isAdminRequired: true
        }
      })
      //USER RELATED
      .state('app.surveys', {
        url: "/survey",
        abstract: true,
        template: '<ui-view></ui-view>',
        ncyBreadcrumb: {
          label: 'Encuesta'
        },
        data: {
          isAdminRequired: false
        }
      })
      .state('app.surveys.main', {
        url: '/home',
        templateUrl: 'views/components/survey/index.html',
        //page title goes here
        ncyBreadcrumb: {
          label: 'Lista',
        },
        controller: 'surveyController',
        resolve: {
          loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
            // you can lazy load controllers
            return $ocLazyLoad.load({
              files: ['js/controllers/survey/survey.js']
            });
          }]
        },
        data: {
          isAdminRequired: false
        }
      })
      .state('app.surveys.handler', {
        url: '/:id/client/:client/',
        templateUrl: 'views/components/survey/survey.html',
        //page title goes here
        ncyBreadcrumb: {
          label: 'Aplicacion',
        },
        controller: 'surveyHandlerController',
        resolve: {
          loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
            // you can lazy load controllers
            return $ocLazyLoad.load({
              files: ['js/controllers/survey/survey-handler.js']
            });
          }]
        },
        data: {
          isAdminRequired: false
        }
      })
      //SIMPLE PAGES
      .state('appSimple', {
        abstract: true,
        templateUrl: 'views/common/layouts/simple.html',
        resolve: {
          loadPlugin: ['$ocLazyLoad', function($ocLazyLoad) {
            // you can lazy load files for an existing module
            return $ocLazyLoad.load([{
              serie: true,
              name: 'Font Awesome',
              files: ['css/font-awesome.min.css']
            }, {
              serie: true,
              name: 'Simple Line Icons',
              files: ['css/simple-line-icons.css']
            }]);
          }],
        }
      })

    // Additional Pages
    .state('appSimple.login', {
        url: '/login',
        templateUrl: 'views/pages/login.html',
        resolve: {
          loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
            // you can lazy load controllers
            return $ocLazyLoad.load({
              files: ['js/controllers/login.js', 'js/factories/common.js']
            });
          }]
        },
        data: {
          isAdminRequired: false
        }
      })
      .state('appSimple.404', {
        url: '/404',
        templateUrl: 'views/pages/404.html',
        data: {
          isAdminRequired: false
        }
      })
      .state('appSimple.500', {
        url: '/500',
        templateUrl: 'views/pages/500.html',
        data: {
          isAdminRequired: false
        }
      })
  }])
  .run(function($rootScope, $transitions, $state, authentication) {

    $rootScope.logout = authentication.logout;

    $transitions.onStart({
      to: 'appSimple.login'
    }, function(trans) {
      if (authentication.isLoggedIn()) {
        // User is authenticated. Redirect to a new Target State
        return trans.router.stateService.target('app.main');
      }
    });

    $transitions.onStart({
      to: 'app.**'
    }, function(trans) {
      if (!authentication.isLoggedIn()) {
        // User isn't authenticated. Redirect to a new Target State
        return trans.router.stateService.target('appSimple.login');
      }

      $rootScope.client = authentication.currentClient();
      let to = trans.$to();
      //if regular user redirect
      if ($rootScope.client.role.level === 3) {
        if (to.data.isAdminRequired) {
          return trans.router.stateService.target('app.surveys.main');
        }
      }
    });
  });
