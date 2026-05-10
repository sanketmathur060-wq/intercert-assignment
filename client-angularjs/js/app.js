const app = angular.module(
  'microApp',
  [
    'ngRoute',
    'ngAnimate',
    'toastr',
  ]
);

app.config(
  function (
    $routeProvider,
    toastrConfig
  ) {

    angular.extend(
      toastrConfig,
      {
        autoDismiss:
          false,

        closeButton:
          true,

        progressBar:
          true,

        newestOnTop:
          true,

        positionClass:
          'toast-top-right',

        preventDuplicates:
          false,

        allowHtml:
          true,

        timeOut:
          4000,

        extendedTimeOut:
          1000,
      }
    );

    $routeProvider

      // LOGIN
      .when(
        '/',
        {
          templateUrl:
            'views/login.html',

          controller:
            'AuthController',
        }
      )

      // REGISTER
      .when(
        '/register',
        {
          templateUrl:
            'views/register.html',

          controller:
            'AuthController',
        }
      )

      // DASHBOARD
      .when(
        '/dashboard',
        {
          templateUrl:
            'views/dashboard.html',

          controller:
            'UserController',
        }
      )

      // PROFILE
      .when(
        '/profile',
        {
          templateUrl:
            'views/profile.html',

          controller:
            'UserController',
        }
      )

      // EDIT PROFILE
      .when(
        '/edit-profile',
        {
          templateUrl:
            'views/edit-profile.html',

          controller:
            'UserController',
        }
      )

      // CHANGE PASSWORD
      .when(
        '/change-password',
        {
          templateUrl:
            'views/change-password.html',

          controller:
            'UserController',
        }
      )

      .otherwise({
        redirectTo: '/',
      });
  }
);