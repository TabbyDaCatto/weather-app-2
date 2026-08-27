let userScoringPolicies = JSON.parse(localStorage.getItem("scoringPolicies")) || [
  { id: "score-1", name: "🚁 Drone Flying", criteria: [{ metric: "wind", ideal: 2, tolerance: 5, weight: 0.6 }, { metric: "precip", ideal: 0, tolerance: 1, weight: 0.3 }, { metric: "temp", ideal: 22, tolerance: 10, weight: 0.1 }] },
  { id: "score-2", name: "🏃 Outdoor Running", criteria: [{ metric: "temp", ideal: 18, tolerance: 10, weight: 0.5 }, { metric: "humidity", ideal: 40, tolerance: 40, weight: 0.3 }, { metric: "precip", ideal: 0, tolerance: 2, weight: 0.2 }] }
];

export function evaluateScoringPolicies(latestWeather) {
  if (!latestWeather) return;
  const scoreContainer = document.getElementById("suitabilityScores");
  const scoreList = document.getElementById("scoreList");
  if (!scoreContainer || !scoreList) return;

  let htmlContent = "";
  userScoringPolicies.forEach(policy => {
    let totalScore = 0, totalWeight = 0;
    policy.criteria.forEach(crit => {
      if (latestWeather[crit.metric] !== undefined) {
        let metricScore = Math.max(0, 1 - (Math.abs(latestWeather[crit.metric] - crit.ideal) / crit.tolerance));
        totalScore += (metricScore * crit.weight);
        totalWeight += crit.weight;
      }
    });

    const roundedScore = Math.round(totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0);
    let barColor = roundedScore < 40 ? "#dc3545" : roundedScore < 75 ? "#ffc107" : "#28a745"; 

    htmlContent += `
      <div style="margin-bottom: 12px; width: 100%;">
        <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px;">
          <span>${policy.name}</span><span style="font-weight: bold;">${roundedScore}%</span>
        </div>
        <div style="width: 100%; background: rgba(255,255,255,0.2); height: 8px; border-radius: 4px; overflow: hidden;">
          <div style="width: ${roundedScore}%; background: ${barColor}; height: 100%;"></div>
        </div>
      </div>`;
  });

  scoreList.innerHTML = htmlContent;
  scoreContainer.style.display = "flex";
}