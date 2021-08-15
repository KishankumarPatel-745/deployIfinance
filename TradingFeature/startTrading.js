'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Kishan Patel',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-07-26T17:01:17.194Z',
    '2020-07-28T23:36:17.929Z',
    '2020-08-01T10:51:36.790Z',
  ],
  holdings: [
    {
      instrument: 'AAPL',
      quantity: 20,
      buyingPrice: 200.9,
    },
    {
      instrument: 'GOOGL',
      quantity: 12,
      buyingPrice: 2400,
    },
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Kritika Gupta',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  holdings: [
    {
      instrument: 'MSFT',
      quantity: 10,
      buyingPrice: 270,
    },
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions
// Event handlers
let currentAccount, timer;

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);
  // console.log(daysPassed);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  // const day = `${date.getDate()}`.padStart(2, 0);
  // const month = `${date.getMonth() + 1}`.padStart(2, 0);
  // const year = date.getFullYear();
  // return `${day}/${month}/${year}`;
  return new Intl.DateTimeFormat(locale).format(date);
};

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

//Under Development
const summarySection = () => {
  const totalInv = currentAccount.holdings.reduce(
    (acc, ele) => acc + ele.buyingPrice * ele.quantity,
    0
  );
  const currentAmount = currentAccount.holdings.reduce(
    (acc, ele) => acc + ele.currentValue * ele.quantity,
    0
  );
  const profitEle = document.getElementById('pl01');
  const profit = currentAmount - totalInv;
  const percentPL = ((currentAmount - totalInv) * 100) / totalInv;
  console.log(totalInv, currentAmount, profit);
  document.getElementById(
    'total01'
  ).innerText = `Total Investment: ${totalInv.toFixed(2)}`;
  document.getElementById(
    'current01'
  ).innerText = `Current Value: ${currentAmount.toFixed(2)}`;
  profit >= 0
    ? (profitEle.style.color = 'green')
    : (profitEle.style.color = 'red');
  profitEle.innerText = `Profit/Loss: ${profit.toFixed(
    2
  )} ( ${percentPL.toFixed(2)}% )`;
};

const populateCurrentPrice = async () => {
  currentAccount.holdings.forEach(async (ele, ind) => {
    const response = await fetch(
      `https://yfapi.net/v6/finance/quote?region=US&lang=en&symbols=${ele.instrument}`,
      {
        headers: {
          accept: 'application/json',
          'X-API-KEY': 'jwoxQ4QgTA4qpmfjWIJGM6vtwPOABEI07G1LhvKC',
        },
      }
    );

    const data = await response.json();

    console.log(data);
    //object currentValues Creation
    currentAccount.holdings[ind].currentValue =
      data?.quoteResponse.result[0].regularMarketPreviousClose;
  });
  drawBarChart();
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);

  //Display BarChart
  //fetch data from yahooApi and create the currentValues property in the holdings Object.
  populateCurrentPrice();

  // console.log(currentAccount.holdings[0]);
  //Draw Graph in the barChart and click on the graph to get further rendering
  drawBarChart();

  //Display portpolio table
};

const drawBarChart = () => {
  console.log('inside the draw');
  google.charts.load('current', { packages: ['bar'] });
  google.charts.setOnLoadCallback(drawChart);
  console.log(currentAccount);
  function drawChart() {
    let data = google.visualization.arrayToDataTable([
      [
        'Status',
        ...currentAccount?.holdings.map(ele => ele.instrument),
        { role: 'annotation' },
      ],

      [
        'CurrentValue',
        ...currentAccount?.holdings.map(ele => ele.currentValue * ele.quantity),
        '',
      ],
      [
        'InvestmentValue',
        ...currentAccount?.holdings.map(ele => ele.buyingPrice * ele.quantity),
        '',
      ],
      [
        'Profit/loss',
        ...currentAccount.holdings.map(
          ele => (ele.currentValue - ele.buyingPrice) * ele.quantity
        ),
        '',
      ],
    ]);
    let options = {
      width: 600,
      height: 400,
      legend: { position: 'top', maxLines: 3 },
      bar: { groupWidth: '75%' },
      isStacked: true,
    };
    let chart = new google.charts.Bar(document.getElementById('barchart'));

    chart.draw(data, google.charts.Bar.convertOptions(options));
  }
  if (currentAccount.holdings[0]?.currentValue !== undefined) {
    summarySection();
    if (currentAccount !== undefined) {
      // document.querySelector('table').remove();
      summaryTableRendering();
    }
  }
};

