/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var pars = ee.FeatureCollection("projects/ee-groa-carbon-accumulation/assets/plot-data/hyperparameter_table"),
    plots_std = ee.FeatureCollection("projects/ee-groa-carbon-accumulation/assets/plot-data/sp_agg_split_std_0_1"),
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
    plots = ee.FeatureCollection("projects/ee-groa-carbon-accumulation/assets/plot-data/sp_agg_split__0_2");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
var f_agb = require('users/NathanielPaulRobinson/TNC-GCS:base/agb-model-functions').agb_func;

var proj = output_sample.projection();

var scale = proj.nominalScale();
var transform = proj.getInfo().transform;
print(plots.filter(ee.Filter.eq('type', 'training')).size())
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
var plots = plots;

var a = 5;

// var ages = ee.List.sequence(a, a, 5);
var seeds = ee.List.sequence(1,3,1);

// pars = pars.limit(5);

// var optimization = ee.FeatureCollection(ages.map(function(age){
  // var age = ee.Number(age).int();
  var age = a;
  var agePlots = plots_std.filter(ee.Filter.eq('age', age));
  var trainingPlots = agePlots.filter(ee.Filter.eq('type', 'training'));
  var modelIteration = ee.FeatureCollection(seeds.map(function(seed){
    var sampleSplit = trainingPlots.randomColumn('rnd', seed);
    var training = sampleSplit.filter(ee.Filter.gte('rnd', 0.3));
    var validationPts = sampleSplit.filter(ee.Filter.lt('rnd', 0.3));
    
    var modelParameters = pars.map(function(parSet){
      var nTrees = ee.Number(parSet.get('n_trees'));
      var nVars = ee.Number(parSet.get('n_vars'));
      var nLeaf = ee.Number(parSet.get('n_leaf'));
      var fBag = ee.Number(parSet.get('n_bags'));
      
      var model_train = ee.Classifier.smileRandomForest({
        numberOfTrees: nTrees,
        variablesPerSplit: nVars,
        minLeafPopulation: nLeaf,
        bagFraction: fBag,
      
        })
          .setOutputMode('REGRESSION')
          .train({
            features: training, 
            classProperty: 'agc_mgha',
            inputProperties: band_names
          });
          
      var predicted = validationPts.classify(model_train, 'agc')
        // .rename('agc')
        // .sampleRegions({
        //   collection: validationPts,
        //   properties: ['agc_mgha'],
        //   scale: scale,
        //   projection: 'EPSG:4326',
        //   geometries: false
        //   });
      
      // var predicted = model_train.predictProperties(validationPts)
      
      var cor = ee.Number(predicted.reduceColumns({
        reducer: ee.Reducer.pearsonsCorrelation(),
        selectors: ['agc', 'agc_mgha']
        }).get('correlation'));
  
      var r2 = cor.multiply(cor);
  
      var rmse = ee.Number(ee.Array(predicted.reduceColumns({
        reducer: ee.Reducer.linearRegression(1,1),
        selectors: ['agc', 'agc_mgha']
      }).get('residuals')).toList().get(0));
      
      return ee.Feature(null, {
        'cor': cor,
        'r2': r2,
        'rmse': rmse,
        'age': age,
        'n_trees': nTrees,
        'n_vars_split': nVars,
        'min_leaf_pop': nLeaf,
        'bag_fraction': fBag,
        'seed': seed
        });
      });
    return modelParameters;
  })).flatten();
//   return modelIteration; 
// })).flatten();


var ageStr = age.toString();
Export.table.toDrive({
  collection: modelIteration,
  folder: 'eeTemp',
  fileNamePrefix: 'rf_hp_opt_age_' + ageStr +'_v2',
  description: 'rf_hp_opt_age_' + ageStr +'_v2'
});