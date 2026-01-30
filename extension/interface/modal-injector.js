class ModalInjector {
    static rawModal = `
        <div id="flq-modal" class="flq-modal-wrapper">
            <div class="flq-modal-box">
                <div class="flq-outline">
                    <span id="flq-close">&#10006;</span>
                    <div class="flq-title">
                        Quests Journal
                    </div>
                    <div class="flq-subtitle-links">
                        <span id="flq-to-home" class="flq-tab">Home</span> | 
                        <span id="flq-to-settings" class="flq-tab">Settings</span> | 
                        <span id="flq-to-help" class="flq-tab">Help</span>
                    </div>
                    <hr/>
                    <div class="flq-body">
                        <div id="flq-home">
                        </div>
                        <div id="flq-settings">
                        </div>
                        <div id="flq-help">
                            <p>Some troubleshooting advice.</p>
                            <div style="text-align: center;">
                                <span id="flq-export-button" class="button button--primary button--no-margin">Export My Qualities</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
    
    static insertModalElements() {
        let tempElem = document.createElement("div");
        tempElem.innerHTML = ModalInjector.rawModal.trim();

        document.body.appendChild(tempElem.firstChild);

        ModalManager.instance().attachEvents();
    }

    static modalCheckForDOM() {
        if (document.body && document.head) {
            ModalInjector.insertModalElements();
        } else {
            requestIdleCallback(ModalInjector.insertModalElements);
        }
    }

    static injectModalHtml() {
        requestIdleCallback(ModalInjector.modalCheckForDOM);
    }
}