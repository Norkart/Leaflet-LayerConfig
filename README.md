Leaflet-LayerConfig
===================

Library that communicates with a web service/reads a stored JavaScript object and adds layers to a leaflet map.



##Usage
L.LayerConfig takes two arguments, the first one is either a URL or a object containing the information about the layers to add. A sample.json file is provided that shows some of the options available.
The second argument is the map container or LayerGroup/FeatureGroup on which we add layers to.

```
var layerConfig = L.layerConfig(object or url to json file, map);
```

##JSON notation
The object containing the information is pretty basic, here is a sample file adding only a marker and setting the map view to a coordinate and a zoomlevel. You can also set bounds if you want to fit the map view to always show some objects.
 ```
{
    "center": [63.43048, 10.39508],
    "zoom": 14, 
    "layers": [
        {
            "type": "marker",
            "latLng": [63.43048, 10.39508],
            "popupContent": "Olavs statuen"
        }
    ]
}
 ```

 To pass options to the layer simply add a options key to the layer. The options passed to the layer is in the same format as the Leaflet options found in the reference.
 Some option keys support functions if you want to pass a function to Leaflet through a web service you need to put it in a single line string. A minifier can help with that. This is because JSON does not support functions or multiline strings.

###Other supported layer types:

####GeoJSON
This can either take an URL or a GeoJSON object

```
{
         	"type": "geojson",
         	"url": "http://example.com/geojson-example.geojson",
         	"options": {
         		"style": "function () { return { color: \"red\" }; };"
         	}

}
```

```
{
  "type": "geojson",
  "geojson": {
			  "type": "FeatureCollection",
			  "features": [
			    {
			      "type": "Feature",
			      "geometry": {
			        "type": "Point",
			        "coordinates": [102.0, 0.6]
			      },
			      "properties": {
			        "prop0": "value0"
			      }
			    }
			  ]
			}

}
```
####TileLayer
```
{
    "type": "tilelayer",
    "url": "http://b.tiles.mapbox.com/v3/torbjornav.hhni5j5f/{z}/{x}/{y}.png",
    "options": {
        "attribution": "Mapbox"
    }
}
```
####WMS
```
{
    "type": "wms",
    "url": "URL-TO-WMS",
    "options": {
        //WMS OPTIONS GO HERE
    }
}
```
####PolyLine
```
 {
    "type": "line",
    "path": [[63.43182, 10.39195],[63.42526, 10.3937]],
    "popupContent": "Prinsens gate"
 }
```
####Polygon
```
 {
    "type": "polygon",
    "path": [[[63.42639, 10.38975],[63.42564, 10.39006],
    	    [63.42570, 10.39194],[63.42643, 10.39183],
    	    [63.42639, 10.38975]]]
 }
```
####Rectangle
```
 {
    "type": "rectangle",
    "path": [[63.42647, 10.39694],[63.42554, 10.39508]],
    "options": {
        
            "color": "red"
        
    }
 }
```
####Circle
```
{ 
    "type": "circle",
    "latLng": [63.43055, 10.39273],
    "radius": 10
}
```
####CircleMarker
```
{
    "type": "circlemarker",
    "latLng": [63.43034, 10.38647]
}
```

####FeatureGroup
FeatureGroup has a "layer" key containing the layers to be added to it. This is in the same format as the top-level layer key.
```
{
    "type": "featuregroup",
    "layers": [
        {
            "type": "marker",
            "latLng": [63.43027, 10.40094]
        },
        { 
            "type": "circle",
            "latLng": [63.43055, 10.39273],
            "radius": 10
        },
        {
            "type": "circlemarker",
            "latLng": [63.43034, 10.38647]
        }

    ],
    "popupContent": "Kongens gate"
}
```
####LayerGroup
LayerGroup has a "layer" key containing the layers to be added to it. This is in the same format as the top-level layer key.
```
{
    "type": "layergroup",
    "layers": [
        {
            "type": "marker",
            "latLng": [63.43027, 10.40094]
        },
        { 
            "type": "circle",
            "latLng": [63.43055, 10.39273],
            "radius": 10
        },
        {
            "type": "circlemarker",
            "latLng": [63.43034, 10.38647]
        }

    ]
}
```
###Events
Leaflet-LayerConfig fires various events.

| Name | Description |
| ---- | ----------- |
| startLayerLoading |Fired when the JSON object is read and we're ready to start loading layers |
| stopLayerLoading | Fired when all layers has been loaded |
| LayerLoaded | Fired when a layer has been added. Passes the Leaflet layer, type of layer and the name of the layer with the event object |
| GroupLoadingStart | Fired when we start loading layers to a group. Passes the group to the layer |
| GroupLoadingEnd | Fired when we have loaded all sub-layers to a group |

