// Inject the modal into the page.
// It's important to do this AFTER
// the request interceptor. See
// the interceptor file for more
// details.

const rawModal = `
<div id="flquestsModal" class="flquestsModalWrapper">
    <div class="flquestsModalBox">
        <div class="flquestsOutline">
            <span id="flquestsClose" class="flquestsModalClose">✖</span>
            <div class="flquestsTitle">
                Quests Journal
            </div>
            <hr/>
            <div class="flquestsBody">
                The quests will go here.
            </div>
        </div>
    </div>
</div>
`;

function insertModal(){
    let tempElem = document.createElement("div");
    tempElem.innerHTML = rawModal.trim();

    document.body.appendChild(tempElem.firstChild);

    let modalElem = document.getElementById("flquestsModal");

    let closeElem = document.getElementById("flquestsClose");
    closeElem.onclick = function(){
        modalElem.style.display = "none";
    };

    window.onclick = function(event){
        if(event.target == modalElem){
            modalElem.style.display = "none";
        }
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
    let modalElem = document.getElementById("flquestsModal");
    if(modalElem){
        modalElem.style.display = "block";
    }
}