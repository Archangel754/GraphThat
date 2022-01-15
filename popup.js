/* 
Main logic of the popup is in processStoredText
and parseColumns. Button clicks are handled by event listeners.
They use chrome scripting to inject a script into the current tab
which gets the current text selection. The selection is then parsed
into rows and columns, cleaned into appropriate format, and stored
in chrome.storage.sync. A new window is opened with graph.html.
graph.js fetches the data and plots it using chart.js.
*/
const NUM_COLORS = 9;
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
];

// Initialize buttons to get selection
let graphLineChart = document.getElementById('graphLineChart');
let graphBarChart = document.getElementById('graphBarChart');
let graphScatterChart = document.getElementById('graphScatterChart');
let dataInRows = document.querySelector('[id="checkdatainrows"]');

// Handle button clicks
graphLineChart.addEventListener('click', async () => {
    // Graph selected text as line chart.
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript(
        {
            target: { tabId: tab.id },
            function: getAndStoreCurrentSel,
        },
        (injectionResults) => {
            for (const frameResult of injectionResults)
                var framevalue = frameResult.result;
            chrome.storage.sync.set(
                { currentSelection: [framevalue] },
                function () {
                    if (chrome.runtime.error) {
                        console.log('Runtime Error.');
                    }
                }
            );
            // Do the rest of processing and graph data
            processStoredText('line');
        }
    );
    // Anything that needs to run after the selected text is
    // set to storage should be placed in processStoredText()
});

graphScatterChart.addEventListener('click', async () => {
    // Graph selected text as scatter plot in new window.
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript(
        {
            target: { tabId: tab.id },
            function: getAndStoreCurrentSel,
        },
        (injectionResults) => {
            for (const frameResult of injectionResults)
                var framevalue = frameResult.result;
            chrome.storage.sync.set(
                { currentSelection: [framevalue] },
                function () {
                    if (chrome.runtime.error) {
                        console.log('Runtime Error.');
                    }
                }
            );
            // Do the rest of processing and graph data
            processStoredText('scatter');
        }
    );
    // Anything that needs to run after the selected text is
    // set to storage should be placed in processStoredText()
});

graphBarChart.addEventListener('click', async () => {
    // Graph selected text as a bar chart in new window.
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript(
        {
            target: { tabId: tab.id },
            function: getAndStoreCurrentSel,
        },
        (injectionResults) => {
            for (const frameResult of injectionResults)
                var framevalue = frameResult.result;
            chrome.storage.sync.set(
                { currentSelection: [framevalue] },
                function () {
                    if (chrome.runtime.error) {
                        console.log('Runtime Error.');
                    }
                }
            );
            // Do the rest of processing and graph data
            processStoredText('bar');
        }
    );
    // Anything that needs to run after the selected text is
    // set to storage should be placed in processStoredText()
});

dataInRows.addEventListener('change', function () {
    // Called when the rows or columns toggle is clicked.
    // Sets the labels for names and labels buttons appropriately.
    let namesButtonText = document.getElementById(
        'checkFirstRowNamesButtonText'
    );
    let labelsButtonText = document.getElementById(
        'checkFirstColumnLabelsButtonText'
    );
    if (this.checked == true) {
        // data is in rows. set labels appropriately.
        namesButtonText.innerHTML = 'First Col Names';
        labelsButtonText.innerHTML = 'First Row Labels';
    } else {
        // data is in columns
        namesButtonText.innerHTML = 'First Row Names';
        labelsButtonText.innerHTML = 'First Col Labels';
    }
});

// Main logic
/**
 * Call after text is stored in sync.storage 'currentSelection'.
 * Calls other functions to handle the selections
 * and opens new window with graph of data.
 * @param {*} graphType 'line' or 'bar' or 'scatter'
 */
function processStoredText(graphType = 'line') {
    chrome.storage.sync.get('currentSelection', function (result) {
        let currentSel = result.currentSelection;
        // Convert the selection to a string from type: object
        currentSel = currentSel.toString();

        // Check the options from the checkboxes in popups:
        let colCheck = document.getElementById('checkfirstcolumnlabels');
        let rowCheck = document.getElementById('checkfirstrownames');
        let dataInRowsCheck = document.getElementById('checkdatainrows');

        // Get graph object from parseColumns:
        var graphDataObj = parseColumns(
            currentSel,
            rowCheck.checked,
            colCheck.checked,
            dataInRowsCheck.checked,
            graphType
        );
        // Write the objects required by graph.js to
        // compose the graph. Will be unpacked in graph.js.
        chrome.storage.sync.set({ graphData: [graphDataObj] }, function () {
            if (chrome.runtime.error) {
                console.log('Runtime Error.');
            }
        });
        // Open a new window with the page graph.html
        // (included in the extension)
        chrome.windows.create({
            url: chrome.runtime.getURL('graph.html'),
            // type: "popup"
        });
    });
}

/**
 * Parse the inputString into an array of arrays,
 * then packs the data into a graphDataObj object
 * for use with the library chart.js.
 * @param {*} inputString
 * @param {*} firstRowNames 'true' or 'false'
 * @param {*} firstColIsLabels 'true' or 'false'
 * @param {*} switchToRows 'true' or 'false'
 * @param {*} chartType 'line' or 'bar' or 'scatter'
 * @returns graphDataObj object for chart.js
 */
