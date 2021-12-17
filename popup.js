// Initialize button with user's preferred color
let changeColor = document.getElementById("changeColor");

chrome.storage.sync.get("color", ({ color}) => {
    changeColor.style.backgroundColor = color;
});

// Initialize button to get selection
let getSelection = document.getElementById("getSelection");
getSelection.style.backgroundColor = "#FB00D7";

// When button is clicked, get selected text
getSelection.addEventListener("click", async () => {
    console.log("getSelection button clicked");
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true});
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: getCurrentSel,
    },
    (injectionResults) => {
        
        for (const frameResult of injectionResults)
            var framevalue = frameResult.result;
            // console.log('Frame Title: ' + frameResult.result);
            // var obj = {};
            // var name = 'CurrentSelection';
            // obj[name] = 'ww'
            chrome.storage.sync.set({ "currentSelection" : [framevalue] }, function() {
                if (chrome.runtime.error) {
                    console.log("Runtime Error.");
                };})
            });
      

    // chrome.scripting.executeScript( null, {code:"window.getSelection().toString();"}, (results) => { document.getElementById("output").value = results; });
    // console.log('read from storage:' + chrome.storage.sync.get(currentSelection));
    
    // view myresults which should be selected text:
    chrome.storage.sync.get("currentSelection", function(result) {
        console.log('Selected text currently is ' + result.currentSelection);
    });

    
    // uncomment to view all keys in storage:
    /* chrome.storage.sync.get(null, function(items) {
        var allKeys = Object.keys(items);
        console.log(allKeys);
    }); */
    


});

// function mgetSelection() {
    /* chrome.scripting.executeScript( null, {
        code:"window.getSelection().toString();"},
        (results) => { document.getElementById("output").value = results; }
    ) */
    
    // (results) => { document.getElementById("output").value = results;
// }

function getCurrentSel() {
    //window.getSelection().toString();
    // chrome.storage.sync.set({ myresults: window.getSelection().toString() });
    console.log('inside getCurrentSel'); // this doesn't print because page code doesnt use popup page console.
    return window.getSelection().toString()
    /* chrome.scripting.executeScript( {
        code: "window.getSelection().toString();"
      }, function(selection) {
        document.getElementById("myresults").value = selection[0];
      }); */
}

// When the button is clicked, inject setPageBackgroundColor into curent page
changeColor.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true});
    //let bkg = chrome.extension.getBackgroundPage();
    console.log('test bg color button popup console onclick');
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: setPageBackgroundColor,
    });
});

// The body of this function will be executed as a content script
// inside the current page
function setPageBackgroundColor() {
    chrome.storage.sync.get("color", ({ color }) => {
        document.body.style.backgroundColor = color;
    });
}