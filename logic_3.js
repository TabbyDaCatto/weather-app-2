import { calculateSuitabilityScore, userScoringPolicies } from "./logic_2.js";

/**
 * SLIDING WINDOW ALGORITHM
 * Scans the forecast array to find the best continuous time block for an activity.
 */
export function optimizeTemporalWindow(forecastList, activityId, durationHours) {
  if (!forecastList || forecastList.length === 0) return null;

  // The API returns data in 3-hour blocks
  const blocksNeeded = Math.ceil(durationHours / 3);
  if (blocksNeeded > forecastList.length) return null;

  // Find the specific policy (e.g., "score-1" for Drone Flying)
  const policy = userScoringPolicies.find(p => p.id === activityId);
  if (!policy) return null;

  let bestWindow = null;
  let highestAverageScore = -1;

  // Slide the window across the 5-day forecast
  for (let i = 0; i <= forecastList.length - blocksNeeded; i++) {
    let totalWindowScore = 0;

    // Calculate average score for this specific time window
    for (let j = 0; j < blocksNeeded; j++) {
      const forecastBlock = forecastList[i + j];
      
      // Map API forecast schema to our internal metric schema
      const weatherParams = {
        temp: forecastBlock.main.temp,
        humidity: forecastBlock.main.humidity,
        wind: forecastBlock.wind.speed,
        precip: forecastBlock.rain ? (forecastBlock.rain["3h"] || 0) : 0
      };
      
      totalWindowScore += calculateSuitabilityScore(weatherParams, policy.criteria);
    }

    const averageScore = totalWindowScore / blocksNeeded;

    // Record if this is the best window we've seen so far
    if (averageScore > highestAverageScore) {
      highestAverageScore = averageScore;
      bestWindow = {
        startTime: forecastList[i].dt,
        endTime: forecastList[i + blocksNeeded - 1].dt,
        score: Math.round(highestAverageScore)
      };
    }
  }

  return { policyName: policy.name, bestWindow };
}

/**
 * DOM MANIPULATION (View update triggered by the Controller)
 */
export function renderBestTimeWindows(forecastList) {
  // Let's find the best 6-hour window for Drone Flying, and 3-hour for Running
  const bestDroneTime = optimizeTemporalWindow(forecastList, "score-1", 6);
  const bestRunTime = optimizeTemporalWindow(forecastList, "score-2", 3);

  const container = document.getElementById("optimalWindowContainer");
  if (!container) return;

  let html = `<h3 style="margin-bottom: 15px; font-size: 1.1rem; color: #ffd85c;">
                <i class="fa-solid fa-clock"></i> Best Upcoming Times
              </h3>`;

  [bestDroneTime, bestRunTime].forEach(result => {
    if(result && result.bestWindow) {
      // Format timestamps
      const start = new Date(result.bestWindow.startTime * 1000).toLocaleString("en-US", { weekday: "short", hour: "numeric", hour12: true });
      // Add 3 hours to end time to reflect the end of the final block
      const end = new Date((result.bestWindow.endTime + 10800) * 1000).toLocaleString("en-US", { hour: "numeric", hour12: true });
      
      const barColor = result.bestWindow.score < 40 ? "#dc3545" : result.bestWindow.score < 75 ? "#ffc107" : "#28a745";

      html += `
      <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px; margin-bottom: 10px; width: 100%;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <strong>${result.policyName}</strong>
            <span style="font-weight: bold; color: ${barColor}">${result.bestWindow.score}%</span>
          </div>
          <div style="font-size: 12px; color: #ddd; margin-bottom: 8px;">
            <i class="fa-regular fa-calendar"></i> ${start} to ${end}
          </div>
      </div>`;
    }
  });

  container.innerHTML = html;
  container.style.display = "flex";
}