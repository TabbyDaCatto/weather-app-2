const city = document.querySelector(".weather__city");
const datetime = document.querySelector(".weather__datetime");
const weather__forecast = document.querySelector(".weather__forecast");
const weather__temperature = document.querySelector(".weather__temperature");
const weather__icon = document.querySelector(".weather__icon");
const weather__minmax = document.querySelector(".weather__minmax");
const weather__realfeel = document.querySelector(".weather__realfeel");
const weather__humidity = document.querySelector(".weather__humidity");
const weather__wind = document.querySelector(".weather__wind");
const weather__precip = document.querySelector(".weather__precip");
const forecastCards = document.getElementById("forecastCards");
const forecastContainer = document.getElementById("forecastContainer");

function convertTimeStamp(timestamp, timezone) {
  const date = new Date((timestamp + timezone) * 1000);
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${date.toLocaleString("en-US", { weekday: "long", timeZone: "UTC" })}, ${date.getUTCDate()} ${date.toLocaleString("en-US", { month: "long", timeZone: "UTC" })}, ${hour12}:${minutes.toString().padStart(2, "0")} ${ampm}`;
}

export function renderWeather(info) {
  city.innerHTML = `<span id="cityName">${info.name}, ${info.country}</span>`;
  const currentUtcSeconds = Math.floor(Date.now() / 1000);
  datetime.innerHTML = convertTimeStamp(currentUtcSeconds, info.timezone);
  weather__forecast.innerHTML = `<p>${info.condition}</p>`;
  weather__temperature.innerHTML = `${Math.round(info.temp)}&#176`;
  weather__icon.innerHTML = `<img src="http://openweathermap.org/img/wn/${info.icon}@4x.png" />`;
  weather__minmax.innerHTML = `<p>Min: ${Math.round(info.temp_min)}&#176</p><p>Max: ${Math.round(info.temp_max)}&#176</p>`;
  weather__realfeel.innerHTML = `${Math.round(info.feels_like)}&#176`;
  weather__humidity.innerHTML = `${info.humidity}%`;
  weather__wind.innerHTML = `${info.wind.toFixed(1)} ${info.unit === "imperial" ? "mph" : "m/s"}`;
  weather__precip.innerHTML = `${info.precip} mm`;
}

export function renderForecast(forecastList) {
  if (!forecastCards || !forecastContainer) return;
  forecastCards.innerHTML = ""; 
  forecastContainer.style.display = "block"; 

  for (let i = 0; i < forecastList.length; i += 8) {
    let period = forecastList[i];
    let date = new Date(period.dt * 1000);
    let dayName = date.toLocaleDateString("en-US", { weekday: 'short' });

    forecastCards.innerHTML += `
      <div class="forecast-card">
        <p style="font-weight: bold;">${dayName}</p>
        <img src="http://openweathermap.org/img/wn/${period.weather[0].icon}@2x.png" alt="icon">
        <p style="font-size: 1.2rem; font-weight: 600;">${Math.round(period.main.temp)}°</p>
        <p style="font-size: 12px; color: #ccc;">${period.weather[0].main}</p>
      </div>
    `;
  }
}