const express = require('express');
const fs = require('fs');
const esriUtils = require('@esri/arcgis-to-geojson-utils');

const app = express();
app.listen(3000, async () => {
    console.log('app listening on port 3000!');

    let geoJsonFeatureList = JSON.parse(await readFile('./countries_geo_json.json')).features;

    let arcGISObj = {
        "geometryType": "esriGeometryPolygon",
        "spatialReference": {
            "wkid": 4326
        },
        "fields": [
            {
                "name": "country_code",
                "type": "esriFieldTypeString",
                "alias": "country_code"
            },
            {
                "name": "country_name",
                "type": "esriFieldTypeString",
                "alias": "country_name"
            }
        ],
        "features": {}
    };

    let arcGISFeatureList = [];
    for (let geoJsonFeatureObj in geoJsonFeatureList) {

        let arcGISFeatureobj = {
            attributes: {},
            geometry: {}
        };

        arcGISFeatureobj.attributes['country_code'] = geoJsonFeatureList[geoJsonFeatureObj].properties.ISO_A3;
        arcGISFeatureobj.attributes['country_name'] = geoJsonFeatureList[geoJsonFeatureObj].properties.ADMIN;

        arcGISFeatureobj.geometry = esriUtils.geojsonToArcGIS(geoJsonFeatureList[geoJsonFeatureObj].geometry);
        delete arcGISFeatureobj.geometry.spatialReference;

        arcGISFeatureList.push(arcGISFeatureobj);
    }

    arcGISObj.features = arcGISFeatureList;

    await writeFile('./arcgis_json.json', JSON.stringify(arcGISObj, null, 2));
});

function readFile(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, function (err, res) {
            if (err) {
                reject(err);
            }

            resolve(res);
        });
    })
}

function writeFile(path, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(path, data, function (err, res) {
            if (err) {
                reject(err);
            }

            resolve(res);
        });
    })
}