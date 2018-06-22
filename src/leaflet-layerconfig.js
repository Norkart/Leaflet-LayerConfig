/*
leaflet-layerconfig
Library that communicates with a web service/reads a stored JavaScript object and adds layers to a leaflet map.
Copyright 2014 Norkart AS
*/

/*global L: false, ActiveXObject: false, window: false, XMLHttpRequest: false*/


(function () {
    'use strict';

    function ajaxRequest(url, callback, onerror) {
        var httpRequest;

        var alertContents = function () {
            if (httpRequest.readyState === 4) {
                if (httpRequest.status === 200) {
                    callback(httpRequest.responseText);
                } else if (onerror) {
                    onerror(httpRequest);
                }
            }
        };

        var makeRequest = function (url) {
            if (window.XMLHttpRequest) { // Mozilla, Safari, ...
                httpRequest = new XMLHttpRequest();
            } else if (window.ActiveXObject) { // IE
                try {
                    httpRequest = new ActiveXObject("Msxml2.XMLHTTP");
                } catch (e) {
                    try {
                        httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
                    } catch (ignore) {

                    }
                }
            }

            if (!httpRequest) {
                throw new Error('Giving up :( Cannot create an XMLHTTP instance');
            }
            httpRequest.onreadystatechange = alertContents;
            httpRequest.open('GET', url);
            httpRequest.send();
        };
        makeRequest(url);
    }

    function existsAndIsString(value) {
        return !!(value && typeof value === "string");
    }

 L.LayerConfig = L.Evented.extend({

        _map: null,

        _json: null,

        initialize: function (map) {
            this._map = map;
        },

        parse: function (json) {
            this._json = json;

            if (typeof json === "string") { // We take a string to mean we got an url;
                var self = this;
                var success = function (data) {
                    var parsedJson = JSON.parse(data);
                    if (self._map.setView && parsedJson.center && parsedJson.zoom) {
                        self._map.setView(parsedJson.center, parsedJson.zoom);
                    }
                    self.addLayers(parsedJson);
                };
                ajaxRequest(json, success);
            } else {
                if (this._map.setView && json.center && json.zoom) {
                    this._map.setView(json.center, json.zoom);
                }
                if (this._map.fitBounds && json.bounds) {
                    this._map.fitBounds(json.bounds);
                }
                this.addLayers(json);
            }
        },

        _evalJsonOptions: function (options) {
            /*jslint evil: true */
            if (options) {
                if (existsAndIsString(options.style)) {
                    eval("options.style = " + options.style);
                }
                if (existsAndIsString(options.onEachFeature)) {
                    eval("options.onEachFeature = " + options.onEachFeature);
                }
                if (existsAndIsString(options.filter)) {
                    eval("options.filter = " + options.filter);
                }
                if (existsAndIsString(options.pointToLayer)) {
                    eval("options.pointToLayer = " + options.pointToLayer);
                }
                if (existsAndIsString(options.coordsToLatLng)) {
                    eval("options.coordsToLatLng = " + options.coordsToLatLng);
                }
            }
            /*jslint evil: false */
            return options;
        },

        _addLayer: function (layer, json, addTo) {
            if (json.baseLayer && this._addedBaseLayer) {

            } else if (!json.baseLayer) {
                addTo.addLayer(layer);
            } else {
                this._addedBaseLayer = true;
                addTo.addLayer(layer);
                if (layer.bringToFront) {
                    layer.bringToFront();
                }
            }
            this.fire("LayerLoaded", {
                type: json.type,
                name: json.name,
                layer: layer,
                baseLayer: json.baseLayer
            });
        },

        addLayers: function (json, addTo) {
            if (!addTo) {
                addTo = this._map;
            }
            this.fire("startLayerLoading");
            var i;
            var layer;
            for (i = 0; i < json.layers.length; i++) {
                layer = json.layers[i];
                switch (layer.type) {
                case 'marker':
                    this.addMarker(layer, addTo);
                    break;
                case 'geojson':
                    this.addGeoJson(layer, addTo);
                    break;
                case 'layergroup':
                    this.addLayerGroup(layer, addTo);
                    break;
                case 'featuregroup':
                    this.addFeatureGroup(layer, addTo);
                    break;
                case 'tilelayer':
                    this.addTileLayer(layer, addTo);
                    break;
                case 'wms':
                    this.addWMS(layer, addTo);
                    break;
                case 'circlemarker':
                    this.addCircleMarker(layer, addTo);
                    break;
                case 'circle':
                    this.addCircle(layer, addTo);
                    break;
                case 'rectangle':
                    this.addRectangle(layer, addTo);
                    break;
                case 'polygon':
                    this.addPolygon(layer, addTo);
                    break;
                case 'line':
                    this.addLine(layer, addTo);
                    break;
                case 'layer':
                    this.addLayer(layer, addTo);
                    break;
                }
            }
            this.fire("stopLayerLoading");
            return this;
        },

        addMarker: function (json, addTo) {
            json.options = this._evalJsonOptions(json.options);
            var l = L.marker(json.latLng, json.options);
            if (json.popupContent) {
                l.bindPopup(json.popupContent);
            }
            this._addLayer(l, json, addTo);
            return this;
        },

        addGeoJson: function (json, addTo) {
            json.options = this._evalJsonOptions(json.options);
            var parent = this;
            var addGeoJSON = function (geojson, options) {
                var l = L.geoJson(geojson, options);
                addTo.addLayer(l);
                parent._addLayer(l, json, addTo);
            };
            function onsuccess(data) {
                addGeoJSON(JSON.parse(data), json.options, parent._map);
            }
            function onerror(data) {
                console.debug(data);
            }
            if (json.url) {
                ajaxRequest(json.url, onsuccess, onerror);
            } else if (json.geojson) {
                addGeoJSON(json.geojson, json.options, this._map);
            } else {
                throw new Error("URL or GeoJSON object expected");
            }
            return this;
        },

        addLayerGroup: function (json, addTo) {
            json.options = this._evalJsonOptions(json.options);
            var l = L.layerGroup();
            this.fire("GroupLoadingStart", {layer: l});
            this.addLayers(json, l);
            this.fire("GroupLoadingEnd", {layer: l});
            this._addLayer(l, json, addTo);
            return this;
        },

        addFeatureGroup: function (json, addTo) {
            json.options = this._evalJsonOptions(json.options);
            var l = L.featureGroup();
            this.fire("GroupLoadingStart", {layer: l});
            this.addLayers(json, l);
            this.fire("GroupLoadingEnd", {layer: l});
            if (json.popupContent) {
                l.bindPopup(json.popupContent);
            }
            this._addLayer(l, json, addTo);
            return this;
        },

        addTileLayer: function (json, addTo) {
            json.options = this._evalJsonOptions(json.options);
            var l = L.tileLayer(json.url, json.options);
            this._addLayer(l, json, addTo);
            return this;
        },

        addWMS: function (json, addTo) {
            json.options = this._evalJsonOptions(json.options);
            var l = L.tileLayer.wms(json.url, json.options);
            this._addLayer(l, json, addTo);
            return this;
        },

        addLayerAndPopup: function (l, json, addTo) {
            if (json.popupContent) {
                l.bindPopup(json.popupContent);
            }
            this._addLayer(l, json, addTo);
        },

        addCircleMarker: function (json, addTo) {
            json.options = this._evalJsonOptions(json.options);
            var l = L.circleMarker(json.latLng, json.options);
            this.addLayerAndPopup(l, json, addTo);
            return this;
        },

        addCircle: function (json, addTo) {
            json.options = this._evalJsonOptions(json.options);
            var l = L.circle(json.latLng, json.radius, json.options);
            this.addLayerAndPopup(l, json, addTo);
            return this;
        },

        addRectangle: function (json, addTo) {
            json.options = this._evalJsonOptions(json.options);
            var l = L.rectangle(json.path, json.options);
            this.addLayerAndPopup(l, json, addTo);
            return this;
        },

        addPolygon: function (json, addTo) {
            json.options = this._evalJsonOptions(json.options);
            var l = L.polygon(json.path, json.options);
            this.addLayerAndPopup(l, json, addTo);
            return this;
        },

        addLine: function (json, addTo) {
            json.options = this._evalJsonOptions(json.options);
            var l = L.polyline(json.path, json.options);
            this.addLayerAndPopup(l, json, addTo);
            return this;
        },

        addLayer: function (json, addTo) {
            json.options = this._evalJsonOptions(json.options);
            var l = json.layer;
            this.addLayerAndPopup(l, json, addTo);
            return this;
        }
    });

    L.layerConfig = function (json, map) {
        return new L.LayerConfig(json, map);
    };

}());
