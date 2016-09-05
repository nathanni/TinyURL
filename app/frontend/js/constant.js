
angular.module('tinyUrl')

    .constant('AUTH_EVENTS', {
        notAuthenticated: 'auth-not-authenticated'
    })

    .constant('API_ENDPOINT', {
        url: 'http://localhost:3000/api'
        //  For a simulator use: url: 'http://127.0.0.1:8080/api'
    })

    .constant('REQUIRE_RELOGIN', {
        sessionInvalid: 'session is invalid'
    })

    .constant('PERMISSION_EVENTS', {
        noPermission: 'no-permission'
    });