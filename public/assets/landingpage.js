$(document).ready(function () {

        AOS.init();

        var mapmargin = 50;
        $('#map').css("height", ($(window).height() - mapmargin));
        $(window).on("resize", resize);
        resize();

        function resize() {

            if ($(window).width() >= 980) {
                $('#map').css("height", ($(window).height() - mapmargin));
                $('#map').css("margin-top", 50);
            } else {
                $('#map').css("height", ($(window).height() - (mapmargin + 12)));
                $('#map').css("margin-top", -21);
            }

        }

        var umkm = L.layerGroup();
        var tahun = new Date().getFullYear();
        var data = @json($dataset);
        $.each(data, function (index, value) {
            $('#tahun_peta').on('change', function(){
                tahun = $('#tahun_peta').val();
                if (tahun == value.tahun) {
                    L.marker([value.longtd, value.latd])
                        .addTo(umkm)
                        .bindPopup("<center>Dusun : " + value.nama_dusun + "&emsp;" + "Potensi : " + value.nama_potensi + "<br> Tahun : "+ value.tahun+ " Hasil Panen : "+ value.hasil+" ton" + "</center>")
                        .openPopup();
                    }
            });
            L.marker([value.longtd, value.latd])
                        .addTo(umkm)
                        .bindPopup("<center>Dusun : " + value.nama_dusun + "&emsp;" + "Potensi : " + value.nama_potensi + "<br> Tahun : "+ value.tahun+ " Hasil Panen : "+ value.hasil+" ton" + "</center>")
                        .openPopup();
        });

        var mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            mbUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

        var streets = L.tileLayer(mbUrl, {
            id: 'mapbox/streets-v11',
            tileSize: 512,
            zoomOffset: -1,
            attribution: mbAttr
        });

        var googlestreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
            maxZoom: 20,
            tileSize: 512,
            zoomOffset: -1,
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
        });

        var googleHybrid = L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
            maxZoom: 20,
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
        });
        var googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
            maxZoom: 20,
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
        });
        var googleTerrain = L.tileLayer('http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {
            maxZoom: 20,
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
        });

        var map = L.map('map', {
            center: [-8.099034, 113.703443],
            zoom: 13,
            layers: [googleHybrid, umkm]
        });

        var baseLayers = {
            "Streets": streets,
            "Google Streets": googlestreets,
            "Google Satelite": googleSat,
            "Google Hybrid": googleHybrid,
            "Google Terrain": googleTerrain
        };

        var overlays = {
            "UMKM": umkm
        };



        var popup = L.popup();
        L.control.scale().addTo(map);

        var info = L.control();

        info.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'info');
            this.update();
            return this._div;
        };

        info.update = function (props) {
            this._div.innerHTML = '' + (props ?
                '<b>' + props.name + '</b><br />' :
                '');
        };

        info.addTo(map);


        // get color depending on population density value
        function getColor(d) {
            return d > 1000 ? '#800026' :
                d > 500 ? '#BD0026' :
                d > 200 ? '#E31A1C' :
                d > 100 ? '#FC4E2A' :
                d > 50 ? '#FD8D3C' :
                d > 20 ? '#FEB24C' :
                d > 10 ? '#FED976' :
                '#FFEDA0';
        }

        function style(feature) {
            return {
                weight: 2,
                opacity: 1,
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.7,
                fillColor: getColor(feature.properties.density)
            };
        }

        function highlightFeature(e) {
            var layer = e.target;

            layer.setStyle({
                weight: 5,
                color: '#666',
                dashArray: '',
                fillOpacity: 0.7
            });

            if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                layer.bringToFront();
            }

            info.update(layer.feature.properties);
        }

        var geojson;

        function resetHighlight(e) {
            geojson.resetStyle(e.target);
            info.update();
        }

        function zoomToFeature(e) {
            map.fitBounds(e.target.getBounds());
        }

        function onEachFeature(feature, layer) {
            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight,
                click: zoomToFeature
            });
        }

        geojson = L.geoJson(kemuningData, {
            style: style,
            onEachFeature: onEachFeature
        }).addTo(umkm);

        map.attributionControl.addAttribution('Data Stunting dan UMKM</a>');


        var legend = L.control({
            position: 'bottomright'
        });

        var arcgisOnlineProvider = L.esri.Geocoding.arcgisOnlineProvider({
            apikey: "https://developers.arcgis.com" // replace with your api key - https://developers.arcgis.com
        });

        var gisDayProvider = L.esri.Geocoding.featureLayerProvider({
            url: 'https://services.arcgis.com/BG6nSlhZSAWtExvp/ArcGIS/rest/services/GIS_Day_Registration_Form_2019_Hosted_View_Layer/FeatureServer/0',
            searchFields: ['event_name', 'host_organization'],
            label: 'GIS Day Events 2019',
            bufferRadius: 5000,
            formatSuggestion: function (feature) {
                return feature.properties.event_name + ' - ' + feature.properties.host_organization;
            }
        });

        L.esri.Geocoding.geosearch({
            providers: [arcgisOnlineProvider, gisDayProvider]
        }).addTo(map);

        L.control.layers(baseLayers, overlays).addTo(map);

        // barChart(result);
        var result = @json($grafik);
          

        var chart;
        initMorris();
        getMorris();
        setMorris(result);
        // getMorrisOffline();

        function initMorris() {
            chart = Morris.Bar({
                element: 'bar-chart',
                xkey: 'y',
                ykeys: ['a'],
                labels: ['Hasil Komoditas / Ton atau Batang '],
                lineWidth: '3px',
                barColors : ['#3366ff'],
                resize: true,
                redraw: true
            });
        }
        function setMorris(result) {
            chart.setData(result);
        }

        function getMorris() {
            $('#nama_potensi').on('change', function(){
                var nama_potensi = $('#nama_potensi').val();
                $.ajax({
                    url: "{{URL::to('grafik')}}",
                    type: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]')
                            .attr('content')
                    },
                    // dataType: 'default: Intelligent Guess (Other values: xml, json, script, or html)',
                    dataType: 'json',
                    data: {
                        nama_potensi: nama_potensi
                    },
                    cache: false,
                    success: function (data) {
                        chart.setData(data);
                        chart.setLabels([nama_potensi]);
                    }
                })
            })
        }

        $(window).resize(function () {
            chart.redraw();
        });
            
        
    });