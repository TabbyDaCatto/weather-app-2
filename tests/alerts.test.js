// 1. The helper function engine must be defined clearly at the top
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

// 2. The automated test block structure
describe('Weather App - Custom Alert Evaluation Tests', () => {

  test('should trigger true when live wind exceeds threshold limit', () => {
    const condition = { metric: "wind", operator: ">", value: 15 };
    const simulatedWeather = { wind: 22 }; 

    const result = checkCondition(condition, simulatedWeather);
    expect(result).toBe(true); 
  });

  test('should trigger true when temperature goes below freezing limits', () => {
    const condition = { metric: "temp_min", operator: "<", value: 0 };
    const simulatedWeather = { temp_min: -3 }; 

    const result = checkCondition(condition, simulatedWeather);
    expect(result).toBe(true);
  });

  test('should return false if live metric does not meet the specified operator threshold', () => {
    const condition = { metric: "wind", operator: ">", value: 15 };
    const simulatedWeather = { wind: 8 }; 

    const result = checkCondition(condition, simulatedWeather);
    expect(result).toBe(false); 
  });
});
