const rawModal = `
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

const TabData = {
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

function insertModal(){
    let tempElem = document.createElement("div");
    tempElem.innerHTML = rawModal.trim();

    document.body.appendChild(tempElem.firstChild);

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
        const csv = qualitiesToCSV(Qualities.getAll());
        downloadFile("fl-character-qualties.csv", csv);
    };

    let homeButton = document.getElementById(TabData.ID.HomeTab);
    homeButton.onclick = function(){
        selectTab(TabData.Tab.Home);
    };

    let settingsButton = document.getElementById(TabData.ID.SettingsTab);
    settingsButton.onclick = function(){
        selectTab(TabData.Tab.Settings);
    };

    let helpButton = document.getElementById(TabData.ID.HelpTab);
    helpButton.onclick = function(){
        selectTab(TabData.Tab.Help);
    };
}

function modalCheckForDOM() {
    if (document.body && document.head) {
        insertModal();
    } else {
        requestIdleCallback(modalCheckForDOM);
    }
}

requestIdleCallback(modalCheckForDOM);

function selectTab(tab) {
    if(TabData.Current == tab){
        return;
    }

    const tabElems = [
        document.getElementById(TabData.ID.HomeTab),
        document.getElementById(TabData.ID.SettingsTab),
        document.getElementById(TabData.ID.HelpTab),
    ];

    const bodyElems = [
        document.getElementById(TabData.ID.HomeBody),
        document.getElementById(TabData.ID.SettingsBody),
        document.getElementById(TabData.ID.HelpBody),
    ];

    for (let i = 0; i < tabElems.length; i++) {
        if (i == tab - 1) {
            tabElems[i].classList.remove(TabData.Class.Clickable);
            tabElems[i].classList.add(TabData.Class.Selected);
            bodyElems[i].style.display = "block";
        }
        else {
            tabElems[i].classList.remove(TabData.Class.Selected);
            tabElems[i].classList.add(TabData.Class.Clickable);
            bodyElems[i].style.display = "none";
        }
    }

    TabData.Current = tab;
}

async function onShowQuestModal(){
    selectTab(TabData.Tab.Home);
    const modalElem = document.getElementById("flq-modal");
    const homeElem = document.getElementById("flq-home");

    while(homeElem.firstChild){
        homeElem.removeChild(homeElem.lastChild);
    }

    try {
        let categories = await Quests.renderQuests();
        let categoryElems = [];
        // We do this in stages so we don't have to clear
        // existing category elements if an error occures.
        categories.forEach(cat =>{
            categoryElems.push(makeCategoryElement(cat));
        })
        categoryElems.forEach(elem =>{
            homeElem.appendChild(elem);
        });
    } catch (error) {
        errorElem = document.createElement("div");
        errorElem.classList.add("flq-error");
        errorElem.textContent = "Error Rendering Quests\n\n" + error;
        homeElem.appendChild(errorElem);
    }

    if(modalElem){
        modalElem.style.display = "block";
    }
}

function downloadFile(filename, content){
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', filename);
    element.style.display = 'none';

    document.body.appendChild(element);
    element.click();
    document.removeChild(element);
}