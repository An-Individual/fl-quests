import { ModalManager } from "./modal-manager";

export class ModalInjector {
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
                            <div class="flq-settings-group">
                                <div class="flq-settings-title">General</div>
                                <div class="flq-settings-body">
                                    <input type="checkbox" id="flq-hidenotstarted" name="flq-hidenotstarted">
                                    <label for="flq-hidenotstarted">Hide quests that have not been started</label>
                                </div>
                            </div>
                            <div class="flq-settings-group">
                                <div class="flq-settings-title">Categories</div>
                                <div id="flq-cat-settings" class="flq-settings-body">
                                </div>
                            </div>
                            <div class="flq-settings-group">
                                <div class="flq-settings-title">Quests Source</div>
                                <div class="flq-settings-body">
                                    Where should the base quest list be pulled from?
                                    <div class="flq-settings-body">
                                        <input type="radio" id="flq-qsource-none" name="flq-qsource">
                                        <label for="flq-qsource-none">Imported Only</label><br>
                                        <input type="radio" id="flq-qsource-local" name="flq-qsource">
                                        <label for="flq-qsource-local">Built In</label><br>
                                        <input type="radio" id="flq-qsource-github" name="flq-qsource">
                                        <label for="flq-qsource-github">GitHub</label><br>
                                        <input type="radio" id="flq-qsource-custom" name="flq-qsource">
                                        <label for="flq-qsource-custom">Custom:</label>
                                        <div class="flq-settings-body" style="margin-right:40px;">
                                            <input type="text" id="flq-qsource-address" disabled>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="flq-settings-group">
                                <div class="flq-settings-title">Imported Quests</div>
                                <div class="flq-settings-body">
                                    <input type="checkbox" id="flq-enable-quest-import" name="flq-enable-quest-import">
                                    <label for="flq-enable-quest-import">Enable quest importing</label><br>
                                    <div class="flq-settings-body" id="flq-quest-import-panel">
                                        <div>
                                        <span id="flq-import-quests-button" class="button button--primary button--no-margin">Import</span>
                                        <span id="flq-clear-imported-button" class="button button--primary button--no-margin">Clear</span>
                                        </div>
                                        <div id="flq-import-state">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="flq-help">
                            <p>Some troubleshooting advice.</p>
                            <div style="text-align: center;">
                                <span id="flq-export-button" class="button button--primary button--no-margin">Export My Qualities</span>
                            </div>
                            <div style="text-align: center;">
                                <span id="flq-spoof-button" class="button button--primary button--no-margin">Spoof My Qualities</span>
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
            requestIdleCallback(ModalInjector.modalCheckForDOM);
        }
    }

    static injectModalHtml() {
        requestIdleCallback(ModalInjector.modalCheckForDOM);
    }
}