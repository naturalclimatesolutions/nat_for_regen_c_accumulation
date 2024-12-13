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
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[23.39082800146962, -1.4940542897099154],
          [23.39082800146962, -3.9520236700698383],
          [26.11543737646962, -3.9520236700698383],
          [26.11543737646962, -1.4940542897099154]]], null, false),
    plots_norm = ee.FeatureCollection("projects/ee-groa-carbon-accumulation/assets/plot-data/sp_agg_split_0_1"),
    plots = ee.FeatureCollection("projects/ee-groa-carbon-accumulation/assets/plot-data/sp_agg_split__0_2");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
var startAge1 = 85; 
var endAge1 = 90;
// var startAge2 = 60; 
// var endAge2 = 90;
var seedToStart = 21;
var seedToEnd = 100;

var f_agb = require('users/NathanielPaulRobinson/TNC-GCS:base/agb-model-functions').agb_func;
var rf_pars = require('users/NathanielPaulRobinson/TNC-GCS:base/rf_parameters').rf_pars;

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
// var plots = plots_std;

// Loop over ages
for (var i = startAge1; i<= endAge1; i+= 5){
  // Loop over seeds
  for (var j = seedToStart; j<= seedToEnd; j++){
    var age = ee.Number(i).int();
    var agePlots = plots.filter(ee.Filter.eq('age', age));
    var training = agePlots.filter(ee.Filter.eq('type', 'training'));
    var validation = agePlots.filter(ee.Filter.eq('type', 'validation'));
    var trainingSample = training.randomColumn('rnd', j);
    trainingSample = trainingSample.filter(ee.Filter.gte('rnd', 0.20));
    
    var ageStr = i.toString();
    var parStr = "age_" + ageStr;
    var rfPars = rf_pars[parStr];

    var model_train = ee.Classifier.smileRandomForest({
      numberOfTrees: rfPars['n_trees'],
      variablesPerSplit: rfPars['n_vars_split'],
      minLeafPopulation: rfPars['min_leaf_pop'],
      bagFraction: rfPars['bag_fraction']
      })
        .setOutputMode('REGRESSION')
        .train({
          features: trainingSample, 
          classProperty: 'agc_mgha',
          inputProperties: band_names
    });
    var predicted = predictors.classify(model_train, 'cartRegression').rename('agc');

    var exportImage = predicted
      .round()
      .int()
      .set({'age': age}).set({'age': i, 'seed': j});


      
      var iStr = i.toString();
      var jStr = j.toString();
      var charsI = iStr.length;
      var charsJ = jStr.length;
      
      if (charsI==1){
        iStr = '00'+iStr;
      } else if (charsI == 2){
        iStr= "0" + iStr;
      } else {
        iStr = iStr;
      }
    
      if (charsJ==1){
        jStr = '00'+jStr;
      } else if (charsJ == 2){
        jStr= "0" + jStr;
      } else {
        jStr = jStr;
      }

      Export.image.toAsset({
        image: exportImage,
        assetId: "projects/ee-groa-carbon-accumulation/assets/agc_accumulation/age_" + ageStr + "/" + "sd_" + jStr,
        description: "asset-age_" + iStr + "_sd_" + jStr,
        region: gBounds,
        crsTransform: transform,
        crs: "EPSG:4326",
        maxPixels: 1e13,
      });
  }
}

// for (var i = startAge2; i<= endAge2; i+= 5){
//   // Loop over seeds
//   for (var j = seedToStart; j<= seedToEnd; j++){
//     var age = ee.Number(i).int();
//     var agePlots = plots.filter(ee.Filter.eq('age', age));
//     var training = agePlots.filter(ee.Filter.eq('type', 'training'));
//     var validation = agePlots.filter(ee.Filter.eq('type', 'validation'));
//     var trainingSample = training.randomColumn('rnd', j);
//     trainingSample = trainingSample.filter(ee.Filter.gte('rnd', 0.20));
    
//     var ageStr = i.toString();
//     var parStr = "age_" + ageStr;
//     var rfPars = rf_pars[parStr];

//     var model_train = ee.Classifier.smileRandomForest({
//       numberOfTrees: rfPars['n_trees'],
//       variablesPerSplit: rfPars['n_vars_split'],
//       minLeafPopulation: rfPars['min_leaf_pop'],
//       bagFraction: rfPars['bag_fraction']
//       })
//         .setOutputMode('REGRESSION')
//         .train({
//           features: trainingSample, 
//           classProperty: 'agc_mgha',
//           inputProperties: band_names
//     });
//     var predicted = predictors.classify(model_train, 'cartRegression').rename('agc');

//     var exportImage = predicted
//       .round()
//       .int()
//       .set({'age': age}).set({'age': i, 'seed': j});


      
//       var iStr = i.toString();
//       var jStr = j.toString();
//       var charsI = iStr.length;
//       var charsJ = jStr.length;
      
//       if (charsI==1){
//         iStr = '00'+iStr;
//       } else if (charsI == 2){
//         iStr= "0" + iStr;
//       } else {
//         iStr = iStr;
//       }
    
//       if (charsJ==1){
//         jStr = '00'+jStr;
//       } else if (charsJ == 2){
//         jStr= "0" + jStr;
//       } else {
//         jStr = jStr;
//       }

//       Export.image.toAsset({
//         image: exportImage,
//         assetId: "projects/ee-groa-carbon-accumulation/assets/agc_accumulation/age_" + ageStr + "/" + "sd_" + jStr,
//         description: "asset-age_" + iStr + "_sd_" + jStr,
//         region: gBounds,
//         crsTransform: transform,
//         crs: "EPSG:4326",
//         maxPixels: 1e13,
//       });
//   }
// }