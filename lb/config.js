module.exports = {

    // The address that the server listens to
    bind: '10.240.203.106',

    // List of URLs like https://127.0.0.1:80
    servers: [
        '10.240.203.106:81'
    ],

    // Add if HTTPS requests can be proxied
    https: {
        key: 'swiftfinger.key',
        crt: 'swiftfinger.crt'
    },

    // Add if you want to make all requests HTTPS (and wss://)
    httpRedirectUrl: 'https://swiftfinger.com',

    // Set to true if you want uncaught exceptions to
    // not kill the process
    unhangable: true,

    // Enable websocket support
    ws: true,

    // Enable benchmarking requests with system info
    benchmark: true

}