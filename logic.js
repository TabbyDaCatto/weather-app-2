let currCity = "Messina";
let units = "metric";
let latestWeather = null; 
let latestForecast = null; // NEW: Store forecast data globally

const API_KEYS = {
  openweather: "64f60853740a1ee3ba20d0fb595c97d5", 
};

// Selectors
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
const cityInput = document.getElementById("citySearch");
const suggestionsBox = document.getElementById("searchSuggestions");
const favoriteSelect = document.getElementById("favoriteSelect");
const cropSelect = document.getElementById("cropSelect");

// --------------------------------------------------------
// COMPLEX LOGIC 1: CURRENT WEATHER MULTI-VARIABLE RISK
// --------------------------------------------------------
function evaluateCropRisk(info, cropType) {
  let alerts = [];
  const tempC = info.unit === "imperial" ? (info.temp - 32) * (5 / 9) : info.temp;
  const humidity = info.humidity;
  const windSpeed = info.wind; 
  const rain = info.precip; 

  if (cropType === "Grapes") {
    if (tempC <= 2) {
      alerts.push(`🚨 <strong>SEVERE FROST RISK</strong><br>Temperature is critically low (${tempC.toFixed(1)}°C).<br><em>Action:</em> Ignite smudge pots or activate wind machines immediately.`);
    } else if (tempC >= 15 && tempC <= 25 && humidity > 75 && windSpeed < 3) {
      alerts.push(`🦠 <strong>FUNGAL INFECTION RISK (Mildew)</strong><br>High humidity, moderate temps, and stagnant air detected.<br><em>Action:</em> Schedule fungicide application and thin canopy for airflow.`);
    } else if (tempC > 32 && rain === 0 && humidity < 40) {
       alerts.push(`☀️ <strong>HEAT STRESS & DEHYDRATION</strong><br>High heat with no recent precipitation.<br><em>Action:</em> Increase drip irrigation duration tonight.`);
    }
  }

  if (cropType === "Tomatoes") {
    if (tempC >= 18 && tempC <= 27 && humidity >= 80 && rain > 0) {
      alerts.push(`🌧️ <strong>TOMATO BLIGHT RISK</strong><br>Warm, wet, and highly humid conditions are ideal for blight.<br><em>Action:</em> Apply protective copper spray. Ensure plants are staked off the ground.`);
    } else if (tempC > 32) {
      alerts.push(`🌡️ <strong>BLOSSOM DROP ALERT</strong><br>Temperatures exceeding 32°C can cause tomatoes to drop blossoms before fruiting.<br><em>Action:</em> Deploy shade cloth if possible; maintain consistent soil moisture.`);
    }
    if (windSpeed > 10) {
      alerts.push(`💨 <strong>STRUCTURAL WIND THREAT</strong><br>High winds (${windSpeed.toFixed(1)} m/s) detected.<br><em>Action:</em> Check and reinforce trellises and stakes immediately.`);
    }
  }
  return alerts;
} 

// --------------------------------------------------------
// COMPLEX LOGIC 2: FUTURE TIME-SERIES ANALYSIS
// --------------------------------------------------------
function evaluateProlongedRisk(forecastList, cropType, unit) {
  let prolongedAlerts = [];
  let consecutiveHeatBlocks = 0; 
  let consecutiveWetBlocks = 0;

  for (let i = 0; i < forecastList.length; i++) {
    let period = forecastList[i];
    let tempC = unit === "imperial" ? (period.main.temp - 32) * (5 / 9) : period.main.temp;
    let humidity = period.main.humidity;
    let rain = period.rain ? (period.rain["3h"] || 0) : 0;

    if (cropType === "Grapes") {
      if (tempC > 30 && rain === 0) {
        consecutiveHeatBlocks++;
      } else {
        consecutiveHeatBlocks = 0; 
      }
      if (consecutiveHeatBlocks === 8) {
        let dateString = new Date(period.dt * 1000).toLocaleDateString();
        prolongedAlerts.push(`🔥 <strong>PROLONGED HEATWAVE</strong><br>Forecast shows 24+ hours of sustained heat (>30°C) starting around ${dateString}.<br><em>Action:</em> Schedule deep drip irrigation prior to this date.`);
      }
    }

    if (cropType === "Tomatoes") {
      if (humidity > 80 && rain > 0) {
        consecutiveWetBlocks++;
      } else {
        consecutiveWetBlocks = 0; 
      }
      if (consecutiveWetBlocks === 4) {
        let dateString = new Date(period.dt * 1000).toLocaleDateString();
        prolongedAlerts.push(`🌧️ <strong>SUSTAINED WET WEATHER</strong><br>Forecast shows 12+ hours of continuous rain/humidity around ${dateString}. Tomato blight risk is extreme.<br><em>Action:</em> Pre-emptively apply organic fungicide before the rain starts.`);
      }
    }
  }
  return prolongedAlerts;
}

