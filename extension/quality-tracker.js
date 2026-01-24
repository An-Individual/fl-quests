let currentQualities = {};

function onMyself(response){
    let newQualities = {};

    response.possessions.forEach((category) => {
        category.possessions.forEach((quality) =>{
            //console.debug(`[FL Quests] Setting ${quality.name}[${quality.id}] to ${quality.level}`);
            newQualities[quality.id] = quality.level;
        });
    });

    currentQualities = newQualities;
}

function onBranch(response){
    if (response.messages?.length > 0){
        response.messages.forEach((message) =>{
            if (message.possession){
                //console.debug(`[FL Quests] Updating ${message.possession.name}[${message.possession.id}] to ${message.possession.level}`);
                currentQualities[message.possession.id] = message.possession.level;
            }
        });
    }
}