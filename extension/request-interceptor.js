console.debug("[FL Quests] Inserting request interception...");

// It's important that we use inline script text like this
// instead of grabbing the script text from an external
// file because that external file grab opens up the main
// page code to execution creating a race condition between
// getting the interception code in place and the initial
// "myself" request. If we miss that initial request the
// quality list won't be properly built until something
// else triggers that request again.
let xhrOverrideScript = document.createElement('script');
xhrOverrideScript.type = 'text/javascript';
xhrOverrideScript.innerHTML = `
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
    `;

xhrOverrideScript.onload = function () {
    this.remove();
};
(document.head || document.documentElement).appendChild(xhrOverrideScript);
console.log("[FL Quests] Request interception installed");

var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
function makeInterceptElement(id, callback) {
    let elem = document.createElement('div');
    elem.id = id;
    elem.style.height = 0;
    elem.style.overflow = 'hidden';
    document.documentElement.appendChild(elem);

    elem = document.getElementById(id);
    let observer = new MutationObserver(callback);
    observer.observe(elem, {
        subtree: true,
        childList: true,
        characterData: true 
    });
}

makeInterceptElement('__questsInterceptedMyself', function(){
    var elem = document.getElementById('__questsInterceptedMyself');
    let payload = JSON.parse(elem.innerText);
    onMyself(payload);
});

makeInterceptElement('__questsInterceptedBranch', function(){
    var elem = document.getElementById('__questsInterceptedBranch');
    let payload = JSON.parse(elem.innerText);
    onBranch(payload);
});

makeInterceptElement('__questsInterceptedAgentBranch', function(){
    var elem = document.getElementById('__questsInterceptedAgentBranch');
    let payload = JSON.parse(elem.innerText);
    onBranch(payload);
});