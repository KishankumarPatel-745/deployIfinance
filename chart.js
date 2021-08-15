dataArrayToChart = [];

const dataPreparation = async () => {
  const response = await fetch(
    "https://rest.yahoofinanceapi.com/v8/finance/chart/DJIA?range=1y&region=US&interval=1d&lang=en&events=div%2Csplit",
    {
      headers: {
        accept: "application/json",
        "X-API-KEY": "jwoxQ4QgTA4qpmfjWIJGM6vtwPOABEI07G1LhvKC",
      },
    }
  );
  const data = await response.json();
  console.log(data);
  timeArray = data.chart.result[0].timestamp;
  lowArray = data.chart.result[0].indicators.quote[0].low;
  openArray = data.chart.result[0].indicators.quote[0].open;
  closeArray = data.chart.result[0].indicators.quote[0].close;
  highArray = data.chart.result[0].indicators.quote[0].high;
  let tempArray;
  for (let i = 190; i < 252; i++) {
    tempArray = [];
    tempArray.push(new Date(timeArray[i] * 1000));
    tempArray.push(lowArray[i]);
    tempArray.push(openArray[i]);
    tempArray.push(closeArray[i]);
    tempArray.push(highArray[i]);
    dataArrayToChart.push(tempArray);
  }
};

dataPreparation();

google.charts.load("current", { packages: ["corechart"] });
google.charts.setOnLoadCallback(drawChart);

function drawChart() {
  var data = google.visualization.arrayToDataTable(dataArrayToChart, true);

  var options = {
    legend: "none",
    bar: { groupWidth: "100%" }, // Remove space between bars.
    candlestick: {
      fallingColor: { strokeWidth: 0, fill: "#a52714" }, // red
      risingColor: { strokeWidth: 0, fill: "#0f9d58" }, // green
    },
  };

  var chart = new google.visualization.CandlestickChart(
    document.getElementById("chart_div")
  );

  chart.draw(data, options);
}