//event listener to update Charts and Summary of the Portfolio
document
  .getElementById('barchart')
  .addEventListener('click', populateCurrentPrice);

const summaryTableRendering = function () {
  const dataRows = function () {
    let rows = ``;
    currentAccount.holdings.forEach(ele => {
      const profitLoss = (
        (ele.currentValue - ele.buyingPrice) *
        ele.quantity
      ).toFixed(2);
      const percent = (profitLoss * 100) / (ele.buyingPrice * ele.quantity);
      rows += `<tr>
      <th  class="font-weight-bold" style="font-size:18px;text-align:center" scope="row">${
        ele.instrument
      }</th>
      <td class="font-weight-bold" style="font-size:18px;text-align:center" >${ele.quantity.toFixed(
        2
      )}</td>
      <td class="font-weight-bold" style="font-size:18px;text-align:center" >${ele.buyingPrice.toFixed(
        2
      )}</td>
      <td class="font-weight-bold" style="font-size:18px;text-align:center" >${ele.currentValue.toFixed(
        2
      )}</td>
      <td class="font-weight-bold" style="font-size:18px;text-align:center" >${(
        ele.currentValue * ele.quantity
      ).toFixed(2)}</td>
      <td  class="font-weight-bold" style="font-size:18px;text-align:center;color:${
        profitLoss >= 0 ? 'green' : 'red'
      };">${profitLoss}</td>
      <td  class="font-weight-bold" style="font-size:18px;text-align:center;color:${
        profitLoss >= 0 ? 'green' : 'red'
      };" >${percent.toFixed(2)} %</td>
    </tr>`;
    });
    return rows;
  };

  let tableData = `<table class="table"><thead>
  <th  class="font-weight-bold" style="font-size:18px;text-align:center" scope="col">Instrument</th>
  <th  class="font-weight-bold" style="font-size:18px;text-align:center" scope="col">Qty.</th>
  <th  class="font-weight-bold" style="font-size:18px;text-align:center" scope="col">Cost Per Stock</th>
  <th  class="font-weight-bold" style="font-size:18px;text-align:center" scope="col">Current Price</th>
  <th  class="font-weight-bold" style="font-size:18px;text-align:center" scope="col">Current Value</th>
  <th  class="font-weight-bold" style="font-size:18px;text-align:center" scope="col">P&L</th>
  <th  class="font-weight-bold" style="font-size:18px;text-align:center" scope="col">Net Change(%)</th></thead><tbody>${dataRows()}</tbody><table>`;
  document.querySelector('.operation-table').innerHTML = tableData;
};

const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    // In each call, print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;

    // When 0 seconds, stop timer and log out user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }

    // Decrease 1s
    time--;
  };

  // Set time to 5 minutes
  let time = 300;

  // Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);

  return timer;
};

///////////////////////////////////////

// FAKE ALWAYS LOGGED IN
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Create current date and time
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      // weekday: 'long',
    };
    // const locale = navigator.language;
    // console.log(locale);

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Timer
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    // Update UI
    updateUI(currentAccount);

    document.querySelector('.operation-table').innerHTML = '';
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);

    // Reset timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

//add/withdrawal of money
document.getElementById('addBtn01').addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Math.floor(document.getElementById('tranc01').value);
  console.log(amount);
  const balance01 = currentAccount.movements.reduce((acc, ele) => acc + ele, 0);
  console.log(balance01);
  if (amount < 0 && balance01 > Math.abs(amount)) {
    console.log('inside ');
    currentAccount.movements.push(amount);
    currentAccount.movementsDates.push(new Date().toISOString());
  } else if (amount > 0) {
    currentAccount.movements.push(amount);
    currentAccount.movementsDates.push(new Date().toISOString());
  }
  updateUI(currentAccount);
  document.getElementById('tranc01').value = '';
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // Add movement
      currentAccount.movements.push(amount);

      // Add loan date
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);

      // Reset timer
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
  labelWelcome.textContent = 'Log in to get started';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  // BUG in video:
  // displayMovements(currentAccount.movements, !sorted);

  // FIX:
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

