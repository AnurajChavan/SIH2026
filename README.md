# 💧 JAL-SHIELD

## Adaptive Mining-Aware Smart Water Purification & Quality Monitoring System

<p align="center">

**Sense → Identify → Decide → Purify → Verify → Alert**

A smart, adaptive and IoT-enabled water purification system designed for **rural and mining-affected areas**, with real-time water-quality monitoring and contamination-responsive treatment.

</p>

---

## 🌐 Live Dashboard

🚀 **Live Demo:**
https://sih-2026-kappa-three.vercel.app/

The dashboard provides a real-time interface for monitoring water quality, purification stages, system health, alerts, filter status and treatment decisions.

---

# 📌 Problem Statement

Rural and mining-affected regions can face water contamination caused by:

* Suspended particles
* High turbidity
* Elevated TDS
* Iron (Fe)
* Manganese (Mn)
* Organic contaminants
* Microbial contamination
* Changes in groundwater quality

Conventional purification systems often use a **fixed sequence of treatment stages**, even when some stages are unnecessary.

This can result in:

* Higher energy consumption
* Faster filter degradation
* Higher operating cost
* Unnecessary RO operation
* Increased maintenance requirements
* Lack of real-time water-quality verification

---

# 💡 Our Solution

**JAL-SHIELD** is an adaptive smart water purification system that continuously monitors incoming water and dynamically selects the required purification pathway.

Instead of always running every purification stage:

> **The system detects the contamination → selects the required treatment → purifies the water → verifies the output → allows or blocks dispensing.**

### Core Architecture

```text
RAW WATER
     ↓
PRE-FILTER
     ↓
INPUT SENSORS
     ↓
ESP32 / CONTROLLER
     ↓
ADAPTIVE DECISION ENGINE
     ↓
SELECT REQUIRED TREATMENT
     ↓
PURIFICATION
     ↓
OUTPUT SENSORS
     ↓
WATER QUALITY VERIFICATION
     ↓
 ┌───────────────┐
 │    SAFE?      │
 └───────┬───────┘
       YES ↓       ↓ NO
     DISPENSE   RECIRCULATE
                  ↓
               RE-TREAT
```

---

# 🚀 Key Innovation

## Adaptive / Selective Purification

JAL-SHIELD does not blindly operate the complete filtration chain.

The system determines which treatment modules are required based on sensor measurements.

### Example

| Detected Condition                 | Treatment                |
| ---------------------------------- | ------------------------ |
| High turbidity                     | Sediment filtration      |
| High Fe/Mn                         | Fe/Mn removal            |
| High TDS                           | RO/NF                    |
| Organic/odor concern               | Activated carbon/biochar |
| Final microbial safety requirement | UV disinfection          |

The system can therefore reduce unnecessary operation of treatment modules.

> **Note:** Essential safety barriers and final disinfection are configured according to the validated treatment policy. Adaptive logic does not replace drinking-water testing or regulatory validation.

---

# 🧠 System Intelligence

The system contains an **Adaptive Decision Engine**.

### Decision Flow

```text
Sensor Data
     ↓
Data Validation
     ↓
Contamination Classification
     ↓
Treatment Selection
     ↓
Valve / Pump Control
     ↓
Water Purification
     ↓
Output Verification
```

The decision engine determines:

* Which treatment stage should operate
* Which stages can remain bypassed
* When treatment should stop
* Whether additional treatment is required
* Whether water can be dispensed
* Whether water should be recirculated

---

# 📊 Dashboard

The JAL-SHIELD web dashboard provides a centralized monitoring interface.

### Dashboard modules

* Water Safety Status
* Live Water Quality
* Real-Time Trends
* Adaptive Treatment Status
* Output Water Verification
* Alerts & Notifications
* Filter & Maintenance
* System Overview
* Water Source Information
* Reports
* AI Prediction
* Water Passport

---

# 💧 Live Water Quality Monitoring

The system can monitor:

