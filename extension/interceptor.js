(function () {
    function parseResponse(response) {
        if (this.readyState !== 4) {
            return;
        }

        if(response.currentTarget.responseURL.includes("/api/character/myself")){
            window.postMessage({
                source: "flq-interceptor",
                payload: {
                    type: "myself",
                    data: this.response
                }
            }, "*");
        }

        if(response.currentTarget.responseURL.includes("/api/storylet/choosebranch")){
            window.postMessage({
                source: "flq-interceptor",
                payload: {
                    type: "branch",
                    data: this.response
                }
            }, "*");
        }

        if(response.currentTarget.responseURL.includes("/api/agents/branch")){
            window.postMessage({
                source: "flq-interceptor",
                payload: {
                    type: "branch",
                    data: this.response
                }
            }, "*");
        }

        if(response.currentTarget.responseURL.includes("/api/exchange/sell")){
            window.postMessage({
                source: "flq-interceptor",
                payload: {
                    type: "exchange",
                    data: this.response
                }
            }, "*");
        }

        if(response.currentTarget.responseURL.includes("/api/exchange/buy")){
            window.postMessage({
                source: "flq-interceptor",
                payload: {
                    type: "exchange",
                    data: this.response
                }
            }, "*");
        }
    }

    function openBypass(original_function) {
        return function (method, url, async) {
            this.addEventListener("readystatechange", parseResponse);
            return original_function.apply(this, arguments);
        };
    }

    XMLHttpRequest.prototype.open = openBypass(XMLHttpRequest.prototype.open);
}())