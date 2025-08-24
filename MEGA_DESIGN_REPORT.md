# SEHAT SATHI – Mega Design Report

## Executive Summary

A smart wearable ECG device designed for rural India, centered on accessibility, cultural sensitivity, and sustainability. The companion Sehat Sathi PWA enables ASHA/health workers to register patients, log ECG readings, view alerts, and provide actionable insights with a clean, offline-capable interface.

- **Problem**: Limited access to timely cardiac diagnosis in rural Gujarat.
- **Solution**: Wearable AI-enabled ECG device with detachable, culturally integrated design; paired with a PWA for data capture and triage.
- **Outcomes**: Early anomaly detection, reduced travel burden, culturally resonant adoption, and sharable community resource.

---

## 1. Context and Motivation

- Rural India has 60% population but ~30% medical professionals. Healthcare access is limited, stigmatized, and distant. This project aims to bring diagnostics to people.
- The solution aligns with UN SDG 3.4 by enabling early detection and preventive care with point-of-care technology.

### Location: Kutch, Gujarat

- ~57.4% rural population; long distances to hospitals (e.g., 70 minutes).
- Rich handicrafts culture and strong emotional intelligence—opportunity for culturally embedded design.

---

## 2. Concept Overview

- **Device**: Xiao ESP32S3 + 6-axis IMU + ECG sensor, haptic motor; detachable via magnet-electrode mechanism for washability and community sharing.
- **Interactions**: RGB light motifs (contextual colors and animations), button, haptics for alerts and feedback.
- **AI on-device**: Real-time anomaly detection, live activity classification.
- **Cultural Integration**: Motifs and colors drawn from local embroidery and crafts to destigmatize and improve everyday acceptance.

---

## 3. Precedents and Research (Selected)

- D-Heart Portable ECG: Portable and connected; trade-offs in complexity and cost.
- VivaLNK Wearable ECG: Comfortable continuous monitoring; cost and consumables are considerations.
- Academic references include Kalra et al. (2023), Perez & Zeadally (2021), and others on wearable sensing, IoT in healthcare, and AI-enabled monitoring.

(Full references reproduced at the end.)

---

## 4. Prototyping Journey

- v1: 3D printed enclosure; explored e-ink displays for non-emissive UI.
- v2 → v3.2: Reduced size; migrated to RGB matrix, haptics, and button interactions; refined detachable mechanism.
- v3.3 → v4: Integrated cultural motifs as communicative surfaces; improved LED animations; finishes and color trials.

---

## 5. Final Design Highlights

- **Detachable and Shareable**: Magnets as both attachment and electrode contacts; protects device during washing; supports community sharing.
- **Power and Compute**: Xiao ESP32S3 runs ML model; local anomaly detection for low-connectivity scenarios.
- **UX Signals**: RGB motifs communicate state (alert, success, attention), with haptics and simple button interactions.

---

## 6. Sustainability and Ethics

- Detachability supports the Ellen MacArthur Foundation’s inner loop: share and extend lifespan.
- Culturally sensitive form language reduces stigma and promotes consistent use.
- Privacy and security considerations for health data are central; app scaffolds clear consent and data handling flows.

---

## 7. Sehat Sathi Web App (PWA) Overview

The PWA complements the hardware by enabling field workflows for ASHA/health workers.

### 7.1 Features

- **Dashboard**: Current HR overview, monitored patients count, model accuracy snapshot, and quick actions.
- **Patients**: Registration form, searchable lists, and detail pages with history.
- **Alerts**: Urgent triage with critical/warning statuses.
- **Activity**: Recent readings and events.
- **Recording**: Guided ECG reading flow with timer and status.
- **Settings**: System info, data security, privacy policy, updates, and logout.

### 7.2 Data Model (Local Demo)

- Uses `localStorage` to persist demo data:
  - `patients`, `alerts`, `activity`, `patientHistory`.
- Programmatic API:
  - `db.getPatients()`, `db.getPatientById(id)`, `db.addPatient(patient)`, `db.getAlerts()`, `db.getActivity()`, `db.getHistoryForPatient(patientId)`, `db.addReadingToHistory(patientId, reading)`.

### 7.3 Key UI Structure

- Main entry: `Sehat.html`
- Styles: `style.css`
- Logic: `script.js`
- Manifest: `manifest.json`
- Icons: `default-icon.png` (192×192, 512×512)

### 7.4 Navigation Flow

- `switchPage(pageId, navItem)` controls page transitions and header/nav updates.
- `updateHeader(pageId)` sets title and back button visibility.
- `populatePageContent(pageId)` renders page-specific content and metrics.

