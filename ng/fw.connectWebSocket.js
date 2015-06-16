fw.socketRequests = {}
fw.connectWebSocket = function (callback) {

    // Will start and maintain a WebSocket connection
    function connectWebSocket() {

        fw.socket = new WebSocket('wss://' + window.location.host);

        fw.socket.onopen = function () {

            fw.socket.onmessage = function (data) {

                var data = JSON.parse(data.data),
                    request = fw.socketRequests[data.requestID];
                request.onsuccess(data);
                !isNaN(request.timeoutFn) && clearTimeout(request.timeoutFn);
                if (!request.persistent) delete fw.socketRequests[data.requestID];

            };

            callback && callback();

        };

        // Log error
        fw.socket.onerror = function (err) {
            console.log('WebSocket error: ', err);
        };

        // Reconnect on close
        fw.socket.onclose = function () {

            // Reset request handlers
            for (var i in fw.socketRequests) {

                try {
                    clearTimeout(fw.socketRequests[i].timeoutFn);
                    fw.socketRequests[i].onerror({ error: 'connection_dropped' });
                } catch (x) { }
                delete fw.socketRequests[i];

            }

            // If dropped because of logout, let it be
            if (fw.LOGGING_OUT) return delete fw.LOGGING_OUT;

            $('.user-block .connected-light').addClass('offline');
            connectWebSocket();

        };

    }

    connectWebSocket();

}