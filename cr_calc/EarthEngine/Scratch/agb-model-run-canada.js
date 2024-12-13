/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var logo = ee.Image("projects/TNC_Africa/tnc_logo"),
    predictors = ee.ImageCollection("projects/wri-datalab/CarbonSequestrationAI/PredictorVariables/PredictorVariablesCookPatton2020"),
    training = ee.FeatureCollection("projects/wri-datalab/CarbonSequestrationAI/TrainingPoints/Train"),
    test = ee.FeatureCollection("projects/wri-datalab/CarbonSequestrationAI/TrainingPoints/Test"),
    azure = ee.Image("projects/TNC_Africa/Global-Forests/potential_carbon_sequestration_rate"),
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
    parameter_list = ee.FeatureCollection("projects/TNC_Africa/Global-Forests/parameter_list"),
    agc = ee.Image("projects/TNC_Africa/carbon/cook-patton-2021/sequestration_rate__mean__aboveground__full_extent__Mg_C_ha_yr"),
    canada_inventory = ee.FeatureCollection("projects/TNC_Africa/carbon/inventory/canada"),
    dem = ee.ImageCollection("JAXA/ALOS/AW3D30/V3_2"),
    canada_ex = ee.Image("projects/TNC_Africa/carbon/extents/canada_grid_300m"),
    canada_agc = ee.FeatureCollection("projects/TNC_Africa/carbon/inventory/canada_agc");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
var projection = canada_ex.projection();
// print(projection.getInfo().wkt);
dem = dem.mosaic().select(0).setDefaultProjection({crs: 'EPSG:4326', scale: 30})
var terrain = ee.Algorithms.Terrain(dem);

/*----------------------------------------------------------------------------*/
/*
  Script: 
   Carbon Sequestration Rates Model Functions
  
  Description:  
    This script containst the helper functions

  Input Data:
    NA

  Input Data:
    NA
    
  Authors: 
    Nathaniel Robinson
  
  Contact:
    nathanielpaulrobinson@gmail.com
    
  Notes:
    Copy and paste the snippets below into for standardized code styling and
    common code components
*/
/*----------------------------------------------------------------------------*/
canada_agc = canada_agc.filter(
  ee.Filter.and(
    ee.Filter.gte('age', 10),
    ee.Filter.lt('age', 40),
    ee.Filter.gt('agc_mgha_y', 0)
  )
).map(function(ft){
    var rate = ft.get('agc_mgha_y')
    return ft.set({'carbon_seqr_rate_Mg_ha_yr': rate})
  });


//----------------------------------------------------------------------------//
/**/ // Section 1: GEE Module With Base Functions
var f_agb = require('users/NathanielPaulRobinson/TNC-GCS:base/agb-model-functions').agb_func;



//----------------------------------------------------------------------------//
/**/ // Section 2: User Defined Variables and Script Parameters



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
  'GMTEDAspect_b1',
  'GMTEDElevation_b1',
  'GMTEDHillShade_b1',
  'GMTEDSlope_b1',
  'BiomesMask_b1'];
  

//----------------------------------------------------------------------------//
/**/ // Section 3: Model Variable Set-Up

// Convert image collection to multiband image with terra clim bands added
var latlong = ee.Image.pixelLonLat();
predictors = predictors.toBands()
  .addBands(terra_clim)
  .addBands(terrain)
  .addBands(latlong);
// print(predictors.bandNames())
// Map.addLayer(predictors.select('BiomesMask_b1'))

Map.addLayer(canada_ex.selfMask())
// Map.addLayer(predictors)

// Convert biome classification to hot encoded variable
var biomeHotEncode = f_agb.hot_encode({
  image: predictors, 
  band_name: 'BiomesMask_b1', 
  reducer_geometry: gBounds, 
  reducer_scale: 1000,
  band_suffix: '_biome'
});

// Remove unwanted bands
predictors = f_agb.remove_bands({
  image: predictors, 
  remove_list: bandsToRemove
});

// Standardize predictor variables
var standardized = f_agb.standardize_predictors({
  image: predictors, 
  reducer_geometry: gBounds, 
  reducer_scale: 10000
})//.addBands(biomeHotEncode)//.addBands(latlong);

// var standardized = latlong
// var sample = test.merge(training);
var sample = canada_agc;

