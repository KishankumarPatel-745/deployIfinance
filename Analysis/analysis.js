//elements from Html
const form = document.getElementById("formSearch01");
const stockValue = document.getElementById("stockValue01");
const navBar = document.querySelector(".navbar");

const renderCompanyBasicsAndGraphAndTrend = async function (stockName) {
  //
  const response = await fetch(
    `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${stockName}&apikey=JBKGMVAVTGA2SJ5I`
  );
  const data = await response.json();
  //   const data = JSON.parse(localStorage.getItem("sampleStock"));
  console.log(data);

  //for drawing a trend Of the Stock..
  const trendDiv = document.createElement("div");
  trendDiv.setAttribute("id", "trendDiv");
  navBar.insertAdjacentElement("afterend", trendDiv);
  //Created Div element.. for the trendLine Graph..

  const loadDataForTrendAndDraw = async function () {
    const res = await fetch(
      `https://yfapi.net/v8/finance/chart/${stockName}?comparisons=MSFT%2C%5EVIX&range=5y&region=US&interval=1mo&lang=en&events=div%2Csplit`,
      {
        headers: {
          accept: "application/json",
          "X-API-KEY": "jwoxQ4QgTA4qpmfjWIJGM6vtwPOABEI07G1LhvKC",
        },
      }
    );
    const data01 = await res.json();
    console.log(data01);
    const chartResultsData01 = data01["chart"]["result"][0];
    const quoteData01 = chartResultsData01["indicators"]["quote"][0];
    const dataforLine = chartResultsData01["timestamp"].map((time, index) => [
      new Date(time * 1000),
      quoteData01["close"][index],
    ]);
    google.charts.load("current", { packages: ["corechart"] });
    google.charts.setOnLoadCallback(drawChart);
    function drawChart() {
      var data = google.visualization.arrayToDataTable([
        ["Time", "Price"],
        ...dataforLine,
      ]);

      var options = {
        title: `Trend of ${stockName} using Exponential Method for last 5 year.`,
        hAxis: { title: "Time" },
        vAxis: { title: "Price" },
        trendlines: {
          0: {
            type: "exponential",
            visibleInLegend: true,
          },
        },
      };

      var chart = new google.visualization.ScatterChart(
        document.getElementById("trendDiv")
      );
      chart.draw(data, options);
    }
  };
  loadDataForTrendAndDraw();

  //Chart Code
  //Generating Element to Render the Graph
  const chartDiv = document.createElement("div");
  chartDiv.setAttribute("id", "chart");
  navBar.insertAdjacentElement("afterend", chartDiv);
  // Fectching Require data and drawing this on the chartDiv
  const loadData = fetch(
    `https://yfapi.net/v8/finance/chart/${stockName}?comparisons=MSFT%2C%5EVIX&range=1y&region=US&interval=1d&lang=en&events=div%2Csplit`,
    {
      headers: {
        accept: "application/json",
        "X-API-KEY": "jwoxQ4QgTA4qpmfjWIJGM6vtwPOABEI07G1LhvKC",
      },
    }
  )
    .then((response) => response.json())
    .then((data) => {
      const chartResultsData = data["chart"]["result"][0];
      const quoteData = chartResultsData["indicators"]["quote"][0];
      return chartResultsData["timestamp"].map((time, index) => ({
        date: new Date(time * 1000),
        high: quoteData["high"][index],
        low: quoteData["low"][index],
        open: quoteData["open"][index],
        close: quoteData["close"][index],
        volume: quoteData["volume"][index],
      }));
    });

  const movingAverage = (data, numberOfPricePoints) => {
    return data.map((row, index, total) => {
      const start = Math.max(0, index - numberOfPricePoints);
      const end = index;
      const subset = total.slice(start, end + 1);
      const sum = subset.reduce((a, b) => {
        return a + b["close"];
      }, 0);

      return {
        date: row["date"],
        average: sum / subset.length,
      };
    });
  };

  loadData.then((data) => {
    initialiseChart(data);
  });

  // credits: https://brendansudol.com/writing/responsive-d3
  const responsivefy = (svg) => {
    // get container + svg aspect ratio
    const container = d3.select(svg.node().parentNode),
      width = parseInt(svg.style("width")),
      height = parseInt(svg.style("height")),
      aspect = width / height;

    // get width of container and resize svg to fit it
    const resize = () => {
      var targetWidth = parseInt(container.style("width"));
      svg.attr("width", targetWidth);
      svg.attr("height", Math.round(targetWidth / aspect));
    };

    // add viewBox and preserveAspectRatio properties,
    // and call resize so that svg resizes on inital page load
    svg
      .attr("viewBox", "0 0 " + width + " " + height)
      .attr("perserveAspectRatio", "xMinYMid")
      .call(resize);

    // to register multiple listeners for same event type,
    // you need to add namespace, i.e., 'click.foo'
    // necessary if you call invoke this function for multiple svgs
    // api docs: https://github.com/mbostock/d3/wiki/Selections#on
    d3.select(window).on("resize." + container.attr("id"), resize);
  };

  const initialiseChart = (data) => {
    data = data.filter(
      (row) => row["high"] && row["low"] && row["close"] && row["open"]
    );

    const thisYearStartDate = new Date(2018, 0, 1);

    // filter out data based on time period
    data = data.filter((row) => {
      if (row["date"]) {
        return row["date"] >= thisYearStartDate;
      }
    });

    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    const width = window.innerWidth - margin.left - margin.right; // Use the window's width
    const height = window.innerHeight - margin.top - margin.bottom; // Use the window's height

    // find data range
    const xMin = d3.min(data, (d) => {
      return d["date"];
    });

    const xMax = d3.max(data, (d) => {
      return d["date"];
    });

    const yMin = d3.min(data, (d) => {
      return d["close"];
    });

    const yMax = d3.max(data, (d) => {
      return d["close"];
    });

    // scale using range
    const xScale = d3.scaleTime().domain([xMin, xMax]).range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([yMin - 5, yMax])
      .range([height, 0]);

    // add chart SVG to the page
    const svg = d3
      .select("#chart")
      .append("svg")
      .attr("width", width + margin["left"] + margin["right"])
      .attr("height", height + margin["top"] + margin["bottom"])
      .call(responsivefy)
      .append("g")
      .attr("transform", `translate(${margin["left"]}, ${margin["top"]})`);

    // create the axes component
    svg
      .append("g")
      .attr("id", "xAxis")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(xScale));

    svg
      .append("g")
      .attr("id", "yAxis")
      .attr("transform", `translate(${width}, 0)`)
      .call(d3.axisRight(yScale));

    // renders close price line chart and moving average line chart

    // generates lines when called
    const line = d3
      .line()
      .x((d) => {
        return xScale(d["date"]);
      })
      .y((d) => {
        return yScale(d["close"]);
      });

    const movingAverageLine = d3
      .line()
      .x((d) => {
        return xScale(d["date"]);
      })
      .y((d) => {
        return yScale(d["average"]);
      })
      .curve(d3.curveBasis);

    svg
      .append("path")
      .data([data]) // binds data to the line
      .style("fill", "none")
      .attr("id", "priceChart")
      .attr("stroke", "steelblue")
      .attr("stroke-width", "1.5")
      .attr("d", line);

    // calculates simple moving average over 50 days
    const movingAverageData = movingAverage(data, 49);
    svg
      .append("path")
      .data([movingAverageData])
      .style("fill", "none")
      .attr("id", "movingAverageLine")
      .attr("stroke", "#FF8900")
      .attr("d", movingAverageLine);

    // renders x and y crosshair
    const focus = svg
      .append("g")
      .attr("class", "focus")
      .style("display", "none");

    focus.append("circle").attr("r", 4.5);
    focus.append("line").classed("x", true);
    focus.append("line").classed("y", true);

    svg
      .append("rect")
      .attr("class", "overlay")
      .attr("width", width)
      .attr("height", height)
      .on("mouseover", () => focus.style("display", null))
      .on("mouseout", () => focus.style("display", "none"))
      .on("mousemove", generateCrosshair);

    d3.select(".overlay").style("fill", "none");
    d3.select(".overlay").style("pointer-events", "all");

    d3.selectAll(".focus line").style("fill", "none");
    d3.selectAll(".focus line").style("stroke", "#67809f");
    d3.selectAll(".focus line").style("stroke-width", "1.5px");
    d3.selectAll(".focus line").style("stroke-dasharray", "3 3");

    //returs insertion point
    const bisectDate = d3.bisector((d) => d.date).left;

    /* mouseover function to generate crosshair */
    function generateCrosshair() {
      //returns corresponding value from the domain
      const correspondingDate = xScale.invert(d3.mouse(this)[0]);
      //gets insertion point
      const i = bisectDate(data, correspondingDate, 1);
      const d0 = data[i - 1];
      const d1 = data[i];
      const currentPoint =
        correspondingDate - d0["date"] > d1["date"] - correspondingDate
          ? d1
          : d0;
      focus.attr(
        "transform",
        `translate(${xScale(currentPoint["date"])}, ${yScale(
          currentPoint["close"]
        )})`
      );

      focus
        .select("line.x")
        .attr("x1", 0)
        .attr("x2", width - xScale(currentPoint["date"]))
        .attr("y1", 0)
        .attr("y2", 0);

      focus
        .select("line.y")
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y1", 0)
        .attr("y2", height - yScale(currentPoint["close"]));

      // updates the legend to display the date, open, close, high, low, and volume of the selected mouseover area
      updateLegends(currentPoint);
    }

    /* Legends */
    const updateLegends = (currentData) => {
      d3.selectAll(".lineLegend").remove();

      const legendKeys = Object.keys(data[0]);
      const lineLegend = svg
        .selectAll(".lineLegend")
        .data(legendKeys)
        .enter()
        .append("g")
        .attr("class", "lineLegend")
        .attr("transform", (d, i) => {
          return `translate(0, ${i * 20})`;
        });
      lineLegend
        .append("text")
        .text((d) => {
          if (d === "date") {
            return `${d}: ${currentData[d].toLocaleDateString()}`;
          } else if (
            d === "high" ||
            d === "low" ||
            d === "open" ||
            d === "close"
          ) {
            return `${d}: ${currentData[d].toFixed(2)}`;
          } else {
            return `${d}: ${currentData[d]}`;
          }
        })
        .style("fill", "white")
        .attr("transform", "translate(15,9)"); //align texts with boxes
    };

    /* Volume series bars */
    const volData = data.filter(
      (d) => d["volume"] !== null && d["volume"] !== 0
    );

    const yMinVolume = d3.min(volData, (d) => {
      return Math.min(d["volume"]);
    });

    const yMaxVolume = d3.max(volData, (d) => {
      return Math.max(d["volume"]);
    });

    const yVolumeScale = d3
      .scaleLinear()
      .domain([yMinVolume, yMaxVolume])
      .range([height, height * (3 / 4)]);

    svg
      .selectAll()
      .data(volData)
      .enter()
      .append("rect")
      .attr("x", (d) => {
        return xScale(d["date"]);
      })
      .attr("y", (d) => {
        return yVolumeScale(d["volume"]);
      })
      .attr("class", "vol")
      .attr("fill", (d, i) => {
        if (i === 0) {
          return "#03a678";
        } else {
          return volData[i - 1].close > d.close ? "#c0392b" : "#03a678"; // green bar if price is rising during that period, and red when price  is falling
        }
      })
      .attr("width", 1)
      .attr("height", (d) => {
        return height - yVolumeScale(d["volume"]);
      });
    // testing axis for volume
    /*
        svg.append('g').call(d3.axisLeft(yVolumeScale));
        */
  };

  //End of Chart Code

  //Summary cards
  let htmlCompany = `
<div class="row my-2">
  <div class="col-sm-6">
    <div class="card">
      <div class="card-body">
        <h5 class="card-title">${data.Name} (${data.Symbol})</h5>
        <h3 class="card-title">${(data.EPS * data.PERatio).toFixed(
          2
        )} <small style="font-size:16px">${data.Currency} ${
    data.Exchange
  }</small></h5>
        <small> Sector: ${data.Sector}</small>
        <h6 class="card-title">Company Address:- ${data.Address}</h6>

        <p class="card-text">${data.Description}</p>

      </div>
    </div>
  </div>
  <div class="col-sm-6">
    <div class="card">
       <div class="card-body">
        <h5 class="card-title"> Company Essentials </h5>
        <table class="table">
                 <thead>
                    <tr>
                    <th scope="col">Company Parameter</th>
                    <th scope="col">Values</th>

                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th scope="row"> <button type="button" class="btn" data-bs-toggle="tooltip" data-bs-placement="top" title="Market capitalization is the aggregate valuation of the company based on its current share price and the total number of outstanding shares." style="font-weight:700">
                        Market Cap ℹ
                      </button>
                       </th>
                        <td>$${(data.MarketCapitalization / 1000000000).toFixed(
                          2
                        )} Billions</td>
                    </tr>
                    <tr>
                    <th scope="row"> <button type="button" class="btn" data-bs-toggle="tooltip" data-bs-placement="top" title="EBITDA stands for Earnings Before Interest, Taxes, Depreciation, and Amortization and is a metric used to evaluate a company's operating performance. It can be seen as a proxy for cash flow." style="font-weight:700">
                    EBITDA ℹ
                      </button>
                       </th>
                        <td>$${(data.EBITDA / 1000000000).toFixed(
                          2
                        )} Billions</td>
                    </tr>
                    <tr>

                    <th scope="row"> <button type="button" class="btn" data-bs-toggle="tooltip" data-bs-placement="top" title="EPS indicates how much money a company makes for each share of its stock and is a widely used metric for estimating corporate value." style="font-weight:700">
                    EPS (Earning Per Share) ℹ
                      </button>
                       </th>
                        <td>${data.EPS}</td>
                    </tr>
                    <tr>
                    <th scope="row"> <button type="button" class="btn" data-bs-toggle="tooltip" data-bs-placement="top" title="The price-to-earnings ratio (P/E ratio) is the ratio for valuing a company that measures its current share price relative to its per-share earnings (EPS)." style="font-weight:700">
                    PE Ratio ℹ
                      </button>
                       </th>

                        <td>${data.PERatio}</td>

                    </tr>
                    <tr>
                    <th scope="row"> <button type="button" class="btn" data-bs-toggle="tooltip" data-bs-placement="top" title="The book value of a company is the net difference between that company's total assets and total liabilities, where book value reflects the total value of a company's assets that shareholders of that company would receive if the company were to be liquidated." style="font-weight:700">
                    Book Value ℹ
                      </button>
                       </th>

                        <td>${data.BookValue}</td>
                    </tr>
                    <tr>
                    <th scope="row"> <button type="button" class="btn" data-bs-toggle="tooltip" data-bs-placement="top" title="The dividend yield–displayed as a percentage–is the amount of money a company pays shareholders for owning a share of its stock divided by its current stock price." style="font-weight:700">
                    Dividend Yield ℹ
                      </button>
                       </th>

                        <td>${data.DividendYield}</td>

                    </tr>
                    <tr>
                    <th scope="row"> <button type="button" class="btn" data-bs-toggle="tooltip" data-bs-placement="top" title="Return on equity (ROE) measures a corporation's profitability in relation to stockholders’ equity." style="font-weight:700">
                    Return On Equity ℹ
                      </button>
                       </th>

                        <td>${data.ReturnOnEquityTTM}</td>
                    </tr>
                    <tr>
                    <th scope="row"> <button type="button" class="btn" data-bs-toggle="tooltip" data-bs-placement="top" title="Beta data about an individual stock can only provide an investor with an approximation of how much risk the stock will add to a (presumably) diversified portfolio." style="font-weight:700">
                    Beta ℹ
                      </button>
                       </th>
                        <td>${data.Beta}</td>
                    </tr>
                    <tr>
                    <th scope="row"> <button type="button" class="btn" data-bs-toggle="tooltip" data-bs-placement="top" title="Highest Price Of 52 week." style="font-weight:700">
                    52 Week High ℹ
                      </button>
                       </th>

                        <td>${data["52WeekHigh"]}</td>
                    </tr>
                    <tr>
                    <th scope="row"> <button type="button" class="btn" data-bs-toggle="tooltip" data-bs-placement="top" title="Lowest Price Of 52 week." style="font-weight:700">
                    52 Week Low ℹ
                      </button>
                       </th>

                        <td>${data["52WeekLow"]}</td>
                    </tr>
            </tbody>
         </table>

      </div>
    </div>
  </div>
</div>
`;
  navBar.insertAdjacentHTML("afterend", htmlCompany);
};

//Main Function submit Event ....
const submitForm = function (e) {
  e.preventDefault();
  const stockName = stockValue.value;
  console.log(stockName);
  document.getElementById("pageLoadMessage").remove();

  renderCompanyBasicsAndGraphAndTrend(stockName);

  //clear input
  stockValue.value = "";
};

//Submit Event
form.addEventListener("submit", submitForm);
