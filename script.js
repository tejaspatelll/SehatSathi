
        // --- Database (localStorage) ---
        const db = {
            _get: (key) => JSON.parse(localStorage.getItem(key)),
            _set: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
            
            init: function() {
                // Force refresh demo data for realistic UI demonstration
                this._set('patients', dummyPatients);
                this._set('alerts', dummyAlerts);
                this._set('activity', dummyActivity);
                this._set('patientHistory', dummyPatientHistory);
            },
            
            reset: function() {
                // Clear all data and reinitialize with fresh demo data
                localStorage.clear();
                this.init();
            },
            
            getPatients: function() { return this._get('patients') || []; },
            getPatientById: function(id) {
                return this.getPatients().find(p => p.id === id);
            },
            addPatient: function(patient) {
                const patients = this.getPatients();
                patients.unshift(patient); // Add to the top
                this._set('patients', patients);
            },
            
            getAlerts: function() { return this._get('alerts') || []; },
            
            getActivity: function() { return this._get('activity') || []; },
            
            getHistoryForPatient: function(patientId) {
                const allHistory = this._get('patientHistory') || {};
                return allHistory[patientId] || [];
            },
            addReadingToHistory: function(patientId, reading) {
                const allHistory = this._get('patientHistory') || {};
                if (!allHistory[patientId]) {
                    allHistory[patientId] = [];
                }
                allHistory[patientId].unshift(reading);
                this._set('patientHistory', allHistory);
            }
        };

        // --- State & Elements ---
        let currentPage = 'dashboard-page';
        let currentPatientId = null; // To track the currently viewed patient
        let currentHR = 85;
        let hrInterval;
        let ecgTimerInterval;
        let ecgSecondsRemaining = 30;

        // --- Enhanced Demo Data for Realistic Healthcare UI ---
        const dummyPatients = [
            { id: 'KUTCH-1023', name: 'Amisha Patel', age: 42, village: 'Bhuj', status: 'normal', hr: 75, hrv: 'Normal', confidence: '98%', lastReading: '2024-01-15', gender: 'Female' },
            { id: 'KUTCH-1045', name: 'Rajesh Kumar', age: 56, village: 'Anjar', status: 'anomaly', hr: 98, hrv: 'High', confidence: '89%', lastReading: '2024-01-16', gender: 'Male' },
            { id: 'KUTCH-1078', name: 'Geeta Sharma', age: 65, village: 'Bhuj', status: 'anomaly', hr: 65, hrv: 'Very High', confidence: '91%', lastReading: '2024-01-16', gender: 'Female' },
            { id: 'KUTCH-1112', name: 'Vishal Singh', age: 29, village: 'Mandvi', status: 'normal', hr: 72, hrv: 'Normal', confidence: '99%', lastReading: '2024-01-14', gender: 'Male' },
            { id: 'KUTCH-1156', name: 'Lakshmi Ben', age: 61, village: 'Mundra', status: 'anomaly', hr: 88, hrv: 'High', confidence: '87%', lastReading: '2024-01-15', gender: 'Female' },
            { id: 'KUTCH-1189', name: 'Mukesh Joshi', age: 44, village: 'Anjar', status: 'normal', hr: 76, hrv: 'Normal', confidence: '96%', lastReading: '2024-01-12', gender: 'Male' },
            { id: 'KUTCH-1203', name: 'Priya Desai', age: 38, village: 'Bhuj', status: 'pending', hr: '--', hrv: '--', confidence: '--', lastReading: null, gender: 'Female' },
            { id: 'KUTCH-1267', name: 'Suresh Patel', age: 59, village: 'Mandvi', status: 'normal', hr: 82, hrv: 'Normal', confidence: '95%', lastReading: '2024-01-10', gender: 'Male' },
            { id: 'KUTCH-1290', name: 'Kavita Modi', age: 33, village: 'Bhuj', status: 'normal', hr: 68, hrv: 'Normal', confidence: '97%', lastReading: '2024-01-16', gender: 'Female' },
            { id: 'KUTCH-1312', name: 'Ashok Gupta', age: 47, village: 'Mandvi', status: 'normal', hr: 79, hrv: 'Normal', confidence: '94%', lastReading: '2024-01-15', gender: 'Male' },
            { id: 'KUTCH-1345', name: 'Sunita Rao', age: 52, village: 'Anjar', status: 'anomaly', hr: 92, hrv: 'High', confidence: '88%', lastReading: '2024-01-16', gender: 'Female' },
            { id: 'KUTCH-1367', name: 'Kishan Vyas', age: 41, village: 'Mundra', status: 'normal', hr: 74, hrv: 'Normal', confidence: '96%', lastReading: '2024-01-14', gender: 'Male' }
        ];
        const dummyAlerts = [
            { id: 'ALT-001', patientId: 'KUTCH-1045', patientName: 'Rajesh Kumar', type: 'critical', message: 'Irregular heartbeat detected - Urgent review needed', timestamp: '2024-01-16T09:35:00', isRead: false },
            { id: 'ALT-002', patientId: 'KUTCH-1078', patientName: 'Geeta Sharma', type: 'critical', message: 'Elevated HR with abnormal rhythm patterns', timestamp: '2024-01-16T11:20:00', isRead: false },
            { id: 'ALT-003', patientId: 'KUTCH-1156', patientName: 'Lakshmi Ben', type: 'warning', message: 'High HR variability detected', timestamp: '2024-01-15T16:45:00', isRead: false },
            { id: 'ALT-004', patientId: 'KUTCH-1345', patientName: 'Sunita Rao', type: 'critical', message: 'Abnormal ECG reading - Requires immediate attention', timestamp: '2024-01-16T14:22:00', isRead: false },
            { id: 'ALT-005', patientId: 'KUTCH-1203', patientName: 'Priya Desai', type: 'warning', message: 'Initial screening pending - Schedule appointment', timestamp: '2024-01-15T12:10:00', isRead: false },
        ];
        const dummyActivity = [
            { id: 'ACT-001', patientId: 'KUTCH-1045', patientName: 'Rajesh Kumar', type: 'reading', message: 'ECG Reading completed - Anomaly detected', timestamp: '2024-01-16T09:30:00' },
            { id: 'ACT-002', patientId: 'KUTCH-1078', patientName: 'Geeta Sharma', type: 'reading', message: 'ECG Reading completed - Critical alert triggered', timestamp: '2024-01-16T11:15:00' },
            { id: 'ACT-003', patientId: 'KUTCH-1345', patientName: 'Sunita Rao', type: 'reading', message: 'ECG Reading completed - Follow-up required', timestamp: '2024-01-16T14:20:00' },
            { id: 'ACT-004', patientId: 'KUTCH-1290', patientName: 'Kavita Modi', type: 'reading', message: 'ECG Reading completed - Normal results', timestamp: '2024-01-16T10:45:00' },
            { id: 'ACT-005', patientId: 'KUTCH-1203', patientName: 'Priya Desai', type: 'patient', message: 'New patient registered - Initial screening pending', timestamp: '2024-01-15T14:22:00' },
            { id: 'ACT-006', patientId: 'KUTCH-1156', patientName: 'Lakshmi Ben', type: 'reading', message: 'ECG Reading completed - High variability noted', timestamp: '2024-01-15T16:40:00' },
            { id: 'ACT-007', patientId: 'KUTCH-1312', patientName: 'Ashok Gupta', type: 'reading', message: 'ECG Reading completed - Normal rhythm', timestamp: '2024-01-15T13:25:00' },
            { id: 'ACT-008', patientId: 'KUTCH-1112', patientName: 'Vishal Singh', type: 'reading', message: 'ECG Reading completed - Excellent baseline', timestamp: '2024-01-14T10:05:00' },
        ];
        const dummyPatientHistory = {
            'KUTCH-1045': [
                { id: 'HIST-1045-1', timestamp: '2024-01-16T09:30:00', hr: 98, hrv: 'High', status: 'anomaly', notes: 'Patient reported chest discomfort - Urgent follow-up scheduled' },
                { id: 'HIST-1045-2', timestamp: '2024-01-09T14:15:00', hr: 82, hrv: 'Normal', status: 'normal', notes: 'Routine checkup - Baseline established' },
                { id: 'HIST-1045-3', timestamp: '2023-12-25T10:20:00', hr: 85, hrv: 'Normal', status: 'normal', notes: 'Follow-up after medication adjustment' },
            ],
            'KUTCH-1078': [
                { id: 'HIST-1078-1', timestamp: '2024-01-16T11:15:00', hr: 65, hrv: 'Very High', status: 'anomaly', notes: 'Patient reported dizziness and fatigue' },
                { id: 'HIST-1078-2', timestamp: '2024-01-02T15:30:00', hr: 67, hrv: 'High', status: 'anomaly', notes: 'Continuing irregular patterns' },
                { id: 'HIST-1078-3', timestamp: '2023-12-18T09:45:00', hr: 70, hrv: 'Normal', status: 'normal', notes: 'Initial baseline assessment' },
            ],
            'KUTCH-1345': [
                { id: 'HIST-1345-1', timestamp: '2024-01-16T14:20:00', hr: 92, hrv: 'High', status: 'anomaly', notes: 'Elevated readings - Stress-related patterns observed' },
                { id: 'HIST-1345-2', timestamp: '2024-01-08T11:30:00', hr: 78, hrv: 'Normal', status: 'normal', notes: 'Follow-up after lifestyle counseling' },
            ]
        };

        // --- Enhanced Toast Notifications ---
        function showToast(message, type = 'default', duration = 4000) {
            const toastArea = document.getElementById('toastArea');
             if (!toastArea) return;

             const toast = document.createElement('div');
            toast.className = `toast-message ${type === 'success' ? 'toast-success' : type === 'error' ? 'toast-error' : type === 'warning' ? 'toast-warning' : ''}`;
             toast.textContent = message;
            
             toastArea.appendChild(toast);
            
            // Trigger animation
            setTimeout(() => toast.classList.add('show'), 100);
            
            // Remove toast
             setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
             }, duration);
         }

        // --- Modal Handling ---
        function openModal(modalId) {
            const modal = document.getElementById(modalId);
            if(modal) modal.classList.remove('hidden');
        }
        function closeModal(modalId) {
            const modal = document.getElementById(modalId);
            if(modal) modal.classList.add('hidden');
        }

        // --- Enhanced Page Navigation ---
        function switchPage(pageId, navItem) {
            // Hide all pages
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });
            
            // Show target page
            const targetPage = document.getElementById(pageId);
            if (targetPage) {
                    targetPage.classList.add('active');
                currentPage = pageId;
                
                // Update header
                updateHeader(pageId);
                
                // Update navigation
                updateNavigation(navItem);
                
                // Populate page content
                populatePageContent(pageId);
            }
        }

        function navigateTo(pageId, context) {
            if (pageId === 'patient-detail-page' && context) {
                currentPatientId = context.id;
            }
            switchPage(pageId, null);
        }

        function updateHeader(pageId) {
            const logoContainer = document.querySelector('.logo-container');
            const backButton = document.getElementById('backButton');
            
            const titles = {
                'dashboard-page': 'Sehat Sathi',
                'patients-page': 'Patients',
                'alerts-page': 'Urgent Alerts',
                'activity-page': 'Recent Activity',
                'record-page': 'ECG Recording',
                'settings-page': 'Settings'
            };
            
            const patient = pageId === 'patient-detail-page' ? db.getPatientById(currentPatientId) : null;
            
            if (pageId === 'dashboard-page') {
                // Show logo for dashboard
                logoContainer.style.display = 'flex';
                logoContainer.classList.add('dashboard-active');
                backButton.style.display = 'none';
                
                // Remove page title if it exists
                const existingTitle = document.getElementById('pageTitle');
                if (existingTitle) {
                    existingTitle.remove();
                }
            } else {
                // Remove dashboard-active class
                logoContainer.classList.remove('dashboard-active');
                // Show page title for other pages
                logoContainer.style.display = 'none';
                backButton.style.display = 'flex';
                
                // Create or update page title
                let pageTitle = document.getElementById('pageTitle');
                if (!pageTitle) {
                    pageTitle = document.createElement('h1');
                    pageTitle.id = 'pageTitle';
                    pageTitle.style.marginLeft = 'var(--space-4)';
                    logoContainer.parentNode.insertBefore(pageTitle, logoContainer.nextSibling);
                }
                pageTitle.textContent = patient ? `${patient.name}` : titles[pageId] || 'Sehat Sathi';
            }
        }

        function updateNavigation(activeItem) {
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            
            if (activeItem && activeItem.classList.contains('nav-item')) {
                activeItem.classList.add('active');
            }
        }

        function populatePageContent(pageId) {
            switch (pageId) {
                case 'dashboard-page':
                    enhanceDashboard();
                    break;
                case 'patients-page':
                    populatePatients();
                    break;
                case 'alerts-page':
            populateAlerts();
                    break;
                case 'activity-page':
                    populateActivity();
                    break;
                case 'record-page':
                    initECG();
                    break;
                case 'patient-detail-page':
                    populatePatientDetail();
                    break;
            }
        }

        function enhanceDashboard() {
            // Enhance real-time stats
            updateDashboardStats();
            
            // Populate recent activity preview
            populateRecentActivityPreview();
            
            // Update AI insights with rotating content
            updateAIInsights();
            
            // Add real-time updates
            startDashboardUpdates();
        }

        function updateDashboardStats() {
            const patients = db.getPatients();
            const alerts = db.getAlerts();
            const activity = db.getActivity();
            
            // Update patient count in stats section
            const totalPatientsEl = document.getElementById('totalPatientsCount');
            if (totalPatientsEl) {
                animateCounter(totalPatientsEl, Math.max(0, patients.length));
            }
            
            // Update patient count in dashboard cards
            const patientsCardEl = document.getElementById('patientsCardCount');
            if (patientsCardEl) {
                animateCounter(patientsCardEl, Math.max(0, patients.length));
            }
            
            // Update patients needing attention
            const anomalyPatients = patients.filter(p => p.status === 'anomaly').length;
            const needAttentionEl = document.getElementById('patientsNeedAttention');
            if (needAttentionEl) {
                needAttentionEl.textContent = `${anomalyPatients} need attention`;
            }
            
            // Update urgent alerts count
            const urgentAlertsEl = document.getElementById('urgentAlertsCount');
            const criticalAlerts = alerts.filter(a => a.type === 'critical');
            if (urgentAlertsEl) {
                animateCounter(urgentAlertsEl, Math.max(0, criticalAlerts.length));
            }
            
            // Update activity count (today's readings)
            const today = new Date().toISOString().split('T')[0];
            const todayActivity = activity.filter(a => a.timestamp.startsWith('2024-01-16')); // Use demo date for realistic count
            const activityCardEl = document.getElementById('activityCardCount');
            if (activityCardEl) {
                animateCounter(activityCardEl, Math.max(0, todayActivity.length));
            }
            
            // Update heart rate with realistic variation
            const hrEl = document.getElementById('dashboard-hr');
            if (hrEl) {
                const currentHR = Math.abs(parseInt(hrEl.textContent)) || 74;
                const variation = Math.floor(Math.random() * 6) - 3; // ±3 BPM variation
                const newHR = Math.max(70, Math.min(100, currentHR + variation));
                animateCounter(hrEl, Math.abs(newHR));
            }
        }

        function populateRecentActivityPreview() {
            const container = document.getElementById('recentActivityPreview');
            if (!container) return;
            
            // Add delay to ensure database is ready
            setTimeout(() => {
                const activity = db.getActivity().slice(0, 3); // Get latest 3 activities
                
                if (activity.length === 0) {
                    container.innerHTML = `
                        <div style="text-align: center; padding: var(--space-6); color: var(--text-muted);">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: var(--space-3); opacity: 0.5;">
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                            </svg>
                            <div style="font-weight: 600; margin-bottom: var(--space-1);">No recent activity</div>
                            <div style="font-size: var(--font-size-sm);">Start monitoring patients to see activity here</div>
                        </div>
                    `;
                    return;
                }
                
                container.innerHTML = activity.map((item, index) => {
                    const timestamp = new Date(item.timestamp);
                    const timeFormatted = timestamp.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                });

                    const activityIcon = item.type === 'reading' ? 
                        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>' :
                        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>';
                    
                    return `
                        <div class="activity-preview-item" style="display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3); background: rgba(102, 126, 234, 0.03); border-radius: var(--radius-lg); margin-bottom: var(--space-2); animation-delay: ${0.1 + (index * 0.05)}s;">
                            <div style="width: 32px; height: 32px; background: var(--primary-light); border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; color: var(--primary-color);">
                                ${activityIcon}
                            </div>
                            <div style="flex: 1;">
                                <div style="font-weight: 600; font-size: var(--font-size-sm); color: var(--text-primary);">${item.patientName}</div>
                                <div style="font-size: var(--font-size-xs); color: var(--text-muted); margin-top: var(--space-1);">${item.message}</div>
                            </div>
                            <div style="font-size: var(--font-size-xs); color: var(--text-muted); font-weight: 500;">${timeFormatted}</div>
                        </div>
                    `;
                }).join('');
            }, 500);
        }

        function updateAIInsights() {
            const insights = [
                {
                    icon: "📊",
                    title: "Today's Pattern Analysis",
                    text: "2 patients show irregular HRV patterns. Consider prioritizing Rajesh Kumar and Geeta Sharma for follow-up consultations."
                },
                {
                    icon: "🎯",
                    title: "Efficiency Insight",
                    text: "Your detection accuracy has improved by 8% this week. Keep up the excellent monitoring routine for optimal patient care."
                },
                {
                    icon: "⚡",
                    title: "Risk Assessment",
                    text: "Low overall risk score today. 3 patients scheduled for routine follow-ups. No immediate interventions required."
                },
                {
                    icon: "🔄",
                    title: "Workflow Optimization",
                    text: "Consider batching morning readings for better efficiency. Optimal monitoring window: 9-11 AM for most accurate readings."
                }
            ];
            
            let currentInsightIndex = 0;
            
            function rotateInsights() {
                const insightEl = document.getElementById('aiInsight');
                if (!insightEl) return;
                
                const insight = insights[currentInsightIndex];
                
                // Smooth transition
                insightEl.style.opacity = '0.6';
                insightEl.style.transform = 'translateY(-10px)';
                
                setTimeout(() => {
                    insightEl.querySelector('.insight-icon').textContent = insight.icon;
                    insightEl.querySelector('.insight-text').innerHTML = `<strong>${insight.title}:</strong> ${insight.text}`;
                    
                    insightEl.style.opacity = '1';
                    insightEl.style.transform = 'translateY(0)';
                    
                    currentInsightIndex = (currentInsightIndex + 1) % insights.length;
                }, 300);
            }
            
            // Initial call
            rotateInsights();
            
            // Rotate insights every 30 seconds
            setInterval(rotateInsights, 30000);
        }

        function startDashboardUpdates() {
            // Update dashboard stats every 10 seconds
            setInterval(updateDashboardStats, 10000);
            
            // Update activity preview every 30 seconds
            setInterval(populateRecentActivityPreview, 30000);
        }

        function animateCounter(element, targetValue) {
            // Ensure target value is always positive
            targetValue = Math.max(0, targetValue);
            
            // Get current value and ensure it's positive
            const currentValue = Math.max(0, parseInt(element.textContent.replace(/[^0-9]/g, '')) || 0);
            const totalSteps = Math.abs(targetValue - currentValue);
            
            // For small differences or first time, just set the value directly
            if (totalSteps === 0 || totalSteps > 10 || currentValue === 0) {
                element.textContent = targetValue;
                element.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    element.style.transform = 'scale(1)';
                }, 200);
                return;
            }
            
            const increment = targetValue > currentValue ? 1 : -1;
            const stepDuration = Math.min(50, 300 / totalSteps);
            
            let current = currentValue;
            const timer = setInterval(() => {
                current += increment;
                // Ensure we never display negative numbers
                const displayValue = Math.max(0, current);
                element.textContent = displayValue;
                
                if (current === targetValue) {
                    clearInterval(timer);
                    // Add a subtle scale animation when done
                    element.style.transform = 'scale(1.05)';
                    setTimeout(() => {
                        element.style.transform = 'scale(1)';
                    }, 200);
                }
            }, stepDuration);
        }

        function populatePatients() {
            const patients = db.getPatients(); // Use db
            const container = document.getElementById('patientListContainer');
            if (!container) return;
            
            container.innerHTML = '';
            
            patients.forEach((patient, index) => {
                const patientElement = document.createElement('div');
                patientElement.className = 'patient-list-item stagger-item premium-hover';
                patientElement.style.animationDelay = `${0.1 + (index * 0.05)}s`;
                patientElement.dataset.status = patient.status;
                patientElement.dataset.patientId = patient.id;
                
                // Calculate priority and time since last reading
                const priority = calculatePriority(patient);
                const timeSince = getTimeSinceLastReading(patient.lastReading);
                
                if (priority === 'high') patientElement.classList.add('priority-high');
                if (priority === 'medium') patientElement.classList.add('priority-medium');
                
                const initials = patient.name.split(' ').map(n => n[0]).join('');
                
                patientElement.innerHTML = `
                    <div class="patient-avatar">${initials}</div>
                    <div class="patient-info">
                        <div class="patient-name">${patient.name}</div>
                        <div class="patient-meta">${patient.age} years • ${patient.village}</div>
                        ${timeSince ? `<div class="patient-time-since">${timeSince}</div>` : ''}
                    </div>
                    <div style="display: flex; flex-direction: column; align-items: flex-end; gap: var(--space-1);">
                        <div class="patient-status status-${patient.status}">${patient.status}</div>
                        ${patient.hr ? `<div style="font-size: var(--font-size-xs); color: var(--text-muted);">${patient.hr} BPM</div>` : ''}
                        ${priority === 'high' ? '<div style="font-size: var(--font-size-xs); color: var(--danger-color); font-weight: 600;">🚨 Urgent</div>' : ''}
                    </div>
                `;
                
                patientElement.onclick = () => {
                    // Add haptic feedback simulation
                    patientElement.style.transform = 'scale(0.98)';
                    setTimeout(() => {
                        patientElement.style.transform = '';
                        navigateTo('patient-detail-page', patient);
                    }, 100);
                };
                
                container.appendChild(patientElement);
            });
        }

        function populateAlerts() {
            const alerts = db.getAlerts(); // Use db
            const container = document.querySelector('#alerts-page .alerts-list');
            if (!container) return;
            
            container.innerHTML = '';
            
            alerts.forEach((alert, index) => {
                const alertElement = document.createElement('div');
                alertElement.className = `alert-item ${alert.type} stagger-item premium-hover`;
                alertElement.style.animationDelay = `${0.1 + (index * 0.05)}s`;
                alertElement.dataset.alertId = alert.id;
                alertElement.dataset.patientId = alert.patientId;
                alertElement.dataset.priority = alert.type;
                
                const timestamp = new Date(alert.timestamp);
                const timeFormatted = timestamp.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                });
                const dateFormatted = timestamp.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                });
                
                // Enhanced icons with better styling
                const alertIcon = alert.type === 'critical' ? 
                    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>' :
                    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>';
                
                // Calculate time since alert
                const now = new Date();
                const alertTime = new Date(alert.timestamp);
                const diffMinutes = Math.floor((now - alertTime) / (1000 * 60));
                const timeAgo = diffMinutes < 60 ? `${diffMinutes}m ago` : 
                              diffMinutes < 1440 ? `${Math.floor(diffMinutes/60)}h ago` : 
                              `${Math.floor(diffMinutes/1440)}d ago`;
                
                // Priority badge
                const priorityBadge = alert.type === 'critical' ? 
                    '<span style="background: rgba(239, 68, 68, 0.2); color: #ef4444; padding: var(--space-1) var(--space-2); border-radius: var(--radius-full); font-size: var(--font-size-xs); font-weight: 700; margin-left: var(--space-2);">🚨 URGENT</span>' :
                    '<span style="background: rgba(245, 158, 11, 0.2); color: #f59e0b; padding: var(--space-1) var(--space-2); border-radius: var(--radius-full); font-size: var(--font-size-xs); font-weight: 700; margin-left: var(--space-2);">⚠️ WARNING</span>';
                
                alertElement.innerHTML = `
                    <div class="alert-icon ${alert.type}">${alertIcon}</div>
                    <div class="alert-content">
                        <div class="alert-header">
                            <div style="display: flex; align-items: center;">
                                <span class="alert-patient">${alert.patientName}</span>
                                ${priorityBadge}
                            </div>
                            <div style="text-align: right;">
                                <div class="alert-time">${dateFormatted}, ${timeFormatted}</div>
                                <div style="font-size: var(--font-size-xs); color: #64748b; margin-top: var(--space-1);">${timeAgo}</div>
                            </div>
                        </div>
                        <p class="alert-message">${alert.message}</p>
                        <div class="alert-actions" style="display: flex; gap: var(--space-2); margin-top: var(--space-3);">
                            <button class="alert-action-btn primary" onclick="handleAlertAction('${alert.id}', 'view')" style="background: rgba(59, 130, 246, 0.2); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.3); padding: var(--space-2) var(--space-3); border-radius: var(--radius-lg); font-size: var(--font-size-sm); font-weight: 500; cursor: pointer; transition: all var(--transition-fast);">
                                👁️ View Patient
                            </button>
                            <button class="alert-action-btn secondary" onclick="handleAlertAction('${alert.id}', 'resolve')" style="background: rgba(34, 197, 94, 0.2); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.3); padding: var(--space-2) var(--space-3); border-radius: var(--radius-lg); font-size: var(--font-size-sm); font-weight: 500; cursor: pointer; transition: all var(--transition-fast);">
                                ✓ Mark Resolved
                            </button>
                            ${alert.type === 'critical' ? `
                            <button class="alert-action-btn emergency" onclick="handleAlertAction('${alert.id}', 'emergency')" style="background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); padding: var(--space-2) var(--space-3); border-radius: var(--radius-lg); font-size: var(--font-size-sm); font-weight: 700; cursor: pointer; transition: all var(--transition-fast);">
                                🚨 Emergency Call
                            </button>
                            ` : ''}
                        </div>
                    </div>
                `;
                
                alertElement.onclick = (e) => {
                    // Prevent triggering when clicking action buttons
                    if (e.target.classList.contains('alert-action-btn')) return;
                    
                    // Add haptic feedback
                    alertElement.style.transform = 'scale(0.98)';
                    setTimeout(() => {
                        alertElement.style.transform = '';
                        showToast(`Opening details for ${alert.patientName}`, 'info');
                        // Navigate to patient details if needed
                        const patient = db.getPatientById(alert.patientId);
                        if (patient) {
                            navigateTo('patient-detail-page', patient);
                        }
                    }, 100);
                };
                
                container.appendChild(alertElement);
            });
            
            // Update alert counts
            updateAlertCounts();
        }

        function populateActivity() {
            const activity = db.getActivity(); // Use db
            const container = document.querySelector('#activity-page .activity-list');
            if (!container) return;
            
            container.innerHTML = '';
            
            activity.forEach((activity, index) => {
                const activityElement = document.createElement('div');
                activityElement.className = 'alert-item stagger-item';
                activityElement.style.animationDelay = `${0.1 + (index * 0.05)}s`;
                
                const timestamp = new Date(activity.timestamp);
                const timeFormatted = timestamp.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                });
                const dateFormatted = timestamp.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                });
                
                const activityIcon = activity.type === 'reading' ? 
                    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>' :
                    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>';
                
                activityElement.innerHTML = `
                    <div class="alert-icon info">${activityIcon}</div>
                    <div class="alert-content">
                        <div class="alert-header">
                            <span class="alert-patient">${activity.patientName}</span>
                            <span class="alert-time">${dateFormatted}, ${timeFormatted}</span>
                        </div>
                        <p class="alert-message">${activity.message}</p>
                    </div>
                `;
                
                container.appendChild(activityElement);
            });
        }

        function populatePatientDetail() {
            const container = document.querySelector('#patient-detail-page .container');
            if (!container) return;
            
            const patient = db.getPatientById(currentPatientId);
            if (!patient) {
                container.innerHTML = '<p>Patient not found.</p>';
                return;
            }
            
            const history = db.getHistoryForPatient(currentPatientId);

            const initials = patient.name.split(' ').map(n => n[0]).join('');

            container.innerHTML = `
                <div class="patient-detail-header stagger-item">
                    <div class="patient-avatar" style="width: 100px; height: 100px; margin: 0 auto var(--space-4); font-size: 3em;">${initials}</div>
                    <h2 class="section-title" style="margin-bottom: var(--space-2);">${patient.name}</h2>
                    <p class="page-subtitle" style="margin-bottom: var(--space-4);">${patient.age} years old ${patient.gender} from ${patient.village}</p>
                    <button class="btn btn-primary btn-lg" onclick="startReadingForPatient()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
                        Start New ECG Reading
                    </button>
                </div>

                <div class="card stagger-item" style="animation-delay: 0.1s;">
                    <h3 style="margin-bottom: var(--space-4);">Latest Vitals</h3>
                    <div class="stats-grid" style="grid-template-columns: 1fr 1fr 1fr; margin-top: 0;">
                        <div class="stats-card">
                            <div class="stat-label">Heart Rate</div>
                            <div class="stat-value">${patient.hr || '--'}</div>
                            <div class="stat-unit">BPM</div>
                    </div>
                        <div class="stats-card">
                            <div class="stat-label">HRV Status</div>
                            <div class="stat-value" style="font-size: 1.8rem;">${patient.hrv || '--'}</div>
                        </div>
                        <div class="stats-card">
                            <div class="stat-label">AI Confidence</div>
                            <div class="stat-value">${patient.confidence || '--'}</div>
                        </div>
                    </div>
                </div>

                <div class="card stagger-item" style="animation-delay: 0.2s;">
                    <h3 style="margin-bottom: var(--space-4);">Reading History</h3>
                    <div id="patientHistoryList">
                        ${history.length > 0 ? history.map(rec => `
                            <div class="history-item">
                                <div class="history-date">${new Date(rec.timestamp).toLocaleDateString('en-IN')}</div>
                        <div class="history-vitals">
                                    <span>HR: ${rec.hr}</span>
                                    <span>HRV: ${rec.hrv}</span>
                                    <span class="patient-status status-${rec.status}">${rec.status}</span>
                        </div>
                        </div>
                        `).join('') : '<p>No reading history found.</p>'}
                    </div>
                    </div>
                `;
        }

        // --- Add Patient Form ---
        document.getElementById('addPatientForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const newPatient = {
                id: `KUTCH-${Date.now()}`,
                name: document.getElementById('patientNameInput').value,
                age: document.getElementById('patientAgeInput').value,
                gender: document.getElementById('patientGenderInput').value,
                village: document.getElementById('patientVillageInput').value,
                status: 'pending',
                hr: null,
                hrv: null,
                confidence: null,
                lastReading: null
            };
            
            db.addPatient(newPatient);
            
            // Add to activity log
            const activity = {
                id: `ACT-${Date.now()}`,
                patientId: newPatient.id,
                patientName: newPatient.name,
                type: 'patient',
                message: `New patient ${newPatient.name} registered`,
                timestamp: new Date().toISOString()
            };
            const activities = db.getActivity();
            activities.unshift(activity);
            db._set('activity', activities);


            closeModal('addPatientModal');
            this.reset();
            showToast('Patient added successfully!', 'success');
            
            // Refresh patient list if on that page
            if (currentPage === 'patients-page') {
                populatePatients();
            }
        });

        function populateRecentActivityPreview() {
            const recentActivity = db.getActivity().slice(0, 3); // Show only latest 3
            const container = document.getElementById('recentActivityPreview');
            
            if (!container) return;
            
            if (recentActivity.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; padding: var(--space-6); color: var(--text-muted);">
                        <div style="font-size: 48px; margin-bottom: var(--space-3);">📊</div>
                        <p style="margin: 0; font-weight: 500;">No recent activity</p>
                        <p style="margin: var(--space-2) 0 0 0; font-size: var(--font-size-sm);">Start by adding patients or taking ECG readings</p>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = recentActivity.map(activity => {
                const timeAgo = getTimeAgo(activity.timestamp);
                const patientName = activity.patientName || 'Unknown Patient';
                
                let actionIcon = '';
                let actionColor = 'var(--text-secondary)';
                
                if (activity.message.includes('ECG') || activity.type === 'reading') {
                    actionIcon = '⚡';
                    actionColor = 'var(--primary-color)';
                } else if (activity.message.includes('added') || activity.type === 'patient') {
                    actionIcon = '👤';
                    actionColor = 'var(--success-color)';
                } else if (activity.message.includes('anomaly')) {
                    actionIcon = '⚠️';
                    actionColor = 'var(--danger-color)';
                } else {
                    actionIcon = '📋';
                    actionColor = 'var(--info-color)';
                }
                
                return `
                    <div class="activity-item" style="margin-bottom: var(--space-2); padding: var(--space-3);">
                        <div style="width: 36px; height: 36px; border-radius: var(--radius-full); background: ${actionColor}15; display: flex; align-items: center; justify-content: center; margin-right: var(--space-3); font-size: 18px;">
                            ${actionIcon}
                        </div>
                        <div style="flex: 1;">
                            <div style="font-weight: 500; color: var(--text-primary); margin-bottom: var(--space-1); font-size: var(--font-size-sm);">${activity.message}</div>
                            <div style="font-size: var(--font-size-xs); color: var(--text-secondary);">${patientName} • ${timeAgo}</div>
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        function getTimeAgo(timestamp) {
            const now = new Date();
            const time = new Date(timestamp);
            const diffMs = now - time;
            const diffMins = Math.floor(diffMs / (1000 * 60));
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            
            if (diffMins < 60) return `${diffMins}m ago`;
            if (diffHours < 24) return `${diffHours}h ago`;
            return `${diffDays}d ago`;
        }

        // --- Initialize App ---
        document.addEventListener('DOMContentLoaded', function() {
            // Force fresh demo data
            db.reset(); // Clear and reinitialize with demo data
            
            // Initialize dashboard immediately
            populatePageContent('dashboard-page');
            
            // Force update stats with proper values
            setTimeout(() => {
                updateDashboardStats();
                populateRecentActivityPreview();
            }, 100);
            
            showToast('Welcome to Sehat Sathi! 🌟', 'success');
            
            // Update AI insights every 30 seconds
            updateAIInsights();
            setInterval(updateAIInsights, 30000);
            
            // Add logo click handler
            const logoContainer = document.querySelector('.logo-container');
            if (logoContainer) {
                logoContainer.addEventListener('click', function() {
                    switchPage('dashboard-page');
                    showToast('Welcome back to dashboard! 🏠', 'info');
                });
            }
            
            // Add subtle background animations
            setTimeout(() => {
                document.body.classList.add('app-ready');
            }, 1000);
        });

        // --- Enhanced ECG Functionality ---
        let ecgAnimation = null;
        let ecgData = [];
        let ecgX = 0;
        
        function initECG() {
            const canvas = document.getElementById('ecgChart');
            if (!canvas) return;
            
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            
            drawECGBackground(canvas);
            showToast('ECG ready to start recording ⚡', 'info');
        }
        
        function drawECGBackground(canvas) {
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#000011';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Enhanced grid with major and minor lines
            ctx.lineWidth = 0.5;
            ctx.strokeStyle = '#003322';
            
            // Minor grid lines (every 10px)
            for (let x = 0; x < canvas.width; x += 10) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            
            for (let y = 0; y < canvas.height; y += 10) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }
            
            // Major grid lines (every 50px)
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#004444';
            
            for (let x = 0; x < canvas.width; x += 50) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            
            for (let y = 0; y < canvas.height; y += 50) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }
        }
        
        function generateECGPoint(x, heartRate = 75) {
            const baselineY = 100; // Center of the ECG
            const beatInterval = (60 / heartRate) * 100; // Points per beat
            const beatPhase = (x % beatInterval) / beatInterval;
            
            let y = baselineY;
            
            // Generate realistic ECG waveform (PQRST complex)
            if (beatPhase < 0.1) {
                // P wave
                y += 8 * Math.sin(beatPhase * 10 * Math.PI);
            } else if (beatPhase > 0.15 && beatPhase < 0.25) {
                // QRS complex
                const qrsPhase = (beatPhase - 0.15) / 0.1;
                if (qrsPhase < 0.3) {
                    y -= 15; // Q wave
                } else if (qrsPhase < 0.7) {
                    y += 50 * Math.sin((qrsPhase - 0.3) * Math.PI / 0.4); // R wave
                } else {
                    y -= 20; // S wave
                }
            } else if (beatPhase > 0.4 && beatPhase < 0.7) {
                // T wave
                const tPhase = (beatPhase - 0.4) / 0.3;
                y += 15 * Math.sin(tPhase * Math.PI);
            }
            
            // Add some realistic noise
            y += (Math.random() - 0.5) * 2;
            
            return y;
        }
        
        // Enhanced ECG Animation with improved visuals
        function animateECG() {
            const canvas = document.getElementById('ecgChart');
            if (!canvas) return;
            
            const ctx = canvas.getContext('2d');
            const patient = db.getPatientById(currentPatientId);
            const heartRate = patient ? (patient.hr || 75) : 75;
            
            // Update real-time HR display
            document.getElementById('realTimeHR').textContent = heartRate;
            document.getElementById('signalQuality').textContent = 'Excellent';
            
            // Clear and redraw enhanced background
            drawEnhancedECGBackground(canvas);
            
            // Generate new point with enhanced algorithm
            const newY = generateEnhancedECGPoint(ecgX, heartRate);
            ecgData.push(newY);
            
            // Keep only last canvas.width points
            if (ecgData.length > canvas.width) {
                ecgData.shift();
            }
            
            // Draw enhanced ECG waveform with glow effect
            ctx.strokeStyle = '#00ff88';
            ctx.lineWidth = 2.5;
            ctx.shadowColor = '#00ff88';
            ctx.shadowBlur = 8;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            // Draw main waveform
            ctx.beginPath();
            ecgData.forEach((y, index) => {
                const x = canvas.width - ecgData.length + index;
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            ctx.stroke();
            
            // Draw subtle trailing effect
            ctx.strokeStyle = 'rgba(0, 255, 136, 0.3)';
            ctx.lineWidth = 4;
            ctx.shadowBlur = 15;
            ctx.stroke();
            
            // Reset shadow
            ctx.shadowBlur = 0;
            
            ecgX += 2;
            
            // Update scanning line position
            const scanningLine = document.getElementById('scanningLine');
            if (scanningLine && ecgTimerInterval) {
                const progress = (30 - ecgSecondsRemaining) / 30;
                scanningLine.style.left = `${progress * 100}%`;
            }
            
            if (ecgTimerInterval) {
                ecgAnimation = requestAnimationFrame(animateECG);
            }
        }

        // Enhanced ECG background with medical-grade grid
        function drawEnhancedECGBackground(canvas) {
            const ctx = canvas.getContext('2d');
            const width = canvas.width;
            const height = canvas.height;
            
            // Set canvas size
            canvas.width = width;
            canvas.height = height;
            
            // Fill black background
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, width, height);
            
            // Draw fine grid (small squares)
            ctx.strokeStyle = 'rgba(0, 255, 136, 0.08)';
            ctx.lineWidth = 0.5;
            
            for (let x = 0; x <= width; x += 20) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            }
            
            for (let y = 0; y <= height; y += 20) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }
            
            // Draw major grid (large squares)
            ctx.strokeStyle = 'rgba(0, 255, 136, 0.15)';
            ctx.lineWidth = 1;
            
            for (let x = 0; x <= width; x += 100) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            }
            
            for (let y = 0; y <= height; y += 100) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }
        }

        // Enhanced ECG point generation with more realistic patterns
        function generateEnhancedECGPoint(x, heartRate) {
            const canvas = document.getElementById('ecgChart');
            if (!canvas) return 140;
            
            const height = canvas.height;
            const baselineY = height / 2;
            const beatInterval = (60 / heartRate) * 60; // Points per beat
            const beatPhase = (x % beatInterval) / beatInterval;
            
            let y = baselineY;
            
            // Enhanced PQRST complex with more realistic morphology
            if (beatPhase < 0.08) {
                // P wave - atrial depolarization
                const pPhase = beatPhase / 0.08;
                y += 12 * Math.sin(pPhase * Math.PI) * (1 + 0.1 * Math.sin(x * 0.02));
            } else if (beatPhase > 0.12 && beatPhase < 0.22) {
                // QRS complex - ventricular depolarization
                const qrsPhase = (beatPhase - 0.12) / 0.1;
                if (qrsPhase < 0.2) {
                    y -= 18; // Q wave
                } else if (qrsPhase < 0.6) {
                    // R wave with slight variation
                    const rPhase = (qrsPhase - 0.2) / 0.4;
                    y += 65 * Math.sin(rPhase * Math.PI) * (1 + 0.05 * Math.sin(x * 0.01));
                } else {
                    y -= 25; // S wave
                }
            } else if (beatPhase > 0.35 && beatPhase < 0.65) {
                // T wave - ventricular repolarization
                const tPhase = (beatPhase - 0.35) / 0.3;
                y += 20 * Math.sin(tPhase * Math.PI) * (1 + 0.08 * Math.sin(x * 0.015));
            }
            
            // Add realistic noise and breathing artifact
            y += (Math.random() - 0.5) * 2; // Electronic noise
            y += 3 * Math.sin(x * 0.005); // Breathing artifact
            
            // Add slight baseline drift
            y += Math.sin(x * 0.001) * 2;
            
            return Math.max(20, Math.min(height - 20, y));
        }

        function startEcgRecording() {
            if (!currentPatientId) {
                showToast('Please select a patient first.', 'warning');
                showPatientSelector();
                return;
            }
            
            // Update UI state for recording
            updateRecordingState('connecting');
            
            // Simulate device connection process
            setTimeout(() => {
                updateRecordingState('connected');
                const patient = db.getPatientById(currentPatientId);
                showToast(`Connected! Starting ECG for ${patient.name}...`, 'success');
                
                setTimeout(() => {
                    updateRecordingState('recording');
                    simulateECGRecording();
                }, 1000);
            }, 2000);
        }

        function updateRecordingState(state) {
            const startBtn = document.getElementById('startEcgBtn');
            const stopBtn = document.getElementById('stopBtn');
            const deviceIndicator = document.getElementById('deviceIndicator');
            const connectionStatus = document.getElementById('connectionStatus');
            const scanningLine = document.getElementById('scanningLine');
            const progressText = document.getElementById('progressText');
            
            switch(state) {
                case 'connecting':
                    startBtn.disabled = true;
                    startBtn.classList.add('disabled');
                    startBtn.querySelector('.btn-text').textContent = 'Connecting...';
                    
                    deviceIndicator.querySelector('.indicator-light').className = 'indicator-light connected';
                    deviceIndicator.querySelector('.indicator-text').textContent = 'Connecting';
                    connectionStatus.textContent = 'Establishing connection...';
                    if (progressText) progressText.textContent = 'Connecting to device...';
                    break;
                    
                case 'connected':
                    deviceIndicator.querySelector('.indicator-light').className = 'indicator-light connected';
                    deviceIndicator.querySelector('.indicator-text').textContent = 'Connected';
                    connectionStatus.textContent = 'Ready to record';
                    startBtn.querySelector('.btn-text').textContent = 'Start ECG Recording';
                    startBtn.disabled = false;
                    startBtn.classList.remove('disabled');
                    if (progressText) progressText.textContent = 'Ready to record';
                    break;
                    
                case 'recording':
                    startBtn.style.display = 'none';
                    stopBtn.style.display = 'flex';
                    
                    deviceIndicator.querySelector('.indicator-light').className = 'indicator-light recording';
                    deviceIndicator.querySelector('.indicator-text').textContent = 'Recording';
                    connectionStatus.textContent = 'Recording in progress...';
                    if (progressText) progressText.textContent = 'Recording in progress...';
                    
                    scanningLine.classList.add('active');
                    break;
                    
                case 'completed':
                    stopBtn.style.display = 'none';
                    startBtn.style.display = 'flex';
                    startBtn.querySelector('.btn-text').textContent = 'Start New Recording';
                    
                    deviceIndicator.querySelector('.indicator-light').className = 'indicator-light connected';
                    deviceIndicator.querySelector('.indicator-text').textContent = 'Connected';
                    connectionStatus.textContent = 'Recording completed successfully';
                    if (progressText) progressText.textContent = 'Recording completed';
                    
                    scanningLine.classList.remove('active');
                    break;
            }
        }

        function simulateECGRecording() {
            ecgSecondsRemaining = 30;
            ecgX = 0;
            ecgData = [];
            const timer = document.getElementById('ecgTimer');
            const progress = document.getElementById('ecgProgress');
            
            // Initialize ECG display
            const canvas = document.getElementById('ecgChart');
            if (canvas) {
                drawEnhancedECGBackground(canvas);
            }
            
            // Start real-time ECG animation
            animateECG();
            
            ecgTimerInterval = setInterval(() => {
                ecgSecondsRemaining--;
                timer.textContent = `${ecgSecondsRemaining}`;
                progress.style.width = `${((30 - ecgSecondsRemaining) / 30) * 100}%`;
                
                // Update progress text
                if (progressText) {
                    const remaining = ecgSecondsRemaining;
                    if (remaining > 20) {
                        progressText.textContent = 'Initializing recording...';
                    } else if (remaining > 10) {
                        progressText.textContent = 'Recording cardiac activity...';
                    } else if (remaining > 5) {
                        progressText.textContent = 'Analyzing signal quality...';
                    } else {
                        progressText.textContent = 'Finalizing recording...';
                    }
                }
                
                // Add pulse effect to monitoring indicators
                const pulseIndicator = document.querySelector('.pulse-indicator');
                if (pulseIndicator) {
                    pulseIndicator.style.transform = 'scale(1.2)';
                    setTimeout(() => {
                        pulseIndicator.style.transform = 'scale(1)';
                    }, 200);
                }
                
                if (ecgSecondsRemaining <= 0) {
                    clearInterval(ecgTimerInterval);
                    ecgTimerInterval = null;
                    if (ecgAnimation) {
                        cancelAnimationFrame(ecgAnimation);
                        ecgAnimation = null;
                    }
                    finishECGRecording();
                }
            }, 1000);
        }

        function finishECGRecording() {
            // Update UI state to completed
            updateRecordingState('completed');
            
            // Show analysis simulation
            if (progressText) {
                progressText.textContent = 'Analyzing ECG data...';
            }
            
            setTimeout(() => {
                // Simulate AI analysis
                const isAnomaly = Math.random() > 0.6; // 40% chance of anomaly
                const newReading = {
                    timestamp: new Date().toISOString(),
                    hr: Math.floor(60 + Math.random() * 40), // Random HR between 60-100
                    hrv: isAnomaly ? (Math.random() > 0.5 ? 'High' : 'Very High') : 'Normal',
                    status: isAnomaly ? 'anomaly' : 'normal',
                    notes: 'Automated ECG analysis completed'
                };
                
                // Save to DB
                db.addReadingToHistory(currentPatientId, newReading);
                
                // Update patient's main record with latest data
                const patient = db.getPatientById(currentPatientId);
                if (patient) {
                    patient.hr = newReading.hr;
                    patient.hrv = newReading.hrv;
                    patient.status = newReading.status;
                    patient.lastReading = newReading.timestamp;
                    patient.confidence = isAnomaly ? `${Math.floor(85 + Math.random() * 10)}%` : `${Math.floor(95 + Math.random()*4)}%`;
                    
                    // Update patient in database
                    const patients = db.getPatients();
                    const patientIndex = patients.findIndex(p => p.id === currentPatientId);
                    if (patientIndex !== -1) {
                        patients[patientIndex] = patient;
                        db._set('patients', patients);
                    }
                }

                // Reset UI elements
                document.getElementById('ecgTimer').textContent = '30';
                document.getElementById('ecgProgress').style.width = '0%';
                document.getElementById('realTimeHR').textContent = '--';
                document.getElementById('signalQuality').textContent = '--';
                
                if (progressText) {
                    progressText.textContent = 'Analysis complete!';
                }
                
                // Show completion actions
                showEcgCompletionActions();
                
                // Show appropriate toast message
                if (isAnomaly) {
                    showToast(`⚠️ Anomaly detected in ${patient.name}'s ECG. Review recommended.`, 'warning');
                } else {
                    showToast(`✅ Normal ECG recorded for ${patient.name}`, 'success');
                }

            }, 2000);
        }

        function cancelEcgReading() {
            if (ecgTimerInterval) {
                clearInterval(ecgTimerInterval);
                ecgTimerInterval = null;
                if (ecgAnimation) {
                    cancelAnimationFrame(ecgAnimation);
                    ecgAnimation = null;
                }
                
                // Reset UI state
                updateRecordingState('connected');
                
                // Reset ECG display
                const canvas = document.getElementById('ecgChart');
                if (canvas) {
                    drawEnhancedECGBackground(canvas);
                }
                
                // Reset timer and progress
                document.getElementById('ecgTimer').textContent = '30';
                document.getElementById('ecgProgress').style.width = '0%';
                document.getElementById('realTimeHR').textContent = '--';
                document.getElementById('signalQuality').textContent = '--';
                
                if (progressText) {
                    progressText.textContent = 'Recording cancelled';
                }
                
                showToast('ECG recording cancelled', 'info');
            }
        }

        // Enhanced patient selector function
        function showPatientSelector() {
            const modal = document.getElementById('patientQuickSelectModal');
            const patientList = document.getElementById('quickPatientList');
            const searchInput = document.getElementById('quickPatientSearch');
            
            // Show modal
            modal.classList.remove('hidden');
            
            // Populate patient list
            const patients = db.getPatients();
            renderPatientList(patients);
            
            // Setup search functionality
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const filteredPatients = patients.filter(patient => 
                    patient.name.toLowerCase().includes(searchTerm) ||
                    patient.village.toLowerCase().includes(searchTerm)
                );
                renderPatientList(filteredPatients);
            });
            
            // Focus search input
            setTimeout(() => searchInput.focus(), 100);
        }

        function renderPatientList(patients) {
            const patientList = document.getElementById('quickPatientList');
            
            if (patients.length === 0) {
                patientList.innerHTML = `
                    <div style="text-align: center; padding: var(--space-6); color: var(--text-muted);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: var(--space-3); opacity: 0.5;">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                        <div style="font-weight: 600; margin-bottom: var(--space-1);">No patients found</div>
                        <div style="font-size: var(--font-size-sm);">Try adjusting your search</div>
                    </div>
                `;
                return;
            }
            
            patientList.innerHTML = patients.map(patient => {
                const initials = patient.name.split(' ').map(n => n[0]).join('');
                const isSelected = patient.id === currentPatientId;
                
                return `
                    <div class="patient-selector-item ${isSelected ? 'selected' : ''}" onclick="selectPatientForECG('${patient.id}')">
                        <div class="patient-selector-avatar">${initials}</div>
                        <div class="patient-selector-info">
                            <div class="patient-selector-name">${patient.name}</div>
                            <div class="patient-selector-meta">${patient.age} yrs • ${patient.village}</div>
                            <div class="patient-selector-status status-${patient.status}">${patient.status}</div>
                        </div>
                        ${isSelected ? '<div class="selected-indicator">✓</div>' : ''}
                    </div>
                `;
            }).join('');
        }

        function selectPatientForECG(patientId) {
            currentPatientId = patientId;
            const patient = db.getPatientById(patientId);
            
            if (patient) {
                // Update patient info card
                updatePatientInfoCard(patient);
                
                // Close modal
                closeModal('patientQuickSelectModal');
                
                showToast(`Selected ${patient.name} for ECG recording`, 'success');
            }
        }

        function updatePatientInfoCard(patient) {
            const initials = patient.name.split(' ').map(n => n[0]).join('');
            
            document.querySelector('.enhanced-patient-avatar').textContent = initials;
            document.querySelector('.patient-name').textContent = patient.name;
            document.querySelector('.patient-age').textContent = `${patient.age} yrs`;
            document.querySelector('.patient-location').textContent = patient.village;
            
            const lastReadingEl = document.querySelector('.patient-last-reading');
            if (patient.lastReading) {
                const lastDate = new Date(patient.lastReading);
                const daysSince = Math.floor((new Date() - lastDate) / (1000 * 60 * 60 * 24));
                lastReadingEl.textContent = `Last: ${daysSince} days ago`;
            } else {
                lastReadingEl.textContent = 'Last: Never recorded';
            }
        }

        function closeModal(modalId) {
            const modal = document.getElementById(modalId);
            modal.classList.add('hidden');
        }

        function cancelEcgReading() {
            if (ecgTimerInterval) {
                clearInterval(ecgTimerInterval);
                if (ecgAnimation) {
                    cancelAnimationFrame(ecgAnimation);
                }
                document.getElementById('ecgTimer').textContent = '30s';
                document.getElementById('ecgProgress').style.width = '0%';
                
                // Reset ECG display
                const canvas = document.getElementById('ecgChart');
                if (canvas) {
                    drawECGBackground(canvas);
                }
                
                showToast('ECG recording cancelled ⏹️', 'warning');
            }
        }

        // Utility Functions
        function showLoader() {
            document.getElementById('loadingOverlay').classList.remove('hidden');
        }

        function hideLoader() {
            document.getElementById('loadingOverlay').classList.add('hidden');
        }

        function goBack() {
            switchPage('dashboard-page', document.querySelector('.nav-item[onclick*="dashboard-page"]'));
        }

        function showNotifications() {
            switchPage('alerts-page', document.querySelector('.nav-item[onclick*="alerts-page"]'));
        }

        function confirmLogout() {
            if (confirm('Are you sure you want to logout?')) {
                showToast('Logging out...', 'info');
                setTimeout(() => {
                    location.reload();
                }, 1500);
            }
        }

        // Enhanced Settings Page Functions
        function editProfile() {
            showToast('Profile editing feature coming soon!', 'info');
        }

        function exportData() {
            showToast('Exporting data... This feature will be available soon.', 'info');
        }

        function syncData() {
            showToast('Syncing data with cloud... Please wait.', 'info');
            setTimeout(() => {
                showToast('Data sync completed successfully!', 'success');
            }, 2000);
        }

        function generateReport() {
            showToast('Generating comprehensive health report...', 'info');
        }

        function toggleNotifications(checkbox) {
            // Add bounce animation
            checkbox.closest('.modern-toggle').classList.add('notification-bounce');
            setTimeout(() => checkbox.closest('.modern-toggle').classList.remove('notification-bounce'), 600);
            
            const status = checkbox.checked ? 'enabled' : 'disabled';
            showToast(`Smart notifications ${status}`, 'success');
        }

        function toggleAutoSync(checkbox) {
            // Add bounce animation
            checkbox.closest('.modern-toggle').classList.add('notification-bounce');
            setTimeout(() => checkbox.closest('.modern-toggle').classList.remove('notification-bounce'), 600);
            
            const status = checkbox.checked ? 'enabled' : 'disabled';
            showToast(`Auto-sync ${status}`, 'success');
        }

        function toggleAnalytics(checkbox) {
            // Add bounce animation
            checkbox.closest('.modern-toggle').classList.add('notification-bounce');
            setTimeout(() => checkbox.closest('.modern-toggle').classList.remove('notification-bounce'), 600);
            
            const status = checkbox.checked ? 'enabled' : 'disabled';
            showToast(`Advanced analytics ${status}`, 'success');
        }

        // === ENHANCED EMERGENCY ALERTS FUNCTIONS ===

        function updateAlertCounts() {
            const alerts = db.getAlerts();
            const criticalAlerts = alerts.filter(a => a.type === 'critical');
            const warningAlerts = alerts.filter(a => a.type === 'warning');
            
            // Update stats cards
            const criticalCountEl = document.getElementById('criticalAlertsCount');
            if (criticalCountEl) {
                animateCounter(criticalCountEl, criticalAlerts.length);
            }
            
            const warningCountEl = document.getElementById('warningAlertsCount');
            if (warningCountEl) {
                animateCounter(warningCountEl, warningAlerts.length);
            }
            
            // Update filter chip counts
            document.getElementById('allAlertsCount').textContent = alerts.length;
            document.getElementById('criticalFilterCount').textContent = criticalAlerts.length;
            document.getElementById('warningFilterCount').textContent = warningAlerts.length;
            document.getElementById('resolvedFilterCount').textContent = '12'; // Mock resolved count
            
            // Update average response time (mock calculation)
            const responseTimeEl = document.getElementById('responseTimeAvg');
            if (responseTimeEl) {
                const avgTime = 2.4 + (Math.random() * 0.8 - 0.4); // Simulate variation
                responseTimeEl.textContent = avgTime.toFixed(1);
            }
            
            // Update resolution rate
            const resolutionRateEl = document.getElementById('resolutionRate');
            if (resolutionRateEl) {
                const rate = 94 + Math.floor(Math.random() * 5); // 94-98%
                animateCounter(resolutionRateEl, rate);
            }
        }

        function filterAlertsByPriority(priority) {
            // Update active filter chip
            document.querySelectorAll('.emergency-filter-chip').forEach(chip => {
                chip.classList.remove('active');
            });
            document.querySelector(`[data-priority="${priority}"]`).classList.add('active');
            
            // Filter alerts
            const alertItems = document.querySelectorAll('.alert-item');
            let visibleCount = 0;
            
            alertItems.forEach(item => {
                const itemPriority = item.dataset.priority;
                const shouldShow = priority === 'all' || itemPriority === priority;
                
                if (shouldShow) {
                    item.style.display = 'flex';
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                    visibleCount++;
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(-10px)';
                    setTimeout(() => {
                        if (item.style.opacity === '0') {
                            item.style.display = 'none';
                        }
                    }, 300);
                }
            });
            
            // Show feedback
            showToast(`Showing ${visibleCount} ${priority === 'all' ? 'alerts' : priority + ' alerts'}`, 'info');
        }

        function handleAlertAction(alertId, action) {
            const alerts = db.getAlerts();
            const alert = alerts.find(a => a.id === alertId);
            
            if (!alert) return;
            
            switch (action) {
                case 'view':
                    showToast(`Opening patient details for ${alert.patientName}`, 'info');
                    const patient = db.getPatientById(alert.patientId);
                    if (patient) {
                        navigateTo('patient-detail-page', patient);
                    }
                    break;
                    
                case 'resolve':
                    // Add resolved class and animation
                    const alertElement = document.querySelector(`[data-alert-id="${alertId}"]`);
                    if (alertElement) {
                        alertElement.style.opacity = '0.5';
                        alertElement.style.transform = 'scale(0.95)';
                        setTimeout(() => {
                            alertElement.style.display = 'none';
                        }, 500);
                    }
                    showToast(`✅ Alert resolved for ${alert.patientName}`, 'success');
                    // Update counts
                    setTimeout(updateAlertCounts, 500);
                    break;
                    
                case 'emergency':
                    showEmergencyDialog(alert);
                    break;
            }
        }

        function showEmergencyDialog(alert) {
            // Create emergency modal
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.style.background = 'rgba(0,0,0,0.8)';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 400px; background: #1e293b; border: 2px solid #ef4444; animation: emergencyModalPulse 1s infinite;">
                    <div style="text-align: center; padding: var(--space-4);">
                        <div style="font-size: 4em; margin-bottom: var(--space-3);">🚨</div>
                        <h2 style="color: #ef4444; margin-bottom: var(--space-3); font-weight: 800;">EMERGENCY ALERT</h2>
                        <p style="color: #f8fafc; margin-bottom: var(--space-4); font-size: var(--font-size-lg);">
                            Critical situation for <strong>${alert.patientName}</strong>
                        </p>
                        <p style="color: #cbd5e1; margin-bottom: var(--space-6);">${alert.message}</p>
                        
                        <div style="display: flex; gap: var(--space-3); justify-content: center;">
                            <button onclick="callEmergencyTeam('${alert.patientId}')" style="background: #ef4444; color: white; border: none; padding: var(--space-3) var(--space-5); border-radius: var(--radius-lg); font-weight: 700; cursor: pointer; font-size: var(--font-size-base);">
                                📞 Call Emergency Team
                            </button>
                            <button onclick="this.closest('.modal-overlay').remove()" style="background: rgba(255,255,255,0.1); color: #f8fafc; border: 1px solid rgba(255,255,255,0.2); padding: var(--space-3) var(--space-5); border-radius: var(--radius-lg); cursor: pointer;">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Auto-remove after 10 seconds if no action
            setTimeout(() => {
                if (document.body.contains(modal)) {
                    modal.remove();
                }
            }, 10000);
        }

        function refreshAlerts() {
            showToast('🔄 Refreshing emergency alerts...', 'info');
            
            // Add refresh animation to all alert items
            const alertItems = document.querySelectorAll('.alert-item');
            alertItems.forEach((item, index) => {
                item.style.opacity = '0.5';
                item.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'scale(1)';
                }, index * 100);
            });
            
            // Simulate refresh delay
            setTimeout(() => {
                populateAlerts();
                showToast('✅ Alerts refreshed successfully', 'success');
            }, 1000);
        }

        function exportAlertsReport() {
            const alerts = db.getAlerts();
            const criticalCount = alerts.filter(a => a.type === 'critical').length;
            const warningCount = alerts.filter(a => a.type === 'warning').length;
            
            showToast(`📋 Exporting report: ${criticalCount} critical, ${warningCount} warning alerts`, 'info');
            
            // Simulate export process
            setTimeout(() => {
                showToast('📄 Emergency alerts report exported successfully', 'success');
            }, 2000);
        }

        function callEmergencyTeam(patientId = null) {
            if (patientId) {
                const patient = db.getPatientById(patientId);
                showToast(`📞 Emergency team contacted for ${patient?.name || 'patient'}`, 'success');
            } else {
                showToast('📞 Emergency team contact initiated', 'info');
            }
            
            // Close any open modals
            document.querySelectorAll('.modal-overlay').forEach(modal => modal.remove());
        }

        function toggleVoiceSearch() {
            const btn = event.target.closest('.search-voice-btn');
            btn.style.background = 'rgba(239, 68, 68, 0.3)';
            btn.style.color = '#ef4444';
            
            showToast('🎤 Voice search activated - Speak now...', 'info');
            
            setTimeout(() => {
                btn.style.background = 'rgba(59, 130, 246, 0.2)';
                btn.style.color = '#3b82f6';
                showToast('Voice search disabled', 'info');
            }, 3000);
        }

        // Add emergency modal pulse animation CSS
        const emergencyStyle = document.createElement('style');
        emergencyStyle.textContent = `
            @keyframes emergencyModalPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.02); }
            }
        `;
        document.head.appendChild(emergencyStyle);

        function openTutorial() {
            showToast('Opening interactive tutorial...', 'info');
        }

        function openHelp() {
            showToast('Opening help center...', 'info');
        }

        function contactSupport() {
            showToast('Contacting technical support...', 'info');
        }

        function checkUpdates() {
            showToast('Checking for updates... You have the latest version!', 'success');
        }

        function manageDataSecurity() {
            showToast('Opening data security settings...', 'info');
        }

        function viewPrivacyPolicy() {
            showToast('Opening privacy policy...', 'info');
        }

        // Enhanced Filtering System
        let currentFilter = 'all';
        
        function filterPatients() {
            const searchTerm = document.getElementById('patientSearchInput').value.toLowerCase();
            const patientItems = document.querySelectorAll('.patient-list-item');
            
            patientItems.forEach(item => {
                const name = item.querySelector('.patient-name').textContent.toLowerCase();
                const village = item.querySelector('.patient-meta').textContent.toLowerCase();
                const status = item.dataset.status;
                
                const matchesSearch = name.includes(searchTerm) || 
                                    village.includes(searchTerm) || 
                                    item.dataset.patientId.toLowerCase().includes(searchTerm);
                const matchesFilter = currentFilter === 'all' || status === currentFilter;
                
                if (matchesSearch && matchesFilter) {
                    item.style.display = 'flex';
                    item.style.opacity = '1';
                } else {
                    item.style.display = 'none';
                    item.style.opacity = '0';
                }
            });
            
            // Update results count
            const visibleCount = document.querySelectorAll('.patient-list-item[style*="flex"]').length;
            updateSearchResults(visibleCount);
        }
        
        function filterByStatus(status) {
            currentFilter = status;
            
            // Update active chip
            document.querySelectorAll('.filter-chip').forEach(chip => {
                chip.classList.remove('active');
            });
            document.querySelector(`[data-filter="${status}"]`).classList.add('active');
            
            filterPatients();
        }
        
        function updateSearchResults(count) {
            const searchInput = document.getElementById('patientSearchInput');
            const patients = db.getPatients();
            const total = patients.length;
            
            if (count !== total) {
                searchInput.style.borderColor = count > 0 ? 'var(--success-color)' : 'var(--warning-color)';
            } else {
                searchInput.style.borderColor = 'var(--border-color)';
            }
        }

        function showAddPatientForm() {
            openModal('addPatientModal');
        }

        // AI-Powered Utility Functions
        function calculatePriority(patient) {
            if (patient.status === 'anomaly') return 'high';
            if (patient.status === 'pending') return 'medium';
            
            // Check time since last reading
            if (patient.lastReading) {
                const daysSince = Math.floor((new Date() - new Date(patient.lastReading)) / (1000 * 60 * 60 * 24));
                if (daysSince > 7) return 'medium';
            }
            
            return 'normal';
        }
        
        function getTimeSinceLastReading(lastReading) {
            if (!lastReading) return 'No readings yet';
            
            const now = new Date();
            const last = new Date(lastReading);
            const diffMs = now - last;
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            
            if (diffDays > 0) {
                return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
            } else if (diffHours > 0) {
                return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
            } else {
                return 'Recent';
            }
        }
        
        function generateAIInsight() {
            const patients = db.getPatients();
            const anomalyCount = patients.filter(p => p.status === 'anomaly').length;
            const pendingCount = patients.filter(p => p.status === 'pending').length;
            
            const insights = [
                `📊 <strong>Today's Overview:</strong> ${anomalyCount} critical cases detected. ${pendingCount} patients awaiting initial screening.`,
                `🎯 <strong>Risk Pattern:</strong> Elderly patients (60+) showing 40% higher anomaly rates. Consider preventive measures.`,
                `📈 <strong>Trend Alert:</strong> Heart rate variability issues increased by 25% this week. Recommend stress management guidance.`,
                `🌟 <strong>Success Rate:</strong> 92% accuracy in early detection. Your diligent monitoring is making a difference!`,
                `⚡ <strong>Efficiency Tip:</strong> Batch readings between 9-11 AM show best signal quality and patient cooperation.`
            ];
            
            const randomInsight = insights[Math.floor(Math.random() * insights.length)];
            return randomInsight;
        }
        
        function updateAIInsights() {
            const insightElement = document.getElementById('aiInsight');
            if (insightElement) {
                const newInsight = generateAIInsight();
                insightElement.innerHTML = `<p style="margin: 0; font-size: var(--font-size-sm); line-height: 1.6;">${newInsight}</p>`;
                insightElement.classList.add('notification-bounce');
                setTimeout(() => insightElement.classList.remove('notification-bounce'), 800);
            }
        }

        function startReadingForPatient() {
            // Navigate to the record page, context is already set by currentPatientId
            switchPage('record-page', document.querySelector('.nav-item[onclick*="record-page"]'));
            
            // Automatically start the reading process
            setTimeout(() => {
                const startButton = document.querySelector('#record-page .btn-success');
                if (startButton) {
                    startEcgRecording();
                }
            }, 500); // Small delay to allow page transition
        }

        // Add scroll effect to header
        window.addEventListener('scroll', function() {
            const header = document.getElementById('appHeader');
            if (window.scrollY > 10) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });

        // --- Streamlined ECG User Flow Enhancements ---
        function showPatientQuickSelect() {
            const modal = document.getElementById('patientQuickSelectModal');
            modal.classList.remove('hidden');
            const list = document.getElementById('quickPatientList');
            const search = document.getElementById('quickPatientSearch');
            const patients = db.getPatients();
            list.innerHTML = patients.map(p => `
                <div class="patient-list-item" style="margin-bottom: 8px; cursor: pointer;" onclick="selectQuickPatient('${p.id}')">
                    <div class="patient-avatar" style="width: 36px; height: 36px; font-size: 1em;">${p.name.split(' ').map(n => n[0]).join('')}</div>
                    <div style="flex:1;">
                        <div style="font-weight: 600;">${p.name}</div>
                        <div style="font-size: 0.9em; color: var(--text-secondary);">${p.age} yrs • ${p.village}</div>
                    </div>
                </div>
            `).join('');
            search.value = '';
            search.oninput = function() {
                const val = search.value.toLowerCase();
                list.innerHTML = patients.filter(p => p.name.toLowerCase().includes(val) || p.village.toLowerCase().includes(val)).map(p => `
                    <div class=\"patient-list-item\" style=\"margin-bottom: 8px; cursor: pointer;\" onclick=\"selectQuickPatient('${p.id}')\">
                        <div class=\"patient-avatar\" style=\"width: 36px; height: 36px; font-size: 1em;\">${p.name.split(' ').map(n => n[0]).join('')}</div>
                        <div style=\"flex:1;\">
                            <div style=\"font-weight: 600;\">${p.name}</div>
                            <div style=\"font-size: 0.9em; color: var(--text-secondary);\">${p.age} yrs • ${p.village}</div>
                        </div>
                    </div>
                `).join('');
            };
        }
        function selectQuickPatient(id) {
            currentPatientId = id;
            closeModal('patientQuickSelectModal');
            showEcgPatientInfo();
        }
        function showEcgPatientInfo() {
            const info = document.getElementById('ecgPatientInfo');
            const patient = db.getPatientById(currentPatientId);
            if (!patient) { info.style.display = 'none'; return; }
            info.style.display = '';
            info.innerHTML = `
                <div style="display: flex; align-items: center; gap: 1.5em;">
                    <div class="patient-avatar" style="width: 56px; height: 56px; font-size: 1.5em;">${patient.name.split(' ').map(n => n[0]).join('')}</div>
                    <div style="flex:1;">
                        <div style="font-size: 1.1em; font-weight: 700;">${patient.name}</div>
                        <div style="font-size: 0.95em; color: var(--text-secondary);">${patient.age} yrs • ${patient.village}</div>
                        <div style="font-size: 0.9em; color: var(--text-muted);">Last: ${getTimeSinceLastReading(patient.lastReading)}</div>
                    </div>
                </div>
            `;
        }
        // On entering record page, check patient
        function onRecordPageEnter() {
            if (!currentPatientId) {
                showPatientQuickSelect();
                document.getElementById('ecgPatientInfo').style.display = 'none';
            } else {
                showEcgPatientInfo();
            }
        }
        // Keyboard shortcuts
        window.addEventListener('keydown', function(e) {
            const recordPage = document.getElementById('record-page');
            if (!recordPage.classList.contains('active')) return;
            if (e.key === 'Enter') {
                document.getElementById('startEcgBtn').click();
            }
            if (e.key === 'Escape') {
                cancelEcgReading();
            }
        });
        // Show completion actions
        function showEcgCompletionActions() {
            document.getElementById('ecgCompletionActions').style.display = '';
        }
        function hideEcgCompletionActions() {
            document.getElementById('ecgCompletionActions').style.display = 'none';
        }
        // Enhanced page initialization
        function onRecordPageEnter() {
            // Initialize ECG canvas
            const canvas = document.getElementById('ecgChart');
            if (canvas) {
                // Set proper canvas dimensions
                const container = canvas.parentElement;
                canvas.width = container.offsetWidth - 40; // Account for padding
                canvas.height = 280;
                
                // Draw initial background
                drawEnhancedECGBackground(canvas);
            }
            
            // Initialize patient info if we have a selected patient
            if (currentPatientId) {
                const patient = db.getPatientById(currentPatientId);
                if (patient) {
                    updatePatientInfoCard(patient);
                }
            } else {
                // Set default patient info
                const defaultPatient = {
                    name: 'Amisha Patel',
                    age: 42,
                    village: 'Bhuj',
                    lastReading: null
                };
                updatePatientInfoCard(defaultPatient);
            }
            
            // Initialize device state
            updateRecordingState('connected');
            
            // Hide completion actions initially
            hideEcgCompletionActions();
        }

        // Initialize canvas when page loads
        function initializeECGCanvas() {
            const canvas = document.getElementById('ecgChart');
            if (canvas) {
                const ctx = canvas.getContext('2d');
                
                // Set high DPI support
                const dpr = window.devicePixelRatio || 1;
                const rect = canvas.getBoundingClientRect();
                
                canvas.width = rect.width * dpr;
                canvas.height = rect.height * dpr;
                ctx.scale(dpr, dpr);
                
                canvas.style.width = rect.width + 'px';
                canvas.style.height = rect.height + 'px';
                
                // Draw initial grid
                drawEnhancedECGBackground(canvas);
            }
        }

        // Show/hide completion actions
        function showEcgCompletionActions() {
            const completionActions = document.getElementById('ecgCompletionActions');
            if (completionActions) {
                completionActions.style.display = 'block';
                completionActions.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }

        function hideEcgCompletionActions() {
            const completionActions = document.getElementById('ecgCompletionActions');
            if (completionActions) {
                completionActions.style.display = 'none';
            }
        }

        // Hook into navigation
        const oldSwitchPage = window.switchPage;
        window.switchPage = function(page, el) {
            oldSwitchPage(page, el);
            if (page === 'record-page') {
                setTimeout(onRecordPageEnter, 200);
            }
        };

        // Initialize when page loads
        document.addEventListener('DOMContentLoaded', function() {
            // Initialize ECG canvas if we're on the record page
            if (document.getElementById('record-page') && !document.getElementById('record-page').classList.contains('hidden')) {
                setTimeout(initializeECGCanvas, 100);
            }
        });