function parseColumns(
    inputString = '',
    firstRowNames = false,
    firstColIsLabels = false,
    switchToRows = false,
    chartType = 'line'
) {
    let rows = inputString.trim();
    rows = rows.split('\n');
    // Trim and split the rows at spaces or commas that are next to spaces
    rows = rows.map(function (row) {
        newrow = row.trim().split(/,\s+|\s+|\s+,/);
        // Remove commas and percent signs
        newrow = newrow.map(function (element) {
            let newelement = element.replace(/,/g, '');
            newelement = newelement.replace(/%/g, '');
            // Convert to int if possible
            const number = parseInt(newelement, 10);
            if (isNaN(number)) {
                return newelement;
            }
            return number;
        });
        return newrow;
    });

    // If data in rows instead of columns, transpose the rows matrix
    if (switchToRows) {
        rows = transpose(rows);
    }

    // Figure out start row and column and set xaxis title
    if (firstRowNames && firstColIsLabels) {
        const xAxisTitle = rows[0][0];
        var startRow = 1;
        var startColumn = 1;
    } else if (firstRowNames && !firstColIsLabels) {
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

    // Find number of datasets
    let rowLengths = rows.map((row) => {
        return row.length;
    });
    numberOfDatasets = Math.min(...rowLengths) - startColumn;

    // Compress rows so that number of columns is consistent:
    // While too many columns, combine adjacent text entries.
    compressRows(rows, numberOfDatasets + startColumn);

    // Generate labels
    const numberOfPoints = rows.length - startRow;
    var dataLabels = new Array(numberOfPoints);
    rows.forEach(function (row, idx) {
        if (idx > startRow - 1) {
            if (firstColIsLabels) {
                dataLabels[idx - startRow] = row[0];
            } else {
                dataLabels[idx - startRow] = idx - startRow;
            }
        }
    });

    // Collect datasets
    let dataSetsArray = [];
    for (let step = 0; step < numberOfDatasets; step++) {
        dataSetsArray.push([]);
    }
    // Push dataset values to datasetsarray[[],[]]
    rows.forEach(function (row, rowidx) {
        row.forEach(function (value, columnidx) {
            if (rowidx >= startRow && columnidx >= startColumn) {
                let dataSetIdx = columnidx - startColumn;
                dataSetsArray[dataSetIdx].push(value);
            }
        });
    });
    // Add datasets to object
    let dataSetsObjList = [];
    dataSetsArray.forEach(function (dataSet, dataSetIdx) {
        let datasetobj = {};
        if (firstRowNames) {
            datasetobj.label = String(rows[0][dataSetIdx + startColumn]);
        } else {
            datasetobj.label = 'Dataset ' + String(dataSetIdx + 1);
        }
        datasetobj.backgroundColor = COLORS[dataSetIdx % NUM_COLORS];
        datasetobj.borderColor = COLORS[dataSetIdx % NUM_COLORS];
        datasetobj.data = dataSetsArray[dataSetIdx];
        dataSetsObjList.push(datasetobj);
    });

    // Generate data and config structures
    let data = {
        labels: dataLabels,
        datasets: dataSetsObjList,
    };
    let config = {
        type: chartType,
        data: data,
        options: {},
    };
    let graphDataObj = {
        labels: dataLabels,
        data: data,
        config: config,
    };
    return graphDataObj;
}

// Helper functions used by main logic
/**
 * Returns string of currently selected text.
 * */
function getAndStoreCurrentSel() {
    return window.getSelection().toString();
}

/**
 * Input array mutated as follows:
 * For every subarray of rows, combine adjacent text
 * entries left to right until length of subarray is
 * equal to desiredWidth.
 * @param {array} rows
 * @param {int} desiredWidth
 */
function compressRows(rows, desiredWidth) {
    rows.forEach(function (row) {
        while (row.length > desiredWidth) {
            // text indices: e.g. [0,1]
            let textIndices = getFirstAdjacentTextIndices(row);
            // If two strings available, then
            // combine the entries at the two string indices.
            // otherwise just combine the first two entries.
            if (textIndices.length == 2) {
                combineArrayPair(row, textIndices, ' ');
            } else {
                combineArrayPair(row, [0, 1], ' ');
            }
        }
    });
}

/**
 * Returns the array of indices of the first occuring pair of
 * adjacent elements in the array where both are of
 * type: "string". Otherwise returns empty array.
 * @param {array} row array of strings and/or ints
 * @returns [] or [i,j]
 */
function getFirstAdjacentTextIndices(row) {
    let indices = [];
    row.forEach(function (element, idx) {
        isString = typeof element == 'string';
        if (isString) {
            indices.push(idx);
        }
    });
    let validPairs = [];
    indices.forEach(function (element, idx) {
        if (idx < indices.length && indices[idx + 1] - element == 1) {
            validPairs.push(indices.slice(idx, idx + 2));
        }
    });
    if (validPairs.length > 0) {
        return validPairs[0];
    }
    return [];
}

/**
 * Input array is mutated as follows:
 * Takes an array of two indices i, j and
 * combines the strings at indices i, j in array,
 * placing them at index i, and deleting the
 * item at the index j. Items will be separated by 'separator'.
 * a = ['2','t','y','u']
 * combineArrayPair(a,[1,2],' ') -> a = ['2','t y','u']
 * @param {*} array
 * @param {*} indices [i,j]
 * @param {*} separator e.g. ' '
 */
function combineArrayPair(array, indices, separator) {
    let first = indices[0];
    let second = indices[1];
    array[first] = String(array[first]) + separator + String(array[second]);
    array.splice(second, 1);
}

/**
 * Matrix transpose an array of arrays. (i.e. swap rows and columns).
 * Return a new array.
 */
function transpose(inputArray) {
    return Object.keys(inputArray[0]).map(function (col) {
        return inputArray.map(function (row) {
            return row[col];
        });
    });
}