//Model window
const modal = document.querySelector('.modal01');
const overlay = document.querySelector('.overlay01');
const btnCloseModal = document.querySelector('.btn--close-modal');
const btnsOpenModal = document.querySelector('.btn--show-modal');

const openModal = function (e) {
  e.preventDefault();
  modal.classList.remove('hidden');
  overlay.classList.remove('hidden');
};

const closeModal = function () {
  modal.classList.add('hidden');
  overlay.classList.add('hidden');
};

btnsOpenModal.addEventListener('click', openModal);

btnCloseModal.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal();
  }
});

// const account2 = {
//   owner: 'Jessica Davis',
//   movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
//   interestRate: 1.5,
//   pin: 2222,

//   movementsDates: [
//     '2019-11-01T13:15:33.035Z',
//     '2019-11-30T09:48:16.867Z',
//     '2019-12-25T06:04:23.907Z',
//     '2020-01-25T14:18:46.235Z',
//     '2020-02-05T16:33:06.386Z',
//     '2020-04-10T14:43:26.374Z',
//     '2020-06-25T18:49:59.371Z',
//     '2020-07-26T12:01:20.894Z',
//   ],
//   holdings: {},
//   currency: 'USD',
//   locale: 'en-US',
// };
const openAccountBtn = document.getElementById('openBtn01');
// to send email
// const sendEmail = function (email, name) {
//   Email.send({
//     Host: 'smtp.gmail.com',
//     Username: 'kishanthegreat45c1er@gmail.com',
//     Password: 'ccccccc',
//     To: email,
//     From: 'kishanthegreat45c1er@gmail.com',
//     Subject: `Hello ${name}, I-Finance account has been opened.`,
//     Body: `Hi ${name},
//      Your account has been opened, pls use user initials as a username and pin as a password for login.
//      Thanks Team I-Finance`,
//   }).then(message => console.log('mail sent successfully', message));
// };

openAccountBtn.addEventListener('click', function (e) {
  e.preventDefault();
  const owner = document.getElementById('name01');
  const pin = document.getElementById('pin01');
  const email = document.getElementById('email01');
  const username = owner.value
    .toLowerCase()
    .split(' ')
    .map(name => name[0])
    .join('');

  const newAccount = {
    owner: owner.value,
    movements: [],
    interestRate: 1.5,
    pin: +pin.value,
    movementsDates: [],
    holdings: [],
    currency: 'USD',
    locale: 'en-US',
    username,
  };
  accounts.push(newAccount);
  // sendEmail(email.value, owner.value  );
  owner.value = '';
  pin.value = '';
  email.value = '';
  closeModal();
});

const findBalance = () => {
  return currentAccount.movements.reduce((acc, ele) => acc + ele, 0);
};
//Stock buying
document.getElementById('btnStock01').addEventListener('click', function (e) {
  e.preventDefault();
  const stockSymbol = document.getElementById('sym01');
  const quantity = document.getElementById('quan01');
  const price = document.getElementById('price01');
  const balance = findBalance();
  const amount = Number(quantity.value) * Number(price.value);
  if (quantity.value > 0 && price.value > 0 && balance >= amount) {
    currentAccount.movements.push(-amount);
    currentAccount.movementsDates.push(new Date().toISOString());
    currentAccount.holdings.push({
      instrument: stockSymbol.value,
      quantity: +quantity.value,
      buyingPrice: +price.value,
    });
  }
  stockSymbol.value = '';
  quantity.value = '';
  price.value = '';
  updateUI(currentAccount);
});

//Selling the Stock
document.getElementById('btnStock02').addEventListener('click', function (e) {
  e.preventDefault();
  const stockSymbol = document.getElementById('sym02');
  const quantity = document.getElementById('quan02');
  const price = document.getElementById('price02');
  const amount = Number(quantity.value) * Number(price.value);
  currentAccount.holdings.forEach((ele, index) => {
    if (ele.instrument === stockSymbol.value) {
      currentAccount.holdings.splice(index, 1);
    }
  });
  currentAccount.movements.push(amount);
  currentAccount.movementsDates.push(new Date().toISOString());
  console.log(currentAccount.holdings);
  stockSymbol.value = '';
  quantity.value = '';
  price.value = '';
  updateUI(currentAccount);
});
