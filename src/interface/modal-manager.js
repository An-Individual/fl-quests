import { QualityTracker } from "../qualities/quality-tracker.js";
import { SettingsManager } from "../settings.js";
import { Logger } from "../logger.js";
import { ModalRenderer } from "./modal-renderer.js";
import { QuestsManager } from "../quests/quests-manager.js";
import { QuestsRenderer } from "../quests/quests-renderer.js";
import { QuestsCSVParser } from "../quests/quests-csv-parser.js";
import { TextFormatter } from "./text-formatter.js";
import { QuestsSourceType } from "../quests/quests-datatypes.js";

export class ModalManager {
    static singleInstance = null;
    static instance() {
        if(this.singleInstance) {
            return this.singleInstance;
        }
        this.singleInstance = new ModalManager();
        return this.singleInstance;
    }

    static TabData = {
            Tab: {
                Home: 1,
                Settings: 2,
                Help: 3
            },
            ID: {
                HomeTab: "flq-to-home",
                HomeBody: "flq-home",
                SettingsTab: "flq-to-settings",
                SettingsBody: "flq-settings",
                HelpTab: "flq-to-help",
                HelpBody: "flq-help"
            },
            Class: {
                Tab: "flq-tab",
                Selected: "flq-tab-selected",
                NotSelected: "flq-tab-notselected",
                Clickable: "flq-clickable"
            }
        }

    constructor() {
        this.qualities = QualityTracker.instance();
        this.settings = SettingsManager.instance();
        this.renderer = new ModalRenderer();
        this.quests = new QuestsManager();
        this.questsRenderer = new QuestsRenderer();
        this.questsImporter = new QuestsCSVParser();
    }

    attachEvents() {
        let modalElem = document.getElementById("flq-modal");

        let closeElem = document.getElementById("flq-close");
        closeElem.onclick = function(){
            modalElem.style.display = "none";
            ModalManager.instance().qualities.releaseSpoof();
        };

        window.onclick = function(event){
            if(event.target == modalElem){
                modalElem.style.display = "none";
                ModalManager.instance().qualities.releaseSpoof();
            }
        };

        this.attachTabEvents();
        this.attachSettingEvents();
        this.attachImportEvents();
        this.attachHelpEvents();
    }

    attachTabEvents() {
        let homeButton = document.getElementById(ModalManager.TabData.ID.HomeTab);
        homeButton.onclick = async function(){
            await ModalManager.instance().renderUI();
            ModalManager.instance().selectTab(ModalManager.TabData.Tab.Home);
        };

        let settingsButton = document.getElementById(ModalManager.TabData.ID.SettingsTab);
        settingsButton.onclick = function(){
            ModalManager.instance().selectTab(ModalManager.TabData.Tab.Settings);
        };

        let helpButton = document.getElementById(ModalManager.TabData.ID.HelpTab);
        helpButton.onclick = async function(){
            await ModalManager.instance().renderUI();
            ModalManager.instance().selectTab(ModalManager.TabData.Tab.Help);
        };
    }

