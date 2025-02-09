import jsdom from "jsdom"
import moment from "moment";

import logger from "../utils/logger.js";

const BCSE_SRC = "https://www.bcse.by/";

const { JSDOM } = jsdom;

export const getBcse = () => {
  logger.info("Получаем курс валют");
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
      logger.error(err);
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
  return `${symbol} ${obj.value}`;
  // return `${symbol} ${obj.value} ${obj.inf > 0 ? "↑" : "↓"}`;
};

export const toText = (dataArray) => {
  const result = dataArray.map((element) => getText(element));
  return result.join(" ");
};

export const toTextOfValues = (dataArray, values = [], time = false) => {
  if (!values) return toText(dataArray);

  const result = [];

  for (let inf of values) {
    try {
      const data = dataArray.find((item) => item.name === inf);
      result.push(getText(data));
    } catch (err) {
      logger.error(err);
    }
  }

  if (time) {
    return `${result.join(" ")} | ${getDateTime()}`;
  }

  return result.join(" ");
};