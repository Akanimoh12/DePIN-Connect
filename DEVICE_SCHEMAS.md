# Sample Device Schemas for Demo

Copy and paste these JSON schemas when registering devices. Each represents a different type of IoT sensor.

---

## 1. Weather Station (weather-station-001)

```json
{
  "type": "weather",
  "temperature": "celsius",
  "humidity": "percentage",
  "pressure": "hPa",
  "windSpeed": "km/h",
  "windDirection": "degrees",
  "location": {
    "lat": "number",
    "lng": "number"
  },
  "updateFrequency": "60s"
}
```

---

## 2. Air Quality Monitor (air-quality-sensor-001)

```json
{
  "type": "air_quality",
  "pm25": "μg/m³",
  "pm10": "μg/m³",
  "co2": "ppm",
  "voc": "ppb",
  "temperature": "celsius",
  "humidity": "percentage",
  "aqi": "index",
  "location": {
    "lat": "number",
    "lng": "number"
  },
  "updateFrequency": "30s"
}
```

---

## 3. Traffic Sensor (traffic-monitor-001)

```json
{
  "type": "traffic",
  "vehicleCount": "number",
  "averageSpeed": "km/h",
  "congestionLevel": "low/medium/high",
  "roadCondition": "dry/wet/snow",
  "timestamp": "ISO8601",
  "location": {
    "lat": "number",
    "lng": "number",
    "roadName": "string"
  },
  "updateFrequency": "15s"
}
```

---

## Quick Copy Format (Minified)

**Weather Station:**
```json
{"type":"weather","temperature":"celsius","humidity":"percentage","pressure":"hPa","windSpeed":"km/h","windDirection":"degrees","location":{"lat":"number","lng":"number"},"updateFrequency":"60s"}
```

**Air Quality:**
```json
{"type":"air_quality","pm25":"μg/m³","pm10":"μg/m³","co2":"ppm","voc":"ppb","temperature":"celsius","humidity":"percentage","aqi":"index","location":{"lat":"number","lng":"number"},"updateFrequency":"30s"}
```

**Traffic:**
```json
{"type":"traffic","vehicleCount":"number","averageSpeed":"km/h","congestionLevel":"low/medium/high","roadCondition":"dry/wet/snow","timestamp":"ISO8601","location":{"lat":"number","lng":"number","roadName":"string"},"updateFrequency":"15s"}
```

---

## Additional Device Ideas

### 4. Smart Parking Sensor
```json
{"type":"parking","spaceId":"string","occupied":"boolean","duration":"minutes","location":{"lat":"number","lng":"number"},"updateFrequency":"5s"}
```

### 5. Energy Monitor
```json
{"type":"energy","powerUsage":"watts","voltage":"volts","current":"amps","frequency":"Hz","totalConsumption":"kWh","location":{"lat":"number","lng":"number"},"updateFrequency":"10s"}
```

### 6. Water Quality Sensor
```json
{"type":"water_quality","ph":"level","turbidity":"NTU","temperature":"celsius","dissolvedOxygen":"mg/L","conductivity":"μS/cm","location":{"lat":"number","lng":"number"},"updateFrequency":"120s"}
```
