    // this must be in a .js file not in html, because chrome does
    // not allow inline javascript. must be 
    // called from html with: <script src="chart.js"></script>
    // old sourcs: "https://cdn.jsdelivr.net/npm/chart.js"
    // make sure to add MIT license to extension folder later
    // === include 'setup' then 'config' above ===
    const labels = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
      ];
      const data = {
        labels: labels,
        datasets: [{
          label: 'My First dataset',
          backgroundColor: 'rgb(255, 99, 132)',
          borderColor: 'rgb(255, 99, 132)',
          data: [0, 10, 5, 2, 20, 30, 45],
        }]
      };
      
      const config = {
        type: 'line',
        data: data,
        options: {}
      };
      
      const myChart = new Chart(
          document.getElementById('myChart'),
          config
      );