const NUM_COLORS = 9
const COLORS = [
    'rgb(255,0,0)', // red
    'rgb(0,255,0)', // lime
    'rgb(0,0,255)', // blue
    'rgb(255,255,0)', // yellow
    'rgb(0,255,255)', // cyan
    'rgb(255,0,255)', // magenta
    'rgb(0,128,0)', // green
    'rgb(128,0,128)', // purple
    'rgb(0,0,128)', // navy
]

// Initialize buttons to get selection
let graphLineChart = document.getElementById("graphLineChart");
//graphLineChart.style.backgroundColor = "#FB00D7";
let graphBarChart = document.getElementById("graphBarChart");
//graphBarChart.style.backgroundColor = "#BB00D7";

// When buttons are clicked, get selected text and generate graph:
graphLineChart.addEventListener("click", async () => {
    console.log("graphLineChart button clicked");
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
            doAfterStoringSelectedText('line');
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

graphBarChart.addEventListener("click", async () => {
    console.log("graphBarChart button clicked");
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
            doAfterStoringSelectedText('bar');
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

function doAfterStoringSelectedText(graphType = 'line') {
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

        /* var gdata = { // original
            labels: glabels,
            datasets: [{
                label: 'My First dataset',
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 99, 132)',
                data: [0, 10, 5, 2, 20, 30, 45],
            }]
        }; */
        var gdata = { // for testing
            labels: glabels,
            datasets: [{
                label: 'My First dataset',
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 99, 132)',
                data: [0, 10, 5, 2, 20, 30],
            },
            {
                label: 'My second dataset',
                backgroundColor: COLORS[1%NUM_COLORS], //'rgb(255, 99, 132)',
                borderColor: COLORS[1%NUM_COLORS], //'rgb(255, 99, 132)',
                data: [10, 15, 52, 2, 20, 30],
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


        // for testing:
        const CA_POPULATION = "Census	Pop.		growth \n" +
"1850	92,597		—\n"+
"1860	379,994		310.4%\n"+
"1870	560,247		47.4%\n"+
"1880	864,694		54.3%\n"+
"1890	1,213,398		40.3%\n"+
"1900	1,485,053		22.4%\n"+
"1910	2,377,549		60.1%\n";
        //var graphDataObj = parseColumns(CA_POPULATION, firstColIsLabels=true, firstRowNames=true);
        
        // needed to convert the selection to a string from type: object
        currentSel = currentSel.toString();

        // Check the options from the checkboxes in popups:
        let colCheck = document.getElementById("checkfirstcolumnlabels");
        let rowCheck = document.getElementById("checkfirstrownames");
        //console.log('colcheck:'+colCheck.checked)
        //console.log('rowcheck:'+rowCheck.checked)

        // get graph object from parseColumns:
        var graphDataObj = parseColumns(currentSel, rowCheck.checked, colCheck.checked, graphType);
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

function parseColumns(inputString = '', firstRowNames = false, firstColIsLabels = false, chartType = 'line') {
    let rows = inputString.trim();
    //console.log(rows);
    rows = rows.split('\n');
    //console.log(rows);
    // trim and split the rows at spaces or commas that are next to spaces
    rows = rows.map(function(row) {
        newrow = row.trim().split(/,\s+|\s+|\s+,/); 
        // remove commas and percent signs
        newrow = newrow.map(function(element) {
            let newelement = element.replace(/,/g,'');
            newelement = newelement.replace(/%/g,'');
            // convert to int if possible
            const number = parseInt(newelement, 10)
            if (isNaN(number)) {return newelement}
            return number
        });
        return newrow
    });
    /*
    rows.forEach(element => {
        console.log(element)
    });
    */

    //console.log(rows);
    // figure out start row and column and set xaxis title
    if (firstRowNames && firstColIsLabels) {
        const xAxisTitle = rows[0][0];
        var startRow = 1;
        var startColumn = 1;
    } else if (firstRowNames &&  (!firstColIsLabels)){
        var startRow = 1;
        var startColumn = 0;
        const xAxisTitle = null;
    } else if (firstColIsLabels) {
        const xAxisTitle = null;
        var startRow = 0;
        var startColumn = 1;
    } else {
        const xAxisTitle = null;
        var startRow = 0;
        var startColumn = 0;
    }

    // find number of datasets
    let rowLengths = rows.map(row => {
        return row.length
    });
    numberOfDatasets = Math.min(...rowLengths)-startColumn;

    // compress rows so that number of columns is consistent:
    // while too many columns, combine adjacent text entries.
    compressRows(rows, numberOfDatasets+startColumn);
    // rows.forEach(row => {
    //     console.log(row)
    // })

    // generate labels:
    const numberOfPoints = rows.length-startRow;
    var dataLabels = new Array(numberOfPoints);
    rows.forEach(function(row, idx) {
        if (idx > startRow-1) {
            if (firstColIsLabels) {
                dataLabels[idx-startRow] = row[0]
            } else {
                dataLabels[idx-startRow] = idx-startRow;
                }
        }
    });

    
    // collect datasets:
    
    let dataSetsArray = [];
    for (let step = 0; step < numberOfDatasets; step++) {
        dataSetsArray.push([]);
    }
    // push dataset values to datasetsarray[[],[]]
    rows.forEach(function(row, rowidx) {
        row.forEach(function(value, columnidx) {
            // console.log('row:',rowidx,'col:',columnidx,'val:',value);
            if ((rowidx >= startRow) && (columnidx >= startColumn)) {
                let dataSetIdx = columnidx - startColumn;
                dataSetsArray[dataSetIdx].push(value)
            }
        })
    });

 
    
    // add datasets to object]
    let dataSetsObjList = []
    dataSetsArray.forEach(function(dataSet, dataSetIdx) {
        let datasetobj = {}
        if (firstRowNames) {
            datasetobj.label = String(rows[0][dataSetIdx+startColumn]);
            //console.log('label'+idataSetIdx + datasetobj.label);
        } else {
            datasetobj.label = dataSetIdx
        }
        datasetobj.backgroundColor = COLORS[dataSetIdx % NUM_COLORS];
        datasetobj.borderColor = COLORS[dataSetIdx % NUM_COLORS];
        datasetobj.data = dataSetsArray[dataSetIdx];
        dataSetsObjList.push(datasetobj);
    });
    
    // generate data and config structures
    let data = {
        labels: dataLabels,
        datasets: dataSetsObjList,
    };
    let config = {
        type: chartType,
        // can add option here for bar chart instead:
        // type: 'bar',
        data: data,
        options: {}
    };
    let graphDataObj = {
        labels: dataLabels,
        data: data,
        config: config
    }
    return graphDataObj


    /* 
    dataSetsObjList.forEach(function(e) {
        console.log(e)
        console.log(e.data)
        
    })

    dataSetsArray.forEach(function(e) {
        console.log(e)
    })
    //console.dir(dataSetsArray);
    */

}

function compressRows(rows, desiredWidth) {
    rows.forEach(function(row) {
        while (row.length > desiredWidth) {
            // text indices: e.g. [0,1]
            let textIndices = getFirstAdjacentTextIndices(row);
            // If two strings available, then
            // combine the entries at the two string indices.
            // otherwise just combine the first two entries.
            if (textIndices.length == 2) {
                combineArrayPair(row,textIndices, ' ');
            } else {
                combineArrayPair(row, [0,1],' ')
            }
        }
    });
}
// Testing compressRows:
// r = [[1,2,3],[1,2,'r','t'],[1,'2','r','g',3],[1,2,3,4]];
// compressRows(r,3)
// r.forEach(function(row) {
//     console.log(row)
// });

function getFirstAdjacentTextIndices(row) {
    let indices = [];
    row.forEach(function(element, idx) {
        isString = ((typeof element) == "string");
        if (isString) {
            indices.push(idx)
        };
    });
    let validPairs = [];
    indices.forEach(function(element, idx) {
        if (idx < indices.length && (indices[idx+1] - element == 1)) {
            validPairs.push(indices.slice(idx,idx+2));
        }
    })
    if (validPairs.length > 0) {return validPairs[0]};
    return [];
}
// Test combineArrayPair:
// let a = ['a','b','c','d','e'];
// console.log(a);
// combineArrayPair(a,[1,3],' ');
// console.log(a);

function combineArrayPair(array, indices, separator) {
    // Takes an array of two indices 'indices' and 
    // combines the strings at the two entries in array,
    // placing them at the first index, and deleting the
    // item at the second index. Items separated by 'separator'
    // a = ['2','t','y','u']
    // combineArrayPair(a,[1,2],' ') -> a = ['2','t y','u']
    let first = indices[0];
    let second = indices[1];
    array[first] = String(array[first]) + separator + String(array[second]);
    array.splice(second,1);
}
// Testing getFirstAdjacentTextIndices:
// let a = [0,1,2,'t','d',4,'f','g',7,'t'];
// let i = getFirstAdjacentTextIndices(a);
// console.log(i);

// Old stuff from color changing extension: _____________________

// Initialize button with user's preferred color
let changeColor = document.getElementById("changeColor");
chrome.storage.sync.get("color", ({ color}) => {
    changeColor.style.backgroundColor = color;
});

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

// End old stuff _________________________________



