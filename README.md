# Balizas V16 - Visor en Tiempo Real

Aplicación web que muestra en un mapa interactivo todas las balizas V16 activas en España usando datos oficiales de la DGT.

## Demo en Vivo

Una vez desplegado en GitHub Pages, la aplicación estará disponible en:
```
https://jdamiancabello.github.io/balizas-v16
```

## Características

- Mapa interactivo con OpenLayers
- Panel de ajustes con botón flotante
- Botones para seleccionar entre vistas Mapa y Satélite
- Sistema multiidioma (Español/Inglés)
- Markers personalizados para cada baliza V16
- Información detallada al hacer clic en cada baliza
- Actualización automática cada 5 minutos con cuenta atrás
- Panel con contador de balizas activas
- Auto-ajuste de zoom para mostrar todas las balizas
- Diseño responsive optimizado para móvil
- 100% del lado del cliente (HTML + JavaScript)
- Preferencias guardadas en localStorage

## Cómo Usar

### Opción 1: Abrir Localmente

Simplemente abre el archivo `index.html` en tu navegador. La aplicación cargará automáticamente los datos usando el proxy CodeTabs.

### Controles de la Aplicación

**Botón de Ajustes (⚙️)**
- Ubicado en la esquina inferior derecha
- Haz clic para abrir/cerrar el panel de configuración
- Animación de rotación al hacer hover

**Panel de Ajustes:**
- **Vista del mapa**: Botones cuadrados con iconos (🗺️ / 🛰️) para cambiar entre mapa normal y vista satélite
- **Idioma**: Botones con banderas (🇪🇸 / 🇬🇧) para cambiar entre Español e Inglés
- Las preferencias se guardan automáticamente en localStorage

**Interacción con el Mapa:**
- **Clic en Baliza**: Ver información detallada (ubicación, hora, tipo de incidente)
- **Zoom**: Rueda del ratón o controles táctiles (pellizco)
- **Pan**: Arrastra el mapa para moverte por España

### Opción 2: Desplegar en GitHub Pages

1. Crea un nuevo repositorio en GitHub (por ejemplo: `balizas-v16`)

2. Sube los archivos al repositorio:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/tu-usuario/balizas-v16.git
   git push -u origin main
   ```

3. Activa GitHub Pages:
   - Ve a Settings → Pages
   - En "Source", selecciona "main" branch
   - Haz clic en "Save"

4. Espera unos minutos y tu aplicación estará disponible en:
   ```
   https://tu-usuario.github.io/balizas-v16
   ```

## Cómo Funciona

### Problema de CORS

La API de la DGT tiene restricciones CORS que impiden el acceso directo desde el navegador. La aplicación resuelve esto usando el proxy público **CodeTabs** (https://api.codetabs.com), que es confiable y no requiere configuración.

### Flujo de Datos

```
1. Usuario abre la página
   ↓
2. JavaScript carga datos del feed DATEX II vía proxy CodeTabs
   ↓
3. Parser XML extrae balizas V16 activas
   ↓
4. Renderiza markers en el mapa
   ↓
