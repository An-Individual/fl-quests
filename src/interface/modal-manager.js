class ModalManager {
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
                Clickable: "flq-tab-clickable"
            }
        }

    static CategoryState = {
        Show: 0,
        Collapsed: 1,
        Hide: 2
    }

    constructor() {
        this.qualities = QualityTracker.instance();
        this.settings = SettingsManager.instance();
        this.renderer = new QuestsRenderer();
        this.quests = new QuestsManager();
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
            await ModalManager.instance().renderQuests();
            await ModalManager.instance().renderSettings();
            ModalManager.instance().selectTab(ModalManager.TabData.Tab.Home);
        };

        let settingsButton = document.getElementById(ModalManager.TabData.ID.SettingsTab);
        settingsButton.onclick = function(){
            ModalManager.instance().selectTab(ModalManager.TabData.Tab.Settings);
        };

        let helpButton = document.getElementById(ModalManager.TabData.ID.HelpTab);
        helpButton.onclick = function(){
            ModalManager.instance().selectTab(ModalManager.TabData.Tab.Help);
        };
    }

    attachSettingEvents() {
        this.settingsElems = {
            hideNotStarted: document.getElementById("flq-hidenotstarted"),
            questSourceNone: document.getElementById("flq-qsource-none"),
            questSourceLocal: document.getElementById("flq-qsource-local"),
            questSourceGithub: document.getElementById("flq-qsource-github"),
            questSourceCustom: document.getElementById("flq-qsource-custom"),
            questSourceAddress: document.getElementById("flq-qsource-address"),
            enableImport: document.getElementById("flq-enable-quest-import"),
            importPanel: document.getElementById("flq-quest-import-panel"),
            importState: document.getElementById("flq-import-state"),
            categorySettings: document.getElementById("flq-cat-settings")
        };

        this.settingsElems.hideNotStarted.addEventListener('change', (event) =>{
            if(!this.renderingSettings) {
                this.settings.setHideNotStarted(event.currentTarget.checked);
            }
        });

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
            await this.renderSettings();
        });
    }

    attachImportEvents() {
        let clearButton = document.getElementById("flq-clear-imported-button");
        clearButton.onclick = async function(){
            if(confirm("Are you sure you want to clear your imported quests?")) {
                if(ModalManager.instance().settings.getImportedQuests()) {
                    ModalManager.instance().settings.setImportedQuests("");
                    ModalManager.instance().quests.clearImported();
                    await ModalManager.instance().renderSettings();
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
                    let imported = this.questsImporter.parse(fileText);
                    if(imported.error) {
                        if(imported.row) {
                            let columnLetter = (10+imported.column).toString(36).toUpperCase();
                            alert(`IMPORT FAILED\nFile: ${fileList[i].name}\nCell: ${columnLetter}${imported.row}\n\n${imported.error}`);
                        } else {
                            alert(`IMPORT FAILED\nFile :${fileList[i].name}\n\n${imported.error}`);
                        }
                        return;
                    }

                    let validate = this.quests.validator.validate(imported, true);
                    if(!validate.valid) {
                        alert(`VALIDATION FAILED\nFile :${fileList[i].name}\n\n${validate.reason}`);
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

                await this.renderSettings();

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
                tabElems[i].classList.remove(ModalManager.TabData.Class.Clickable);
                tabElems[i].classList.add(ModalManager.TabData.Class.Selected);
                bodyElems[i].style.display = "block";
            }
            else {
                tabElems[i].classList.remove(ModalManager.TabData.Class.Selected);
                tabElems[i].classList.add(ModalManager.TabData.Class.Clickable);
                bodyElems[i].style.display = "none";
            }
        }

        this.currentTab = tab;
    }

    async show(){
        this.selectTab(ModalManager.TabData.Tab.Home);
        const modalElem = document.getElementById("flq-modal");

        await this.renderQuests();
        await this.renderSettings();

        if(modalElem){
            modalElem.style.display = "block";
        }
    }

    async renderQuests() {
        const homeElem = document.getElementById("flq-home");
        this.clearChildren(homeElem);

        try {
            let categories = await this.quests.renderQuests();
            let categoryElems = [];
            let hideNotStarted = this.settings.getHideNotStarted();
            // We do this in stages so we don't have to clear
            // existing category elements if an error occures.
            categories.forEach(cat =>{
                let catState = this.settings.getCategoryState(cat.id);
                if(catState != ModalManager.CategoryState.Hide) {
                    if(!hideNotStarted || cat.quests.find(q => q.state != QuestStates.NotStart && q.state != QuestStates.HiddenStatus)) {
                        categoryElems.push(this.renderer.makeCategoryElement(cat, catState == ModalManager.CategoryState.Collapsed));
                    }
                }
            });
            categoryElems.forEach(elem =>{
                homeElem.appendChild(elem);
            });
        } catch (error) {
            homeElem.innerHTML = `
                <div id="flq-error-title">Error Rendering Quests</div>
                <div id="flq-error-message"></div>
                <div id="flq-error-trace"></div>
            `;
            let messageElem = document.getElementById("flq-error-message");
            let traceElem = document.getElementById("flq-error-trace");

            messageElem.innerText = error.message;
            traceElem.innerText = error.stack;
        }
    }

    async renderSettings() {
        this.renderingSettings = true;
        try {
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

            this.clearChildren(this.settingsElems.categorySettings);
            let categories = await this.quests.getCategories();

            let imported = [];
            let overrides = [];
            for(const i in categories) {
                let category = categories[i];

                if(category.isImport) {
                    if(category.isOverride) {
                        overrides.push(category);
                    } else {
                        imported.push(category);
                    }
                }

                let checkboxElem = document.createElement("input");
                checkboxElem.setAttribute("type", "checkbox");
                checkboxElem.setAttribute("id", `hideCat${i}`);
                checkboxElem.setAttribute("name", `hideCat${i}`);
                checkboxElem.checked = this.settings.getCategoryState(category.id) == ModalManager.CategoryState.Hide;
                checkboxElem.addEventListener('change', (event) =>{
                    this.settings.setCategoryState(category.id, event.currentTarget.checked ? ModalManager.CategoryState.Hide : ModalManager.CategoryState.Show);
                });

                let labelElem = document.createElement("label");
                labelElem.setAttribute("for", `hideCat${i}`);
                labelElem.innerHTML = `Hide ${TextFormatter.sanitizeAndFormat(category.title)}`;

                this.settingsElems.categorySettings.appendChild(checkboxElem);
                this.settingsElems.categorySettings.appendChild(document.createTextNode(" "));
                this.settingsElems.categorySettings.appendChild(labelElem);
                this.settingsElems.categorySettings.appendChild(document.createElement("br"));
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
        } catch(error) {
            Logger.error(error);
            this.clearChildren(this.settingsElems.categorySettings);
        } finally {
            this.renderingSettings = false;
        }
    }

    updateSettingEnabledStates() {
        this.settingsElems.questSourceAddress.disabled = !this.settingsElems.questSourceCustom.checked;
        this.settingsElems.importPanel.style.display = this.settingsElems.enableImport.checked ? "block" : "none";
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