| Parameter    | Sensor             |
| ------------ | ------------------ |
| pH           | pH Sensor          |
| TDS          | TDS/EC Sensor      |
| Turbidity    | Turbidity Sensor   |
| Temperature  | Temperature Sensor |
| Conductivity | EC Sensor          |
| Iron         | Fe Sensor          |
| Manganese    | Mn Sensor          |
| Flow         | Flow Sensor        |
| Pressure     | Pressure Sensor    |

### Important

pH, TDS and turbidity do **not** directly identify specific heavy metals.

JAL-SHIELD therefore treats Fe/Mn detection as a separate sensing requirement.

---

# ⚙️ Adaptive Treatment Modules

### 1. Sediment Filter

Used for:

* Suspended particles
* High turbidity
* Physical impurities

### 2. Fe/Mn Removal

Used for:

* Iron
* Manganese

Possible implementation:

* Oxidation
* Adsorbent media
* Specialized Fe/Mn filter media

### 3. Activated Carbon / Biochar

Potentially used for:

* Organic contaminants
* Odor
* Taste
* Selected dissolved contaminants

Media performance must be experimentally validated for the target contaminant.

### 4. RO/NF

Used when the measured water chemistry requires dissolved-solids reduction.

### 5. UV Disinfection

Used as a final microbial-disinfection stage where configured.

UV does not remove dissolved chemical contaminants.

---

# 🔄 Output Verification

A major feature of JAL-SHIELD is **input + output monitoring**.

After purification, the system measures the treated water again.

```text
INPUT WATER
     ↓
CONTAMINATION DETECTED
     ↓
ADAPTIVE PURIFICATION
     ↓
OUTPUT SENSOR
     ↓
VALIDATION
     ↓
   ┌─────────┐
   │  PASS?  │
   └────┬────┘
      YES ↓       ↓ NO
    DISPENSE   BLOCK OUTPUT
                   ↓
              RECIRCULATION
```

If the output does not satisfy configured validation criteria:

**Dispensing is blocked and the water is sent for additional treatment.**

---

# 📱 Dashboard Features

## Water Safety

Displays:

* SAFE / UNSAFE
* Safety indicator
* Current water status
* Last update
* System connectivity

---

## 📈 Real-Time Trends

Interactive graphs for:

* pH
* TDS
* Turbidity
* Temperature
* Fe
* Mn

Time ranges:

* 1 hour
* 6 hours
* 24 hours
* 7 days

---

## 🔧 Filter & Maintenance

The system monitors filter condition using parameters such as:

* Cumulative water volume
* Operating time
* Flow rate
* Pressure drop

Dashboard displays filter condition and maintenance alerts.

---

# 🚨 Alert System

The dashboard can generate alerts for:

* High TDS
* High turbidity
* High Fe
* High Mn
* Abnormal pH
* Low filter life
* High pressure drop
* Low electrical power availability
* UV fault
* Pump fault
* Unsafe output water

Example:

```text
🔴 HIGH IRON DETECTED

Fe = 1.82 mg/L

Action:
Fe/Mn Removal Activated
```

---

# ⚡ Electrical Power System

JAL-SHIELD operates using an **external electrical power supply**.

```text
AC MAINS ELECTRICITY
        ↓
POWER SUPPLY / SMPS
        ↓
DC REGULATOR
        ↓
 ┌──────┬───────┬──────┬──────┐
ESP32  SENSORS  PUMP   UV   VALVES
```

The power section can include:

* AC-to-DC SMPS
* DC voltage regulators
* Fuse/protection
* Relay/MOSFET driver circuits
* Electrical power monitoring

The dashboard can display:

* Power status
* Pump status
* UV status
* Controller status
* Electrical fault alerts

---

# 📡 IoT Connectivity

Possible communication technologies:

* Wi-Fi
* GSM
* LoRaWAN

The system can support remote monitoring while maintaining local operation when connectivity is unavailable.

### Offline-first concept