5. Repite cada 5 minutos (300 segundos)
```

## Estructura del Proyecto

```
balizas/
├── assets/
│   ├── css/
│   │   └── styles.css           # Estilos y responsive design
│   ├── js/
│   │   ├── i18n.js             # Sistema de internacionalización
│   │   ├── dgt-api.js          # Módulo para cargar datos de la DGT
│   │   ├── map.js              # Módulo para gestión del mapa
│   │   └── app.js              # Aplicación principal
│   └── images/
│       └── baliza-intermitente-32px.png  # Icono de baliza V16
├── index.html                   # Página principal
├── README.md                    # Este archivo
└── .gitignore                   # Archivos ignorados por Git
```

## Tecnologías

- **HTML5** - Estructura
- **CSS3** - Estilos con media queries responsive
- **JavaScript vanilla** - Lógica (sin frameworks)
- **OpenLayers 8.2.0** - Librería de mapas
- **OpenStreetMap** - Capa de mapa estándar
- **ESRI World Imagery** - Capa satélite

## Arquitectura del Código

La aplicación está organizada en módulos independientes:

### `i18n.js`
Sistema de internacionalización:
- Gestión de traducciones español/inglés
- Cambio dinámico de idioma en tiempo real
- Persistencia de preferencias en localStorage
- Actualización automática del DOM
- Traducciones para UI y popups

### `dgt-api.js`
Módulo responsable de la comunicación con la API de la DGT:
- Carga del feed XML DATEX II
- Parseo de datos XML
- Extracción de balizas V16 activas
- Gestión de errores de red

### `map.js`
Módulo de gestión del mapa interactivo:
- Inicialización de OpenLayers
- Sistema de capas múltiples (OSM y satélite)
- Cambio dinámico entre vistas de mapa
- Renderizado de markers con icono personalizado
- Eventos de clic y hover
- Ajuste automático de vista
- Formateo de información de balizas con traducciones

### `app.js`
Controlador principal de la aplicación:
- Coordinación entre módulos
- Gestión del panel de ajustes
- Actualización de UI (contador, estado, hora)
- Sistema de auto-refresh cada 5 minutos
- Cuenta atrás para próxima actualización
- Ciclo de vida de la aplicación

## Compatibilidad Móvil

La aplicación está completamente optimizada para dispositivos móviles:

### Adaptaciones Responsive

- **Panel de información**: Se reposiciona sobre el botón de ajustes en móviles para mejor accesibilidad
- **Botón de ajustes**: Tamaño reducido en móviles (45px) pero mantiene buena área de toque
- **Panel de ajustes**: Ancho adaptativo con padding reducido en móviles
- **Botones**: Tamaño reducido en móviles (45px mapa, 40px idioma) pero perfectamente táctiles
- **Tamaños de fuente**: Se ajustan automáticamente según el tamaño de pantalla
- **Controles táctiles**: Zoom con pellizco, pan con un dedo, totalmente funcional
- **Botones interactivos**: Estados visuales claros con animaciones suaves

### Breakpoints

- **Tablets (≤768px)**: Botón de ajustes 45px, panel sobre botón, botones de 45x45px (mapa) y 40px altura (idioma)
- **Móviles pequeños (≤480px)**: Tamaños de fuente más pequeños, padding reducido, optimización de espacio

La aplicación funciona perfectamente en:
- iOS (Safari, Chrome)
- Android (Chrome, Firefox, Samsung Internet)
- Tablets
- Dispositivos de cualquier tamaño

## Datos de la DGT

Los datos provienen del feed oficial DATEX II de la DGT:
```
https://nap.dgt.es/datex2/v3/dgt/SituationPublication/datex2_v36.xml
```

La aplicación filtra únicamente las incidencias con `causeType = vehicleObstruction` y estado `active`, que corresponden a las balizas V16.

### Formato DATEX II

El XML contiene situaciones de tráfico. Cada baliza V16 se identifica por:
```xml
<situationRecord ...>
    <validity>
        <validityStatus>active</validityStatus>
    </validity>
    <cause>
        <causeType>vehicleObstruction</causeType>
    </cause>
    <locationReference>
        <pointCoordinates>
            <latitude>40.123456</latitude>
            <longitude>-3.654321</longitude>
        </pointCoordinates>
    </locationReference>
    ...
</situationRecord>
```

## Solución de Problemas

### "Error al cargar datos"

**Posibles causas:**
- El proxy CodeTabs está temporalmente caído
- La API de la DGT está fuera de línea
- Restricciones de red (firewall corporativo)

**Soluciones:**
1. Abre la consola del navegador (F12) para ver el error detallado
2. Espera unos minutos e intenta de nuevo
3. Verifica que tienes conexión a internet

### No veo ninguna baliza

**Posibles causas:**
- No hay balizas V16 activas en este momento en España
- Los datos se cargaron pero están vacíos

**Verificación:**
1. Revisa el contador en el panel (debería mostrar 0 si no hay balizas)
2. Mira la consola del navegador para ver los mensajes de debug

### Los datos no se actualizan

**Solución:**
- Refresca la página (F5)
- El auto-refresh funciona cada 5 minutos automáticamente

## Limitaciones

1. **Dependencia del proxy CodeTabs**: Si el proxy falla, la aplicación no funcionará
2. **Límites de rate**: El proxy puede tener límites de peticiones por IP
3. **Latencia**: El proxy añade latencia extra (1-3 segundos típicamente)

## Mejoras Futuras

- [ ] Caché local de datos para funcionamiento offline
- [ ] Filtros por región/provincia
- [ ] Historial de balizas
- [ ] Notificaciones de nuevas balizas
- [ ] Estimación de tiempo de incidente

## Licencia

Este proyecto es de código abierto para fines educativos.

### Atribuciones

- **Icono de baliza**: <a href="https://www.flaticon.com/free-icons/beacon" title="beacon icons">Beacon icons created by Freepik - Flaticon</a>
  - Licencia: Gratis para uso personal o comercial con atribución
  - Fuente: [Flaticon](https://www.flaticon.com)

## Contribuir

¿Encontraste un bug o quieres añadir una funcionalidad?

1. Haz un fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Añade nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## Contacto

Si tienes preguntas o sugerencias, abre un issue en el repositorio.

---

**Nota:** Esta aplicación no está afiliada con la DGT. Los datos se obtienen del feed público oficial.
