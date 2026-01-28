const rawModal = `
<div id="flq-modal" class="flq-modal-wrapper">
    <div class="flq-modal-box">
        <div class="flq-outline">
            <span id="flq-close" class="flq-modal-close">&#10006;</span>
            <div class="flq-title">
                Quests Journal
            </div>
            <hr/>
            <div class="flq-body">
                <div id="flq-categories">
                </div>
                <div id="flq-troubleshooting">
                    <div id="flq-troubleshooting-title">Troubleshooting</div>
                    <div id="flq-troubleshooting-content">
                        <p>Some troubleshooting advice.</p>
                        <div style="text-align: center;">
                            <span id="flq-export-button" class="button button--primary button--no-margin">Export My Qualities</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
`;

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
        const csv = qualitiesToCSV(currentQualities);
        downloadFile("fl-character-qualties.csv", csv);
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

function onShowQuestModal(){
    const modalElem = document.getElementById("flq-modal");
    const categoriesElem = document.getElementById("flq-categories");

    while(categoriesElem.firstChild){
        categoriesElem.removeChild(categoriesElem.lastChild);
    }

    const testCategory = {
        title: "Test Category",
        quests: [{
            state: QuestStates.HiddenStatus,
            title: "Hidden Status Quest",
            details: "This is a description of the quest.",
            subtasks: [
                {
                    description: "An incomplete task.",
                    completed: false
                },
                {
                    description: "A completed task.",
                    completed: true
                }
            ]
        },
        {
            state: QuestStates.NotStart,
            title: "Not Started Quest",
            details: "This is a description of the quest."
        },
        {
            state: QuestStates.InProgress,
            title: "In Progress Quest",
            details: "This is a description of the quest.",
            subtasks: [
                {
                    description: "An incomplete task.",
                    completed: false
                },
                {
                    description: "A completed task.",
                    completed: true
                }
            ]
        },
        {
            state: QuestStates.Blocked,
            title: "Blocked Quest",
            details: "This is a description of the quest.",
            subtasks: [
                {
                    description: "An incomplete task.",
                    completed: false
                },
                {
                    description: "A completed task.",
                    completed: true
                }
            ]
        },
        {
            state: QuestStates.Completed,
            title: "Completed Quest",
            details: "This is a description of the quest.",
            subtasks: []
        }]
    };

    const testCategory2 = {
        title: "Test Category 2",
        quests: [
        {
            state: QuestStates.NotStart,
            title: "Not Started Quest",
            details: "This is a description of the quest."
        },
        {
            state: QuestStates.InProgress,
            title: "In Progress Quest",
            details: "This is a description of the quest.",
            subtasks: [
                {
                    description: "An incomplete task.",
                    completed: false
                },
                {
                    description: "A completed task.",
                    completed: true
                }
            ]
        },
        {
            state: QuestStates.Completed,
            title: "Completed Quest",
            details: "This is a description of the quest.",
            subtasks: []
        }]
    };

    categoriesElem.appendChild(makeCategoryElement(testCategory));
    categoriesElem.appendChild(makeCategoryElement(testCategory2));

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