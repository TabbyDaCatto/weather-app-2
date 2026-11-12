import { checkCondition } from "../logic_1.js";
import { calculateSuitabilityScore, userScoringPolicies } from "../logic_2.js";
import { optimizeTemporalWindow } from "../logic_3.js";

describe("Weather App - Custom Alert Evaluation Tests", () => {
  test("should trigger true when live wind exceeds threshold limit", () => {
    const condition = { metric: "wind", operator: ">", value: 15 };
    const simulatedWeather = { wind: 22 };

    expect(checkCondition(condition, simulatedWeather)).toBe(true);
  });

  test("should trigger true when temperature goes below freezing limits", () => {
    const condition = { metric: "temp_min", operator: "<", value: 0 };
    const simulatedWeather = { temp_min: -3 };

    expect(checkCondition(condition, simulatedWeather)).toBe(true);
  });

  test("should return false if live metric does not meet the specified operator threshold", () => {
    const condition = { metric: "wind", operator: ">", value: 15 };
    const simulatedWeather = { wind: 8 };

    expect(checkCondition(condition, simulatedWeather)).toBe(false);
  });

  test("should return false when the target metric is missing from weather data", () => {
    const condition = { metric: "precip", operator: ">", value: 5 };
    const simulatedWeather = { temp: 20 };

    expect(checkCondition(condition, simulatedWeather)).toBe(false);
  });
});

describe("Weather App - Activity Suitability & Forecast Window Tests", () => {
  test("should return 100% suitability score under ideal drone flying conditions", () => {
    const dronePolicy = userScoringPolicies.find((p) => p.id === "score-1");
    const idealWeather = { wind: 2, precip: 0, temp: 22 };

    expect(calculateSuitabilityScore(idealWeather, dronePolicy.criteria)).toBe(100);
  });

  test("should reduce suitability score when wind reaches the tolerance limit", () => {
    const dronePolicy = userScoringPolicies.find((p) => p.id === "score-1");
    const windyWeather = { wind: 7, precip: 0, temp: 22 };

    expect(calculateSuitabilityScore(windyWeather, dronePolicy.criteria)).toBeCloseTo(40);
  });

  test("should select the optimal 3-hour forecast window for outdoor running", () => {
    const mockForecast = [
      {
        dt: 1700000000,
        main: { temp: 35, humidity: 90 },
        wind: { speed: 5 },
        rain: { "3h": 5 },
      },
      {
        dt: 1700010800,
        main: { temp: 18, humidity: 40 },
        wind: { speed: 2 },
      },
    ];

    const result = optimizeTemporalWindow(mockForecast, "score-2", 3);

    expect(result).toEqual({
      policyName: "🏃 Outdoor Running",
      bestWindow: {
        startTime: 1700010800,
        endTime: 1700010800,
        score: 100,
      },
    });
  });
});