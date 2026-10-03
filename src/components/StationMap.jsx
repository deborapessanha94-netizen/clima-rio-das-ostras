import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Layers, Maximize2, MapPin, ExternalLink, Waves, Navigation, ChevronDown, X, RotateCcw } from 'lucide-react';

export function StationMap({ stations, weatherData, selectedStation, onSelectStation }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const controlsRef = useRef(null);
  const [activeTileLayer, setActiveTileLayer] = useState('standard');
  const [activeMenu, setActiveMenu] = useState(null); // 'regions' | 'layers' | null

  // Click outside to close map popovers
  useEffect(() => {
    function handleClickOutside(event) {
      if (controlsRef.current && !controlsRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
    }
    if (activeMenu) {
      document.addEventListener('pointerdown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
    };
  }, [activeMenu]);

  const tileLayers = {
    standard: {
      name: 'Mapa Claro (OSM)',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    },
    dark: {
      name: 'Modo Escuro (Esri)',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
      maxZoom: 16
    },
    satellite: {
      name: 'Satélite (Esri)',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Source: Esri, Maxar, Earthstar Geographics',
      maxZoom: 18
    },
    topo: {
      name: 'Relevo / Serras',
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM',
      maxZoom: 17
    }
  };

  // Initialize Map focused on Rio das Ostras
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialMap = L.map(mapContainerRef.current, {
      center: [-22.495, -41.950],
      zoom: 12,
      zoomControl: true,
      scrollWheelZoom: true
    });

    const baseTile = L.tileLayer(tileLayers[activeTileLayer].url, {
      attribution: tileLayers[activeTileLayer].attribution,
      maxZoom: tileLayers[activeTileLayer].maxZoom || 18
    }).addTo(initialMap);

    mapInstanceRef.current = initialMap;
    mapInstanceRef.current._baseTile = baseTile;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle Tile Switch
  useEffect(() => {
    if (!mapInstanceRef.current || !mapInstanceRef.current._baseTile) return;
    mapInstanceRef.current.removeLayer(mapInstanceRef.current._baseTile);
    const newBase = L.tileLayer(tileLayers[activeTileLayer].url, {
      attribution: tileLayers[activeTileLayer].attribution,
      maxZoom: tileLayers[activeTileLayer].maxZoom || 18
    }).addTo(mapInstanceRef.current);
    mapInstanceRef.current._baseTile = newBase;
  }, [activeTileLayer]);

  // Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    stations.forEach(station => {
      const weather = weatherData[station.id];
      const tempText = weather?.current?.temp != null ? `${Math.round(weather.current.temp)}°` : '--';
      const status = weather?.status || station.defaultStatus || 'online';
      const isInactive = status === 'offline';
      const isOutdated = status === 'desatualizada';
      const alertLevel = weather?.alert?.level || 'normal';

      let bgClass = "bg-sky-600 text-white";
      let ringClass = "ring-sky-200 dark:ring-sky-800";

      if (isInactive) {
        bgClass = "bg-slate-400 text-white";
        ringClass = "ring-slate-200 dark:ring-slate-700";
      } else if (isOutdated) {
        bgClass = "bg-amber-600 text-white";
        ringClass = "ring-amber-200 dark:ring-amber-800";
      } else if (station.isHydrological) {
        bgClass = "bg-cyan-700 text-white";
        ringClass = "ring-cyan-200 dark:ring-cyan-800";
      } else if (station.network === 'CEMADEN') {
        bgClass = "bg-blue-600 text-white";
        ringClass = "ring-blue-200 dark:ring-blue-800";
      } else if (alertLevel === 'warning' || alertLevel === 'critical') {
        bgClass = "bg-amber-600 text-white";
        ringClass = "ring-amber-300 dark:ring-amber-800";
      }

      const isSelected = selectedStation?.id === station.id;
      const displayContent = isInactive ? 'Off' : (station.isHydrological ? '🌊' : (station.network === 'CEMADEN' ? '🌧️' : tempText));

      const customIcon = L.divIcon({
        className: 'custom-station-pin',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer group">
            <div class="w-10 h-10 rounded-full ${bgClass} font-bold text-xs shadow-md flex items-center justify-center border-2 border-white dark:border-slate-900 ring-2 ${ringClass} ${isSelected ? 'scale-125 ring-4 ring-sky-400' : ''} transition-all duration-200">
              ${displayContent}
            </div>
            <div class="absolute -bottom-1 w-2.5 h-2.5 ${bgClass} rotate-45 border-r border-b border-white dark:border-slate-900"></div>
            <span class="absolute -bottom-6 bg-slate-900/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-xs whitespace-nowrap opacity-90 group-hover:opacity-100 transition-opacity">
              ${station.neighborhood}
            </span>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -18]
      });

      const marker = L.marker([station.lat, station.lng], { icon: customIcon }).addTo(map);

      // Popup Content
      const popupContent = document.createElement('div');
      popupContent.className = 'p-2 min-w-[220px] text-slate-800 dark:text-slate-100 text-sm font-sans';
      popupContent.innerHTML = `
        <div class="border-b border-slate-200 dark:border-slate-800 pb-2 mb-2">
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs uppercase tracking-wider font-bold text-sky-600 dark:text-sky-400">${station.neighborhood}</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
              ${station.network}
            </span>
          </div>
          <h4 class="font-bold text-sm text-slate-900 dark:text-slate-100 mt-1 leading-snug">${station.name}</h4>
          <p class="text-xs text-slate-500 dark:text-slate-400">Rio das Ostras &bull; Alt: ${station.altitude}m</p>
        </div>
        
        ${station.isHydrological ? `
          <div class="bg-cyan-50 dark:bg-cyan-950/50 p-2 rounded-xl mb-2 text-xs border border-cyan-200 dark:border-cyan-800/60">
            <div class="text-[10px] text-cyan-700 dark:text-cyan-400 font-bold uppercase">${station.river}</div>
            <div class="font-bold text-slate-900 dark:text-slate-100">Nível do Rio: <span class="text-cyan-700 dark:text-cyan-300">${weather?.current?.riverLevel != null ? weather.current.riverLevel + ' m' : (station.riverLevel != null ? station.riverLevel + ' m' : '1.39 m')}</span></div>
            <div class="text-[10px] text-slate-500">Status: ${weather?.current?.statusMonitoramento || station.statusMonitoramento || 'Vigilância'}</div>
          </div>
        ` : ''}

        ${station.network === 'CEMADEN' ? `
          <div class="bg-blue-50 dark:bg-blue-950/50 p-2 rounded-xl mb-2 text-xs border border-blue-200 dark:border-blue-800/60">
            <div class="text-[10px] text-blue-700 dark:text-blue-400 font-bold uppercase">PCD Pluviométrica CEMADEN</div>
            <div class="font-bold text-slate-900 dark:text-slate-100">Chuva 24h: <span class="text-blue-700 dark:text-blue-300">${weather?.current?.rainAccumulated24h || 1.0} mm</span></div>
            <div class="text-[10px] text-slate-500">Acumulado 96h: ${weather?.current?.rain96h || 39.2} mm</div>
          </div>
        ` : ''}

        <div class="grid grid-cols-2 gap-2 text-xs mb-3">
          <div class="bg-slate-50 dark:bg-slate-800/80 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
            <div class="text-slate-500 dark:text-slate-400 text-[10px]">Temp. / Sensação</div>
            <div class="font-bold text-sm text-slate-900 dark:text-slate-100">${weather?.current?.temp != null ? weather.current.temp + '°C' : '--'}</div>
          </div>
          <div class="bg-slate-50 dark:bg-slate-800/80 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
            <div class="text-slate-500 dark:text-slate-400 text-[10px]">Chuva 24h</div>
            <div class="font-bold text-sm text-sky-600 dark:text-sky-400">${weather?.current?.rainAccumulated24h != null ? weather.current.rainAccumulated24h + ' mm' : '0 mm'}</div>
          </div>
        </div>

        <div class="flex items-center gap-1.5">
          <button id="btn-station-${station.id}" class="flex-1 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold py-1.5 px-2 rounded-xl shadow-xs transition flex items-center justify-center gap-1">
            Ver Gráficos &rarr;
          </button>
          ${station.externalUrl ? `
            <a href="${station.externalUrl}" target="_blank" rel="noopener noreferrer" class="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition" title="Abrir página oficial">
              🔗
            </a>
          ` : ''}
        </div>
      `;

      popupContent.querySelector(`#btn-station-${station.id}`)?.addEventListener('click', () => {
        onSelectStation(station);
      });

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        onSelectStation(station);
      });

      markersRef.current[station.id] = marker;
    });
  }, [stations, weatherData, selectedStation]);

  // Center on selected station
  useEffect(() => {
    if (selectedStation && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedStation.lat, selectedStation.lng], 14, {
        duration: 1.2
      });
      const marker = markersRef.current[selectedStation.id];
      if (marker) {
        marker.openPopup();
      }
    }
  }, [selectedStation]);

  const setViewCoords = (lat, lng, zoom) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], zoom, { duration: 1.0 });
    }
  };

  return (
    <div className="relative w-full h-[390px] sm:h-[460px] md:h-[500px] rounded-3xl overflow-hidden shadow-sm border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Floating Controls - Clean Responsive Popovers */}
      <div ref={controlsRef} className="absolute top-3 right-3 z-[400] flex items-center gap-1.5">
        {/* Recenter Button */}
        <button
          onClick={() => setViewCoords(-22.495, -41.950, 12)}
          className="p-2 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 shadow-md hover:bg-slate-50 dark:hover:bg-slate-800 transition active:scale-95"
          title="Recentralizar Rio das Ostras"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500 hover:text-sky-600" />
        </button>

        {/* Regiões Dropdown Toggle */}
        <div className="relative">
          <button
            onClick={() => setActiveMenu(activeMenu === 'regions' ? null : 'regions')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl backdrop-blur-md text-xs font-semibold border shadow-md transition active:scale-95 ${
              activeMenu === 'regions'
                ? 'bg-sky-600 text-white border-sky-600 ring-2 ring-sky-300 dark:ring-sky-700'
                : 'bg-white/95 dark:bg-slate-900/95 text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Navigation className="w-3.5 h-3.5 text-sky-500" />
            <span>Regiões</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${activeMenu === 'regions' ? 'rotate-180' : ''}`} />
          </button>

          {/* Regiões Dropdown Panel */}
          {activeMenu === 'regions' && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1.5 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 flex flex-col gap-1 text-xs">
              <div className="flex items-center justify-between px-2 py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Regiões &bull; Rio das Ostras</span>
                <button onClick={() => setActiveMenu(null)} className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <X className="w-3 h-3" />
                </button>
              </div>
              <button
                onClick={() => { setViewCoords(-22.495, -41.950, 12); setActiveMenu(null); }}
                className="px-2.5 py-1.5 rounded-xl text-left font-bold text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/60 transition"
              >
                📍 Toda Rio das Ostras
              </button>
              <button
                onClick={() => { setViewCoords(-22.529, -41.925, 14); setActiveMenu(null); }}
                className="px-2.5 py-1.5 rounded-xl text-left font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Costazul / Litoral
              </button>
              <button
                onClick={() => { setViewCoords(-22.524, -41.942, 14); setActiveMenu(null); }}
                className="px-2.5 py-1.5 rounded-xl text-left font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Centro / Boca da Barra
              </button>
              <button
                onClick={() => { setViewCoords(-22.502, -41.940, 14); setActiveMenu(null); }}
                className="px-2.5 py-1.5 rounded-xl text-left font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Mariléa / Âncora
              </button>
              <button
                onClick={() => { setViewCoords(-22.451, -41.988, 13); setActiveMenu(null); }}
                className="px-2.5 py-1.5 rounded-xl text-left font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cantagalo / Rural
              </button>
              <button
                onClick={() => { setViewCoords(-22.420, -42.045, 13); setActiveMenu(null); }}
                className="px-2.5 py-1.5 rounded-xl text-left font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Rocha Leão / REBIO
              </button>
            </div>
          )}
        </div>

        {/* Camadas Dropdown Toggle */}
        <div className="relative">
          <button
            onClick={() => setActiveMenu(activeMenu === 'layers' ? null : 'layers')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl backdrop-blur-md text-xs font-semibold border shadow-md transition active:scale-95 ${
              activeMenu === 'layers'
                ? 'bg-sky-600 text-white border-sky-600 ring-2 ring-sky-300 dark:ring-sky-700'
                : 'bg-white/95 dark:bg-slate-900/95 text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-sky-500" />
            <span>Camadas</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${activeMenu === 'layers' ? 'rotate-180' : ''}`} />
          </button>

          {/* Camadas Dropdown Panel */}
          {activeMenu === 'layers' && (
            <div className="absolute right-0 top-full mt-2 w-44 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1.5 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 flex flex-col gap-1 text-xs">
              <div className="flex items-center justify-between px-2 py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estilo do Mapa</span>
                <button onClick={() => setActiveMenu(null)} className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <X className="w-3 h-3" />
                </button>
              </div>
              <button
                onClick={() => { setActiveTileLayer('standard'); setActiveMenu(null); }}
                className={`px-2.5 py-1.5 rounded-xl font-medium text-left transition ${
                  activeTileLayer === 'standard' ? 'bg-sky-600 text-white font-semibold shadow-xs' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Mapa Claro
              </button>
              <button
                onClick={() => { setActiveTileLayer('dark'); setActiveMenu(null); }}
                className={`px-2.5 py-1.5 rounded-xl font-medium text-left transition ${
                  activeTileLayer === 'dark' ? 'bg-sky-600 text-white font-semibold shadow-xs' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Modo Escuro
              </button>
              <button
                onClick={() => { setActiveTileLayer('satellite'); setActiveMenu(null); }}
                className={`px-2.5 py-1.5 rounded-xl font-medium text-left transition ${
                  activeTileLayer === 'satellite' ? 'bg-sky-600 text-white font-semibold shadow-xs' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Satélite
              </button>
              <button
                onClick={() => { setActiveTileLayer('topo'); setActiveMenu(null); }}
                className={`px-2.5 py-1.5 rounded-xl font-medium text-left transition ${
                  activeTileLayer === 'topo' ? 'bg-sky-600 text-white font-semibold shadow-xs' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Relevo
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Legend Overlay - Responsive Slim Pill Bar */}
      <div className="absolute bottom-2.5 left-2.5 sm:bottom-3 sm:left-3 z-[400] max-w-[calc(100%-80px)] sm:max-w-none">
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl shadow-md border border-slate-200/80 dark:border-slate-800 text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-2 sm:gap-3 overflow-x-auto whitespace-nowrap">
          <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 flex-shrink-0">
            <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-500" /> Legenda:
          </span>
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-sky-600 inline-block"></span>
            <span>Ativa</span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-cyan-700 inline-block"></span>
            <span className="hidden sm:inline">Hidrológica (Rio Jundiá)</span>
            <span className="sm:hidden">Rio Jundiá</span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-600 inline-block"></span>
            <span className="hidden sm:inline">Desatualizada</span>
            <span className="sm:hidden">Desat.</span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-slate-400 inline-block"></span>
            <span>Inativa</span>
          </div>
        </div>
      </div>
    </div>
  );
}
