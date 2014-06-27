/*
leaflet-layerconfig
Library that communicates with a web service/reads a stored JavaScript object and adds layers to a leaflet map.
Copyright 2014 Norkart AS
*/

L.LayerConfig = L.Class.extend(
{
	includes: L.Mixin.Events,
	_map: null,
	_json: null,
	initialize: function(map) {
		this._map = map;


	},
	parse: function (json) {
		this._json = json;
		
		if(typeof json == "string") { // We take a string to mean we got an url;
			var parent = this;
			function success(data) {
				var json = JSON.parse(data);
				if(this._map.setView && json.center && json.zoom)
					this._map.setView(json.center, json.zoom);
				parent.addLayers(json);
			};
			this._ajaxRequest(json, success, function () {});
		}
		else {
			if(this._map.setView && json.center && json.zoom)
					this._map.setView(json.center, json.zoom);
			if(this._map.fitBounds && json.bounds)
				this._map.fitBounds(json.bounds);
			this.addLayers(json);
		}
	},
	_ajaxRequest: function (url, callback, onerror) {
		var httpRequest;

		  function makeRequest(url) {
		    if (window.XMLHttpRequest) { // Mozilla, Safari, ...
		      httpRequest = new XMLHttpRequest();
		    } else if (window.ActiveXObject) { // IE
		      try {
		        httpRequest = new ActiveXObject("Msxml2.XMLHTTP");
		      } 
		      catch (e) {
		        try {
		          httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
		        } 
		        catch (e) {}
		      }
		    }

		    if (!httpRequest) {
		      throw new Error('Giving up :( Cannot create an XMLHTTP instance');
		      return false;
		    }
		    httpRequest.onreadystatechange = alertContents;
		    httpRequest.open('GET', url);
		    httpRequest.send();
		  }

		  function alertContents() {
		    if (httpRequest.readyState === 4) {
		      if (httpRequest.status === 200) {
		        callback(httpRequest.responseText);
		      } else {
		        onerror(httpRequest);
		      }
		    }
		  }
		  makeRequest(url);
	},
	_evalJsonOptions: function (options) {
		if (options && options.style && typeof options.style == "string") {
			eval("options.style = "+options.style);
		}
		if (options && options.onEachFeature && typeof options.onEachFeature == "string") {
			eval("options.onEachFeature = "+options.onEachFeature);
		}
		if (options && options.filter && typeof options.filter == "string") {
			eval("options.filter = "+options.filter);
		}
		if (options && options.pointToLayer && typeof options.pointToLayer == "string") {
			eval("options.pointToLayer = "+options.pointToLayer);
		}
		if (options && options.coordsToLatLng && typeof options.coordsToLatLng == "string") {
			eval("options.coordsToLatLng = "+json.options.coordsToLatLng);
		}
		return options;
	},
	_addLayer: function(layer, json, addTo) {
		if(json.baseLayer && this._addedBaseLayer) {
			
		} 
		else if(!json.baseLayer) {
			addTo.addLayer(layer);
		}
		else {
			this._addedBaseLayer = true;
			addTo.addLayer(layer);
			if(layer.bringToFront) {
				layer.bringToFront();
			}
		}

		this.fire("LayerLoaded", { type: json.type, name: json.name, layer: layer, baseLayer: json.baseLayer });
	},
	addLayers: function (json, addTo) {
		if(!addTo)
			addTo = this._map;

		this.fire("startLayerLoading");
		for (var i = 0; i < json.layers.length; i++) {
			var layer = json.layers[i];
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

		};
		this.fire("stopLayerLoading");
		return this;
	},
	addMarker: function(json, addTo) {
		json.options = this._evalJsonOptions(json.options);
		var l = L.marker(json.latLng, json.options);
		if(json.popupContent)
			l.bindPopup(json.popupContent);
		this._addLayer(l, json, addTo);
		return this;

	},
	
	addGeoJson: function(json, addTo) {
		json.options = this._evalJsonOptions(json.options);
		var parent = this;
		var addGeoJSON = function (geojson, options, map) {
			var l = L.geoJson(geojson,options);
			addTo.addLayer(l);
			parent._addLayer(l, json, addTo);
		}
		function onsuccess(data) {
			addGeoJSON(JSON.parse(data),json.options,parent._map);
		}
		function onerror(data) {
			console.debug(data);
		}
		if(json.url) {
			this._ajaxRequest(json.url, onsuccess, onerror);
		}
		else if(json.geojson) {
			addGeoJSON(json.geojson,json.options,this._map);
		}
		else {
			throw new Error("URL or GeoJSON object expected");
		}

		return this;

	},
	addLayerGroup: function(json, addTo) {
		json.options = this._evalJsonOptions(json.options);
		var l = L.layerGroup();
		this.fire("GroupLoadingStart", { layer: l });
		this.addLayers(json, l);
		this.fire("GroupLoadingEnd", { layer: l });
		this._addLayer(l, json, addTo);
		return this;

	},
	addFeatureGroup: function(json, addTo) {
		json.options = this._evalJsonOptions(json.options);
		var l = L.featureGroup();
		this.fire("GroupLoadingStart", { layer: l });
		this.addLayers(json, l);
		this.fire("GroupLoadingEnd", { layer: l });
		if(json.popupContent)
			l.bindPopup(json.popupContent);
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
	addCircleMarker: function (json, addTo) {
		json.options = this._evalJsonOptions(json.options);
		var l = L.circleMarker(json.latLng, json.options);
		if(json.popupContent)
			l.bindPopup(json.popupContent);
		this._addLayer(l, json, addTo);
		return this;
	},
	addCircle: function (json, addTo) {
		json.options = this._evalJsonOptions(json.options);
		var l = L.circle(json.latLng, json.radius, json.options);
		if(json.popupContent)
			l.bindPopup(json.popupContent);
		this._addLayer(l, json, addTo);
		return this;
	},
	addRectangle: function (json, addTo) {
		json.options = this._evalJsonOptions(json.options);
		var l = L.rectangle(json.path, json.options);
		if(json.popupContent)
			l.bindPopup(json.popupContent);
		this._addLayer(l, json, addTo);
		return this;
	},
	addPolygon: function (json, addTo) {
		json.options = this._evalJsonOptions(json.options);
		var l = L.polygon(json.path, json.options);
		if(json.popupContent)
			l.bindPopup(json.popupContent);
		this._addLayer(l, json, addTo);
		return this;
	},
	addLine: function (json, addTo) {
		json.options = this._evalJsonOptions(json.options);
		var l = L.polyline(json.path, json.options);
		if(json.popupContent)
			l.bindPopup(json.popupContent);
		this._addLayer(l, json, addTo);
		return this;
	},
	addLayer: function (json, addTo) {
		json.options = this._evalJsonOptions(json.options);
		var l = json.layer;
		if(json.popupContent)
			l.bindPopup(json.popupContent);
		this._addLayer(l, json, addTo);
		return this;
	}
}
);

L.layerConfig = function(json, map) {
	return new L.LayerConfig(json,map);
};