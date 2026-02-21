import { QuestStates } from "../quests/quests-datatypes.js";
import { SettingsManager } from "../settings.js";
import { ModalManager } from "./modal-manager.js";
import { TextFormatter } from "./text-formatter.js";

export class ModalRenderer {
    static CharacterCodes = {
        TriangleUp: "&#9650;",
        TriangleUpOutline: "&#9651;",
        TriangleDown: "&#9660;",
        TriangleDownOutline: "&#9661",
        Checkmark: "&#10003;",
        Bars: "&#8801;",
        Eye: "&#x1F441;",
        Close: "&#10006;"
    }

    constructor() {
        this.settings = SettingsManager.instance();
    }

    makeElement(tag, className, children){
        let result = document.createElement(tag);
        result.className = className;
        this.appendChildren(result, children);
        return result;
    }

    appendChildren(element, children) {
        if(!children) {
            return;
        }

        children.forEach(elem => {
            element.appendChild(elem);
        });
    }

    makeElementFromHTML(elementHtml) {
        const div = document.createElement("div");
        div.innerHTML = elementHtml.trim();
        return div.firstChild;
    }

    makeTextElement(tag, className, text, markdownLite) {
        let result = this.makeElement(tag, className);
        result.innerHTML = TextFormatter.sanitizeAndFormat(text, markdownLite);
        return result;
    }

    makeQuestElement(quest)
    {
        let statusElem;
        switch(quest.state){
            case QuestStates.NotStart:
                statusElem = this.makeElementFromHTML(`<div class="flq-quest-status flq-notstarted"><div>Not Started</div></div>`);
                break;
            case QuestStates.HiddenStatus:
                statusElem = this.makeElementFromHTML(`<div class="flq-quest-status flq-hiddenstatus"><div>Hidden</div></div>`);
                break;
            case QuestStates.InProgress:
                statusElem = this.makeElementFromHTML(`<div class="flq-quest-status flq-inprogress"><div>In Progress</div></div>`);
                break;
            case QuestStates.Blocked:
                statusElem = this.makeElementFromHTML(`<div class="flq-quest-status flq-blocked"><div>Blocked</div></div>`);
                break;
            case QuestStates.Completed:
                statusElem = this.makeElementFromHTML(`<div class="flq-quest-status flq-completed"><div>Completed</div></div>`);
                break;
            default:
                statusElem = this.makeElementFromHTML(`<div class="flq-quest-status"><div>ERROR</div></div>`);
        }

        let toggleElem = this.makeElementFromHTML(`<div class="flq-quest-toggle">+</div>`);

        let mainElem = this.makeElement("div", "flq-quest-main flq-clickable", [
            toggleElem,
            this.makeTextElement("div", "flq-quest-title", quest.title, false),
            statusElem
        ]);

        let detailElems = [];

        let descriptionElem = this.makeTextElement("div", "flq-quest-detail", quest.details, true);
        if(quest.subtasks?.length > 0){
            descriptionElem.classList.add("flq-quest-detail-line");
        }
        detailElems.push(descriptionElem);

        let taskIndex = 0;
        if(quest.subtasks){
            quest.subtasks.forEach((task) =>{
                let statusElem;
                if(task.completed){
                    statusElem = this.makeElementFromHTML(`<div class="flq-subtask-status">${ModalRenderer.CharacterCodes.Checkmark}</div>`);
                } else {
                    statusElem = this.makeElementFromHTML(`<div class="flq-subtask-status" />`);
                }

                let taskElem = this.makeElement("div", "flq-subtask", [
                    this.makeTextElement("div", "flq-subtask-description", task.description, true),
                    statusElem
                ])

                if(taskIndex % 2 == 1){
                    taskElem.classList.add("flq-subtask-offsetrow");
                }
                taskIndex++;

                detailElems.push(taskElem);
            });
        }

        let detailsElem = this.makeElement("div", "flq-quest-details", detailElems)

        mainElem.onclick = function(){
            if(!detailsElem.style.display || detailsElem.style.display == "none")
            {
                detailsElem.style.display = "block";
                toggleElem.innerText = "-";
            } else {
                detailsElem.style.display = "none";
                toggleElem.innerText = "+";
            }
        };

        return this.makeElement("div", "flq-quest", [
            mainElem,
            detailsElem
        ]);
    }