var ensemble = ee.ImageCollection(ee.List.sequence(100,100,1).map(function(seed){

  var split = f_agb.split_training_validation_2({
    sample: sample,
    seed: seed,
    n_validation: 0.3,
    distance: 10,
  });
  
  // Map.addLayer(sample)
  var training_spatial = split.filter(ee.Filter.eq('type', 'training'));
  var test_spatial = split.filter(ee.Filter.eq('type', 'test'));
  var gee_model_spatial = f_agb.agb_model({
    predictor_image: predictors,
    training_points: training_spatial,
    variable: 'carbon_seqr_rate_Mg_ha_yr',
    sample_scale: 300,
    band_name: 'gee_model',
    n_trees: 150,
    n_vars_split: 2,
    min_leaf: null,
    bag_fraction: 0.5,
    max_nodes: null
  });
  
  var test_a_spatial = ee.Dictionary(f_agb.validate_model({
    gee_image: gee_model_spatial,
    azure_image: azure,
    validation_points: test_spatial,
    sample_scale: 1000,
    // print_chart: false, 
    // print_stats: false,
    // return_stats: true,
    print_mod: "spatial autocorrelation accounted for"
  }));

  var r = ee.Image(ee.Number(test_a_spatial.get('r'))).float()
  var rmse = ee.Image(ee.Number(test_a_spatial.get('rmse'))).float()
  return gee_model_spatial.float().addBands([r, rmse])
    .rename(['agc_mg_ha_yr', 'r', 'rmse']);
}))

var reducer1 = ee.Reducer.mean().forEach(['agc_mg_ha_yr', 'r', 'rmse'])
var reducer2 = ee.Reducer.stdDev().forEach(['agc_mg_ha_yr'])
var reducer = reducer1.combine(reducer2)


var ensemble_means = ensemble.mean();
var estimate_std = ensemble.select('agc_mg_ha_yr').reduce(ee.Reducer.stdDev());
Map.addLayer(ensemble_means)
var output = ensemble_means.addBands(estimate_std)//.updateMask(canada_ex)
var geom = canada_ex.geometry()

Export.image.toAsset({
  image:output,
  assetId: 'projects/TNC_Africa/carbon/outputs/canada_ensemble_noMask',
  description: 'canada_ensemble',
  region: geom,
  crs: projection.getInfo().wkt,
  crsTransform: projection.getInfo().transform,
  maxPixels: 1e13
})

// Map.addLayer(canada_ex.geometry())
// Map.addLayer(ensemble)
// print(training_spatial.size())
// print(test_spatial.size())
// print("original number of training points: ", training.size());
// print("original number of validation points: ", test.size());
// print("spatial seperate number of training points: ", training_spatial.size());
// print("original number of validation points: ", test_spatial.size());


// var gee_model = f_agb.agb_model({
//   predictor_image: predictors,
//   training_points: training,
//   sample_scale: 30,
//   band_name: 'gee_model',
//   n_trees: 150,
//   n_vars_split: 2,
//   min_leaf: null,
//   bag_fraction: 0.5,
//   max_nodes: null
// });





// azure = azure.selfMask()
//   .rename('azure_model')
//   .updateMask(azure.mask().gt(0));

// var dist = [0.0000001, 2, 10, 50, 100, 150, 200, 500]
// var spatial_validation = ee.FeatureCollection(dist.map(function(dist){
//   var test_sp = f_agb.spatial_validation({
//     predictor_image: standardized,
//     azure_image: azure,
//     sample: sample,
//     distance: dist,
//     seed: 5,
//     percent_validation: 10
//   });
//   return test_sp;
// })).flatten();

// Export.table.toDrive({
//   collection:  spatial_validation,
//   folder: 'eeTempExports',
//   fileNamePrefix: 'agb_rate_spatial_validation_original_latlon'
// })
// var test_sp = f_agb.spatial_validation({
//   predictor_image: standardized,
//   azure_image: azure,
//   sample: sample,
//   distance: 100,
//   seed: 5,
//   percent_validation: 0.01
// });



// var test_a = f_agb.validate_model({
//   gee_image: gee_model,
//   azure_image: azure,
//   validation_points: test,
//   sample_scale: 1000,
//   print_chart: false, 
//   print_stats: true,
//   return_stats: false,
//   print_mod: "spatially autocorrelated"
// });



// var n_trees_test = f_agb.model_pars_test({
//   parameter: "n_trees",
//   parameter_min: 25,
//   parameter_max: 250,
//   parameter_step: 25,
//   predictor_image: standardized,
//   training_points: training,
//   sample_scale: 1000,
//   band_name: 'gee_model',
//   n_trees: 126,
//   n_vars_split: 2,
//   min_leaf: null,
//   bag_fraction: 0.5,
//   max_nodes: null,
//   azure_image: azure,
//   validation_points: test,
//   print_chart: false, 
//   print_stats: true,
//   return_stats: false
// });

// var vars_test = f_agb.model_pars_test({
//   parameter: "n_vars_split",
//   parameter_min: 1,
//   parameter_max: 10,
//   parameter_step: 1,
//   predictor_image: standardized,
//   training_points: training,
//   sample_scale: 1000,
//   band_name: 'gee_model',
//   n_trees: 126,
//   n_vars_split: null,
//   min_leaf: null,
//   bag_fraction: null,
//   max_nodes: null,
//   azure_image: azure,
//   validation_points: test,
//   print_chart: false, 
//   print_stats: false,
//   return_stats: true
// });


