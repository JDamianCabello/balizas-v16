/**
 * Módulo para gestionar el mapa de OpenLayers
 * Inicialización, renderizado de markers y eventos
 */

const MapManager = {
    // Estado interno
    map: null,
    vectorSource: null,
    vectorLayer: null,
    osmLayer: null,
    satelliteLayer: null,
    currentLayer: 'osm',

    // Configuración
    config: {
        MAP_CENTER: [-3.7038, 40.4168], // Madrid (lon, lat)
        MAP_ZOOM: 6,
        BEACON_ICON_PATH: './assets/images/baliza-intermitente-32px.png'
    },

    /**
     * Inicializa el mapa de OpenLayers
     */
    init() {
        console.log('Inicializando mapa...');

        // Crear capa OSM
        this.osmLayer = new ol.layer.Tile({
            source: new ol.source.OSM(),
            visible: true
        });

        // Crear capa satélite (ESRI World Imagery)
        this.satelliteLayer = new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                attributions: 'Tiles © Esri'
            }),
            visible: false
        });

        // Crear fuente de datos vectorial para los markers
        this.vectorSource = new ol.source.Vector();

        // Crear capa vectorial con estilo personalizado
        this.vectorLayer = new ol.layer.Vector({
            source: this.vectorSource,
            style: new ol.style.Style({
                image: new ol.style.Icon({
                    anchor: [0.5, 1],
                    src: this.config.BEACON_ICON_PATH,
                    scale: 1
                })
            })
        });

        // Crear mapa con ambas capas base
        this.map = new ol.Map({
            target: 'map',
            layers: [
                this.osmLayer,
                this.satelliteLayer,
                this.vectorLayer
            ],
            view: new ol.View({
                center: ol.proj.fromLonLat(this.config.MAP_CENTER),
                zoom: this.config.MAP_ZOOM
            })
        });

        // Configurar eventos
        this.map.on('click', (evt) => this.handleMapClick(evt));
        this.map.on('pointermove', (e) => this.handlePointerMove(e));

        // Configurar selector de capa
        this.setupLayerSelector();

        console.log('Mapa inicializado correctamente');
    },

    /**
     * Maneja el clic en el mapa
     * @param {object} evt - Evento de clic
     */
    handleMapClick(evt) {
        const feature = this.map.forEachFeatureAtPixel(evt.pixel, (feature) => feature);

        if (feature) {
            const props = feature.getProperties();
            const message = `${I18n.get('beacon')}\n\n` +
                          `${I18n.get('location')}: ${props.location || I18n.get('unknown')}\n` +
                          `${I18n.get('time')}: ${this.formatTime(props.time) || I18n.get('unknown')}\n` +
                          `${I18n.get('type')}: ${this.formatType(props.type) || I18n.get('unknown')}`;
            alert(message);
        }
    },

    /**
     * Maneja el movimiento del puntero sobre el mapa
     * @param {object} e - Evento de movimiento
     */
    handlePointerMove(e) {
        const pixel = this.map.getEventPixel(e.originalEvent);
        const hit = this.map.hasFeatureAtPixel(pixel);
        const target = this.map.getTargetElement();

        if (target) {
            target.style.cursor = hit ? 'pointer' : '';
        }
    },

    /**
     * Renderiza las balizas en el mapa
     * @param {Array} beacons - Array de objetos con datos de balizas
     */
    renderBeacons(beacons) {
        // Limpiar markers existentes
        this.vectorSource.clear();

        // Agregar nuevos markers
        beacons.forEach(beacon => {
            const feature = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.fromLonLat([beacon.lon, beacon.lat])),
                id: beacon.id,
                time: beacon.time,
                type: beacon.type,
                location: beacon.location
            });

            this.vectorSource.addFeature(feature);
        });

        console.log(`${beacons.length} balizas renderizadas en el mapa`);

        // Si hay balizas, ajustar vista para mostrarlas todas
        if (beacons.length > 0) {
            const extent = this.vectorSource.getExtent();
            this.map.getView().fit(extent, {
                padding: [50, 50, 50, 50],
                maxZoom: 16,
                duration: 1000
            });
        }
    },

    /**
     * Formatea la hora para mostrar
     * @param {string} timeStr - String de tiempo ISO
     * @returns {string} Hora formateada
     */
    formatTime(timeStr) {
        if (!timeStr || timeStr === 'N/A') return 'N/A';

        try {
            const date = new Date(timeStr);
            return date.toLocaleString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return timeStr;
        }
    },

    /**
     * Formatea el tipo de obstrucción
     * @param {string} type - Tipo de obstrucción
     * @returns {string} Tipo formateado
     */
    formatType(type) {
        // Intentar obtener traducción del tipo
        const translatedType = I18n.get(type);

        // Si la traducción es igual al tipo, significa que no existe traducción
        if (translatedType !== type) {
            return translatedType;
        }

        // Si no hay traducción específica, devolver valor por defecto
        return type || I18n.get('vehicleStopped');
    },

    /**
     * Configura el selector de capas (botones)
     */
    setupLayerSelector() {
        const btnOsm = document.getElementById('btn-map-osm');
        const btnSatellite = document.getElementById('btn-map-satellite');

        if (btnOsm && btnSatellite) {
            btnOsm.addEventListener('click', () => {
                this.switchLayer('osm');
                btnOsm.classList.add('active');
                btnSatellite.classList.remove('active');
            });

            btnSatellite.addEventListener('click', () => {
                this.switchLayer('satellite');
                btnSatellite.classList.add('active');
                btnOsm.classList.remove('active');
            });
        }
    },

    /**
     * Cambia entre capas del mapa
     * @param {string} layerType - Tipo de capa ('osm' o 'satellite')
     */
    switchLayer(layerType) {
        console.log(`Cambiando a capa: ${layerType}`);

        if (layerType === 'osm') {
            this.osmLayer.setVisible(true);
            this.satelliteLayer.setVisible(false);
            this.currentLayer = 'osm';
        } else if (layerType === 'satellite') {
            this.osmLayer.setVisible(false);
            this.satelliteLayer.setVisible(true);
            this.currentLayer = 'satellite';
        }
    }
};

// Exportar para uso como módulo
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MapManager;
}
