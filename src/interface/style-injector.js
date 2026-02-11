export class StyleInjector {
    // I spent a lot of time trying to setup
    // a system for grabbing these styles
    // from a file but web_accessible_resources
    // file but while I could do this with
    // script files, though I had to discard
    // that for other reasons, something kept 
    // blocking the CSS file, though I could 
    // never identify what. So heck with it,
    // we're just doing it inline.
    static cssRaw = `
        .flq-modal-wrapper {
            display: none;
            position: fixed;
            z-index: 500; /* The mobile footer menu is 450 */
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: auto;
            background-color: rgb(0,0,0); /* Fallback color */
            background-color: rgba(0,0,0,0.65);
        }

        .flq-modal-box {
            margin: 50px auto;
            padding: 4px;
            max-width: 600px;
            background-color: #bdb29e;
            color: #282520;
            box-sizing: border-box;
            font-family: "Roboto Slab",Georgia,Times,serif;
        }

        .flq-outline {
            position: relative;
            margin: 0px;
            height: 100%;
            border: 2px solid #897d67;
            padding: 0px;
            box-sizing: border-box;
        }

        .flq-outline  hr {
            margin: 0px 20px;
            border: 1px solid #897d67;
        }

        .flq-title {
            margin-top: 20px;
            text-align: center;
            font-size: 28px;
            font-weight: bold;
            user-select: none;
        }

        .flq-subtitle-links {
            text-align: center;
            margin-bottom: 5px;
            font-size: 12px;
            user-select: none;
        }

        .flq-tab-selected
        {
            font-weight: bold;
        }

        .flq-tab-clickable
        {
            color: #3f7277;
        }

        .flq-tab-clickable:hover
        {
            color: #254245;
        }

        .flq-body {
            margin: 20px;
        }

        #flq-close {
            color: black;
            font-size: 28px;
            font-weight: bold;
            display: block;
            position: absolute;
            top: 0px;
            right: 10px;
        }

        .flq-tab-clickable:hover,
        .flq-tab-clickable:focus,
        .flq-cat-titlebar:hover,
        .flq-cat-titlebar:focus,
        .flq-quest-main:hover,
        .flq-quest-main:focus,
        #flq-close:hover,
        #flq-close:focus {
            text-decoration: none;
            cursor: pointer;
        }

        @media screen and (max-width: 1000px) {
            .flq-modal-box {
                margin: auto;
                width: 100%;
                height: 100%;
            }
        }

        .flq-cat {
            margin-bottom: 20px;
        }

        .flq-cat-titlebar {
            display: flex;
            width: 100%;
            align-items: stretch;
            user-select: none;
            background-color: #636363;
            color: #ffffff;
            box-shadow: 0 1px 3px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.24);
        }

        .flq-cat-title {
            flex: 1 1 auto;
            min-width: 0;
            padding: 5px;
            font-weight: bold;
            font-size: 18px;
        }

        .flq-cat-expand {
            width: 30px;
            flex: 0 0 30px;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .flq-quest-main {
            display: flex;
            width: 100%;
            align-items: stretch;
            user-select: none;
            background-color: #e8dac3;
            box-shadow: 0 1px 3px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.24);
        }

        .flq-quest-status {
            width: 100px;
            flex: 0 0 100px;
            margin: auto;
        }

        .flq-quest-status div {
            width: 90px;
            margin: 5px auto;
            padding: 5px;
            text-align: center;
            border: 1px solid #000000;
        }

        .flq-quest-toggle {
            width: 20px;
            flex: 0 0 20px;
            text-align: center;
            margin: auto 0;
            font-weight: bold;
        }

        .flq-quest-title {
            flex: 1 1 auto;
            min-width: 0;
            padding: 5px 0;
            margin: auto 0;
            font-weight: bold;
        }

        .flq-hiddenstatus div {
            visibility: hidden;
        }

        .flq-inprogress div {
            background-color: #ddd200;
            color: #000000;
        }

        .flq-blocked div {
            background-color: #636363;
            color: #ffffff;
        }

        .flq-completed div {
            background-color: #2c9c00;
            color: #ffffff;
        }

        .flq-quest-details {
            display: none;
            background-color: #ffffff;
            box-shadow: 0 1px 3px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.24);
            margin-left: 20px;
            margin-bottom: 20px;
        }

        .flq-quest-detail {
            padding: 5px;
        }

        .flq-quest-detail-line {
            border-bottom: 1px solid #808080;
        }

        .flq-subtask {
            display: flex;
            width: 100%;
            align-items: stretch;
        }

        .flq-subtask-offsetrow {
            background-color: #eeeeee;
        }

        .flq-subtask-description {
            flex: 1 1 auto;
            min-width: 0;
            padding: 5px;
        }

        .flq-subtask-status {
            width: 30px;
            flex: 0 0 30px;
            display: flex;
            justify-content: center;
            align-items: center;
            font-weight: bold;
            user-select: none;
            border-left: 1px solid #808080;
        }
        
        #flq-error-title {
            font-size: 20px;
            font-weight: bold;
        }

        #flq-error-trace {
            font-family: "Lucida Console", "Courier New", monospace;
            font-size: 8px;
            margin-left: 5px;
        }

        .flq-ul {
            padding-left: 1rem;
            list-style-type: disc;
        }

        .flq-ul .flq-ul {
            list-style-type: circle;
        }

        .flq-ul .flq-ul .flq-ul {
            list-style-type: square;
        }
        
        .flq-settings-title {
            font-size: 1.5em;
            font-weight: bold;
        }
        
        .flq-settings-group {
            margin-bottom: 10px;
        }

        .flq-settings-body {
            margin-left: 20px;
        }

        #flq-quest-import-panel {
            display: none;
        }

        #flq-quest-import-panel {
            margin-top: 5px;
        }

        #flq-qsource-address {
            width: 100%;
        }

        #flq-import-state {
            font-family: "Lucida Console", "Courier New", monospace;
            border: 1px solid #000;
            margin-top: 5px;
            margin-right: 40px;
            padding: 5px;
            font-size: 0.9em;
            white-space: pre-wrap;
        }
        `;

    static insertStylesElement(){
        let cssElem = document.createElement("style");
        cssElem.textContent = StyleInjector.cssRaw;
        document.head.appendChild(cssElem);
    }

    static stylesCheckForDOM() {
        if (document.body && document.head) {
            StyleInjector.insertStylesElement();
        } else {
            requestIdleCallback(StyleInjector.stylesCheckForDOM);
        }
    }

    static injectStyles() {
        requestIdleCallback(StyleInjector.stylesCheckForDOM);
    }
}