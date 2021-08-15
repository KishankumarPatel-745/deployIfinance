let loanObj = {};
function calculator() {
  const loanstruct = {
    loanAmount: +document.getElementById("loanAmount").value,
    annualInterestrate: +document.getElementById("annualRate").value,
    loanDuration: +document.getElementById("tenure").value,
  };
  loanObj = loanstruct;
  // Passing the object as the arguement. The function also returns an object that includes both EMI & Total
  console.log(loanstruct);
  function EMIVal2(loan) {
    interest = loan.annualInterestrate / 1200;
    let term = loan.loanDuration * 12;
    let top = Math.pow(1 + interest, term);
    let bottom = top - 1;
    let ratio = top / bottom;
    EMI = loan.loanAmount * interest * ratio;
    Total = EMI * term;
    const EMIObj = {
      EMI: EMI.toFixed(0),
      Total: Total.toFixed(0),
    };
    return EMIObj;
  }
  console.log(EMIVal2(loanstruct));
  document.getElementById("loanAmount").value = "";
  document.getElementById("annualRate").value = "";
  document.getElementById("tenure").value = "";
  return EMIVal2(loanstruct);
}

document.getElementById("emiForm01").addEventListener("submit", (event) => {
  event.preventDefault();
  let emiObj = calculator();
  let principleAmount = loanObj.loanAmount;
  let totalInterestPayable = emiObj.Total - loanObj.loanAmount;
  document.getElementById("tableEMI").innerHTML = `<table class="table">
  <thead>
    <tr>
      <th scope="row">EMI</th>
      <th>$${emiObj.EMI}</th>
      
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Total Interest payable</th>
      <th>$${totalInterestPayable}</th>
      
    </tr>
    <tr>
      <th scope="row">Principal Amount</th>
      <th>$${principleAmount}</th>
      
    </tr>
    <tr>
      <th scope="row">Total Payment (Principal + Interest)</th>
      <th>$${emiObj.Total}</th>
      
    </tr>
  </tbody>
</table>`;

  google.charts.load("current", { packages: ["corechart"] });
  google.charts.setOnLoadCallback(drawChart);

  function drawChart() {
    var data = google.visualization.arrayToDataTable([
      ["Category", "amount"],
      ["Principal Amount", principleAmount],
      ["Total interest Payable", totalInterestPayable],
    ]);

    var options = {
      title: "Loan Payment Break-up",
    };

    var chart = new google.visualization.PieChart(
      document.getElementById("piechart")
    );

    chart.draw(data, options);
  }

  let h1InSchedule = document.createElement("h1");
  h1InSchedule.textContent = "Loan Repayment Schedule (Yearly)";
  h1InSchedule.style.textAlign = "center";
  h1InSchedule.classList.add("bg-dark");
  h1InSchedule.style.color = "white";
  let tableInSchedule = document.createElement("table");
  tableInSchedule.classList.add("table");
  tableInSchedule.innerHTML = `<thead>
  <tr>
    <th scope="col">Years</th>
    <th scope="col">Principal Portion (P)</th>
    <th scope="col">Interest Portion (I)</th>
    <th scope="col">Total Payment (P+I)</th>
    <th scope="col">Principal Outstanding</th>
    <th scope="col">Cumulative Interest </th>
    <th scope="col">Cumulative Principal </th>

  </tr>
</thead><tbody id="rowData"></tbody>`;
  document.getElementById(
    "loanSchedule"
  ).innerHTML = `<h1 class="bg-dark text-light py-2 my-2">Loan Repayment Schedule (Monthly)</h1>
  <table class='table'><thead>
  <tr>
    <th scope="col">Month</th>
    <th scope="col">Principal Portion (P)</th>
    <th scope="col">Interest Portion (I)</th>
    <th scope="col">Total Payment (P+I)</th>
    <th scope="col">Principal Outstanding</th>
    <th scope="col">Cumulative Interest </th>
    <th scope="col">Cumulative Principal </th>

  </tr>
</thead><tbody id="rowData"></tbody></table>`;
  let barDataArray = [];
  let principalPortion = 0;
  let interestPortion = 0;
  let principalOutstanding = loanObj.loanAmount;
  let cumulativeInterest = 0;
  let cumulativePrincipal = 0;
  let totalHapta = emiObj.EMI;
  let tableRows = ``;

  for (let i = 1; i < +loanObj.loanDuration * 12; i++) {
    interestPortion =
      (principalOutstanding * loanObj.annualInterestrate) / 1200;
    principalOutstanding += interestPortion - totalHapta;
    principalPortion = totalHapta - interestPortion;
    cumulativeInterest += interestPortion;
    cumulativePrincipal += principalPortion;
    barDataArray.push([
      String(i),
      Math.trunc(interestPortion),
      Math.trunc(principalPortion),
      "",
    ]);
    tableRows += `<tr style="text-align:center">
    <th scope="row">${i}</th>
    <td>${Math.trunc(principalPortion)}</td>
    <td>${Math.trunc(interestPortion)}</td>
    <td>${Math.trunc(totalHapta)}</td>
    <td>${Math.trunc(principalOutstanding)}</td>
    <td>${Math.trunc(cumulativeInterest)}</td>
    <td>${Math.trunc(cumulativePrincipal)}</td>
  </tr>`;
  }

  google.charts.load("current", { packages: ["corechart"] });
  google.charts.setOnLoadCallback(barChart);
  function barChart() {
    var data = google.visualization.arrayToDataTable([
      [
        "Genre",
        "Interest Portion",
        "Principal Portion",
        { role: "annotation" },
      ],
      //spead the array
      ...barDataArray,
      //   ["2030", 28, 19, 29, 30, 12, 13, ""],
    ]);

    var options = {
      width: 800,
      height: 1500,
      legend: { position: "top", maxLines: 3 },
      bar: { groupWidth: "75%" },
      isStacked: true,
    };
    var chartBar = new google.visualization.BarChart(
      document.getElementById("barChart")
    );
    chartBar.draw(data, options);
  }
  document.getElementById("rowData").innerHTML = tableRows;
});
