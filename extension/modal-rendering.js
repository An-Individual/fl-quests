const CharacterCodes = {
    TriangleUp: "&#9650;",
    TriangleDown: "&#9660;",
    Checkmark: "&#10003;",
}

function makeTextElement(tag, className, textContent){
    let result = document.createElement(tag);
    result.className = className;
    result.innerHTML = textContent;
    return result;
}

function makeWrapperElement(tag, className, childElements){
    let result = document.createElement(tag);
    result.className = className;
    childElements.forEach((elem) =>{
        result.appendChild(elem);
    });
    return result;
}

function encodeText(text){
    const elem = document.createElement("textarea");
    elem.innerText = text;
    return elem.innerHTML;
}

function makeQuestElement(quest)
{
    let statusElem;
    switch(quest.state){
        case QuestStates.NotStart:
            statusElem = makeTextElement("div", "flq-quest-status flq-notstarted", "<div>Not Started</div>");
            break;
        case QuestStates.HiddenStatus:
            statusElem = makeTextElement("div", "flq-quest-status flq-hiddenstatus", "<div>Hidden</div>");
            break;
        case QuestStates.InProgress:
            statusElem = makeTextElement("div", "flq-quest-status flq-inprogress", "<div>In Progress</div>");
            break;
        case QuestStates.Blocked:
            statusElem = makeTextElement("div", "flq-quest-status flq-blocked", "<div>Blocked</div>");
            break;
        case QuestStates.Completed:
            statusElem = makeTextElement("div", "flq-quest-status flq-completed", "<div>Completed</div>");
            break;
        default:
            statusElem = makeTextElement("div", "flq-quest-status", "<div>ERROR</div>");
    }

    let toggleElem = makeTextElement("div", "flq-quest-toggle", "+");

    let mainElem = makeWrapperElement("div", "flq-quest-main", [
        toggleElem,
        makeTextElement("div", "flq-quest-title", encodeText(quest.title)),
        statusElem
    ]);

    let detailElems = [];

    let descriptionElem = makeTextElement("div", "flq-quest-detail", encodeText(quest.details));
    if(quest.subtasks?.length > 0){
        descriptionElem.classList.add("flq-quest-detail-line");
    }
    detailElems.push(descriptionElem);

    let taskIndex = 0;
    if(quest.subtasks){
        quest.subtasks.forEach((task) =>{
            let statusElem;
            if(task.completed){
                statusElem = makeTextElement("div", "flq-subtask-status", CharacterCodes.Checkmark);
            } else {
                statusElem = makeTextElement("div", "flq-subtask-status", "");
            }

            let taskElem = makeWrapperElement("div", "flq-subtask", [
                makeTextElement("div", "flq-subtask-description", encodeText(task.description)),
                statusElem
            ])

            if(taskIndex % 2 == 1){
                taskElem.classList.add("flq-subtask-offsetrow");
            }
            taskIndex++;

            detailElems.push(taskElem);
        });
    }

    let detailsElem = makeWrapperElement("div", "flq-quest-details", detailElems)

    mainElem.onclick = function(){
        if(!detailsElem.style.display || detailsElem.style.display == "none")
        {
            detailsElem.style.display = "block";
            toggleElem.textContent = "-";
        } else {
            detailsElem.style.display = "none";
            toggleElem.textContent = "+";
        }
    };

    return makeWrapperElement("div", "flq-quest", [
        mainElem,
        detailsElem
    ]);
}

function makeCategoryElement(category){
    let questElems = [];
    let completed = 0;
    category.quests.forEach((quest) =>{
        questElems.push(makeQuestElement(quest));
        if(quest.state == QuestStates.Completed){
            completed++;
        }
    });

    let titleElem = makeTextElement("div", "flq-cat-title", encodeText(category.title) + ` (${completed}/${category.quests.length})`);
    let titleExpandElem = makeTextElement("div", "flq-cat-expand", CharacterCodes.TriangleUp)
    let titleBarElem = makeWrapperElement("div", "flq-cat-titlebar", [titleElem, titleExpandElem]);
    let questsElem = makeWrapperElement("div", "flq-cat-quests", questElems);

    titleBarElem.onclick = function(){
        if(questsElem.style.display != "none")
        {
            questsElem.style.display = "none";
            titleExpandElem.innerHTML = CharacterCodes.TriangleDown;
        } else {
            questsElem.style.display = "block";
            titleExpandElem.innerHTML = CharacterCodes.TriangleUp;
        }
    };

    return makeWrapperElement("div", "flq-cat", [
        titleBarElem,
        questsElem
    ]);
}