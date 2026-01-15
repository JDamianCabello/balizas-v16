/**
 * Aplicación principal - Balizas V16 DGT
 * Coordina la carga de datos, renderizado y actualización
 */

const App = {
    // Estado
    refreshTimer: null,
    countdownTimer: null,
    refreshInterval: 300000, // 300 segundos = 5 minutos
    remainingSeconds: 300,

    /**
     * Inicializa la aplicación
     */
    async init() {
        console.log('Iniciando aplicación Balizas V16...');

        // Inicializar sistema de traducción
        I18n.init();

        // Inicializar mapa
        MapManager.init();

        // Configurar panel de ajustes
        this.setupSettingsPanel();

        // Configurar selector de idioma
        this.setupLanguageSelector();

        // Cargar datos iniciales
        await this.loadAndRenderBeacons();

        // Configurar actualización automática
        this.startAutoRefresh();

        console.log('Aplicación iniciada correctamente');
    },

    /**
     * Carga los datos de balizas y los renderiza
     */
    async loadAndRenderBeacons() {
        this.updateStatus('loading', 'loading');

        try {
            // Cargar balizas desde la API
            const beacons = await DgtApi.getBeacons();

            // Renderizar en el mapa
            MapManager.renderBeacons(beacons);

            // Actualizar UI
            this.updateBeaconCount(beacons.length);
            this.updateStatus('dataLoaded', 'success');
            this.updateLastUpdateTime();

            // Reiniciar cuenta atrás
            this.resetCountdown();

        } catch (error) {
            console.error('Error al cargar datos:', error);
            const errorMsg = I18n.get('error') + ': ' + error.message;
            const statusElement = document.getElementById('status');
            if (statusElement) {
                statusElement.textContent = errorMsg;
                statusElement.className = 'error';
            }
        }
    },

    /**
     * Configura el panel de ajustes
     */
    setupSettingsPanel() {
        const settingsBtn = document.getElementById('settings-button');
        const settingsPanel = document.getElementById('settings-panel');

        if (settingsBtn && settingsPanel) {
            settingsBtn.addEventListener('click', () => {
                settingsPanel.classList.toggle('hidden');
            });

            // Cerrar al hacer clic fuera
            document.addEventListener('click', (e) => {
                if (!settingsPanel.contains(e.target) && e.target !== settingsBtn) {
                    settingsPanel.classList.add('hidden');
                }
            });
        }
    },

    /**
     * Configura el selector de idioma
     */
    setupLanguageSelector() {
        const btnEs = document.getElementById('btn-lang-es');
        const btnEn = document.getElementById('btn-lang-en');

        if (btnEs && btnEn) {
            // Establecer estado inicial según idioma guardado
            const currentLang = I18n.getCurrentLanguage();
            if (currentLang === 'es') {
                btnEs.classList.add('active');
                btnEn.classList.remove('active');
            } else {
                btnEn.classList.add('active');
                btnEs.classList.remove('active');
            }

            btnEs.addEventListener('click', () => {
                I18n.setLanguage('es');
                btnEs.classList.add('active');
                btnEn.classList.remove('active');

                // Actualizar los textos dinámicos actuales
                this.updateDynamicTexts();
            });

            btnEn.addEventListener('click', () => {
                I18n.setLanguage('en');
                btnEn.classList.add('active');
                btnEs.classList.remove('active');

                // Actualizar los textos dinámicos actuales
                this.updateDynamicTexts();
            });
        }
    },

    /**
     * Actualiza textos dinámicos después de cambio de idioma
     */
    updateDynamicTexts() {
        // Actualizar última actualización
        const lastUpdateEl = document.getElementById('last-update-time');
        if (lastUpdateEl && lastUpdateEl.textContent !== '--') {
            // Se mantiene la hora, solo cambia el texto
        }

        // Actualizar próxima actualización
        this.updateCountdownDisplay();
    },

    /**
     * Actualiza el estado en el panel de información
     * @param {string} messageKey - Clave de traducción del mensaje
     * @param {string} className - Clase CSS ('loading', 'success', 'error')
     */
    updateStatus(messageKey, className) {
        const statusElement = document.getElementById('status');
        if (statusElement) {
            statusElement.textContent = I18n.get(messageKey);
            statusElement.className = className;
            statusElement.setAttribute('data-i18n', messageKey);
        }
    },

    /**
     * Actualiza el contador de balizas
     * @param {number} count - Número de balizas
     */
    updateBeaconCount(count) {
        const countElement = document.getElementById('beacon-count');
        if (countElement) {
            countElement.textContent = count;
        }
    },

    /**
     * Actualiza la hora de última actualización
     */
    updateLastUpdateTime() {
        const timeElement = document.getElementById('last-update-time');
        if (timeElement) {
            const now = new Date();
            const locale = I18n.getCurrentLanguage() === 'es' ? 'es-ES' : 'en-US';
            const timeString = now.toLocaleTimeString(locale);
            timeElement.textContent = timeString;
        }
    },

    /**
     * Reinicia la cuenta atrás
     */
    resetCountdown() {
        // Detener cuenta atrás anterior si existe
        if (this.countdownTimer) {
            clearInterval(this.countdownTimer);
        }

        // Reiniciar contador
        this.remainingSeconds = this.refreshInterval / 1000;

        // Iniciar nueva cuenta atrás
        this.countdownTimer = setInterval(() => {
            this.remainingSeconds--;
            this.updateCountdownDisplay();

            if (this.remainingSeconds <= 0) {
                clearInterval(this.countdownTimer);
            }
        }, 1000);

        // Actualizar display inmediatamente
        this.updateCountdownDisplay();
    },

    /**
     * Actualiza el display de la cuenta atrás
     */
    updateCountdownDisplay() {
        const nextUpdateElement = document.getElementById('next-update-time');
        if (nextUpdateElement) {
            const formatted = this.formatCountdown(this.remainingSeconds);
            nextUpdateElement.textContent = formatted;
        }
    },

    /**
     * Formatea los segundos restantes en un formato legible
     * @param {number} seconds - Segundos restantes
     * @returns {string} Tiempo formateado
     */
    formatCountdown(seconds) {
        if (seconds <= 0) {
            return I18n.getCurrentLanguage() === 'es' ? '0 segundos' : '0 seconds';
        }

        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;

        if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            const label = I18n.getCurrentLanguage() === 'es' ? 'segundos' : 'seconds';
            return `${secs} ${label}`;
        }
    },

    /**
     * Inicia la actualización automática periódica
     */
    startAutoRefresh() {
        console.log(`Auto-refresh configurado cada ${this.refreshInterval / 1000} segundos`);

        this.refreshTimer = setInterval(() => {
            console.log('Actualizando datos...');
            this.loadAndRenderBeacons();
        }, this.refreshInterval);
    },

    /**
     * Detiene la actualización automática
     */
    stopAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
            console.log('Auto-refresh detenido');
        }

        if (this.countdownTimer) {
            clearInterval(this.countdownTimer);
            this.countdownTimer = null;
        }
    }
};

// Inicializar aplicación cuando el DOM esté listo
window.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Limpiar al cerrar
window.addEventListener('beforeunload', () => {
    App.stopAutoRefresh();
});
