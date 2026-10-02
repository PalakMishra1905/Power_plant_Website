document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('prediction-form');
    const submitBtn = document.getElementById('submit-btn');
    const resultContainer = document.getElementById('result-container');
    const predictionValue = document.getElementById('prediction-value');
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');
    
    const historyTable = document.getElementById('history-table');
    const historyTbody = document.getElementById('history-tbody');
    const emptyHistoryMsg = document.getElementById('empty-history-msg');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    
    const chartsGrid = document.getElementById('charts-grid');
    const emptyChartsMsg = document.getElementById('empty-charts-msg');

    const API_URL = '/predict';
    const MAX_HISTORY = 50;

    // Charts instances
    let chartAT, chartV, chartAP, chartRH;
    let chartActualVsPredicted, chartFeatureImportance;

    // Initialize application
    initApp();

    function initApp() {
        loadHistory();
        initCharts();
        updateUI();
        loadModelPerformance();
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        resultContainer.classList.add('hidden');
        errorContainer.classList.add('hidden');
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        const payload = {
            AT: parseFloat(document.getElementById('at').value),
            V: parseFloat(document.getElementById('v').value),
            AP: parseFloat(document.getElementById('ap').value),
            RH: parseFloat(document.getElementById('rh').value),
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to get prediction');
            }

            const data = await response.json();
            const predictedPE = parseFloat(data.predicted_PE).toFixed(2);
            
            animateValue(predictionValue, 0, predictedPE, 1000);
            resultContainer.classList.remove('hidden');
            
            saveToHistory(payload, predictedPE);
            
        } catch (error) {
            errorMessage.textContent = error.message || 'An error occurred while connecting to the server.';
            errorContainer.classList.remove('hidden');
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    });

    clearHistoryBtn.addEventListener('click', () => {
        localStorage.removeItem('predictionHistory');
        loadHistory();
        updateUI();
    });

    function saveToHistory(inputs, prediction) {
        let history = getHistory();
        
        const now = new Date();
        const formattedDate = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const timestamp = `${formattedDate}, ${formattedTime}`;

        const entry = {
            timestamp,
            ...inputs,
            PE: prediction
        };

        history.unshift(entry);
        if (history.length > MAX_HISTORY) {
            history.pop();
        }

        localStorage.setItem('predictionHistory', JSON.stringify(history));
        
        loadHistory();
        updateUI();
    }

    function getHistory() {
        const data = localStorage.getItem('predictionHistory');
        return data ? JSON.parse(data) : [];
    }

    function loadHistory() {
        const history = getHistory();
        historyTbody.innerHTML = '';
        
        history.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.timestamp}</td>
                <td>${item.AT.toFixed(2)}</td>
                <td>${item.V.toFixed(2)}</td>
                <td>${item.AP.toFixed(2)}</td>
                <td>${item.RH.toFixed(2)}</td>
                <td><strong style="color: #93c5fd">${item.PE}</strong></td>
            `;
            historyTbody.appendChild(tr);
        });
    }

    function updateUI() {
        const history = getHistory();
        
        if (history.length === 0) {
            emptyHistoryMsg.classList.remove('hidden');
            historyTable.classList.add('hidden');
            clearHistoryBtn.classList.add('hidden');
            
            emptyChartsMsg.classList.remove('hidden');
            chartsGrid.classList.add('hidden');
        } else {
            emptyHistoryMsg.classList.add('hidden');
            historyTable.classList.remove('hidden');
            clearHistoryBtn.classList.remove('hidden');
            
            emptyChartsMsg.classList.add('hidden');
            chartsGrid.classList.remove('hidden');
            
            updateCharts(history);
        }
    }

    function initCharts() {
        // Only load if Chart is defined (in case CDN failed)
        if (typeof Chart === 'undefined') return;

        const commonOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: '#94a3b8' }
                },
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: '#94a3b8' }
                }
            }
        };

        const createChart = (ctx, label, color) => {
            return new Chart(ctx, {
                type: 'scatter',
                data: {
                    datasets: [{
                        label: label,
                        data: [],
                        backgroundColor: color,
                        pointRadius: 6,
                        pointHoverRadius: 9,
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        borderWidth: 1
                    }]
                },
                options: {
                    ...commonOptions,
                    plugins: {
                        ...commonOptions.plugins,
                        title: {
                            display: true,
                            text: label,
                            color: '#f8fafc',
                            font: { size: 16, family: 'Outfit' }
                        },
                        tooltip: {
                            callbacks: {
                                label: (ctx) => `${label.split(' ')[0]}: ${ctx.parsed.x}, PE: ${ctx.parsed.y} MW`
                            },
                            backgroundColor: 'rgba(15, 23, 42, 0.9)',
                            titleFont: { family: 'Outfit' },
                            bodyFont: { family: 'Outfit' },
                            padding: 10,
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            borderWidth: 1
                        }
                    }
                }
            });
        };

        chartAT = createChart(document.getElementById('chart-at').getContext('2d'), 'Temperature vs Energy', '#ef4444');
        chartV = createChart(document.getElementById('chart-v').getContext('2d'), 'Vacuum vs Energy', '#3b82f6');
        chartAP = createChart(document.getElementById('chart-ap').getContext('2d'), 'Pressure vs Energy', '#10b981');
        chartRH = createChart(document.getElementById('chart-rh').getContext('2d'), 'Humidity vs Energy', '#f59e0b');
    }

    function updateCharts(history) {
        if (!chartAT) return; // If charts didn't initialize

        const atData = history.map(h => ({ x: h.AT, y: parseFloat(h.PE) }));
        const vData = history.map(h => ({ x: h.V, y: parseFloat(h.PE) }));
        const apData = history.map(h => ({ x: h.AP, y: parseFloat(h.PE) }));
        const rhData = history.map(h => ({ x: h.RH, y: parseFloat(h.PE) }));

        chartAT.data.datasets[0].data = atData;
        chartAT.update();

        chartV.data.datasets[0].data = vData;
        chartV.update();

        chartAP.data.datasets[0].data = apData;
        chartAP.update();

        chartRH.data.datasets[0].data = rhData;
        chartRH.update();
    }

    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const endFloat = parseFloat(end);
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            
            const easeProgress = 1 - Math.pow(1 - progress, 4);
            const current = (start + (endFloat - start) * easeProgress).toFixed(2);
            
            obj.innerHTML = current;
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                obj.innerHTML = end;
            }
        };
        window.requestAnimationFrame(step);
    }

    async function loadModelPerformance() {
        try {
            const response = await fetch('/model-performance');
            if (!response.ok) throw new Error('Failed to load performance data');
            
            const data = await response.json();
            
            document.getElementById('metric-r2').textContent = data.metrics.r2.toFixed(4);
            document.getElementById('metric-mae').textContent = data.metrics.mae.toFixed(4);
            document.getElementById('metric-rmse').textContent = data.metrics.rmse.toFixed(4);

            document.getElementById('performance-section').classList.remove('hidden');

            if (typeof Chart !== 'undefined') {
                renderActualVsPredicted(data.scatter_data);
                renderFeatureImportance(data.feature_importance);
            }
        } catch (error) {
            console.error('Error loading model performance:', error);
            // Silently fail if performance dashboard can't load, doesn't break main app
        }
    }

    function renderActualVsPredicted(scatterData) {
        const ctx = document.getElementById('chart-actual-vs-predicted').getContext('2d');
        const formattedData = scatterData.map(d => ({ x: d.actual, y: d.predicted }));

        // Find min/max for the reference line
        const allVals = scatterData.map(d => d.actual).concat(scatterData.map(d => d.predicted));
        const minVal = Math.min(...allVals) - 5;
        const maxVal = Math.max(...allVals) + 5;

        chartActualVsPredicted = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [
                    {
                        label: 'Predicted vs Actual',
                        data: formattedData,
                        backgroundColor: '#8b5cf6', // Secondary color
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        borderWidth: 1
                    },
                    {
                        label: 'Perfect Prediction',
                        data: [{x: minVal, y: minVal}, {x: maxVal, y: maxVal}],
                        type: 'line',
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        fill: false,
                        pointRadius: 0,
                        pointHoverRadius: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Actual vs. Predicted Energy (MW)', color: '#f8fafc', font: { size: 16, family: 'Outfit' } },
                    legend: { labels: { color: '#f8fafc', font: { family: 'Outfit' } } },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleFont: { family: 'Outfit' },
                        bodyFont: { family: 'Outfit' },
                        padding: 10,
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Actual Energy (MW)', color: '#94a3b8' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#94a3b8' }
                    },
                    y: {
                        title: { display: true, text: 'Predicted Energy (MW)', color: '#94a3b8' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#94a3b8' }
                    }
                }
            }
        });
    }

    function renderFeatureImportance(importanceData) {
        const ctx = document.getElementById('chart-feature-importance').getContext('2d');
        const labels = importanceData.map(d => `${d.feature} - ${d.description}`);
        const values = importanceData.map(d => d.importance);

        chartFeatureImportance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Decrease in R² Score',
                    data: values,
                    backgroundColor: [
                        '#ef4444', // Red
                        '#3b82f6', // Blue
                        '#10b981', // Green
                        '#f59e0b'  // Yellow
                    ],
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.1)'
                }]
            },
            options: {
                indexAxis: 'y', // horizontal bar chart
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Feature Importance (Permutation)', color: '#f8fafc', font: { size: 16, family: 'Outfit' } },
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `Importance: ${ctx.raw.toFixed(4)}`
                        },
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleFont: { family: 'Outfit' },
                        bodyFont: { family: 'Outfit' },
                        padding: 10,
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Decrease in R² Score', color: '#94a3b8' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#94a3b8' }
                    },
                    y: {
                        grid: { display: false },
                        ticks: { color: '#f8fafc', font: { family: 'Outfit' } }
                    }
                }
            }
        });
    }
});
