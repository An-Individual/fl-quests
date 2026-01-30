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

    constructor() {
        this.qualities = QualityTracker.instance();
        this.renderer = new QuestsRenderer();
        this.quests = new QuestsManager();
    }

    attachEvents() {
        let modalElem = document.getElementById("flq-modal");

        let closeElem = document.getElementById("flq-close");
        closeElem.onclick = function(){
            modalElem.style.display = "none";
        };

        window.onclick = function(event){
            if(event.target == modalElem){
                modalElem.style.display = "none";
            }
        };

        let exportButton = document.getElementById("flq-export-button");
        exportButton.onclick = function(){
            ModalManager.instance().exportQualities();
        };

        let homeButton = document.getElementById(ModalManager.TabData.ID.HomeTab);
        homeButton.onclick = function(){
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
        const homeElem = document.getElementById("flq-home");

        while(homeElem.firstChild){
            homeElem.removeChild(homeElem.lastChild);
        }

        try {
            let categories = await this.quests.renderQuests();
            let categoryElems = [];
            // We do this in stages so we don't have to clear
            // existing category elements if an error occures.
            categories.forEach(cat =>{
                categoryElems.push(this.renderer.makeCategoryElement(cat));
            })
            categoryElems.forEach(elem =>{
                homeElem.appendChild(elem);
            });
        } catch (error) {
            let errorElem = document.createElement("div");
            errorElem.classList.add("flq-error");
            errorElem.textContent = "Error Rendering Quests\n\n" + error;
            homeElem.appendChild(errorElem);
        }

        if(modalElem){
            modalElem.style.display = "block";
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