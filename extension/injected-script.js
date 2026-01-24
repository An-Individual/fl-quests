(function () {
    console.debug("[FL Quests] Executing injected code...");
    function parseResponse(response) {
        if (this.readyState !== 4) {
            return;
        }

        if(response.currentTarget.responseURL.includes("/api/character/myself")){
            var messengerElem = document.getElementById('__questsInterceptedMyself');
            messengerElem.innerText = this.response;
        }

        if(response.currentTarget.responseURL.includes("/api/storylet/choosebranch")){
            var messengerElem = document.getElementById('__questsInterceptedBranch');
            messengerElem.innerText = this.response;
        }

        if(response.currentTarget.responseURL.includes("/api/agents/branch")){
            var messengerElem = document.getElementById('__questsInterceptedAgentBranch');
            messengerElem.innerText = this.response;
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