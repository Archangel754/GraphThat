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
        function: getAndStoreCurrentSel,
    },
    (injectionResults) => {
        
        for (const frameResult of injectionResults)
            var framevalue = frameResult.result;
            // console.log('Frame Title: ' + framevalue);
            chrome.storage.sync.set({ "currentSelection" : [framevalue] }, function() {
                if (chrome.runtime.error) {
                    console.log("Runtime Error.");
                };
            });
            // Displays the stored text in the console log
            // logCurrentStoredSel();
            // Call the function for handling the stored data
            doAfterStoringSelectedText();
            });

    // Anything that needs to run after the selected text is 
    // set to storage should be placed in doAfterStoringSelectedText()

    // view myresults which should be selected text:
    // This displays an outdated result because it runs before 
    // the selected text is actually set to the storage.

    /* chrome.storage.sync.get("currentSelection", function(result) {
        console.log('Selected text currently is ' + result.currentSelection);
    }); */


    // uncomment to view all keys in storage:
    /* chrome.storage.sync.get(null, function(items) {
        var allKeys = Object.keys(items);
        console.log(allKeys);
    }); */
});

function doAfterStoringSelectedText() {
    chrome.storage.sync.get("currentSelection", function(result) {
        let currentSel = result.currentSelection
        console.log('Selected text to work on currently is ' + currentSel);
        
        // First parse the selection to determine data
        // graph type, labels, etc.

        // If data is not valid to graph, display an error

        // Write the objects required by graph.js to
        // compose the graph. For now hardcoded.
        
        var glabels = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
        ];

        var gdata = {
            labels: glabels,
            datasets: [{
                label: 'My First dataset',
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 99, 132)',
                data: [0, 10, 5, 2, 20, 30, 45],
            }]
        };
            
        var gconfig = {
            type: 'line',
            data: gdata,
            options: {}
        };
        
        var graphDataObj = {
            labels: glabels,
            data: gdata,
            config: gconfig
        };
        // Open a new window with the graph of the data.
        chrome.storage.sync.set({ "graphData" : [graphDataObj] }, function() {
            if (chrome.runtime.error) {
                console.log("Runtime Error.");
            };
            
        });
        // Opens a new window with the page testgraph.html 
        // which is included in the extension:
        chrome.windows.create({
            url: chrome.runtime.getURL("testgraph.html"),
            // type: "popup"
        });
    });
}

function logCurrentStoredSel() {
    // view myresults which should be selected text:
    chrome.storage.sync.get("currentSelection", function(result) {
        console.log('Selected text currently is ' + result.currentSelection);
    });
}

function getAndStoreCurrentSel() {
    // console.log('inside getCurrentSel'); // this doesn't print because page code doesnt use popup page console.
    // var throwaway = window.getSelection().toString();
    return window.getSelection().toString()
}

function retrieveStoredSel() {
    chrome.storage.sync.get("currentSelection", function(result) {
        return result.currentSelection;
    });
}



// Old stuff from color changing extension:

// When the button is clicked, inject setPageBackgroundColor into curent page
changeColor.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true});
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