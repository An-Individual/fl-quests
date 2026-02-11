class ButtonInjector {
    static addQuestsButton(buttonsNode){
        let whitespace = document.createTextNode(' ');
        buttonsNode.prepend(whitespace);
        
        let button = document.createElement('span');
        button.id = "quests-button"
        button.className = "button button--primary button--no-margin"
        button.innerText = "Open Quests";
        button.onclick = () =>{
            ModalManager.instance().show();
        }

        buttonsNode.prepend(button);
    }

    static startButtonObserver() {
        const domObserver = new MutationObserver(((mutations) => {
            let buttonElem = document.querySelector("#quests-button");
            if(buttonElem){
                return;
            }

            let profileButton = document.querySelector(".myself-profile__view-and-set-private div .button");
            if(!profileButton){
                return;
            }

            this.addQuestsButton(profileButton.parentElement);
        }));
        domObserver.observe(document, {childList: true, subtree: true});
    }
}