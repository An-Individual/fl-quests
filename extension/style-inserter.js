// It's important that this excutes AFTER the
// request interceptor is setup as it opens
// a window for page scripts to execute.
// See the request interceptor code for
// more details on why this is important.

// I spent a lot of time trying to setup
// a system for grabbing these styles
// from a file but web_accessible_resources
// file but while I could do this with
// script files, though I had to discard
// that for other reasons, something kept 
// blocking the CSS file, though I could 
// never identify what. So heck with it,
// we're just doing it inline.
const cssRaw = `
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
    margin: 15% auto;
    padding: 4px;
    max-width: 600px;
    background-color: #bdb29e;
    color: #282520;
    box-sizing: border-box;
    font-family: "Roboto Slab",Georgia,Times,serif;
}

.flq-outline {
    margin: 0px;
    height: 100%;
    border: 2px solid #897d67;
    padding: 0px;
    box-sizing: border-box;
}

.flq-outline hr {
    margin: 0px 20px;
    border: 1px solid #897d67;
}

.flq-title {
    margin: 20px;
    text-align: center;
    font-size: 28px;
    font-weight: bold;
}

.flq-body {
    margin: 20px;
}

.flq-modal-close {
    color: black;
    float: right;
    margin-right: 10px;
    font-size: 28px;
    font-weight: bold;
    display: block;
}

.flq-modal-close:hover,
.flq-modal-close:focus {
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
`;

function insertStyles(){
    let cssElem = document.createElement("style");
    cssElem.textContent = cssRaw;
    document.head.appendChild(cssElem);
}

function stylesCheckForDOM() {
    if (document.body && document.head) {
        insertStyles();
    } else {
        requestIdleCallback(stylesCheckForDOM);
    }
}

requestIdleCallback(stylesCheckForDOM);