import { QualityTracker } from "./quality-tracker.js";

export class RequestInterceptor
{
    /**
     * Alright, let's talk about the request interception system because
     * boy has that been an adventure to figure out. The setup is this.
     * A content script running in the MAIN world overrides XMLHttpRequest.open()
     * to intercept the responses to web request and pass those into the
     * isolated extension context. This sounds way simpler than it was
     * to figure out because MAIN world content scripts seem to be a
     * newer tool so most of the advice around injecting scripts either runs
     * afoul of CSP or is too slow to to capture the initial /myself
     * call that is key to the functioning of this extension.
     * 
     * The reason the whole thing isn't just running in the MAIN context
     * is that it would lose access to extension specific tools. Primarily,
     * the runtime.getURL() method that gets the URL of the local quests.json
     * file.
     */
    static listenForInterceptions() {
        window.addEventListener('message', (event) => {
            // Security check: Only trust messages from this window
            if (event.source !== window) return;

            // Filter for your specific message structure
            if (event.data && event.data.source === 'flq-interceptor') {
                const message = event.data.payload;
                const jsonData = JSON.parse(message.data);
                switch(message.type) {
                    case "myself":
                        QualityTracker.instance().onMyself(jsonData);
                        break;
                    case "branch":
                        QualityTracker.instance().onBranch(jsonData);
                        break;
                    case "onExchange":
                        QualityTracker.instance().onMyself(jsonData);
                        break;
                    default:
                        break;
                }
            }
        });
    }
}