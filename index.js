// this is a variable for storing News Cart and related HTML
let newsDiv = "";

//fetchNew is a function to load a news data into the newsDiv variable by calling the News API and render it onto the screen(DOM)
const fetchNew = async () => {
  const response = await fetch(
    "https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey=28b7fb17349b4580869be56c00785428"
  );
  const data = await response.json();
  //   console.log(data.articles);
  for (const item of data.articles) {
    newsDiv =
      newsDiv +
      `<div class="col">
      <div class="card h-100">
          <img src="${item.urlToImage}" class="card-img-top" alt="...">
          <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
              <p class="card-text">${item.description}</p>
              <h6 class="card-title">source :- <a href=${item.url}>${item.source.name}</a></h6>
          </div>
      </div>
      </div>`;
    // console.log(item.title);
    // console.log(item.description);
    // console.log(item.urlToImage);
  }
  //   console.log(newsDiv);
  const newdiv01 = document.getElementById("newsdiv01");
  newdiv01.innerHTML = newsDiv;
};

//this is a function call for rendening data onto the DOM
fetchNew();
//this is a testing
// console.log(newsDiv);
// console.log(data);

//summeryDiv is a variable to load carts of market summary,by calling the yahoofinance API
let summeryDiv = "";
//function to put cart detail in the summaryDiv variable
const fetchSummary = async () => {
  const response = await fetch(
    "https://rest.yahoofinanceapi.com/v6/finance/quote/marketSummary",
    {
      headers: {
        accept: "application/json",
        "X-API-KEY": "jwoxQ4QgTA4qpmfjWIJGM6vtwPOABEI07G1LhvKC",
      },
    }
  );
  const data = await response.json();
  for (const market of data.marketSummaryResponse.result) {
    let displayPrice = ``;
    if (market.regularMarketChange.fmt < 0) {
      displayPrice = `<h6  style="text-align: center;  font-weight: bolder">${market.regularMarketPrice.fmt} <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="red" class="bi bi-arrow-down-square-fill" viewBox="0 0 16 16">
      <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zm6.5 4.5v5.793l2.146-2.147a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .708-.708L7.5 10.293V4.5a.5.5 0 0 1 1 0z"/>
    </svg><small style="color:red;"> ( ${market.regularMarketChange.fmt} )</small><small style="color:red;"> ( ${market.regularMarketChangePercent.fmt} )</small><small>( ${market.regularMarketTime.fmt} )</small></h6>`;
    } else {
      displayPrice = `<h6  style="text-align: center; font-weight: bolder">${market.regularMarketPrice.fmt} <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="green" class="bi bi-arrow-up-square-fill" viewBox="0 0 16 16">
      <path d="M2 16a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2zm6.5-4.5V5.707l2.146 2.147a.5.5 0 0 0 .708-.708l-3-3a.5.5 0 0 0-.708 0l-3 3a.5.5 0 1 0 .708.708L7.5 5.707V11.5a.5.5 0 0 0 1 0z"/>
    </svg><small style="color:green;"> ( ${market.regularMarketChange.fmt} )</small><small style="color:green;"> ( ${market.regularMarketChangePercent.fmt} )</small><small>( ${market.regularMarketTime.fmt} )</small></h6>`;
    }
    // console.log(displayPrice);
    summeryDiv =
      summeryDiv +
      `<div class="col">
        <div class="card">

            <div class="card-body">
                <h5 class="card-title" style="text-align: center;">${market.shortName}(${market.symbol}) <small class="card-title">
                       ${market.quoteType}
                    </small></h5>

                ${displayPrice}

              
                <table class="table my-2">
                    <thead style="text-align: center;">
                        <tr>
                            <th scope="col">Exchange</th>
                            <td scope="col">${market.exchange}</td>

                        </tr>
                    </thead>
                    <tbody style="text-align: center;">
                        <tr>
                            <th scope="row">Exchange Timezone</th>
                            <td>${market.exchangeTimezoneName}</td>
                            

                        </tr>
                        <tr>
                            <th scope="row">Market Status</th>
                            <td>${market.marketState}</td>

                        </tr>
                        <tr>
                            <th scope="row">Region</th>
                            <td colspan="2">${market.region}</td>

                        </tr>
                        <tr>
                            <th scope="row">Previous Closing</th>
                            <td colspan="2">${market.regularMarketPreviousClose.fmt}</td>

                        </tr>
                        
                        
                    </tbody>
                </table>
            </div>
        </div>
    </div>`;
  }

  console.log(data.marketSummaryResponse.result);
  const summeryDiv01 = document.getElementById("marketSummaryDiv");
  summeryDiv01.innerHTML = summeryDiv;
};
//function call to render summeryDiv detail onto the screen
fetchSummary();
