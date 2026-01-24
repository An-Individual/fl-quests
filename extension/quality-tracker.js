let currentQualities = {};

function onMyself(response){
    let newQualities = {};

    response.possessions.forEach((category) => {
        category.possessions.forEach((quality) =>{
            newQualities[quality.id] = quality;
        });
    });

    currentQualities = newQualities;
}

function onBranch(response){
    if (response.messages?.length > 0){
        response.messages.forEach((message) =>{
            if (message.possession){
                currentQualities[message.possession.id] = message.possession;
            }
        });
    }
}