// var leaf_test = f_agb.model_pars_test({
//   parameter: "min_leaf",
//   parameter_min: 1,
//   parameter_max: 10,
//   parameter_step: 1,
//   predictor_image: standardized,
//   training_points: training,
//   sample_scale: 1000,
//   band_name: 'gee_model',
//   n_trees: 126,
//   n_vars_split: null,
//   min_leaf: null,
//   bag_fraction: null,
//   max_nodes: null,
//   azure_image: azure,
//   validation_points: test,
//   print_chart: false, 
//   print_stats: false,
//   return_stats: true
// });

// var bag_test = f_agb.model_pars_test({
//   parameter: "bag_fraction",
//   parameter_min: 0.1,
//   parameter_max: 0.9,
//   parameter_step: 0.1,
//   predictor_image: standardized,
//   training_points: training,
//   sample_scale: 1000,
//   band_name: 'gee_model',
//   n_trees: 126,
//   n_vars_split: null,
//   min_leaf: null,
//   bag_fraction: null,
//   max_nodes: null,
//   azure_image: azure,
//   validation_points: test,
//   print_chart: false, 
//   print_stats: false,
//   return_stats: true
// });

// var nodes_test = f_agb.model_pars_test({
//   parameter: "max_nodes",
//   parameter_min: 10,
//   parameter_max: 1000,
//   parameter_step: 50,
//   predictor_image: standardized,
//   training_points: training,
//   sample_scale: 1000,
//   band_name: 'gee_model',
//   n_trees: 126,
//   n_vars_split: null,
//   min_leaf: null,
//   bag_fraction: null,
//   max_nodes: null,
//   azure_image: azure,
//   validation_points: test,
//   print_chart: false, 
//   print_stats: false,
//   return_stats: true
// });

// var trees_chart = f_agb.chart_test(n_trees_test, "n_trees", "Number of Trees");
// var vars_chart = f_agb.chart_test(vars_test, "n_vars_split", "Number of Variables per Split");
// var leaf_chart = f_agb.chart_test(leaf_test, "min_leaf", "Minimum Number of Leaves");
// var bag_chart = f_agb.chart_test(bag_test, "bag_fraction", "Bag Fraction");
// var nodes_chart = f_agb.chart_test(nodes_test, "max_nodes", "Maximum Nodes");


// print(trees_chart);

// print(vars_chart);

// print(leaf_chart);

// print(bag_chart);

// print(nodes_chart);

// var parameter_search =  f_agb.parameter_search({
//   predictor_image: standardized,
//   training_points: training,
//   sample_scale: 1000,
//   band_name: 'gee_model',
//   azure_image: azure,
//   validation_points: test,
//   collection: parameter_list
// });


// Export.table.toDrive({
//   collection: parameter_search,
//   fileNamePrefix: 'gee_agb_parameter_search',
//   folder: 'eeTempExports'
// })
// print(ee.List.sequence(0.5, 0.5, 0.1));

// Map.addLayer(gee_model_spatial.updateMask(canada_ex).resample('bilinear'), f_agb.vis_pars, "gee_model", true);
// Map.addLayer(azure)
// Map.addLayer(canada_ex.geometry().bounds())
// Map.addLayer(azure, f_agb.vis_pars, "azure_model", true);
// agc = agc.updateMask(agc.gte(0)).unmask(-9999)
// var export_image = agc.where(agc.eq(-9999), gee_model)
// export_image = export_image.updateMask(export_image.neq(-9999))
// Map.addLayer(export_image, f_agb.vis_pars, "gee_model", true);
// // f_agb.add_logo(logo);
// var transform = agc.projection().getInfo().transform
// print(transform)

// var gBounds = ee.Geometry.Polygon([-180, 88, 0, 88, 180, 88, 180, -88, 0, -88, -180, -88], null, false);


// var export_image = gee_model_spatial.updateMask(canada_agc).resample('bilinear');
// var extent = canada_agc.geometry().bounds();
// var crs = canada_agc.projection().getInfo()
// var transform = crs.transform
// print(crs)
// print(transform)

// Export.image.toDrive({
//   image: export_image.multiply(1000).int(),
//   region: extent,
//   folder: 'carbon_accumulation_canada',
//   fileNamePrefix: 'canada_agc_mg_ha_yr_v001',
//   scale: 30,
//   // crsTransform: transform,
//   crs: "EPSG:4326",
//   maxPixels:1e13,
//   description: 'carbon_accumulation',
// })

// Export.image.toAsset({
//   image: export_image,
//   region: extent,
//   assetId: 'projects/TNC_Africa/carbon/outputs/canada_001',
//   scale: 30,
//   // crsTransform: transform,
//   crs: "EPSG:4326",
//   maxPixels:1e13,
//   description: 'carbon_accumulation',
// })