    attachSettingEvents() {
        this.settingsElems = {
            revealHidden: document.getElementById("flq-revealhidden"),
            hideNotStarted: document.getElementById("flq-hidenotstarted"),
            clearHomeEdits: document.getElementById("flq-clear-home-edits"),
            questSourceNone: document.getElementById("flq-qsource-none"),
            questSourceLocal: document.getElementById("flq-qsource-local"),
            questSourceGithub: document.getElementById("flq-qsource-github"),
            questSourceCustom: document.getElementById("flq-qsource-custom"),
            questSourceAddress: document.getElementById("flq-qsource-address"),
            enableImport: document.getElementById("flq-enable-quest-import"),
            importPanel: document.getElementById("flq-quest-import-panel"),
            importState: document.getElementById("flq-import-state")
        };

        this.settingsElems.revealHidden.addEventListener('change', (event) =>{
            if(!this.renderingSettings) {
                this.settings.setRevealHidden(event.currentTarget.checked);
            }
        });

        this.settingsElems.hideNotStarted.addEventListener('change', (event) =>{
            if(!this.renderingSettings) {
                this.settings.setHideNotStarted(event.currentTarget.checked);
            }
        });

        this.settingsElems.clearHomeEdits.onclick = function() {
            if(confirm("Are you sure you want to clear your ordering and visibility customizations?")) {
                SettingsManager.instance().clearCategoryProperty("order");
                SettingsManager.instance().clearCategoryProperty("hidden");
            }
        }

        this.settingsElems.questSourceNone.addEventListener('change', (event) =>{
            if(!this.renderingSettings && event.currentTarget.checked) {
                this.settings.setQuestsSourceType(QuestsSourceType.None);
                this.quests.clear();
            }

            this.updateSettingEnabledStates();
        });

        this.settingsElems.questSourceLocal.addEventListener('change', (event) =>{
            if(!this.renderingSettings && event.currentTarget.checked) {
                this.settings.setQuestsSourceType(QuestsSourceType.Local);
                this.quests.clear();
            }

            this.updateSettingEnabledStates();
        });

        this.settingsElems.questSourceGithub.addEventListener('change', (event) =>{
            if(!this.renderingSettings && event.currentTarget.checked) {
                this.settings.setQuestsSourceType(QuestsSourceType.GitHub);
                this.quests.clear();
            }

            this.updateSettingEnabledStates();
        });

        this.settingsElems.questSourceCustom.addEventListener('change', (event) =>{
            if(!this.renderingSettings && event.currentTarget.checked) {
                this.settings.setQuestsSourceType(QuestsSourceType.Custom);
                this.quests.clear();
            }

            this.updateSettingEnabledStates();
        });

        this.settingsElems.questSourceAddress.addEventListener('blur', (event) =>{
            if(!this.renderingSettings && event.currentTarget.value != this.settings.getCustomQuestsSource()) {
                this.settings.setCustomQuestsSource(event.currentTarget.value);
                this.quests.clear();
            }
        });

        this.settingsElems.enableImport.addEventListener('change', async (event) =>{
            if(!this.renderingSettings) {
                this.settings.setEnableImportedQuests(event.currentTarget.checked);
            }
            
            this.quests.clearImported();
            await this.renderUI();
        });
    }

    attachImportEvents() {
        let clearButton = document.getElementById("flq-clear-imported-button");
        clearButton.onclick = async function(){
            if(confirm("Are you sure you want to clear your imported quests?")) {
                if(ModalManager.instance().settings.getImportedQuests()) {
                    ModalManager.instance().settings.setImportedQuests("");
                    ModalManager.instance().quests.clearImported();
                    await ModalManager.instance().renderUI();
                }
            }
        };

        let importButton = document.getElementById("flq-import-quests-button");
        importButton.onclick = function(){
            ModalManager.instance().importQuests();
        };
    }

    attachHelpEvents() {
        let exportButton = document.getElementById("flq-export-button");
        exportButton.onclick = function(){
            ModalManager.instance().exportQualities();
        };

        let spoofButton = document.getElementById("flq-spoof-button");
        spoofButton.onclick = function(){
            ModalManager.instance().importQualities();
        };
    }

    async importQualities() {
        try {
            let fileList = await this.openFileDialog(false);
            if(!fileList || fileList.length == 0){
                return;
            }

            let fileText = await this.readFile(fileList[0]);
            let count = this.qualities.spoofFromCSV(fileText);

            alert(`Spoofed ${count} Qualities.`);
        } catch (error) {
            Logger.error(error);
            alert(`IMPORT THREW AN ERROR\n\n${error}`);
        }
    }

