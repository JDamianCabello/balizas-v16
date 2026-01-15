/**
 * Módulo para interactuar con la API de la DGT
 * Carga y parsea el feed DATEX II de balizas V16
 */

const DgtApi = {
    // Configuración
    config: {
        DGT_FEED_URL: 'https://nap.dgt.es/datex2/v3/dgt/SituationPublication/datex2_v36.xml',
        PROXY_URL: 'https://api.codetabs.com/v1/proxy?quest=',
        REQUEST_TIMEOUT: 15000 // 15 segundos
    },

    /**
     * Carga los datos XML desde la DGT
     * @returns {Promise<string>} XML como texto
     */
    async fetchData() {
        console.log('Cargando datos desde DGT via CodeTabs proxy...');

        const response = await fetch(
            this.config.PROXY_URL + encodeURIComponent(this.config.DGT_FEED_URL),
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/xml, text/xml, */*'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const xmlText = await response.text();
        console.log(`XML recibido: ${xmlText.length} bytes`);

        return xmlText;
    },

    /**
     * Obtiene un elemento del XML de forma robusta
     * @param {Element} parent - Elemento padre
     * @param {string} tagName - Nombre del tag a buscar
     * @returns {Element|null} Elemento encontrado o null
     */
    getElement(parent, tagName) {
        return parent.querySelector(tagName) || parent.getElementsByTagName(tagName)[0] || null;
    },

    /**
     * Obtiene el texto de un elemento del XML
     * @param {Element} parent - Elemento padre
     * @param {string} tagName - Nombre del tag a buscar
     * @returns {string} Texto del elemento o cadena vacía
     */
    getElementText(parent, tagName) {
        const element = this.getElement(parent, tagName);
        return element ? element.textContent.trim() : '';
    },

    /**
     * Parsea el XML DATEX II y extrae las balizas V16
     * @param {string} xmlText - XML como texto
     * @returns {Array} Array de objetos con datos de balizas
     */
    parseBeacons(xmlText) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

        // Verificar errores de parseo
        const parserError = xmlDoc.querySelector('parsererror');
        if (parserError) {
            console.error('Error al parsear XML:', parserError.textContent);
            throw new Error('Error al parsear XML');
        }

        const beacons = [];

        // Buscar todos los situationRecord
        let situations = xmlDoc.getElementsByTagName('situationRecord');
        if (situations.length === 0) {
            situations = xmlDoc.getElementsByTagNameNS('*', 'situationRecord');
        }

        console.log(`Total situationRecords encontrados: ${situations.length}`);
        console.log('Buscando balizas V16 (causeType=vehicleObstruction)...');

        for (let i = 0; i < situations.length; i++) {
            const situation = situations[i];

            // Las balizas V16 tienen causeType = vehicleObstruction
            const causeTypeText = this.getElementText(situation, 'causeType');
            const status = this.getElementText(situation, 'validityStatus');

            if (causeTypeText === 'vehicleObstruction' && status === 'active') {
                const latitude = this.getElement(situation, 'latitude');
                const longitude = this.getElement(situation, 'longitude');

                if (latitude && longitude) {
                    const lat = parseFloat(latitude.textContent);
                    const lon = parseFloat(longitude.textContent);

                    // Construir ubicación legible
                    const locationParts = [
                        this.getElementText(situation, 'roadName'),
                        this.getElementText(situation, 'municipality'),
                        this.getElementText(situation, 'province')
                    ].filter(part => part.length > 0);

                    beacons.push({
                        id: situation.getAttribute('id') || `beacon_${i}`,
                        lat: lat,
                        lon: lon,
                        time: this.getElementText(situation, 'overallStartTime') || 'N/A',
                        type: this.getElementText(situation, 'vehicleObstructionType') || 'Vehículo detenido',
                        location: locationParts.length > 0 ? locationParts.join(', ') : 'Ubicación desconocida'
                    });
                }
            }
        }

        console.log(`Total balizas V16 activas encontradas: ${beacons.length}`);
        return beacons;
    },

    /**
     * Carga y parsea las balizas V16 en un solo paso
     * @returns {Promise<Array>} Array de objetos con datos de balizas
     */
    async getBeacons() {
        try {
            const xmlText = await this.fetchData();
            const beacons = this.parseBeacons(xmlText);
            return beacons;
        } catch (error) {
            console.error('Error al obtener balizas:', error);
            throw error;
        }
    }
};

// Exportar para uso como módulo
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DgtApi;
}
