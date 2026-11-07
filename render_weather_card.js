const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const path = require('path');

// 讀取天氣預報 JSON
const forecastData = JSON.parse(fs.readFileSync(path.join(__dirname, 'weather_forecast.json'), 'utf-8'));

function getWeatherIconSvg(weatherCode) {
  // 晴天
  if (weatherCode === 0) {
    return `
      <g>
        <circle cx="28" cy="28" r="12" fill="#f59e0b" />
        <g stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round">
          <line x1="28" y1="6" x2="28" y2="10" />
          <line x1="28" y1="46" x2="28" y2="50" />
          <line x1="6" y1="28" x2="10" y2="28" />
          <line x1="46" y1="28" x2="50" y2="28" />
          <line x1="12.5" y1="12.5" x2="15.5" y2="15.5" />
          <line x1="40.5" y1="40.5" x2="43.5" y2="43.5" />
          <line x1="12.5" y1="43.5" x2="15.5" y2="40.5" />
          <line x1="40.5" y1="15.5" x2="43.5" y2="12.5" />
        </g>
      </g>
    `;
  }
  // 晴時多雲 / 多雲
  if (weatherCode === 1 || weatherCode === 2) {
    return `
      <g>
        <circle cx="34" cy="20" r="9" fill="#f59e0b" />
        <path d="M16 38 C 12 38, 10 35, 10 31 C 10 26, 14 24, 18 24 C 19 19, 24 16, 29 16 C 35 16, 39 20, 39 25 C 43 25, 46 28, 46 32 C 46 36, 43 38, 39 38 Z" fill="#94a3b8" />
      </g>
    `;
  }
  // 陰天
  if (weatherCode === 3) {
    return `
      <g>
        <path d="M14 38 C 9 38, 7 34, 7 30 C 7 25, 11 22, 16 22 C 18 16, 24 13, 30 13 C 37 13, 42 17, 43 23 C 47 23, 50 26, 50 31 C 50 36, 46 38, 42 38 Z" fill="#64748b" />
      </g>
    `;
  }
  // 雨 / 毛毛雨
  return `
    <g>
      <path d="M14 30 C 10 30, 8 27, 8 23 C 8 19, 11 17, 15 17 C 17 12, 22 10, 27 10 C 33 10, 37 13, 38 18 C 42 18, 45 21, 45 25 C 45 29, 42 30, 38 30 Z" fill="#64748b" />
      <g stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round">
        <line x1="18" y1="36" x2="16" y2="43" />
        <line x1="26" y1="36" x2="24" y2="43" />
        <line x1="34" y1="36" x2="32" y2="43" />
      </g>
    </g>
  `;
}

function generateSvg(data) {
  const cardWidth = 120;
  const cardGap = 14;
  const paddingX = 40;
  const totalWidth = paddingX * 2 + 7 * cardWidth + 6 * cardGap; // 80 + 840 + 84 = 1004
  const totalHeight = 440;

  const cardsSvg = data.forecast.map((item, idx) => {
    const x = paddingX + idx * (cardWidth + cardGap);
    const y = 140;
    const isToday = idx === 0;
    const borderStroke = isToday ? 'stroke="#38bdf8" stroke-width="2"' : 'stroke="#334155" stroke-width="1"';
    const bgFill = isToday ? '#1e293b' : '#0f172a';
    const iconSvg = getWeatherIconSvg(item.weatherCode);

    return `
      <g transform="translate(${x}, ${y})">
        <!-- 卡片背景 -->
        <rect width="${cardWidth}" height="250" rx="16" fill="${bgFill}" ${borderStroke} />
        
        ${isToday ? `<rect x="30" y="8" width="60" height="20" rx="10" fill="#0284c7" />
        <text x="60" y="22" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle" font-family="Microsoft JhengHei, PingFang TC, sans-serif">今日</text>` : ''}

        <!-- 星期與日期 -->
        <text x="60" y="${isToday ? 48 : 38}" fill="#f8fafc" font-size="16" font-weight="bold" text-anchor="middle" font-family="Microsoft JhengHei, PingFang TC, sans-serif">${item.dayOfWeek}</text>
        <text x="60" y="${isToday ? 68 : 58}" fill="#94a3b8" font-size="12" text-anchor="middle" font-family="Microsoft JhengHei, PingFang TC, sans-serif">${item.date.slice(5)}</text>

        <!-- 天氣圖示 -->
        <g transform="translate(32, ${isToday ? 76 : 68}) scale(1)">
          ${iconSvg}
        </g>

        <!-- 天氣文字 -->
        <text x="60" y="145" fill="#e2e8f0" font-size="13" font-weight="500" text-anchor="middle" font-family="Microsoft JhengHei, PingFang TC, sans-serif">${item.condition}</text>

        <!-- 氣溫 (高溫 / 低溫) -->
        <text x="60" y="175" fill="#f8fafc" font-size="18" font-weight="bold" text-anchor="middle" font-family="Microsoft JhengHei, PingFang TC, sans-serif">${item.tempMax}° / <tspan fill="#64748b" font-size="15">${item.tempMin}°</tspan></text>

        <!-- 降雨機率 -->
        <g transform="translate(35, 198)">
          <path d="M7 2 C 7 2, 2 8, 2 11 C 2 14, 4.2 16, 7 16 C 9.8 16, 12 14, 12 11 C 12 8, 7 2, 7 2 Z" fill="#38bdf8"/>
          <text x="20" y="12" fill="#38bdf8" font-size="12" font-weight="bold" font-family="Microsoft JhengHei, PingFang TC, sans-serif">${item.rainProb}%</text>
        </g>
      </g>
    `;
  }).join('\n');

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}">
      <defs>
        <linearGradient id="bgGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#090d16" />
          <stop offset="100%" stop-color="#0f172a" />
        </linearGradient>
      </defs>
      
      <!-- 主背景 -->
      <rect width="100%" height="100%" rx="24" fill="url(#bgGradient)" stroke="#1e293b" stroke-width="2"/>
      
      <!-- 頂部標題區 -->
      <text x="40" y="60" fill="#f8fafc" font-size="28" font-weight="bold" font-family="Microsoft JhengHei, PingFang TC, sans-serif">
        📍 ${data.city} 一週天氣預報
      </text>
      <text x="40" y="92" fill="#64748b" font-size="14" font-family="Microsoft JhengHei, PingFang TC, sans-serif">
        預報期間：${data.forecast[0].date} ~ ${data.forecast[data.forecast.length - 1].date} ｜ 每日降雨機率與氣溫趨勢
      </text>
      
      <!-- 7 天卡片 -->
      ${cardsSvg}
    </svg>
  `;
}

async function renderCard() {
  const svg = generateSvg(forecastData);
  fs.writeFileSync(path.join(__dirname, 'weather_forecast.svg'), svg, 'utf-8');
  
  const resvg = new Resvg(svg, {
    font: {
      loadSystemFonts: true,
      defaultFontFamily: 'Microsoft JhengHei'
    }
  });
  
  const pngData = resvg.render();
  const pngPath = path.join(__dirname, 'weather_forecast.png');
  fs.writeFileSync(pngPath, pngData.asPng());
  console.log(`成功生成圖表！已儲存至: ${pngPath}`);
}

renderCard();

