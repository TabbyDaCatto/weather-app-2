//hide ts
const API_KEYS = {
  openweather: "SECRET_API_KEY_PLACEHOLDER", 
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