```text
SENSORS
   ↓
ESP32
   ↓
LOCAL STORAGE
   ↓
Dashboard

      +
Wi-Fi / GSM / LoRa
      ↓
Cloud / Remote Monitoring
```

---

# 🤖 AI / Predictive Analytics

AI can be used for **prediction and maintenance assistance**, rather than being the sole safety decision-maker.

Potential predictions:

### Water Quality Prediction

Forecast:

* TDS trend
* Turbidity trend
* Fe/Mn trend
* pH trend

### Filter-Life Prediction

Estimate:

* Remaining filter life
* Expected replacement date
* Abnormal pressure increase
* Performance degradation

Example:

```text
RO MEMBRANE

Current Condition: 35%

Predicted Replacement:
12 Days

Confidence:
Demo Prediction
```

Do not claim that AI guarantees drinking-water safety.

---

# 📍 Water Source Monitoring

The system can store:

* Water source
* Source type
* Location
* Unit ID
* Measurement history
* Treatment history

Supported source examples:

* Borewell
* Surface water
* Rural water source
* Mining-affected water

---

# 📄 Water Passport

Each purification unit can have a unique QR-based **Water Passport**.

The QR report can provide:

* Unit ID
* Source location
* Last measurement
* Input water quality
* Treatment performed
* Output water quality
* Verification result
* Filter status
* Timestamp

---

# 🧪 Experimental Validation

The prototype should be experimentally evaluated using controlled water samples.

For contaminant removal:

```text
Removal Efficiency (%)

= ((Ci - Cf) / Ci) × 100
```

Where:

* `Ci` = Initial concentration
* `Cf` = Final concentration

Testing should compare sensor measurements against appropriate reference/laboratory methods.

Actual prototype results should be added to the README after experimentation.

---

# 🏗️ Hardware Architecture

Major components:

* ESP32
* pH Sensor
* TDS/EC Sensor
* Turbidity Sensor
* Temperature Sensor
* Fe Sensor
* Mn Sensor
* Flow Sensor
* Pressure Sensor
* Water-Level Sensor
* Pump
* Solenoid Valves
* Sediment Filter
* Fe/Mn Media
* Activated Carbon/Biochar
* RO/NF Module
* UV Chamber
* OLED Display
* AC-to-DC Power Supply
* DC Regulators
* Electrical Protection Circuit
* Enclosure

---

# 🔌 Software Architecture

```text
┌─────────────────────────────┐
│          SENSORS            │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│            ESP32            │
│       Data Acquisition      │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│   Adaptive Decision Engine  │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│ Pump + Solenoid Controllers │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│    Purification Modules     │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│     Output Verification     │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│       Web Dashboard         │
└─────────────────────────────┘
```

---

# 💻 Technology Stack

### Frontend

* React
* TypeScript
* Tailwind CSS
* Recharts
* Lucide Icons

### Hardware

* ESP32
* Water-quality sensors
* Pumps
* Solenoid valves
* UV module
* Filtration modules

### Communication

* Wi-Fi
* GSM
* LoRaWAN

### Data

* Local storage / SD card
* API
* Cloud database
* Historical sensor data

### Deployment

* Vercel for dashboard deployment

---

# 📂 Suggested Project Structure

```text
JAL-SHIELD/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── charts/
│   │   ├── services/
│   │   └── utils/
│   │
│   └── public/
│
├── firmware/
│   ├── esp32/
│   │   ├── sensors/
│   │   ├── control/
│   │   ├── communication/
│   │   └── main.ino
│
├── docs/
│   ├── block-diagram/
│   ├── research/
│   ├── testing/
│   └── presentations/
│
├── datasets/
│
├── README.md
└── LICENSE
```

---

# 🎯 SIH Demonstration Flow

### STEP 1

Show contaminated raw water.

### STEP 2

Sensor readings detect contamination.

### STEP 3

Dashboard displays:

```text
HIGH TURBIDITY
HIGH IRON
NORMAL TDS
```

### STEP 4

Adaptive Decision Engine selects:

