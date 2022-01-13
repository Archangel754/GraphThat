
/*
Get the graphDataObj stored by popup.js from 
chrome.storage.sync and plot it using chart.js
*/
var myChart
chrome.storage.sync.get('graphData', function (result) {
    let graphData = result.graphData[0];
    var config = graphData.config;
    myChart = new Chart(document.getElementById('myChart'), config);
    // addVisibilityButtons()
});

let addGraphTitleButton = document.getElementById('addGraphTitleButton')
let addXAxisTitleButton = document.getElementById('addXAxisTitleButton')
let addYAxisTitleButton = document.getElementById('addYAxisTitleButton')

addGraphTitleButton.addEventListener('click', async () => {
    let userText = document.getElementById('userInputTextBox').value;
    addGraphTitle(userText);
})

addXAxisTitleButton.addEventListener('click', async () => {
    let userText = document.getElementById('userInputTextBox').value;
    addAxisTitle(userText,'x');
})

addYAxisTitleButton.addEventListener('click', async () => {
    let userText = document.getElementById('userInputTextBox').value;
    addAxisTitle(userText,'y');
})

// Add toggle visibility buttons for each dataset
function addVisibilityButtons() {
    let numberOfDatasets = myChart.data.datasets.length;
    //numberOfDatasets = 3
    for (let index = 0; index < numberOfDatasets; index++) {
        const datasetID = index;
        let visButton = document.createElement('button');
        visButton.innerHTML = datasetID;
        visButton.id = 'visibilityBotton'+datasetID.toString()
        document.body.appendChild(visButton); 
        let buttonElement = document.getElementById('visibilityBotton'+datasetID.toString())
        buttonElement.addEventListener('click', async () => {
            myChart.hide(datasetID);
        })

    }
}

/**
 * Add userText string as graph title and refreshes graph.
 * Supported labelType's: 'title'
 * @param {*} userText 
 */
function addGraphTitle(userText) {
    myChart.options.plugins.title.text = userText;
    myChart.options.plugins.title.display = true;
    myChart.update();
}

/**
 * Adds userText as label for x or y axis.
 * axis: 'x', or 'y'
 * @param {string} userText 
 * @param {*} axis 
 */
function addAxisTitle(userText, axis) {
    myChart.options.scales[axis].title.text = userText;
    myChart.options.scales[axis].title.display = true;
    myChart.update();
}