const apiKey = process.env.WEATHERAPI

const city = "Minsk";
const urlNow = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=no&lang=ru`;
const urlToday = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&aqi=no&lang=ru`;

function getWeatherNow() {
  return fetch(urlNow)
    .then(response => response.json())
    .then(data => {
      // console.log(`Температура в ${city}: ${data.current.temp_c}°C`);
      // console.log(`Погода: ${data.current.condition.text}`);
      // console.log(`Ветер: ${data.current.wind_kph} км/ч`);
      return `Температура в Минске: ${data.current.temp_c}°C,\n${data.current.condition.text},\nветер ${data.current.wind_kph} км/ч`;
    })
    .catch(error => console.error("Ошибка получения данных:", error));
} 

function getWeatherToday() {
  return fetch(urlToday)
  .then(response => response.json())
  .then(data => {
    const forecast = data.forecast.forecastday[0];
    // console.log(`Погода в ${city} сегодня:`);
    // console.log(`Макс. температура: ${forecast.day.maxtemp_c}°C`);
    // console.log(`Мин. температура: ${forecast.day.mintemp_c}°C`);
    // console.log(`Средняя температура: ${forecast.day.avgtemp_c}°C`);
    // console.log(`Состояние: ${forecast.day.condition.text}`);
    // console.log(`Осадки: ${forecast.day.totalprecip_mm} мм`);
    // console.log(`Ветер: ${forecast.day.maxwind_kph} км/ч`);
    return `Сегодня ${forecast.day.mintemp_c}...${forecast.day.maxtemp_c}°, ${forecast.day.condition.text}`;
  })
  .catch(error => console.error("Ошибка получения данных:", error));
} 

module.exports = { getWeatherNow, getWeatherToday };