```text
✓ Sediment Filter
✓ Fe/Mn Removal
✗ RO/NF
```

### STEP 5

Water passes through selected treatment modules.

### STEP 6

Output sensors measure treated water.

### STEP 7

```text
OUTPUT VERIFIED

SAFE → DISPENSE
```

### STEP 8

Simulate another contamination condition:

```text
HIGH TDS
```

The system automatically activates:

```text
RO/NF → ON
```

This demonstrates the core innovation of JAL-SHIELD.

---

# 🌍 Applications

JAL-SHIELD can be adapted for:

* Rural communities
* Mining-affected villages
* Borewell water treatment
* Remote field stations
* Schools
* Community water systems
* Disaster/emergency water treatment
* Mining-site monitoring
* Portable purification units

---

# 📈 Scalability

The architecture can be scaled into:

### Home Unit

10–20 L/h

### Community Unit

50–100 L/h

### Portable Field Unit

Designed for temporary deployment and emergency applications.

The exact flow rate and treatment configuration should be selected based on the target water source and validated treatment requirements.

---

# 💰 Prototype Cost

Estimated prototype cost:

**₹8,000 – ₹15,000**

depending primarily on:

* Fe/Mn sensing approach
* Pump capacity
* RO/NF module
* UV system
* Sensors
* Electrical power system
* Enclosure

A detailed BOM should be maintained separately for the final prototype.

---

# 🔬 Research & Validation

The project is supported by research in:

* Smart water-quality monitoring
* IoT-based purification
* Mining-impacted water treatment
* Biochar/adsorption
* Adaptive purification
* Remote water monitoring

Research findings should be used to justify component selection and treatment mechanisms, while actual prototype performance must be established through controlled experiments.

---

# ⚠️ Important Scientific Limitation

JAL-SHIELD is a **prototype research and monitoring system**.

Sensor readings alone should not be treated as proof of drinking-water safety.

In particular:

* TDS does not identify individual contaminants.
* pH does not identify heavy metals.
* Turbidity does not establish microbiological safety.
* UV disinfects microorganisms but does not remove dissolved chemicals.
* Activated carbon/biochar performance depends on contaminant, media, pH, contact time and saturation.
* Fe/Mn sensors require calibration and reference validation.

Before real-world drinking-water deployment, the treatment system must be validated against applicable drinking-water requirements and laboratory testing.

---

# 🚀 Future Development

* Real ESP32 hardware integration
* GSM/LoRa remote monitoring
* Automated chemical dosing where appropriate
* Advanced Fe/Mn sensing
* Better contaminant-specific sensors
* Predictive filter maintenance
* Offline-first mobile application
* Community-scale purification
* Automated calibration
* Laboratory validation
* Cloud-based multi-unit monitoring

---

# 🏆 Project Highlights

| Feature                     | JAL-SHIELD |
| --------------------------- | ---------- |
| Real-time monitoring        | ✅          |
| Adaptive treatment          | ✅          |
| Mining-aware treatment      | ✅          |
| Fe/Mn monitoring            | ✅          |
| Input + output verification | ✅          |
| Automatic recirculation     | ✅          |
| IoT dashboard               | ✅          |
| Filter-life monitoring      | ✅          |
| Electrical operation        | ✅          |
| Offline capability          | ✅          |
| AI prediction               | ✅          |
| QR Water Passport           | ✅          |
| Modular architecture        | ✅          |

---

# 👥 Team

**Smart India Hackathon 2026**

Project:

**JAL-SHIELD**

**Adaptive Mining-Aware Smart Water Purification & Quality Monitoring System**

Problem Domain:

**Smart Water Purification & Quality Monitoring for Rural and Mining-Affected Areas**

---

# 📜 License

This project is developed as an academic/hackathon prototype for Smart India Hackathon 2026.

---

# 💧 JAL-SHIELD

### Sense. Identify. Decide. Purify. Verify.

**Smart Water. Smarter Purification. Safer Communities.**
