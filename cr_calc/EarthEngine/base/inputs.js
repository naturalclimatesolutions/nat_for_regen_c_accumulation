/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var predictors = ee.ImageCollection("projects/wri-datalab/CarbonSequestrationAI/PredictorVariables/PredictorVariablesCookPatton2020"),
    training = ee.FeatureCollection("projects/wri-datalab/CarbonSequestrationAI/TrainingPoints/Train"),
    test = ee.FeatureCollection("projects/wri-datalab/CarbonSequestrationAI/TrainingPoints/Test"),
    sequestration = ee.Image("projects/TNC_Africa/Global-Forests/potential_carbon_sequestration_rate"),
    geometry = 
    /* color: #d63000 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-52.61595010990376, -8.301170823891802],
          [-52.61595010990376, -14.501150333735152],
          [-47.16673135990376, -14.501150333735152],
          [-47.16673135990376, -8.301170823891802]]], null, false),
    terra_clim = ee.Image("projects/TNC_Africa/Global-Forests/terra_clim_vars");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
var latlong = ee.Image.pixelCoordinates("EPSG:4326");
var gBounds = ee.Geometry.Polygon([-180, 88, 0, 88, 180, 88, 180, -88, 0, -88, -180, -88], null, false);

predictors = predictors.toBands().addBands(terra_clim);

var biome_img = predictors.select('BiomesMask_b1');

var predictor_bands_1 = predictors.bandNames()
  // .filter(ee.Filter.neq('item', 'BiomesMask_b1'))
  .filter(ee.Filter.neq('item', 'CM10_1975H_Bio20_V1_2_b1'))
  .filter(ee.Filter.neq('item', 'CM10_1975H_Bio21_V1_2_b1'))
  .filter(ee.Filter.neq('item', 'CM10_1975H_Bio22_V1_2_b1'))
  .filter(ee.Filter.neq('item', 'CM10_1975H_Bio23_V1_2_b1'))
  .filter(ee.Filter.neq('item', 'CM10_1975H_Bio24_V1_2_b1'))
  .filter(ee.Filter.neq('item', 'CM10_1975H_Bio25_V1_2_b1'))
  .filter(ee.Filter.neq('item', 'CM10_1975H_Bio26_V1_2_b1'))
  .filter(ee.Filter.neq('item', 'CM10_1975H_Bio27_V1_2_b1'))
  .filter(ee.Filter.neq('item', 'CM10_1975H_Bio28_V1_2_b1'))
  .filter(ee.Filter.neq('item', 'CM10_1975H_Bio29_V1_2_b1'))
  .filter(ee.Filter.neq('item', 'CM10_1975H_Bio30_V1_2_b1'))
  .filter(ee.Filter.neq('item', 'CM10_1975H_Bio31_V1_2_b1'))
  .filter(ee.Filter.neq('item', 'CM10_1975H_Bio32_V1_2_b1'))
  .filter(ee.Filter.neq('item', 'CM10_1975H_Bio33_V1_2_b1'))
  .filter(ee.Filter.neq('item', 'CM10_1975H_Bio34_V1_2_b1'))
  .filter(ee.Filter.neq('item', 'CM10_1975H_Bio35_V1_2_b1'))

predictors = predictors.select(predictor_bands_1);

var means = predictors.reduceRegion({
  geometry: gBounds,
  scale: 5000,
  crs: 'EPSG:4326',
  reducer: ee.Reducer.mean().combine(ee.Reducer.stdDev(), null, true),
  maxPixels: 1e13
}).toImage();
var stdevs = predictors.reduceRegion({
  geometry: gBounds,
  scale: 10000,
  crs: 'EPSG:4326',
  reducer: ee.Reducer.stdDev(),
  maxPixels: 1e13
}).toImage();

var standardized = (predictors.subtract(means)).divide(stdevs);

var biomes = biome_img.reduceRegion({
  geometry: gBounds,
  scale: 1000,
  crs: 'EPSG:4326',
  reducer: ee.Reducer.frequencyHistogram(),
  maxPixels: 1e13
});

var biome_keys = ee.List(ee.Dictionary(biomes.get('BiomesMask_b1')).keys());

var biome_hot_encode = ee.ImageCollection(biome_keys.map(function(item){
  var biome_num = ee.Number.parse(item);
  var biome_binary = biome_img.eq(biome_num)
  return (biome_binary).rename(ee.String(item).cat('biome'))
})).toBands();


// var predictor_image = standardized//.addBands(biome_hot_encode)//.addBands(latlong);
var predictor_image = predictors//.addBands(biome_hot_encode)//.addBands(latlong);
var predictor_bands_2 = predictor_image.bandNames()


var sample_data = training.merge(test).randomColumn('random', 1);

Map.addLayer(sample_data)
var test_data = sample_data.filter(ee.Filter.lt('random', 0.1)).map(function(feature){
  return feature.buffer(100000)
}).union()
Map.addLayer(test_data)



// sample_data = sample_data.map(function(feature){
//   var buffer = feature.buffer(100000).geometry();
//   var count = sample_data.filterBounds(buffer).size().subtract(1);
//   return feature.set({'close_points': count});
// });


// // var training_points = sample_data.filter(ee.Filter.gte("close_points", 1));
// // var test_points = sample_data.filter(ee.Filter.eq("close_points", 0));
// // print(training_points.size())
// // print(test_points.size())
// var training_points = training;
// var test_points = test;
// var trainingPoints = predictor_image.sampleRegions({collection: training_points, scale: 1000, projection: 'EPSG:4326'});
// // print(trainingPoints.first())

// var cartRegression = ee.Classifier.smileRandomForest({
//   numberOfTrees: 100,
//   variablesPerSplit: null,
//   minLeafPopulation: 1,
//   bagFraction: 0.5
//   })
//     .setOutputMode('REGRESSION')
//     .train({
//       features: trainingPoints, 
//       classProperty: 'carbon_seqr_rate_Mg_ha_yr', 
//       inputProperties: predictor_bands_2
//     });


// var cartRegressionImage = predictor_image.select(predictor_bands_2)
//     .classify(cartRegression, 'cartRegression')
//     .rename('GEE_Model');
    
// sequestration = sequestration.selfMask().rename('Azure_Model');

// var validationPoints = cartRegressionImage.addBands(sequestration).sampleRegions({collection: test_points, scale: 1000, projection: 'EPSG:4326'});

// var chart1 = ui.Chart.feature.byFeature({
//   features: validationPoints,
//   xProperty: 'carbon_seqr_rate_Mg_ha_yr',
//   yProperties: ['Azure_Model', 'GEE_Model']
// }).setChartType('ScatterChart')
//   .setSeriesNames(['Azure Model', 'GEE Model'])
//   .setOptions({
//     title: "Azure & GEE Models vs. Test Data",
//     hAxis: {
//       title: 'Measured Sequestration Rate'
//     },
//     vAxis: {
//       title: 'Predicted Sequestration Rate'
//     },
//     pointSize: 15,
//     series:{ 
//       0: { pointShape: { type: 'star', sides: 5, dent: 0.25 }, dataOpacity: 0.8, color: 'orange'},
//       1: { pointShape: { type: 'star', sides: 5, dent: 0.25 }, dataOpacity: 0.3, color: 'green'}
//     }
//   });
  
// var chart2 = ui.Chart.feature.byFeature({
//   features: validationPoints,
//   xProperty: 'Azure_Model',
//   yProperties: ['GEE_Model']
// }).setChartType('ScatterChart')
//   .setOptions({
//     title: "Azure vs GEE Models",
//     hAxis: {
//       title: 'Azure'
//     },
//     vAxis: {
//       title: 'Google Earth Engine'
//     },
//     pointSize: 15,
//     series:{ 
//       0: { pointShape: { type: 'star', sides: 5, dent: 0.25 }, dataOpacity: 0.3, color: 'green'}
//     }
//   });


// var cor_gee = validationPoints.reduceColumns({
//     reducer:ee.Reducer.pearsonsCorrelation(), 
//     selectors: ['GEE_Model', 'carbon_seqr_rate_Mg_ha_yr']});

// var cor_azure = validationPoints.reduceColumns({
//   reducer:ee.Reducer.pearsonsCorrelation(), 
//   selectors: ['Azure_Model', 'carbon_seqr_rate_Mg_ha_yr']});

// var reg_gee = ee.Array(validationPoints.reduceColumns({
//     reducer:ee.Reducer.linearRegression(1,1), 
//     selectors: ['GEE_Model', 'carbon_seqr_rate_Mg_ha_yr']})
//     .get('residuals')).toList().get(0);

// var reg_azure = ee.Array(validationPoints.reduceColumns({
//   reducer:ee.Reducer.linearRegression(1,1), 
//   selectors: ['Azure_Model', 'carbon_seqr_rate_Mg_ha_yr']})
//   .get('residuals')).toList().get(0);
  
// var cor_gee_azure = validationPoints.reduceColumns({
//   reducer:ee.Reducer.pearsonsCorrelation(), 
//   selectors: ['Azure_Model', 'GEE_Model']});

// var reg_gee_azure = ee.Array(validationPoints.reduceColumns({
//     reducer:ee.Reducer.linearRegression(1,1), 
//     selectors: ['Azure_Model', 'GEE_Model']})
//     .get('residuals')).toList().get(0);
    

// // print(chart1);
// print("Correlation: Test vs GEE", cor_gee.get('correlation'));
// print("Correlation: Test vs Azure", cor_azure.get('correlation'));
// print("RMSE: Test vs GEE", reg_gee);
// print("RMSE: Test vs Azure", reg_azure);

// // print(chart2);
// print("Correlation: GEE vs Azure", cor_gee_azure.get('correlation'));
// print("RMSE: GEE vs Azure", reg_gee_azure);


// var diff = cartRegressionImage.subtract(sequestration).rename('difference');
// var palette  = ['613318', 'b99c6b', 'bdd09f', '668d3c', '404f24'];

// // Map.addLayer(cartRegressionImage, {min: 0, max: 6, palette: palette}, 'CART regression');
// // Map.addLayer(sequestration, {min: 0, max: 6, palette: palette}, 'Original');


// // var chart3 = ui.Chart.image.histogram({
// //   image: cartRegressionImage.addBands(sequestration),
// //   region: geometry,
// //   scale: 1000,
// //   maxBuckets: 50,
// //   minBucketWidth: 0.1,
// //   maxPixels: 1e13
// // });
// // print(chart3)