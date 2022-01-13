
/*
Get the graphDataObj stored by popup.js from 
chrome.storage.sync and plot it using chart.js
*/
var myChart
chrome.storage.sync.get('graphData', function (result) {
    let graphData = result.graphData[0];
    var config = graphData.config;
    myChart = new Chart(document.getElementById('myChart'), config);
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