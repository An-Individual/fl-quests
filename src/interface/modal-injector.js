import { ModalManager } from "./modal-manager.js";

export class ModalInjector {
    static rawModal = `
        <div id="flq-modal" class="flq-modal-wrapper">
            <div class="flq-modal-box">
                <div class="flq-outline">
                    <span class="flq-clickable" id="flq-close">&#10006;</span>
                    <img id="flq-marquee" />
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
                                    <input type="checkbox" id="flq-revealhidden" name="flq-revealhidden">
                                    <label for="flq-revealhidden">Reveal hidden quests</label><br>
                                    <input type="checkbox" id="flq-hidenotstarted" name="flq-hidenotstarted">
                                    <label for="flq-hidenotstarted">Conceal quests that have not been started</label><br>
                                    <span id="flq-clear-home-edits" class="button button--primary button--no-margin" style="margin-top: 5px">Reset Home Tab</span>
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
                            <div class="flq-version-outer">
                                <div class="flq-version-border">
                                    <div style="text-align: center;">Fallen London Quests</div>
                                    <div id="flq-version"></div>
                                </div>
                            </div>
                            <p>REMINDER: Fallen London Quests is an unsupported 3rd party extension. If you are experiencing
                            issues with the wider game uninstall it, refresh the page, and check if the issue has been resolved
                            before contacting support.</p>
                            <h1>What are the Quest Sources?</h1>
                            <p>This is what the extension will use to build its base quest list. There are 4 options.</p>
                            <ul class="flq-ul">
                                <li><b>Imported Only:</b> Keeps the base list empty so you can assemble your
                                quests entirely using the import feature.</li>
                                <li><b>Built In:</b> The quest list that the extension is distributed with. It won't be updated
                                as often, but doesn't rely on externally hosted files.</li>
                                <li><b>GitHub:</b> The most up-to-date version of the extension's quest list pulled from the
                                <a target="_blank" href="https://github.com/An-Individual/fl-quests">GitHub repository</a>.
                                <li><b>Custom:</b> Allows you to use a custom quest list published by another party. You'll need
                                to populate the provided text field with the URL of the JSON file you want to pull quests from.</li>
                                <ul class="flq-ul">
                                    <li>Note: It is recommended you only pull quests from a trusted source. The extension is written
                                    defensively, but there is always the risk of security issues slipping the net.</li>
                                </ul>
                            </ul>
                            <h1>Can I create my own quests?</h1>
                            <p>Yes! Quests can be created with any spreadsheet program and require a minimum of technical knowledge.
                            See [TODO: CREATE QUEST CREATION PAGE] for details.</p>
                            <h1>Troubleshooting</h1>
                            <p>The extension only refetches from its Quests Source once every 12 hours. If you're just waiting
                            for an update to roll out I recommend patience. If you absolutely cannot wait, you can force the issue 
                            by clearing your browser's local data.</p>
                            <p>If you're having issues with the extension, here are some common steps to narrow down the issue.</p>
                            <ul class="flq-ul">
                                <li>Refresh the page.</li>
                                <ul class="flq-ul">
                                    <li>This forces the extension to grab your latest qualities list.</li>
                                </ul>
                                <li>If you're using a Custom quests source, switch to GitHub or Built In.</li>
                                <li>If you're still having trouble with the GitHub source, consider trying Built In.</li>
                                <ul class="flq-ul">
                                    <li>This eliminates network issues from the equation.</li>
                                </ul>
                                <li>Disable quest importing.</li>
                                <ul class="flq-ul">
                                    <li>Your imported quests will still be there when you turn it back on.</li>
                                    <li>If disabling quest importing fixes the issue, try clearing your imported quests and
                                    re-importing them.</li>
                                </ul>
                            </ul>
                            <p>If you're still having issues after trying the above, consider reporting an issue (see below).</p>
                            <h1>Reporting an Issue</h1>
                            <p>This is a difficult extension to test because there is no fast way to take a character through the game
                            and ensure that its advice is accurate. Here are the kinds of issues you should report.</p>
                            <ul class="flq-ul">
                                <li>A quest providing incorrect or inaccurate advice.</li>
                                <li>A quest being in the wrong state.</li>
                                <li>The Home tab showing an error message.</li>
                                <ul class="flq-ul">
                                    <li>Unless you are using a Custom Quests Source. Network issues reading these sources as well
                                    as formatting issues with their JSON will appear as errors here.</li>
                                </ul>
                                <li>Issues with settings not being applied or preserved.</li>
                                <li>Persistent issues with quest states getting out of sync with your character, especially if they
                                are fixed by refreshing the page.</li>
                                <ul class="flq-ul">
                                    <li>Note: It is expected that changes caused by Living Stories and interactions with the
                                    Messages tab might require a refresh to pick up.</li>
                                </ul>
                            </ul>
                            <p>Things you should NOT report.</p>
                            <ul class="flq-ul">
                                <li>Issues with Imported Quests or Custom Quest Sources. These should be directed to their creators.</li>
                                <li>Feature requests.</li>
                                <li>Requests for additional quests.</li>
                                <li>Requests for existing quests to provide additional details unless they are too vague to locate
                                the thing the quest is trying to point you to.</li>
                                <ul class="flq-ul">
                                    <li>The base quests are intended to be more vague than a wiki guide. They help you keep track
                                    of what stories were in progress and where you should go next. But they try to preserve the
                                    classic experience of these stories so they tend to be light on details.</li>
                                </ul>
                            </ul>
                            <p>The best way to report a problem is to create an issue on the 
                            <a target="_blank" href="https://github.com/An-Individual/fl-quests">GitHub repository</a>. When you create 
                            an issue you should include the extension information at the top of this tab and any relevant qualities 
                            information you're comfortable sharing (see the Debugging Tools section below for a quick way to access these).</p>
                            <h1>Debugging Tools</h1>
                            <p>This button packages the character qualities that the extension has detected into a CSV file which
                            can be opened in most spreadsheet programs. It includes your character's game state (the content of your 
                            Myself and Possessions page) as well as any names you've given to your companions and other game objects. 
                            Before sharing it with others, consider deleting all the columns except for <code>id</code>, <code>level</code>, 
                            and <code>effectiveLevel</code> as well as any rows related to qualities you'd rather not share or which
                            are not relevant to your reason for sharing the file.</p>
                            <div style="text-align: center; margin-bottom: 10px;">
                                <span id="flq-export-button" class="button button--primary button--no-margin">Export My Qualities</span>
                            </div>
                            <p>This button takes a CSV file with first row headings <code>id</code>, <code>level</code>, and <code>effectiveLevel</code>
                            (case sensitive, but position independent and additional columns will be ignored) and replace's the extension's 
                            detected qualities with the provided list. This only affects the extension pages and not the wider game. 
                            To clear the spoofing simply close the quests journal. It will return to normal when opened again.</p>
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

        const refreshElem = document.getElementById("flq-marquee");
        refreshElem.setAttribute("src", chrome.runtime.getURL('images/refresh.svg'));

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