    async importQuests() {
        try {
            let fileList = await this.openFileDialog(true);
            if(fileList && fileList.length > 0) {
                let current;
                for(let i = 0; i < fileList.length; i++) {
                    let fileText = await this.readFile(fileList[i]);
                    let imported
                    try {
                        imported = this.questsImporter.parse(fileText);
                    } catch(error) {
                        if(error.cell) {
                            alert(`IMPORT FAILED\nFile: ${fileList[i].name}\nCell: ${error.cell}\n\n${error.text}`);
                        } else {
                            alert(`IMPORT FAILED\nFile :${fileList[i].name}\n\n${error.message}`);
                        }
                        return;
                    }

                    try {
                        this.quests.validator.validate(imported, true);
                    } catch (error) {
                        alert(`VALIDATION FAILED\nFile :${fileList[i].name}\n\n${error.message}`);
                        return;
                    }

                    if(!current) {
                        current = imported;
                    } else {
                        this.mergeQuests(current, imported);
                    }
                }

                if(!current || current.categories.length == 0)
                {
                    alert('IMPORT FAILED\n\nNo quests found.');
                    return;
                }

                let oldCategories = await this.quests.getCategories();
                let overrides = [];
                let additions = [];
                current.categories.forEach(cat =>{
                    if(oldCategories.find(c => c.id == cat.id)) {
                        overrides.push(cat.id);
                    } else {
                        additions.push(cat.id);
                    }
                });

                let oldRaw = this.settings.getImportedQuests();
                if(oldRaw) {
                    let oldImported = JSON.parse(oldRaw);
                    current = this.mergeQuests(oldImported, current);
                }

                this.settings.setImportedQuests(JSON.stringify(current));
                this.quests.clearImported();

                let details = "";
                if(overrides.length > 0){
                    details+= `\n\nNew Overrides\n    ${overrides.join("\n    ")}`;
                }
                if(additions.length > 0){
                    details+= `\n\nNew Additions\n    ${additions.join("\n    ")}`;
                }

                await this.renderUI();

                alert(`IMPORT SUCCESSFUL\nImported ${overrides.length+additions.length} categories${details}`);
            }
        } catch (error) {
            Logger.error(error);
            alert(`IMPORT THREW AN ERROR\n\n${error}`);
        }
    }

    openFileDialog(allowMultiple) {
        return new Promise((resolve) =>{
            let inputElem = document.createElement("input");
            inputElem.setAttribute("type", "file");
            inputElem.setAttribute("accept", "text/csv,.csv");

            if(allowMultiple) {
                inputElem.setAttribute("multiple", "");
            }

            inputElem.addEventListener("change", event =>{
                resolve(event.target.files);
            });

            inputElem.addEventListener("cancel", event =>{
                resolve();
            });

            inputElem.click();
        });
    }

    readFile(file) {
        return new Promise((resolve,reject) =>{
            let reader = new FileReader();
            reader.onload = () => {
                resolve(reader.result);
            };
            reader.onerror = () => {
                reject(new Error(`An error occurred reading file: ${file.name}`));
            };
            reader.readAsText(file);
        })
    }

    mergeQuests(current, additional) {
        additional.categories.forEach(cat =>{
            let idx = current.categories.findIndex(c => c.id == cat.id);
            if(idx >= 0) {
                current.categories[idx] = cat;
            } else {
                current.categories.push(cat);
            }
        });
    }

    selectTab(tab) {
        if(this.currentTab == tab){
            return;
        }

        const tabElems = [
            document.getElementById(ModalManager.TabData.ID.HomeTab),
            document.getElementById(ModalManager.TabData.ID.SettingsTab),
            document.getElementById(ModalManager.TabData.ID.HelpTab),
        ];

        const bodyElems = [
            document.getElementById(ModalManager.TabData.ID.HomeBody),
            document.getElementById(ModalManager.TabData.ID.SettingsBody),
            document.getElementById(ModalManager.TabData.ID.HelpBody),
        ];

        for (let i = 0; i < tabElems.length; i++) {
            if (i == tab - 1) {
                tabElems[i].classList.remove(ModalManager.TabData.Class.NotSelected);
                tabElems[i].classList.remove(ModalManager.TabData.Class.Clickable);
                tabElems[i].classList.add(ModalManager.TabData.Class.Selected);
                bodyElems[i].style.display = "block";
            }
            else {
                tabElems[i].classList.remove(ModalManager.TabData.Class.Selected);
                tabElems[i].classList.add(ModalManager.TabData.Class.NotSelected);
                tabElems[i].classList.add(ModalManager.TabData.Class.Clickable);
                bodyElems[i].style.display = "none";
            }
        }

        this.currentTab = tab;
    }

