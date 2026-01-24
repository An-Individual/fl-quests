// Inject the modal into the page.
// It's important to do this AFTER
// the request interceptor. See
// the interceptor file for more
// details.

const rawModal = `
<div id="flq-modal" class="flq-modal-wrapper">
    <div class="flq-modal-box">
        <div class="flq-outline">
            <span id="flq-close" class="flq-modal-close">✖</span>
            <div class="flq-title">
                Quests Journal
            </div>
            <hr/>
            <div class="flq-body">
                The quests will go here.
                <button id="flq-export-button">Export My Qualities</button>
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
    let modalElem = document.getElementById("flq-modal");
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