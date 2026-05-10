app.controller(
  'UserController',
  function (
    $scope,
    $http,
    $location
  ) {

    const token =
      localStorage.getItem(
        'token'
      );

    console.log(
      'TOKEN:',
      token
    );

    // Protect routes
    if (
      !token ||
      token ===
      'undefined' ||
      token ===
      'null'
    ) {

      alert(
        'Please login first'
      );

      window.location.hash =
        '#!/';

      return;
    }

    // Fetch profile
    $scope.getProfile =
      async function () {

        try {

          const response =
            await $http.get(
              `${USER_API}/user/profile`,
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );

          $scope.profile =
            response.data;

          // Build image URL
          if (
            $scope.profile
              .photo
          ) {

            $scope.profile
              .photoUrl =
              `${USER_API}/uploads/${$scope.profile.photo}`;
          }

          console.log(
            'PROFILE:',
            $scope.profile
          );

          $scope.$apply();

        } catch (error) {

          console.log(
            'Profile Error:',
            error
          );

          alert(
            'Session expired. Please login again.'
          );

          localStorage.removeItem(
            'token'
          );

          window.location.hash =
            '#!/';
        }
      };

    // Update Profile
    $scope.updateProfile =
      async function () {

        try {

          await $http.put(
            `${USER_API}/user/profile`,
            {
              name:
                $scope.profile.name,

              email:
                $scope.profile.email,

              phone:
                $scope.profile.phone,
            },
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

          alert(
            'Profile updated successfully'
          );

          window.location.hash =
            '#!/profile';

        } catch (error) {

          console.log(
            'Update Error:',
            error
          );

          alert(
            error?.data
              ?.message ||
            'Profile update failed'
          );
        }
      };

    // Change Password
    $scope.changePassword =
      async function () {

        console.log(
          'Change password clicked'
        );

        console.log({
          oldPassword:
            $scope.oldPassword,

          newPassword:
            $scope.newPassword,

          confirmPassword:
            $scope.confirmPassword,
        });

        // Manual validation
        if (
          !$scope.oldPassword ||
          !$scope.newPassword ||
          !$scope.confirmPassword
        ) {

          return alert(
            'All fields are required'
          );
        }

        // Password match validation
        if (
          $scope.newPassword !==
          $scope.confirmPassword
        ) {

          return alert(
            'Passwords do not match'
          );
        }

        try {

          const response =
            await $http.post(
              `${AUTH_API}/auth/change-password`,
              {
                oldPassword:
                  $scope.oldPassword,

                newPassword:
                  $scope.newPassword,
              },
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );

          console.log(
            'SUCCESS:',
            response
          );

          alert(
            'Password changed successfully'
          );

          // Clear fields
          $scope.oldPassword =
            '';

          $scope.newPassword =
            '';

          $scope.confirmPassword =
            '';

          // Redirect
          window.location.hash =
            '#!/profile';

        } catch (error) {

          console.log(
            'PASSWORD ERROR:',
            error
          );

          const message =
            Array.isArray(
              error?.data
                ?.message
            )
              ? error.data.message.join(
                  '\n'
                )
              : error?.data
                  ?.message ||
                error?.data
                  ?.error;

          alert(
            message ||
            'Password change failed'
          );
        }
      };

    // Preview image
    $scope.previewImage =
      function (
        element
      ) {

        const file =
          element.files[0];

        if (!file)
          return;

        $scope.previewUrl =
          URL.createObjectURL(
            file
          );

        $scope.$apply();

        // Auto upload
        $scope.uploadPhoto(
          element
        );
      };

    // Upload Profile Photo
    $scope.uploadPhoto =
      async function (
        element
      ) {

        const file =
          element.files[0];

        if (!file) {

          return alert(
            'Please select a file'
          );
        }

        const formData =
          new FormData();

        formData.append(
          'photo',
          file
        );

        try {

          await $http.post(
            `${USER_API}/user/upload-photo`,
            formData,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
                'Content-Type':
                  undefined,
              },
            }
          );

          alert(
            'Photo uploaded successfully'
          );

          await $scope
            .getProfile();

        } catch (error) {

          console.log(
            'Upload Error:',
            error
          );

          alert(
            error?.data
              ?.message ||
            'Photo upload failed'
          );
        }
      };

    // Logout
    $scope.logout =
      async function () {

        try {

          await $http.post(
            `${AUTH_API}/auth/logout`,
            {},
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

          alert(
            'Logged out successfully'
          );

        } catch (error) {

          console.log(
            'Logout Error:',
            error
          );
        }

        localStorage.removeItem(
          'token'
        );

        window.location.hash =
          '#!/';
      };

    // Init
    $scope.getProfile();
  }
);