    async show(){
        this.selectTab(ModalManager.TabData.Tab.Home);
        const modalElem = document.getElementById("flq-modal");

        await this.renderUI();

        if(modalElem){
            modalElem.style.display = "block";
        }
    }

    async renderUI() {
        this.showMarquee();
        try{
            let quests;
            try {
                quests = await this.quests.getQuests();
            } catch(error) {
                quests = {
                    error: error
                };
            }

            this.renderQuests(quests);
            this.renderSettings(quests);
            this.renderVersionBox(quests);
        } finally {
            this.hideMarquee();
        }
    }

    renderQuests(quests) {
        if(quests.error) {
            this.setQuestTabError(quests.error);
            return;
        }

        

        try {
            let categories = this.questsRenderer.renderQuests(quests);
            this.renderedCategories = categories;
            this.renderQuestsCategories(categories);
        } catch (error) {
            this.setQuestTabError(error);
        }
    }

    async rerenderQuests() {
        if(this.renderedCategories) {
            this.renderQuestsCategories(this.renderedCategories);
        } else {
            await this.renderUI();
        }
    }

    renderQuestsCategories(categories) {
        const homeElem = document.getElementById("flq-home");
        this.clearChildren(homeElem);

        try {
            categories.forEach(cat => {
                let orderOverride = this.settings.getCategoryProperty(cat.id, "order");
                if(orderOverride) {
                    cat.newOrder = orderOverride;
                } else {
                    delete cat.newOrder;
                }
            });

            categories.sort((a,b) =>{
                return (b.newOrder ?? b.order) - (a.newOrder ?? a.order)
            });

            let categoryElems = [];
            let hideNotStarted = this.settings.getHideNotStarted();
            let revealHidden = this.settings.getRevealHidden();
            // We do this in stages so we don't have to clear
            // existing category elements if an error occures.
            categories.forEach(cat =>{
                if(!hideNotStarted || cat.quests.find(q => q.state != QuestStates.NotStart && q.state != QuestStates.HiddenStatus)) {
                    let catHidden = this.settings.getCategoryProperty(cat.id, "hidden");
                    if(!catHidden || revealHidden) {
                        let catElem = this.renderer.makeCategoryElement(cat, 
                            this.settings.getCategoryProperty(cat.id, "collapsed"),
                            catHidden
                        );
                        if(catElem) {
                            categoryElems.push(catElem);
                        }
                    }
                }
            });

            categoryElems.forEach(elem =>{
                homeElem.appendChild(elem);
            });
        } catch (error) {
            this.setQuestTabError(error);
        }
    }

    setQuestTabError(error) {
        const homeElem = document.getElementById("flq-home");
        homeElem.innerHTML = `
            <div id="flq-error-title">Error Rendering Quests</div>
            <div id="flq-error-message"></div>
            <div id="flq-error-trace"></div>
        `;
        let messageElem = document.getElementById("flq-error-message");
        let traceElem = document.getElementById("flq-error-trace");

        messageElem.innerHTML = TextFormatter.sanitizeAndFormat(error.message);
        traceElem.innerHTML = TextFormatter.sanitizeAndFormat(error.stack);
    }