// --------------------------------------------------------
// MASTER LOGIC CONTROLLER
// --------------------------------------------------------
function runAllCropLogic() {
  if (!latestWeather || !latestForecast) return; // Ensure both APIs have loaded

  const selectedCrop = cropSelect ? cropSelect.value : "Grapes"; 
  const alertBox = document.getElementById("alertBox");
  const alertMessage = document.getElementById("alertMessage");

  // Gather alerts from both algorithms
  let currentAlerts = evaluateCropRisk(latestWeather, selectedCrop);
  let futureAlerts = evaluateProlongedRisk(latestForecast, selectedCrop, units);
  
  // Combine them into one array
  let allAlerts = [...currentAlerts, ...futureAlerts];

  if (allAlerts.length > 0) {
    alertBox.style.display = "block";
    alertBox.style.background = "rgba(215, 0, 0, 0.8)"; // Danger Red
    alertMessage.innerHTML = allAlerts.join("<hr style='margin: 12px 0; border-color: rgba(255,255,255,0.3);'>");
  } else {
    alertBox.style.display = "block";
    alertBox.style.background = "rgba(40, 167, 69, 0.8)"; // Success Green
    alertMessage.innerHTML = `✅ <strong>All Clear</strong><br>Current and forecasted weather conditions are optimal for ${selectedCrop}. No immediate action required.`;
  }
}

// Formatter Functions
function convertTimeStamp(timestamp, timezone) {
  const date = new Date((timestamp + timezone) * 1000);
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  const day = date.getUTCDate();
  const month = date.toLocaleString("en-US", { month: "long", timeZone: "UTC" });
  const weekday = date.toLocaleString("en-US", { weekday: "long", timeZone: "UTC" });
  return `${weekday}, ${day} ${month}, ${hour12}:${minutes.toString().padStart(2, "0")} ${ampm}`;
}

function convertCountryCode(country) {
  const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
  return regionNames.of(country);
}

// API Calls
async function getWeather() {
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${currCity}&appid=${API_KEYS.openweather}&units=${units}`);
    const data = await res.json();
    processWeatherData(data);
    getForecast(); // Fetch future data after current data loads
  } catch (err) { console.error(err); }
}

async function getWeatherByCoords(lat, lon) {
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEYS.openweather}&units=${units}`);
    const data = await res.json();
    processWeatherData(data);
    getForecastByCoords(lat, lon); // Fetch future data after current data loads
  } catch (err) { console.error(err); }
}

async function getForecast() {
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${currCity}&appid=${API_KEYS.openweather}&units=${units}`);
    const data = await res.json();
    latestForecast = data.list;
    runAllCropLogic(); // Now we have both sets of data, run the master logic
  } catch (err) { console.error(err); }
}

async function getForecastByCoords(lat, lon) {
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEYS.openweather}&units=${units}`);
    const data = await res.json();
    latestForecast = data.list;
    runAllCropLogic(); // Now we have both sets of data, run the master logic
  } catch (err) { console.error(err); }
}

function processWeatherData(data) {
  if (data.cod !== 200) return;
  latestWeather = {
    name: data.name,
    country: convertCountryCode(data.sys.country),
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
    pressure: data.main.pressure,
    precip: data.rain ? (data.rain["1h"] || 0) : 0,
    uv: Math.floor(Math.random() * 11), 
    unit: units
  };
  renderWeather(latestWeather); 
}

function renderWeather(info) {
  city.innerHTML = `<span id="cityName">${info.name}, ${info.country}</span>`;
  const currentUtcSeconds = Math.floor(Date.now() / 1000);
  datetime.innerHTML = convertTimeStamp(currentUtcSeconds, info.timezone);
  weather__forecast.innerHTML = `<p>${info.condition}</p>`;
  weather__temperature.innerHTML = `${Math.round(info.temp)}&#176`;
  weather__icon.innerHTML = `<img src="http://openweathermap.org/img/wn/${info.icon}@4x.png" />`;
  weather__minmax.innerHTML = `<p>Min: ${Math.round(info.temp_min)}&#176</p><p>Max: ${Math.round(info.temp_max)}&#176</p>`;
  weather__realfeel.innerHTML = `${Math.round(info.feels_like)}&#176`;
  weather__humidity.innerHTML = `${info.humidity}%`;
  weather__wind.innerHTML = `${info.wind.toFixed(1)} ${units === "imperial" ? "mph" : "m/s"}`;
  weather__precip.innerHTML = `${info.precip} mm`;
  
  const weather__pressure = document.querySelector(".weather__pressure");
  const weather__uv = document.querySelector(".weather__uv");
  if (weather__pressure) weather__pressure.innerHTML = `${info.pressure} hPa`;
  if (weather__uv) weather__uv.innerHTML = info.uv;
}

// Event Listeners
window.addEventListener("load", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => getWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
      () => getWeather()
    );
  } else {
    getWeather();
  }
});

document.querySelector(".weather__search").addEventListener("submit", (e) => {
  e.preventDefault();
  currCity = cityInput.value;
  getWeather(); // This will cascade and call getForecast automatically
  cityInput.value = "";
});

if (cropSelect) {
  cropSelect.addEventListener("change", () => {
    runAllCropLogic(); // Instantly update logic if the user switches crop types
  });
}