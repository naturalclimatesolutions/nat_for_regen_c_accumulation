/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var plotsa = ee.FeatureCollection("projects/TNC_Africa/carbon/plot_data/agc_plot_cleaned"),
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
    table = ee.FeatureCollection("projects/TNC_Africa/carbon/plot_data/cl_sp_agg_plots_2"),
    ecoregions = ee.Image("projects/SCL/v1/source/resolve-ecoregion-img"),
    plots = ee.FeatureCollection("projects/ee-groa-carbon-accumulation/assets/plot-data/agc_plot_cleaned_2"),
    geometry = 
    /* color: #d63000 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-85.57395283184606, 10.607600020821046],
          [-85.57395283184606, 10.118917665752777],
          [-85.05038563213903, 10.118917665752777],
          [-85.05038563213903, 10.607600020821046]]], null, false);
/***** End of imports. If edited, may not auto-convert in the playground. *****/
var f_agb = require('users/NathanielPaulRobinson/TNC-GCS:base/agb-model-functions').agb_func;
plots = plots.filterBounds(geometry)

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
// var biomes = ecoregions.reduceToImage({
//   properties: ['BIOME_NUM'],
//   reducer: ee.Reducer.first()
// }).rename('biomes')

// Convert biome classification to hot encoded variable
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

var band_names = predictors.bandNames().cat(['bin']);

// Standardize predictor variables
var standardized = f_agb.standardize_predictors({
  image: predictors, 
  reducer_geometry: gBounds, 
  reducer_scale: 10000
}).addBands(biomeHotEncode);


predictors = predictors.addBands(biomeHotEncode);

// predictors = predictors;
predictors = standardized;

var ages = ee.List.sequence(5,100,5);

var proj = output_sample.projection();
var scale = proj.nominalScale();

var spatial_aggregation = ee.FeatureCollection(ages.map(function(age){
  age = ee.Number(age);
  var age1 = age.subtract(2);
  var age2 = age.add(2);
  
  var samplesToAggregate = plots.filter(
    ee.Filter.and(
      ee.Filter.gte('age', age1), 
      ee.Filter.lte('age', age2)));
      
  var points_to_image = samplesToAggregate.reduceToImage(['agc_mgha'], ee.Reducer.mean())
    .setDefaultProjection(proj)
    .reproject(proj)
    .multiply(100)
    .int();
    
  var image_to_points = points_to_image.reduceToVectors({
    scale: scale,
    crs: proj,
    geometry: gBounds,
    geometryType: 'centroid',
    maxPixels: 1e13
  });
  var pre_n = samplesToAggregate.size();
  var post_n = image_to_points.size();
  
  var sample_plots = image_to_points.map(function(point){
    var agc_mgha = ee.Number(point.get('label')).divide(100);
    var stats = standardized.reduceRegion({
      geometry: point.geometry(),
      reducer: ee.Reducer.mean(),
      scale: 1000,
      crs: 'EPSG:4326',
    });
    return point.set({
      // 'bin': bin,
      'age': age,
      'agc_mgha': agc_mgha,
      'n_t1': pre_n,
      'n_t2': post_n
    })
      .select([
        'age', 
        'agc_mgha', 
        'n_t1', 
        'n_t2'])
        .set(stats);
  }).randomColumn("rnd_1", 1);
  
  // var seeds = ee.FeatureCollection(ee.List.sequence(1,101,1).map(function(seed){
  //   seed = ee.Number(seed).int();
  //   var seedStr = ee.String('s_').cat(ee.String(seed))
  //   var column = sample_plots.randomColumn(seedStr, seed).select([seedStr], null, false);
  //   return column
  // })).flatten()
  
  return sample_plots;
})).flatten()

var properties = spatial_aggregation.first().propertyNames()

spatial_aggregation = spatial_aggregation.filter(ee.Filter.notNull(properties)); 

var split = f_agb.split_training_validation(
  {
    sample: spatial_aggregation,
    distance: 0,
    n_validation: 0.1
  });


// print(spatial_aggregation.size())
// https://code.earthengine.google.com/4bc816a0009b35b798f281e775f68b55

Export.table.toAsset({
  collection:spatial_aggregation,
  assetId: "projects/ee-groa-carbon-accumulation/assets/plot-data/sp_agg_plots_0_2",
  description: "sp_agg_plots_0_1",
});

Export.table.toAsset({
  collection: split,
  assetId: "projects/ee-groa-carbon-accumulation/assets/plot-data/sp_agg_split__0_2",
  description: "sp_agg_split_0_1",
});
