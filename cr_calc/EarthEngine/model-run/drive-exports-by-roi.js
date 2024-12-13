/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var output_sample = ee.Image("projects/TNC_Africa/carbon/cook-patton-2021/sequestration_rate__mean__aboveground__full_extent__Mg_C_ha_yr"),
    gBounds = 
    /* color: #d63000 */
    /* shown: false */
    ee.Geometry.Polygon(
        [[[-180, 88],
          [0, 88],
          [180, 88],
          [180, -88],
          [0, -88],
          [-180, -88]]], null, false),
    roi_congo = 
    /* color: #d63000 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[7.81264700744416, 4.022131003815147],
          [7.81264700744416, -9.986115667673358],
          [31.98256888244416, -9.986115667673358],
          [31.98256888244416, 4.022131003815147]]], null, false),
    roi_pnw = 
    /* color: #98ff00 */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-127.01071545623462, 50.17852121616226],
          [-127.01071545623462, 49.384022716878306],
          [-125.73630139373462, 49.384022716878306],
          [-125.73630139373462, 50.17852121616226]]], null, false),
    roi_ne = 
    /* color: #0b4a8b */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-75.83584219471241, 45.093944174153705],
          [-75.83584219471241, 41.00173153068959],
          [-69.57363516346241, 41.00173153068959],
          [-69.57363516346241, 45.093944174153705]]], null, false),
    max_walker = ee.Image("projects/ee-groa-carbon-accumulation/assets/agc-max/pot_agc_mgha");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
var path = "projects/ee-groa-carbon-accumulation/assets/agc_accumulation/age_"
var proj = output_sample.projection();

var scale = proj.nominalScale();
var transform = proj.getInfo().transform;

var roi = roi_pnw;
var roi_name = 'pnw_2';
var ages = [];
var ids = [];

for (var i = 5; i<=100; i+=5){
  var ageStr = i.toString();
  var id = path + i;
  ids.push(id)
  var collection = ee.ImageCollection(id);
  var reducer = ee.Reducer.mean().combine(
    ee.Reducer.stdDev(), null, true).combine(
      ee.Reducer.percentile([5,95]), null, true)
  // var image = collection.reduce(reducer).multiply(100).int()
  // Map.addLayer(collection)
  var mean = collection.mean().int();
  var bands = collection.toBands()

  // Export.image.toDrive({
  //   image: mean,
  //   fileNamePrefix: roi_name + '_agc_mean_' + ageStr,
  //   description:  roi_name + '_agc_mean_' + ageStr,
  //   folder: 'agc_outputs',
  //   region: roi,
  //   crsTransform: transform,
  //   crs: "EPSG:4326",
  //   maxPixels: 1e13,
  // });
  Export.image.toDrive({
    image: bands,
    fileNamePrefix: roi_name + '_agc_bands_' + ageStr,
    description:  roi_name + '_agc_bands_' + ageStr,
    folder: 'agc_global',
    region: roi,
    crsTransform: transform,
    crs: "EPSG:4326",
    maxPixels: 1e13,
  });
  
  // Export.image.toDrive({
  //   image: image.select('agc_stdDev'),
  //   fileNamePrefix: 'agc_stdDev_' + ageStr,
  //   description: 'agc_stdDev_' + ageStr,
  //   folder: 'agc_outputs',
  //   region: gBounds,
  //   crsTransform: transform,
  //   crs: "EPSG:4326",
  //   maxPixels: 1e13,
  // });
  
  // Export.image.toDrive({
  //   image: image.select('agc_p5'),
  //   fileNamePrefix: 'agc_p5_' + ageStr,
  //   description: 'agc_p5_' + ageStr,
  //   folder: 'agc_outputs',
  //   region: gBounds,
  //   crsTransform: transform,
  //   crs: "EPSG:4326",
  //   maxPixels: 1e13,
  // });
  
  // Export.image.toDrive({
  //   image: image.select('agc_p95'),
  //   fileNamePrefix: 'agc_agc_p95_' + ageStr,
  //   description: 'agc_agc_p95_' + ageStr,
  //   folder: 'agc_outputs',
  //   region: gBounds,
  //   crsTransform: transform,
  //   crs: "EPSG:4326",
  //   maxPixels: 1e13,
  // });
}

var maxValue = ee.ImageCollection(ids.map(function(id){
  return ee.ImageCollection(id).max();
})).max();

Map.addLayer(maxValue, null, 'Modeled Max 100')
Map.addLayer(max_walker, null, 'Max Potential')

var combinedMax = maxValue
  .addBands(max_walker.unmask(0))
  .reduce(ee.Reducer.max());
  
Export.image.toDrive({
  image: combinedMax,
  fileNamePrefix: roi_name + '_agc_pot',
  description:  roi_name + '_agc_pot',
  folder: 'agc_global',
  region: roi,
  crsTransform: transform,
  crs: "EPSG:4326",
  maxPixels: 1e13,
});

  