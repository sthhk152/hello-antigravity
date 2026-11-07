/**
 * 台北未來一週天氣預報資料抓取腳本
 * 使用 Open-Meteo 開放氣象 API（免 API Key）
 */

const fs = require('fs');
const path = require('path');

const WMO_CODE_MAP = {
  0: { description: '晴朗無雲', icon: '☀️' },
  1: { description: '晴時多雲', icon: '🌤️' },
  2: { description: '多雲', icon: '⛅' },
  3: { description: '陰天', icon: '☁️' },
  45: { description: '有霧', icon: '🌫️' },
  48: { description: '霧淞結霜', icon: '🌫️' },
  51: { description: '小毛毛雨', icon: '🌦️' },
  53: { description: '中度毛毛雨', icon: '🌧️' },
  55: { description: '密集毛毛雨', icon: '🌧️' },
  61: { description: '小雨', icon: '🌧️' },
  63: { description: '中雨', icon: '🌧️' },
  65: { description: '大雨', icon: '⛈️' },
  71: { description: '小雪', icon: '🌨️' },
  80: { description: '短暫陣雨', icon: '🌦️' },
  81: { description: '陣雨', icon: '🌧️' },
  82: { description: '強烈陣雨', icon: '⛈️' },
  95: { description: '雷雨', icon: '⛈️' },
};

const WEEKDAYS = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];

async function fetchWeeklyWeather(city = '台北', lat = 25.0330, lon = 121.5654) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum,precipitation_probability_max,windspeed_10m_max,uv_index_max&timezone=Asia%2FTaipei`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP 錯誤: ${res.status}`);
    const data = await res.json();

    const daily = data.daily;
    const forecastList = daily.time.map((dateStr, index) => {
      const date = new Date(dateStr);
      const dayOfWeek = WEEKDAYS[date.getDay()];
      const code = daily.weathercode[index];
      const weatherInfo = WMO_CODE_MAP[code] || { description: '多雲', icon: '⛅' };

      return {
        date: dateStr,
        dayOfWeek,
        condition: weatherInfo.description,
        icon: weatherInfo.icon,
        weatherCode: code,
        tempMax: Math.round(daily.temperature_2m_max[index]),
        tempMin: Math.round(daily.temperature_2m_min[index]),
        apparentTempMax: Math.round(daily.apparent_temperature_max[index]),
        apparentTempMin: Math.round(daily.apparent_temperature_min[index]),
        rainProb: daily.precipitation_probability_max[index] ?? 0,
        rainSum: daily.precipitation_sum[index] ?? 0,
        maxWindSpeed: daily.windspeed_10m_max[index] ?? 0,
        uvIndex: daily.uv_index_max[index] ?? 0,
      };
    });

    const result = {
      city,
      coordinate: { latitude: lat, longitude: lon },
      updatedAt: new Date().toISOString(),
      forecast: forecastList,
    };

    const outputPath = path.join(__dirname, 'weather_forecast.json');
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');
    console.log(`成功獲取天氣資料並寫入: ${outputPath}`);
    return result;
  } catch (err) {
    console.error('抓取氣象資料失敗:', err);
    throw err;
  }
}

if (require.main === module) {
  fetchWeeklyWeather();
}

module.exports = { fetchWeeklyWeather };

