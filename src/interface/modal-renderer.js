import { QuestStates } from "../quests/quests-datatypes.js";
import { SettingsManager } from "../settings.js";
import { TextFormatter } from "./text-formatter.js";

export class ModalRenderer {
    static CharacterCodes = {
        TriangleUp: "&#9650;",
        TriangleDown: "&#9660;",
        Checkmark: "&#10003;",
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

    makeCategoryElement(category, collapsed){
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

        let titleElem = this.makeTextElement("div", "flq-cat-title", `${category.title} (${completed}/${category.quests.length})`, false);
        let titleExpandElem = this.makeElementFromHTML(`<div class="flq-cat-expand">${ModalRenderer.CharacterCodes.TriangleUp}</div>`)
        let titleBarElem = this.makeElement("div", "flq-cat-titlebar flq-clickable", [titleElem, titleExpandElem]);
        let questsElem = this.makeElement("div", "flq-cat-quests", questElems);

        if(collapsed) {
            questsElem.style.display = "none";
            titleExpandElem.innerHTML = ModalRenderer.CharacterCodes.TriangleDown;
        }

        titleBarElem.onclick = function(){
            if(questsElem.style.display != "none")
            {
                questsElem.style.display = "none";
                titleExpandElem.innerHTML = ModalRenderer.CharacterCodes.TriangleDown;
                SettingsManager.instance().setCategoryState(category.id, ModalManager.CategoryState.Collapsed);
            } else {
                questsElem.style.display = "block";
                titleExpandElem.innerHTML = ModalRenderer.CharacterCodes.TriangleUp;
                SettingsManager.instance().setCategoryState(category.id, ModalManager.CategoryState.Show);
            }
        };

        return this.makeElement("div", "flq-cat", [
            titleBarElem,
            questsElem
        ]);
    }

    MakeCategoryConfigElems(categories) {

    }
}