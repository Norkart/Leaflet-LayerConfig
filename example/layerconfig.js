var json = {
    "center": [63.43048, 10.39508],
    "zoom": 14, 
    "layers": [
        {
            "name": "marker",
            "type": "marker",
            "latLng": [63.43048, 10.39508],
            "popupContent": "Olavs statuen"
        },
        {
            "type": "featuregroup",
            "name": "featuregroup",
            "layers": [
                {
                  "name": "submarker",
                    "type": "marker",
                    "latLng": [63.43027, 10.40094],
                },
                { 
                  "name": "subcircle",
                    "type": "circle",
                    "latLng": [63.43055, 10.39273],
                    "radius": 10
                },
                {
                  "name": "subcirclemarker",
                    "type": "circlemarker",
                    "latLng": [63.43034, 10.38647]
                }

            ],
            "popupContent": "Kongens gate"
        },
        {
                "name": "Pink",
                "type": "tilelayer",
                "url": "http://{s}.tiles.mapbox.com/v3/torbjornav.hhni5j5f/{z}/{x}/{y}.png",
                "options": {
                    "attribution": "Mapbox"
                },
                "baseLayer": true
         },
         {
                "name": "KuGIS",
                "type": "tilelayer",
                "url": "http://{s}.tiles.mapbox.com/v3/torbjornav.map-d9hhchjc/{z}/{x}/{y}.png",
                "options": {
                    "attribution": "Mapbox"
                },
                "baseLayer": true
         },
         {
                "name": "Purple",
                "type": "tilelayer",
                "url": "http://{s}.tiles.mapbox.com/v3/torbjornav.hcp57k2g/{z}/{x}/{y}.png",
                "options": {
                    "attribution": "Mapbox"
                },
                "baseLayer": true
         },
         {
          "name": "line",
            "type": "line",
            "path": [[63.43182, 10.39195],[63.42526, 10.3937]],
            "popupContent": "Prinsens gate"
         },
         {
          "name": "polygon",
            "type": "polygon",
            "path": [[[63.42639, 10.38975],[63.42564, 10.39006],[63.42570, 10.39194],[63.42643, 10.39183],[63.42639, 10.38975]]]
         },
         {
          "name": "rectangle",
            "type": "rectangle",
            "path": [[63.42647, 10.39694],[63.42554, 10.39508]],
            "options": {
                
                    "color": "red"
                
            }
         },
         {
          "name": "geojson",
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
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0]
        ]
      },
      "properties": {
        "prop1": 0.0,
        "prop0": "value0"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0],
            [100.0, 0.0]
          ]
        ]
      },
      "properties": {
        "prop1": {
          "this": "that"
        },
        "prop0": "value0"
      }
    }
  ]
}

         }




    ]



};