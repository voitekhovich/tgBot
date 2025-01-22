const jsdom = require("jsdom");
const moment = require("moment");

const BCSE_SRC = "https://www.bcse.by/";

const { JSDOM } = jsdom;

const getBcse = () => {
  
  const parse = (elem) => {
    const element = elem.firstElementChild;
    const asfalt = element.getElementsByClassName("text-asfalt");

    const name = asfalt[0].textContent.substring(0,3);
    const value = Number(asfalt[1].textContent);
    const inf = Number(element.getElementsByClassName("text-right")[1].textContent);

    return {
      name,
      value,
      inf
    }
  }

  return JSDOM.fromURL(BCSE_SRC)
    .then((dom) => dom.window.document.querySelector("#currency").getElementsByClassName("inf-instrument"))
    .then((data) => {
      const arrs = [];
      for (let elem of data) {
        arrs.push(parse(elem))
      }
      return arrs;      
    })
    .catch((err) => {
      console.log(err);
    });
};


// Визуальная составляющая
const getDateTime = () => {
  return moment().format("HH:mm DD.MM");
};

const currencySymbols = {
  USD: '$',
  EUR: '€',
  RUB: '₽',
  CNY: '¥',
};

const getText = (obj) => {
  const symbol = currencySymbols[obj.name] || obj.name;
  return `${symbol} ${obj.value} ${obj.inf > 0 ? "↑" : "↓"}`;
};

const toText = (dataArray) => {
  const result = dataArray.map((element) => getText(element));
  return result.join(" ");
};

const toTextOfValues = (dataArray, values = [], time = false) => {
  if (!values) return toText(dataArray);

  const result = [];

  for (let inf of values) {
    try {
      const data = dataArray.find((item) => item.name === inf);
      result.push(getText(data));
    } catch (error) {
      console.log("error");
      // continue
    }
  }

  if (time) {
    return `${result.join(" ")} | ${getDateTime()}`;
  }

  return result.join(" ");
};

module.exports = { getBcse, toText, toTextOfValues };