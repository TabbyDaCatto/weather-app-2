// 1. Start with a clean slate (no hardcoded default alerts)
let alertPolicies = JSON.parse(localStorage.getItem("alertPolicies")) || [];
let getLatestWeatherRef = null;

export function checkCondition(cond, context) {
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
  getLatestWeatherRef = getLatestWeatherCallback;
  const ruleModal = document.getElementById("ruleModal");

  document.getElementById("openRuleBuilderBtn")?.addEventListener("click", () => {
    renderSavedAlerts();
    ruleModal.style.display = "flex";
  });

  document.getElementById("closeRuleModal")?.addEventListener("click", () => {
    ruleModal.style.display = "none";
  });

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
    
    // Trigger global cloud sync if logged in
    if (window.syncAlertsToCloud) window.syncAlertsToCloud(alertPolicies);

    // Refresh UI list without closing the modal
    renderSavedAlerts();
    
    // Clear inputs
    document.getElementById("policyName").value = "";
    document.getElementById("ruleValue1").value = "";
    document.getElementById("ruleValue2").value = "";

    alert(`✅ Custom alert "${name}" saved!`);
    evaluateAlertPolicies(getLatestWeatherRef());
  });

  renderSavedAlerts();
}

function renderSavedAlerts() {
  const listContainer = document.getElementById("savedAlertsList");
  if (!listContainer) return;
  listContainer.innerHTML = "";

  const savedData = localStorage.getItem("alertPolicies");
  const alerts = savedData ? JSON.parse(savedData) : [];

  if (alerts.length === 0) {
    listContainer.innerHTML = "<p style='font-size: 12px; color: #666;'>No alerts saved yet.</p>";
    return;
  }

  alerts.forEach((alert, index) => {
    const card = document.createElement("div");
    card.style.cssText = "background: #f4f4f4; padding: 10px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;";
    
    card.innerHTML = `
      <div>
        <strong style="font-size: 13px; color: #222;">${alert.name || "Custom Alert"}</strong>
        <div style="font-size: 11px; color: #666;">Conditions: ${alert.conditions.length} (${alert.matchType})</div>
      </div>
      <button class="delete-alert-btn" data-index="${index}" style="background: #dc3545; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer;">
        <i class="fa-solid fa-trash"></i>
      </button>
    `;
    listContainer.appendChild(card);
  });

  document.querySelectorAll(".delete-alert-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const alertIndex = parseInt(e.currentTarget.getAttribute("data-index"), 10);
      deleteAlert(alertIndex);
    });
  });
}

function deleteAlert(index) {
  const savedData = localStorage.getItem("alertPolicies");
  if (!savedData) return;

  let alerts = JSON.parse(savedData);
  alerts.splice(index, 1);

  alertPolicies = alerts;
  localStorage.setItem("alertPolicies", JSON.stringify(alerts));
  
  // Trigger global cloud sync if logged in
  if (window.syncAlertsToCloud) window.syncAlertsToCloud(alerts);

  renderSavedAlerts();
  if (getLatestWeatherRef) {
    evaluateAlertPolicies(getLatestWeatherRef());
  }
}

// Global refresh function for Firebase to call on login
window.refreshAlertsFromMemory = function() {
  const savedData = localStorage.getItem("alertPolicies");
  alertPolicies = savedData ? JSON.parse(savedData) : [];
  renderSavedAlerts();
  if (getLatestWeatherRef) {
    evaluateAlertPolicies(getLatestWeatherRef());
  }
};