    makeCategoryElement(category, collapsed, isHidden){

        let questElems = [];
        let completed = 0;
        let hideNotStarted = this.settings.getHideNotStarted();
        category.quests.forEach((quest) =>{
            if(!hideNotStarted || (quest.state != QuestStates.NotStart && quest.state != QuestStates.HiddenStatus)) {
                questElems.push(this.makeQuestElement(quest));
                if(quest.state == QuestStates.Completed){
                    completed++;
                }
            }
        });

        if(questElems.length == 0) {
            return;
        }

        let result = this.makeElement("div", "flq-cat", []);

        let titleElem = this.makeTextElement("div", "flq-cat-title", `${category.title} (${completed}/${category.quests.length})`, false);
        let titleExpandElem = this.makeElementFromHTML(`<div class="flq-cat-expand">${ModalRenderer.CharacterCodes.TriangleUp}</div>`);
        let expandableElem = this.makeElement("div", "flq-cat-titlebar-sub", [titleElem, titleExpandElem]);

        let menuElem = this.makeEditMenu(result, isHidden);
        menuElem.style.display = "none";
        let menuButtonElem = this.makeElementFromHTML(`<div class="flq-cat-menu-button">${ModalRenderer.CharacterCodes.Bars}</div>`);

        menuButtonElem.onclick = function() {
            if(menuElem.style.display == "none") {
                menuButtonElem.style.color = "#d5d5d5";
                menuButtonElem.style.backgroundColor = "#000";
                menuButtonElem.innerHTML = ModalRenderer.CharacterCodes.Close;
                menuElem.style.display = "block";
            } else {
                menuButtonElem.style.color = "#ffffff";
                menuButtonElem.style.backgroundColor = "#636363";
                menuButtonElem.innerHTML = ModalRenderer.CharacterCodes.Bars;
                menuElem.style.display = "none";
            }
        }

        let titleBarElem = this.makeElement("div", "flq-cat-titlebar flq-clickable", [menuElem, menuButtonElem, expandableElem]);
        let questsElem = this.makeElement("div", "flq-cat-quests", questElems);

        if(isHidden) {
            menuButtonElem.style.opacity = 0.5;
            expandableElem.style.opacity = 0.5;
            questsElem.style.opacity = 0.5;
        }

        if(collapsed) {
            questsElem.style.display = "none";
            titleExpandElem.innerHTML = ModalRenderer.CharacterCodes.TriangleDown;
        }

        expandableElem.onclick = function(){
            if(questsElem.style.display != "none")
            {
                questsElem.style.display = "none";
                titleExpandElem.innerHTML = ModalRenderer.CharacterCodes.TriangleDown;
                SettingsManager.instance().setCategoryProperty(category.id, "collapsed", true);
            } else {
                questsElem.style.display = "block";
                titleExpandElem.innerHTML = ModalRenderer.CharacterCodes.TriangleUp;
                SettingsManager.instance().setCategoryProperty(category.id, "collapsed", false);
            }
        };

        result.appendChild(titleBarElem);
        result.appendChild(questsElem);

        let order = category.order;
        let orderOverride = this.settings.getCategoryProperty(category.id, "order");
        if(orderOverride) {
            order = orderOverride;
        }

        result.flqID = category.id;
        result.flqOrder = order;
        result.flqHidden = isHidden;
        return result;
    }

    makeEditMenu(catElem, isHidden) {
        let toTopElem = this.makeElementFromHTML(`<div class="flq-cat-menu-item"><span>${ModalRenderer.CharacterCodes.TriangleUp}</span> Move to Top</div>`);
        toTopElem.onclick = function(){
            ModalRenderer.moveCategoryUp(catElem, true);
        }

        let moveUpElem = this.makeElementFromHTML(`<div class="flq-cat-menu-item"><span>${ModalRenderer.CharacterCodes.TriangleUpOutline}</span> Move Up</div>`);
        moveUpElem.onclick = function(){
            ModalRenderer.moveCategoryUp(catElem, false);
        }

        let moveDownElem = this.makeElementFromHTML(`<div class="flq-cat-menu-item"><span>${ModalRenderer.CharacterCodes.TriangleDownOutline}</span> Move Down</div>`);
        moveDownElem.onclick = function(){
            ModalRenderer.moveCategoryDown(catElem, false);
        }

        let toBottomElem = this.makeElementFromHTML(`<div class="flq-cat-menu-item"><span>${ModalRenderer.CharacterCodes.TriangleDown}</span> Move to Bottom</div>`);
        toBottomElem.onclick = function(){
            ModalRenderer.moveCategoryDown(catElem, true);
        }

        let toggleVisible = this.makeElementFromHTML(`<div class="flq-cat-menu-item"><span>${ModalRenderer.CharacterCodes.Eye}</span> ${isHidden ? "Show" : "Hide"}</div>`);
        toggleVisible.onclick = function(){
            SettingsManager.instance().setCategoryProperty(catElem.flqID, "hidden", !catElem.flqHidden);
            ModalManager.instance().rerenderQuests();
        }

        return this.makeElement("div", "flq-cat-menu", [
            toTopElem,
            moveUpElem,
            moveDownElem,
            toBottomElem,
            toggleVisible
        ]);
    }

    static moveCategoryUp(catElem, toTop) {
        const shiftedElems = [];
        let checkElem = catElem.previousSibling;
        while(checkElem) {
            if(checkElem.flqID && checkElem.flqOrder) {
                shiftedElems.push(checkElem);
                if(!checkElem.flqHidden && !toTop) {
                    break;
                }
            }
            checkElem = checkElem.previousSibling;
        }

        if(shiftedElems.length > 0) {
            let settings = SettingsManager.instance();
            settings.setCategoryProperty(catElem.flqID, "order", shiftedElems[shiftedElems.length - 1].flqOrder);
            for(let i = shiftedElems.length - 1; i >= 0; i--) {
                if(i == 0) {
                    settings.setCategoryProperty(shiftedElems[i].flqID, "order", catElem.flqOrder);
                } else {
                    settings.setCategoryProperty(shiftedElems[i].flqID, "order", shiftedElems[i-1].flqOrder);
                }
            }
        }

        ModalManager.instance().rerenderQuests();
    }

    static moveCategoryDown(catElem, toBottom) {
        const shiftedElems = [];
        let checkElem = catElem.nextSibling;
        while(checkElem) {
            if(checkElem.flqID && checkElem.flqOrder) {
                shiftedElems.push(checkElem);
                if(!checkElem.flqHidden && !toBottom) {
                    break;
                }
            }
            checkElem = checkElem.nextSibling;
        }

        if(shiftedElems.length > 0) {
            let settings = SettingsManager.instance();
            settings.setCategoryProperty(catElem.flqID, "order", shiftedElems[shiftedElems.length - 1].flqOrder);
            for(let i = shiftedElems.length - 1; i >= 0; i--) {
                if(i == 0) {
                    settings.setCategoryProperty(shiftedElems[i].flqID, "order", catElem.flqOrder);
                } else {
                    settings.setCategoryProperty(shiftedElems[i].flqID, "order", shiftedElems[i-1].flqOrder);
                }
            }
        }

        ModalManager.instance().rerenderQuests();
    }
}