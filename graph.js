/*
Get the graphDataObj stored by popup.js from 
chrome.storage.sync and plot it using chart.js
*/
chrome.storage.sync.get('graphData', function (result) {
    let graphData = result.graphData[0];
    var config = graphData.config;
    var myChart = new Chart(document.getElementById('myChart'), config);
});
