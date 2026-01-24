console.debug("[FL Quests] Setting up button inserter...");

function addQuestsButton(buttonsNode){
    let whitespace = document.createTextNode(' ');
    buttonsNode.prepend(whitespace);
    
    let button = document.createElement('span');
    button.id = "quests-button"
    button.className = "button button--primary button--no-margin"
    button.innerText = "Open Quests";
    button.onclick = onShowQuestModal;

    buttonsNode.prepend(button);
}

let domObserver = new MutationObserver(((mutations) => {
    let buttonElem = document.querySelector("#quests-button");
    if(buttonElem){
        return;
    }

    let profileButton = document.querySelector(".myself-profile__view-and-set-private div .button");
    if(!profileButton){
        return;
    }

    addQuestsButton(profileButton.parentElement);
}));
domObserver.observe(document, {childList: true, subtree: true});