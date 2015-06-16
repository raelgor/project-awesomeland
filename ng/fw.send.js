app.run(['$http', function ($http) {

    fw.send = function (data, ws) {

        // User websocket if we have an open connection
        if (ws && this.socket && this.socket.readyState) {

            var requestID = data.api + ':' + data.request + ':' + new Date().getTime();

            data.requestID = requestID;
            fw.socketRequests[requestID] = data;

            data.success = function (fn) {

                this.onsuccess = fn;
                return this;

            }

            data.error = function (fn) {

                this.onerror = fn;
                return this;

            }

            fw.socket.send(JSON.stringify(data));

            if (!data.persistent) {

                data.timeoutFn = setTimeout(function () {

                    // Execute onerror
                    data.onerror && data.onerror({ error: "websocket_timeout" });

                    // Kill request handler
                    delete fw.socketRequests[data.requestID];

                }, data.timeout || 10000);

            }

            return data;

            // Otherwise post
        } else if(!ws) {

            return $http({
                method: 'post',
                url: '/api',
                headers: { 'x-csrf-token': fw.csrf },
                data: data
            });

        }

    }

}]);
