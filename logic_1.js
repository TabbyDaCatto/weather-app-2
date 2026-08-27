let alertPolicies = JSON.parse(localStorage.getItem("alertPolicies")) || [
  { id: "alert-1", name: "🚗 Extreme Travel Hazard", matchType: "ALL", conditions: [{ metric: "wind", operator: ">", value: 15 }, { metric: "precip", operator: ">", value: 5 }] },
  { id: "alert-2", name: "❄️ Freezing Conditions", matchType: "ANY", conditions: [{ metric: "temp_min", operator: "<", value: 0 }, { metric: "feels_like", operator: "<", value: -2 }] }
];

function checkCondition(cond, context) {
  const liveValue = context[cond.metric];
  if (liveValue === undefined) return false;
  switch (cond.operator) {
    case ">": return liveValue > cond.value;
    case "<": return liveValue < cond.value;
    case "==": return liveValue == cond.value;
    default: return false;
  }
}

export function evaluateAlertPolicies(latestWeather) {
  if (!latestWeather) return;
  const alertBox = document.getElementById("alertBox");
  const alertMessage = document.getElementById("alertMessage");
  let triggeredAlerts = [];

  alertPolicies.forEach(policy => {
    let isTriggered = policy.matchType === "ALL" 
      ? policy.conditions.every(cond => checkCondition(cond, latestWeather))
      : policy.conditions.some(cond => checkCondition(cond, latestWeather));

    if (isTriggered) triggeredAlerts.push(`🚨 <strong>Alert: ${policy.name}</strong><br><small>Threshold conditions met.</small>`);
  });

  if (triggeredAlerts.length > 0) {
    alertBox.style.display = "block";
    alertBox.style.background = "rgba(215, 0, 0, 0.95)";
    alertMessage.innerHTML = triggeredAlerts.join("<hr style='margin: 10px 0; border-color: rgba(255,255,255,0.3)'>");
  } else {
    alertBox.style.display = "none";
  }
}

export function initAlertBuilder(getLatestWeatherCallback) {
  const ruleModal = document.getElementById("ruleModal");
  document.getElementById("openRuleBuilderBtn")?.addEventListener("click", () => ruleModal.style.display = "flex");
  document.getElementById("closeRuleModal")?.addEventListener("click", () => ruleModal.style.display = "none");

  document.getElementById("savePolicyBtn").addEventListener("click", () => {
    const name = document.getElementById("policyName").value.trim();
    if (!name) return alert("Please fill out the alert name.");
    
    alertPolicies.push({
      id: "alert-" + Date.now(),
      name,
      matchType: document.getElementById("matchType").value,
      conditions: [
        { metric: document.getElementById("ruleMetric1").value, operator: document.getElementById("ruleOperator1").value, value: parseFloat(document.getElementById("ruleValue1").value) },
        { metric: document.getElementById("ruleMetric2").value, operator: document.getElementById("ruleOperator2").value, value: parseFloat(document.getElementById("ruleValue2").value) }
      ]
    });
    
    localStorage.setItem("alertPolicies", JSON.stringify(alertPolicies));
    ruleModal.style.display = "none";
    alert(`✅ Custom alert "${name}" saved!`);
    evaluateAlertPolicies(getLatestWeatherCallback());
  });
}