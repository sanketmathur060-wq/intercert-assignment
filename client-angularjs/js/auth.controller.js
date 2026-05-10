app.controller(
  'AuthController',
  function (
    $scope,
    $http,
    $location,
    toastr
  ) {

    function handleError(
      error,
      fallback =
        'Something went wrong'
    ) {

      console.log(
        'FULL ERROR:',
        error
      );

      const messages =
        error?.data?.message;

      // Handle 429 ThrottlerException
      if (
        error?.status === 429 ||
        error?.data?.message?.includes('ThrottlerException')
      ) {
        return alert(
          'Too Many Requests\nPlease wait before trying again.'
        );
      }

      // Multiple backend validation errors
      if (
        Array.isArray(
          messages
        )
      ) {

        return alert(
          'Validation Error:\n' +
          messages.join('\n')
        );
      }

      // Single error message
      alert(
        messages ||
        error?.data?.error ||
        fallback
      );
    }

    // LOGIN

    $scope.login =
      async function () {

        if (
          $scope.loginForm
            .$invalid
        ) {

          return toastr.warning(
            'Please enter valid credentials'
          );
        }

        try {

          const response =
            await $http.post(
              `${AUTH_API}/auth/login`,
              {
                email:
                  $scope.email,

                password:
                  $scope.password,
              }
            );

          localStorage.setItem(
            'token',
            response.data.token
          );

          toastr.success(
            'Login successful'
          );

          $location.path(
            '/dashboard'
          );

          $scope.$apply();

        } catch (error) {

          handleError(
            error,
            'Login failed'
          );
        }
      };

    // REGISTER

    $scope.register =
      async function () {

        if (
          $scope.registerForm
            .$invalid
        ) {

          return toastr.warning(
            'Please fix form errors'
          );
        }

        if (
          $scope.password !==
          $scope.confirmPassword
        ) {

          return toastr.warning(
            'Passwords do not match'
          );
        }

        try {

          await $http.post(
            `${AUTH_API}/auth/register`,
            {
              name:
                $scope.name,

              email:
                $scope.email,

              password:
                $scope.password,

              phone:
                $scope.phone,
            }
          );

          alert('Registration successful');

          $location.path('/');

          $scope.$apply();

        } catch (error) {

          handleError(
            error,
            'Registration failed'
          );
        }
      };
  }
);