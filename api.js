//hide ts
let LOCAL_KEY = null;

try {
  // Dynamically import the local config file
  const config = await import("./config.js");
  LOCAL_KEY = config.API_KEY;
} catch (err) {
  // Silently fail if config.js is missing (e.g., on GitHub)
  console.log("Local config not found, falling back to placeholder.");
}

const API_KEYS = {
  // Use the real key locally, or the placeholder when pushed online
  openweather: LOCAL_KEY || "SECRET_API_KEY_PLACEHOLDER", 
};

async function fetchAPI(endpoint, params, units) {
  const query = new URLSearchParams({ ...params, appid: API_KEYS.openweather, units });
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/${endpoint}?${query}`);
    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function getWeather(city, units) {
  return await fetchAPI("weather", { q: city }, units);
}

export async function getWeatherByCoords(lat, lon, units) {
  return await fetchAPI("weather", { lat, lon }, units);
}

export async function getForecast(city, units) {
  return await fetchAPI("forecast", { q: city }, units);
}

export async function getForecastByCoords(lat, lon, units) {
  return await fetchAPI("forecast", { lat, lon }, units);
}