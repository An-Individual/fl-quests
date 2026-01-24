function qualitiesToCSV(qualities)
{
    const builder = new CSVBuilder();
    
    builder.addRow([
        "Category",
        "ID",
        "Name",
        "Level",
        "Effective Level",
        "Nature"
    ]);

    for(const id in qualities){
        const quality = qualities[id];
        builder.addRow([
            quality.category,
            quality.id,
            quality.name,
            quality.level,
            quality.effectiveLevel,
            quality.nature
        ]);
    }

    return builder.result;
}