    renderSettings(quests) {
        this.renderingSettings = true;
        try {
            this.settingsElems.revealHidden.checked = this.settings.getRevealHidden();
            this.settingsElems.hideNotStarted.checked = this.settings.getHideNotStarted();
            this.settingsElems.enableImport.checked = this.settings.getEnableImportedQuests();
            this.settingsElems.questSourceAddress.value = this.settings.getCustomQuestsSource() ?? "";

            switch(this.settings.getQuestsSourceType()) {
                case QuestsSourceType.None:
                    this.settingsElems.questSourceNone.checked = true;
                    break;
                case QuestsSourceType.GitHub:
                    this.settingsElems.questSourceGithub.checked = true;
                    break;
                case QuestsSourceType.Custom:
                    this.settingsElems.questSourceCustom.checked = true;
                    break;
                default:
                    this.settingsElems.questSourceLocal.checked = true;
                    break;
            }

            this.updateSettingEnabledStates();
            
            if(quests?.categories) {
                let imported = [];
                let overrides = [];
                for(const i in quests.categories) {
                    let category = quests.categories[i];

                    if(category.isImport) {
                        if(category.isOverride) {
                            overrides.push(category);
                        } else {
                            imported.push(category);
                        }
                    }
                }

                let importString = "";
                
                if(overrides.length > 0) {
                    importString += "Overridden Categories:\n";
                    importString += overrides.map(c => {
                        if(c.title == c.originalTitle) {
                            return `    ${TextFormatter.sanitizeAndFormat(c.title)}`;
                        } else {
                            return `    ${TextFormatter.sanitizeAndFormat(c.originalTitle)} -> ${TextFormatter.sanitizeAndFormat(c.title)}`;
                        }
                    }).join("\n");
                }

                if(imported.length > 0) {
                    if(importString) {
                        importString+= "\n\n";
                    }
                    importString += "Imported Categories:\n";
                    importString += imported.map(c => {
                        return `    ${TextFormatter.sanitizeAndFormat(c.title)}`;
                    }).join("\n");
                }

                if(!importString) {
                    importString = "No Imports";
                }

                this.settingsElems.importState.innerText = importString;
            }
        } catch(error) {
            Logger.error(error);
        } finally {
            this.renderingSettings = false;
        }
    }

    renderVersionBox(quests) {
        const versionElem = document.getElementById("flq-version");
        
        let extensionInfo = `Extension Info`;
        extensionInfo += `\n    Version: ${chrome.runtime.getManifest().version}`;

        let questsInfo = `Quests Info`;
        switch(this.settings.getQuestsSourceType()) {
            case QuestsSourceType.None:
                questsInfo += `\n    Source: None`;
                break;
            case QuestsSourceType.Local:
                questsInfo += `\n    Source: Built In`;
                break;
            case QuestsSourceType.GitHub:
                questsInfo += `\n    Source: GitHub`;
                break;
            default:
                questsInfo += `\n    Source: Custom`;
                break;
        }
        
        if(!quests || quests.error) {
            questsInfo += `\n    Error: Quest Read Failed`;
        } else {
            if(quests.version) {
                questsInfo += `\n    Version: ${TextFormatter.sanitizeAndFormat(quests.version)}`;
            }
            if(quests.date) {
                questsInfo += `\n    Last Fetched: ${new Date(quests.date).toISOString()}`;
            }
            
            let overrides = 0;
            let additions = 0;
            quests.categories.forEach(cat => {
                if(cat.isOverride) {
                    overrides++;
                } else if(cat.isImport) {
                    additions++;
                }
            });

            if(overrides || additions) {
                questsInfo += `\n    Imports:`;
                if(overrides) {
                    questsInfo += `\n        ${overrides} Overrides`;
                }
                if(additions) {
                    questsInfo += `\n        ${additions} Additions`;
                }
            }
        }

        versionElem.innerText = extensionInfo + "\n" + questsInfo;
    }

    updateSettingEnabledStates() {
        this.settingsElems.questSourceAddress.disabled = !this.settingsElems.questSourceCustom.checked;
        this.settingsElems.importPanel.style.display = this.settingsElems.enableImport.checked ? "block" : "none";
    }

    showMarquee() {
        const refreshElem = document.getElementById("flq-marquee");
        refreshElem.style.opacity = 1;
    }

    hideMarquee() {
        const refreshElem = document.getElementById("flq-marquee");
        refreshElem.style.opacity = 0;
    }

    clearChildren(element) {
        while(element.firstChild){
            element.removeChild(element.lastChild);
        }
    }

    exportQualities() {
        const csv = this.qualities.exportToCSV();
        this.downloadFile("fl-character-qualties.csv", csv);
    }

    downloadFile(filename, content){
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
        element.setAttribute('download', filename);
        element.style.display = 'none';

        document.body.appendChild(element);
        element.click();
        document.removeChild(element);
    }
}