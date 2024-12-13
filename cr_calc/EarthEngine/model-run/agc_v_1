/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var plots_std = ee.FeatureCollection("projects/ee-groa-carbon-accumulation/assets/plot-data/sp_agg_split_std_0_1"),
    output_sample = ee.Image("projects/TNC_Africa/carbon/cook-patton-2021/sequestration_rate__mean__aboveground__full_extent__Mg_C_ha_yr"),
    predictors = ee.ImageCollection("projects/wri-datalab/CarbonSequestrationAI/PredictorVariables/PredictorVariablesCookPatton2020"),
    terra_clim = ee.Image("projects/TNC_Africa/Global-Forests/terra_clim_vars"),
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
    ecoregions = ee.Image("projects/SCL/v1/source/resolve-ecoregion-img"),
    geometry = 
    /* color: #d63000 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[18.29317175146962, 4.302508299762589],
          [18.29317175146962, -5.528593150849964],
          [29.63106237646962, -5.528593150849964],
          [29.63106237646962, 4.302508299762589]]], null, false),
    plots_norm = ee.FeatureCollection("projects/ee-groa-carbon-accumulation/assets/plot-data/sp_agg_split_0_1"),
    table = ee.FeatureCollection("projects/ee-groa-carbon-accumulation/assets/plot-data/sp_agg_split__0_2");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
// cookpatton@gmail.com
print(predictors)
var f_agb = require('users/NathanielPaulRobinson/TNC-GCS:base/agb-model-functions').agb_func;

var proj = output_sample.projection();

var scale = proj.nominalScale();
var transform = proj.getInfo().transform;

var bandsToRemove =  
  ['CM10_1975H_Bio20_V1_2_b1',
  'CM10_1975H_Bio21_V1_2_b1',
  'CM10_1975H_Bio22_V1_2_b1',
  'CM10_1975H_Bio23_V1_2_b1',
  'CM10_1975H_Bio24_V1_2_b1',
  'CM10_1975H_Bio25_V1_2_b1',
  'CM10_1975H_Bio26_V1_2_b1',
  'CM10_1975H_Bio27_V1_2_b1',
  'CM10_1975H_Bio28_V1_2_b1',
  'CM10_1975H_Bio29_V1_2_b1',
  'CM10_1975H_Bio30_V1_2_b1',
  'CM10_1975H_Bio31_V1_2_b1',
  'CM10_1975H_Bio32_V1_2_b1',
  'CM10_1975H_Bio33_V1_2_b1',
  'CM10_1975H_Bio34_V1_2_b1',
  'CM10_1975H_Bio35_V1_2_b1',
  'BiomesMask_b1'
  ];
  
predictors = predictors.toBands()
  .addBands(terra_clim);

var biomeHotEncode = f_agb.hot_encode({
  image: ecoregions.int(), 
  band_name: 'BIOME_NUM', 
  reducer_geometry: gBounds, 
  reducer_scale: 1000,
  band_suffix: '_biome'
});


// Remove unwanted bands
predictors = f_agb.remove_bands({
  image: predictors, 
  remove_list: bandsToRemove
});

var band_names = predictors.bandNames();


// Standardize predictor variables
var standardized = f_agb.standardize_predictors({
  image: predictors, 
  reducer_geometry: gBounds, 
  reducer_scale: 10000
}).addBands(biomeHotEncode);


// predictors = predictors.addBands(biomeHotEncode);
// var plots = plots_norm;
predictors = standardized;
var plots = table;


var ages = ee.List.sequence(5, 100, 5);
var seeds = ee.List.sequence(1, 1, 1);

var bandNames = seeds.map(function(seed){
  var name = ee.String('agc_s_').cat(ee.String(ee.Number(seed).int()));
  return name; 
});

var modelOutput = ee.ImageCollection(ages.map(function(age){
  age = ee.Number(age).int();
  var agePlots = plots.filter(ee.Filter.eq('age', age));
  var trainingPlots = agePlots.filter(ee.Filter.eq('type', 'training'));
  var modelIteration = ee.ImageCollection(seeds.map(function(seed){
    var sampleSplit = trainingPlots.randomColumn('rnd', seed);
    var training = sampleSplit.filter(ee.Filter.gte('rnd', 0.25));
    var validationPts = sampleSplit.filter(ee.Filter.lt('rnd', 0.25));
      
    var model_train = ee.Classifier.smileRandomForest({
      numberOfTrees: 100,
      })
        .setOutputMode('REGRESSION')
        .train({
          features: training, 
          classProperty: 'agc_mgha',
          inputProperties: band_names
    });
    var predicted = predictors.classify(model_train, 'cartRegression').rename('agc');
    return predicted
  })).toBands()
    .rename(bandNames);
    
  return modelIteration.set({'age': age});
}));

var ageToMap = 100;

var img = modelOutput.filter(ee.Filter.eq('age', ageToMap)).first();

var mean = img.reduce(ee.Reducer.mean());

var stdDev = img.reduce(ee.Reducer.stdDev());
var errorRatio = stdDev.divide(mean)
Map.addLayer(mean, {min: 0, max: 150, palette: ['613318', 'b99c6b', 'bdd09f', '668d3c', '404f24']}, 'mean')
Map.addLayer(errorRatio, {min: 0.01, max: 0.5, palette: ['green','yellow', 'orange', 'red']}, 'error ratio')
Map.addLayer(modelOutput)

var modelOutputFC = ee.FeatureCollection(ages.map(function(age){
  age = ee.Number(age).int();
  var agePlots = plots_std.filter(ee.Filter.eq('age', age));
  var trainingPlots = agePlots.filter(ee.Filter.eq('type', 'training'));
  var modelIteration = ee.FeatureCollection(seeds.map(function(seed){
    var sampleSplit = trainingPlots.randomColumn('rnd', seed);
    var training = sampleSplit.filter(ee.Filter.gte('rnd', 0.25));
    var validationPts = sampleSplit.filter(ee.Filter.lt('rnd', 0.25));
      
    var model_train = ee.Classifier.smileRandomForest({
      numberOfTrees: 100,
      })
        .setOutputMode('REGRESSION')
        .train({
          features: training, 
          classProperty: 'agc_mgha',
          inputProperties: band_names
    });
    var predicted = predictors.classify(model_train, 'cartRegression').rename('agc');
    return predicted.sampleRegions({
      collection: validationPts,
      properties: ['agc_mgha'],
      scale: scale,
      projection: 'EPSG:4326',
      geometries: false
    });
  })).flatten();

  var cor = ee.Number(modelIteration.reduceColumns({
    reducer: ee.Reducer.pearsonsCorrelation(),
    selectors: ['agc', 'agc_mgha']
  }).get('correlation'));
  
  var r2 = cor.multiply(cor);
  
   var rmse = ee.Array(modelIteration.reduceColumns({
    reducer: ee.Reducer.linearRegression(1,1),
    selectors: ['agc', 'agc_mgha']
  }).get('residuals')).toList().get(0);
  
  return ee.Feature(null, {
    'cor': cor,
    'r2': r2,
    'rmse': rmse,
    'age': age
  });

}));
    

var chart = ui.Chart.feature.byFeature({
  features: modelOutputFC,
  xProperty: 'age',
  yProperties: ['r2', 'rmse']
}).setSeriesNames(['R^2', 'RMSE'])
  .setOptions({
  title: 'Performance Stats',
  series: {
    0: {targetAxisIndex: 0, type: 'line', color: '0f8755'},
    1: {
      targetAxisIndex: 1,
      type: 'line',
      color: 'f0af07'
    }
          },
  hAxis:
    {title: 'Age', titleTextStyle: {italic: false, bold: true}},
  vAxes: {
    1: {
      title: 'RMSE',
      titleTextStyle: {italic: false, bold: true, color: 'f0af07'}
    },
    0: {
      title: 'R^2',
      titleTextStyle: {italic: false, bold: true, color: '0f8755'}
    },
  },
  
});

print(chart);