### 7.5 Demo Data and Seeding

- On initialization, demo datasets for realistic UI are written to `localStorage` for immediate exploration.

### 7.6 Offline and PWA Setup

- `manifest.json` declares PWA name, colors, icons, and `start_url` as `Sehat.html` with standalone display.
- Service worker files present: `service-worker.js` and `service-worker.json` (cache and fetch handlers).
- Note: Service worker registration is not yet included in `Sehat.html`. To enable offline mode, add:

```html
<script>
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("service-worker.js");
    });
  }
</script>
```

### 7.7 Project Scripts

- `package.json` present; app is static and can be served by any static server.

### 7.8 How to Run

- Option A: Open `Sehat.html` directly in a browser.
- Option B (recommended for PWA features): Serve via a local HTTP server:

```bash
npx serve -s .
# or
python3 -m http.server 5173
```

Then open `http://localhost:5173/Sehat.html` and install as a PWA.

---

## 8. User Journeys

- **Primary User (Villager)**: Wears device, receives haptic/light alerts, visits community worker when prompted.
- **Secondary User (Health Worker)**: Registers patients, records readings, monitors alerts, schedules follow-ups, and escalates as needed.

---

## 9. Risks and Mitigations

- **Battery Life**: Optimize duty cycling; provide charging workflows and low-power modes.
- **Cost**: Use modular components; shareable device policy; community charging hubs.
- **Connectivity**: On-device ML and offline-first PWA; sync when available.
- **Privacy**: Consent flows, encryption at rest/in transit when syncing, role-based access in future versions.

---

## 10. Roadmap

- v0: Demo PWA with seeded data and UI flows (current).
- v1: Real ECG integration via Web Bluetooth / bridge app; secure storage abstraction.
- v2: Sync to backend, clinician dashboard, role-based access, audit logs.
- v3: On-device model updates, federated learning for privacy-preserving improvements.

---

## 11. Gantt (High-Level)

- Weeks 6–11: Research, context, technology, culture study, concept development, design, prototype, documentation, renders, poster, report, exhibition planning and execution.

---

## 12. Designer’s Statement (Tejas Patel)

I am Tejas Patel, an Industrial/Product Designer based in Sydney (UNSW DDES9017). My practice integrates function with cultural context to create meaningful, sustainable interactions. This project responds to inequities in rural healthcare by fusing med-tech with local aesthetics to encourage adoption and reduce stigma.

---

## 13. Full Project Report (Integrated)

The following content reproduces and integrates your detailed narrative to preserve intent and context:

> A smart wearable ECG device designed for Rural India. Kutch, Gujarat. Evolution of Prototypes. In rural India, healthcare accessibility is a significant challenge, with only 30% of medical professionals serving 60% of the population. My design project addresses this issue through an innovative wearable AI-powered ECG monitoring device. This device brings healthcare to people, making it more accessible and less stigmatized. The device features real-time ECG and activity monitoring, with an AI system that detects anomalies and alerts users. Its design, inspired by the cultural aesthetics of the Kutch region in Gujarat, blends seamlessly into the local culture, making it more acceptable and assimilating for users. Sustainability and cultural sensitivity were key considerations in the design process. The device is detachable, enhancing sustainability by allowing it to be shared within the community and protected during garment washing... [truncated for brevity in this section; see `project report.txt` for the full text.]

For the full text, refer to `project report.txt` in the repository root.

---

## 14. Bibliography (Selected)

- Kalra, A., et al. (2023). The burgeoning cardiovascular disease epidemic in Indians – perspectives on contextual factors and solutions. The Lancet Regional Health - Southeast Asia.
- Perez, A. J., & Zeadally, S. (2021). Recent Advances in Wearable Sensing Technologies. Sensors.
- Doughty, K., & Livingstone, A. (2017). The Role of Technology in a Rural Environment. J. Corporate Citizenship.
- Neri, L., et al. (2023). ECG Wearables and AI Diagnostics: A Review. Sensors.
- Konwar, A. N., & Borse, V. (2020). Point-of-care devices in Indian healthcare. Sensors International.
- Vivalink (n.d.), D-Heart (n.d.).

---

## 15. Appendix

- `manifest.json`: PWA metadata (name, colors, icons, start URL).
- `service-worker.js`: Cache-first fetch; consider aligning `CACHE_NAME` usage and cached URLs; add registration in HTML.
- `Sehat.html`: Responsive app shell, dashboard, navigation, modals.
- `script.js`: Local data store (`localStorage`), navigation, demo seeding, UI logic, forms and modals.
- `style.css`: Comprehensive design system and component styles for mobile-first UI.
