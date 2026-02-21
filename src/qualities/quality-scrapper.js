export class QualityScrapper {
    static scrapeQualities() {
        /**
         * The most notable thing we lose by doing this is the
         * distinction between effective and actual level. The
         * quality text only includes the effective level. We
         * can scrape some of the actual levels from the
         * side bar to suplement this. But that only works
         * if the quality is there and we can only map by name,
         * since the ID isn't present in the sidebar, which is
         * a much more fragile link than I'd like.
         */
        let myselfItems = QualityScrapper.scrapeMyselfQualities();
        let sidebarItems = QualityScrapper.scrapeSidebarQualities();
        sidebarItems.forEach(item => {
            let quality = myselfItems.find(q => q.name == item.name);
            if(quality) {
                quality.level = item.level;
            }
        });

        const result = {};
        myselfItems.forEach(item =>{
            result[item.id] = item;
        })

        QualityScrapper.handleHiddenLevels(result);

        return result;
    }

    static scrapeMyselfQualities() {
        let result = [];
        const qElems = document.getElementsByClassName("quality-item");
        for(let i = 0; i < qElems.length; i++) {
            const elem = qElems[i];
            const iconDiv = elem.getElementsByClassName("quality-item__icon")[0];
            const id = parseInt(iconDiv?.getAttribute("data-branch-id"));
            if(!id) {
                break;
            }
            const mediaObjectImg = elem.getElementsByTagName("img")[0];
            const name = mediaObjectImg?.getAttribute("alt")?.trim();

            let level = 1;
            let maxlevel = 0;
            let subName = "";
            const nameElem = elem.getElementsByClassName("quality-item__name")[0]?.getElementsByTagName("span")[0];
            let text = nameElem?.innerText?.trim();
            if(text) {
                if(name) {
                    text = text.substring(name.length)?.trim();
                }

                if(text) {
                    subName = text.replace(/[^-]*-/, "").trim();
                    const levelMatch = text.match(/\s*([0-9,]+)(?:\/([0-9,]+))?/);
                    if(levelMatch) {
                        level = parseInt(levelMatch[1]?.replace(/,/g, ""));
                        if(levelMatch.length > 2) {
                            maxlevel = parseInt(levelMatch[2]?.replace(/,/g, ""));
                        }
                    }
                }
            }

            result.push(
                    {
                        id: id,
                        level: level,
                        effectiveLevel: level,
                        name: name,
                        subName: subName,
                        cap: maxlevel
                    });
        }

        return result;
    }

    static scrapeSidebarQualities(){
        let result = [];
        const qElems = document.getElementsByClassName("sidebar-quality");
        for(let i = 0; i < qElems.length; i++) {
            const elem = qElems[i];
            const name = elem.getElementsByClassName("item__name")[0]?.innerText?.trim()
            const level = parseInt(elem.getElementsByClassName("item__value")[0]?.innerText?.trim());
            result.push( 
                {
                    name: name,
                    level: level
                }
            );
        }

        return result;
    }

    static handleHiddenLevels(qualities) {
        /**
         * Accomplishment, Circumstance, Major Lateral, and Route qualities
         * don't include their effectiveLevel in their text. So if they can
         * have values greater than 1 and we need to render quests based on
         * that we need to manually map their sub names to those levels.
         */
        QualityScrapper.replacePoSILevel(qualities);
        QualityScrapper.replaceProfessionLevel(qualities);
    }

    static replaceQualityLevel(qualities, id, mappings) {
        const quality = qualities[id];
        if(!quality) {
            return;
        }

        let key = quality.subName.toLowerCase();
        if(Object.hasOwn(mappings, key)) {
            quality.level = mappings[key];
        }
    }

    static replacePoSILevel(qualities) {
        QualityScrapper.replaceQualityLevel(qualities, 716,{
            "a paramount presence": 10,
            "an extraordinary mind": 6,
            "an invisible eminence": 5,
            "a legendary charisma": 4,
            "a shattering force": 3,
            "not yet a person of importance": 0
        });
    }

    static replaceProfessionLevel(qualities) {
        QualityScrapper.replaceQualityLevel(qualities, 13615,{
            "campaigner": 1,
            "enforcer": 2,
            "rat-catcher": 3,
            "trickster": 4,
            "journalist": 5,
            "watcher": 6,
            "tough": 7,
            "minor poet": 8,
            "pickpocket": 9,
            "enquirer": 10,
            "author": 11,
            "murderer": 12,
            "stalker": 13,
            "agent": 14,
            "mystic": 15,
            "conjurer": 16,
            "tutor": 17,
            "undermanager": 18,
            "correspondent": 30,
            "licentiate": 31,
            "monster-hunter": 32,
            "midnighter": 33,
            "silverer": 34,
            "crooked-cross": 35,
            "notary": 36,
            "doctor": 37,
        });
    }
}