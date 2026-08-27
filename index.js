import { getWeather, getWeatherByCoords, getForecast, getForecastByCoords } from "./api.js";
import { renderWeather, renderForecast } from "./ui.js";
import { evaluateAlertPolicies, initAlertBuilder } from "./logic_1.js";
import { evaluateScoringPolicies } from "./logic_2.js";

const state = {
  currCity: "Messina",
  units: "metric",
  latestWeather: null,
};

function processWeatherData(data) {
  if (data.cod !== 200) return;
  state.latestWeather = {
    name: data.name,
    country: new Intl.DisplayNames(["en"], { type: "region" }).of(data.sys.country),
    dt: data.dt,
    timezone: data.timezone,
    condition: data.weather[0].main,
    icon: data.weather[0].icon,
    temp: data.main.temp,
    temp_min: data.main.temp_min,
    temp_max: data.main.temp_max,
    feels_like: data.main.feels_like,
    humidity: data.main.humidity,
    wind: data.wind.speed,
    precip: data.rain ? (data.rain["1h"] || 0) : 0,
    unit: state.units
  };
  
  renderWeather(state.latestWeather);
  evaluateAlertPolicies(state.latestWeather);
  evaluateScoringPolicies(state.latestWeather);
}

async function updateAllData(fetchWeatherFn, fetchForecastFn) {
  const [weatherData, forecastData] = await Promise.all([
    fetchWeatherFn(),
    fetchForecastFn()
  ]);
  if (weatherData) processWeatherData(weatherData);
  if (forecastData) renderForecast(forecastData.list);
}

window.addEventListener("load", () => {
  initAlertBuilder(() => state.latestWeather);

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => updateAllData(
        () => getWeatherByCoords(pos.coords.latitude, pos.coords.longitude, state.units),
        () => getForecastByCoords(pos.coords.latitude, pos.coords.longitude, state.units)
      ),
      () => updateAllData(() => getWeather(state.currCity, state.units), () => getForecast(state.currCity, state.units))
    );
  } else {
    updateAllData(() => getWeather(state.currCity, state.units), () => getForecast(state.currCity, state.units));
  }
});

document.querySelector(".weather__search").addEventListener("submit", (e) => {
  e.preventDefault();
  const cityInput = document.getElementById("citySearch");
  state.currCity = cityInput.value;
  updateAllData(() => getWeather(state.currCity, state.units), () => getForecast(state.currCity, state.units));
  cityInput.value = "";
});