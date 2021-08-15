//compounding feacture
let startingAmount;
let interest;
let cycle;
let monthlyInvestment;

document.getElementById("form01").addEventListener("submit", (event) => {
  event.preventDefault();
  let chartCompoundingDatapoints = [];

  startingAmount = +document.getElementById("startingAmount").value;
  interest = +document.getElementById("interest").value;
  cycle = +document.getElementById("cycle").value;
  monthlyInvestment = +document.getElementById("monthlyInvestment").value;
  let newPrincipal = startingAmount;

  for (let i = 0; i < cycle * 12; i++) {
    newPrincipal += newPrincipal * (interest / 12) * 0.01;
    chartCompoundingDatapoints.push([i, newPrincipal]);
    newPrincipal += monthlyInvestment;
  }
  let divCompute = document.createElement("div");

  let h2Compute = document.createElement("h2");
  h2Compute.innerText =
    "The Resultant Amount:- " +
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Math.trunc(newPrincipal));
  h2Compute.style.textAlign = "center";
  h2Compute.style.color = "white";
  h2Compute.classList.add("bg-dark");
  h2Compute.style.margin = "10px 0px";
  h2Compute.style.padding = "10px";
  divCompute.appendChild(h2Compute);
  document.getElementById("compute01").innerHTML = divCompute.innerHTML;

  console.log(startingAmount, interest, cycle, monthlyInvestment);
  console.log(typeof startingAmount);

  google.charts.load("current", { packages: ["corechart", "line"] });
  google.charts.setOnLoadCallback(drawBasic);

  function drawBasic() {
    var data = new google.visualization.DataTable();
    data.addColumn("number", "");
    data.addColumn("number", "Amount: ");

    data.addRows(chartCompoundingDatapoints);

    var options = {
      hAxis: {
        title: "Months",
      },
      vAxis: {
        title: "Amount At Particular Month",
      },
    };

    var chart = new google.visualization.LineChart(
      document.getElementById("chart_div")
    );

    chart.draw(data, options);
  }

  document.getElementById("startingAmount").value = "";
  document.getElementById("interest").value = "";
  document.getElementById("cycle").value = "";
  document.getElementById("monthlyInvestment").value = "";
  startingAmount = 0;
  interest = 0;
  cycle = 0;
  monthlyInvestment = 0;
  console.log(chartCompoundingDatapoints);
});
