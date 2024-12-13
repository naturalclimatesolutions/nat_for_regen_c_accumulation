/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var alos = ee.ImageCollection("JAXA/ALOS/AW3D30/V3_2"),
    terraclim = ee.ImageCollection("IDAHO_EPSCOR/TERRACLIMATE"),
    geometry = 
    /* color: #d63000 */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-168.90747797731265, 72.40511765786451],
          [-168.90747797731265, 24.074887402800037],
          [-44.45435297731266, 24.074887402800037],
          [-44.45435297731266, 72.40511765786451]]], null, false);
/***** End of imports. If edited, may not auto-convert in the playground. *****/
// var logo = ee.Image("projects/TNC_Africa/tnc_logo"),
//     predictors = ee.ImageCollection("projects/wri-datalab/CarbonSequestrationAI/PredictorVariables/PredictorVariablesCookPatton2020"),
//     training = ee.FeatureCollection("projects/wri-datalab/CarbonSequestrationAI/TrainingPoints/Train"),
//     test = ee.FeatureCollection("projects/wri-datalab/CarbonSequestrationAI/TrainingPoints/Test"),
//     azure = ee.Image("projects/TNC_Africa/Global-Forests/potential_carbon_sequestration_rate"),
//     geometry = 
//     /* color: #d63000 */
//     /* shown: false */
//     /* displayProperties: [
//       {
//         "type": "rectangle"
//       }
//     ] */
//     ee.Geometry.Polygon(
//         [[[-52.61595010990376, -8.301170823891802],
//           [-52.61595010990376, -14.501150333735152],
//           [-47.16673135990376, -14.501150333735152],
//           [-47.16673135990376, -8.301170823891802]]], null, false),
    // terra_clim = ee.Image("projects/TNC_Africa/Global-Forests/terra_clim_vars"),
    // parameter_list = ee.FeatureCollection("projects/TNC_Africa/Global-Forests/parameter_list"),
    // agc = ee.Image("projects/TNC_Africa/carbon/cook-patton-2021/sequestration_rate__mean__aboveground__full_extent__Mg_C_ha_yr"),
    // canada_inventory = ee.FeatureCollection("projects/TNC_Africa/carbon/inventory/canada"),
    // us_canada = ee.FeatureCollection("projects/TNC_Africa/carbon/inventory/us_canada_data_b"),
    // canada_ex = ee.Image("projects/TNC_Africa/carbon/extents/canada_grid"),
    // dem = ee.ImageCollection("JAXA/ALOS/AW3D30/V3_2");



terraclim = terraclim.filterDate('1980-01-01', '2011-01-01')
  .map(process_clim)



// Map.addLayer(terraclim.first().select('tmmn').multiply(0.1).resample('bilinear'), {min: -40, max:40, palette:['purple', 'blue', 'yellow', 'orange', 'red']})

var alos_dem = alos.mosaic()
  .select(0)
  .setDefaultProjection({
    crs: 'EPSG:4326',
    scale: 30.922080775909325
  }).rename('elevation');
  


var visPars = {min:-50, max:50, palette: ['blue', 'green', 'red']};

var tpiFine = tpi(alos_dem, 1.5).rename("tpi_fine");
var tpiMed = tpi(alos_dem, 15.5).rename("tpi_medium");
var tpiCoarse = tpi(alos_dem, 30.5).rename("tpi_coarse");

var terrain = ee.Algorithms.Terrain(alos_dem)
  .addBands([
    tpiFine,
    tpiMed,
    tpiCoarse]);

var quarterly = quarterly_reduce(1980, 2009, terraclim)
  .mean();
var precip = annual_reduce(1980, 2009, terraclim, 'pr', ee.Reducer.sum())
  .mean()
  .rename('pr');
var pet = annual_reduce(1980, 2009, terraclim, 'pet', ee.Reducer.sum())
  .mean()
  .rename('pet');
var rad_avg = annual_reduce(1980, 2009, terraclim, 'srad', ee.Reducer.sum())
  .mean()
  .rename('srad');
var rad_max = annual_reduce(1980, 2009, terraclim, 'srad', ee.Reducer.max())
  .mean()
  .rename('srad_max'); 
var rad_min = annual_reduce(1980, 2009, terraclim, 'srad', ee.Reducer.max())
  .mean()
  .rename('srad_min'); 
var rad_cov = annual_cov(1980, 2009, terraclim, 'srad')
  .mean()
  .rename('srad_cov');
var pr_cov = annual_cov(1980, 2009, terraclim, 'pr')
  .mean()
  .rename('pr_cov');
var temp_cov = annual_cov(1980, 2009, terraclim, 'tavg')
  .mean()
  .rename('tavg_cov'); 
var annual_mean_bands = ['aet', 'def', 'pdsi', 'soil', 'vap', 'vpd', 'vs', 'tavg', 'trange'];

var annual_means = annual_reduce(1980, 2009, terraclim,annual_mean_bands, ee.Reducer.mean())
  .mean()
  .rename(annual_mean_bands) ;

var annual_temp_range = annual_temp_range(1980, 2009, terraclim)
  .mean();

var isothermality = calc_isothermality(1980, 2009, terraclim)
  .mean();


var covariates = terrain.addBands([
  annual_means,
  annual_temp_range,
  temp_cov,
  pr_cov,
  rad_cov,
  rad_min,
  rad_max,
  rad_avg,
  pet,
  precip,
  quarterly
  ]);








// Export.image.toAsset({
//   image: covariates,
//   crs: 'EPSG:4326',
//   scale: 30,
//   region: geometry,
//   maxPixels: 1e13,
//   assetId: 'projects/TNC_Africa/carbon/covariates/covariates_north_america_001'
  
// })


function tpi(dem, pixels){
  var kernel = ee.Kernel.circle(pixels, 'pixels');
  var focalMean = dem.neighborhoodToBands(kernel);
  var bandNames = focalMean.bandNames().remove('elevation_0_0');
  focalMean = focalMean.select(bandNames).reduce(ee.Reducer.mean());
  return dem.subtract(focalMean.int());
}


function process_clim(image){
  var resampled = resample(image);
  var scaled = scale(resampled);
  var add_avg_temp = avg_temp(scaled);
  var add_aridity = aridity(add_avg_temp);
  var return_image = range_temp(add_aridity);
  return return_image.copyProperties(image, ['system:time_start']);
}

function scale(image){
  return image.multiply(ee.Image([
    0.1, 0.1, 0.01, 0.1, 1, 1, 0.1, 0.1, 1, 0.1, 0.1, 0.001, 0.01, 0.01 
    ]));
}

function resample(image){
  return image.resample('bilinear')
}

function avg_temp(image){
  var tmin = image.select('tmmn');
  var tmax = image.select('tmmx');
  var average = tmin.add(tmax).divide(2).rename('tavg');
  return image.addBands(average);
}

function range_temp(image){
  var tmin = image.select('tmmn');
  var tmax = image.select('tmmx');
  var range = tmax.subtract(tmin).rename('trange');
  return image.addBands(range);
}

function aridity(image){
  var prc = image.select('pr');
  var pet = image.select('pet');
  return image.addBands([prc.divide(pet).rename('ariditiy')]);
}

function annual_reduce(start_year, end_year, collection, band, annual_reducer){
  return ee.ImageCollection(
    ee.List.sequence(start_year, end_year, 1).map(function(year){
      var annual_image = collection.select(band)
        .filter(ee.Filter.calendarRange(year, year, 'year'))
        .reduce(annual_reducer);
      return annual_image;
  }));
}

function annual_temp_range(start_year, end_year, collection){
  return ee.ImageCollection(
    ee.List.sequence(start_year, end_year, 1).map(function(year){
      var annual_image = collection
        .filter(ee.Filter.calendarRange(year, year, 'year'))
      var tmin = annual_image.select('tmmn').min();
      var tmmx = annual_image.select('tmmx').max();
      var range = tmmx.subtract(tmin).rename('trange_annual');
      return range;
  }));
}

// function diurnal_temp_range(start_year, end_year, collection){
//   return ee.ImageCollection(
//     ee.List.sequence(start_year, end_year, 1).map(function(year){
//       var annual_image = collection
//         .filter(ee.Filter.calendarRange(year, year, 'year'))
//       var tmin = annual_image.select('tmmn').min();
//       var tmmx = annual_image.select('tmmx').max();
//       var range = tmmx.subtract(tmin).rename('trange_annual');
//       return range;
//   }));
// }

function calc_isothermality(start_year, end_year, collection){
  return ee.ImageCollection(
    ee.List.sequence(start_year, end_year, 1).map(function(year){
      var annual_image = collection
        .filter(ee.Filter.calendarRange(year, year, 'year'));
      var tmin = annual_image.select('tmmn').min();
      var tmmx = annual_image.select('tmmx').max();
      var range = tmmx.subtract(tmin);
      var mean_diurnal = annual_image.select('trange').mean();
      return mean_diurnal.divide(range).multiply(100).rename('isothermality');
  }));
}

function quarterly_reduce(start_year, end_year, collection){
  return ee.ImageCollection(
    ee.List.sequence(start_year, end_year, 1).map(function(year){
      var annual_collection = collection.filter(ee.Filter.calendarRange(year, year, 'year'))
        .select(['pr', 'srad', 'tavg']);
      var sum_bands = ['pr', 'srad'];
      var mean_bands = ['tavg']
      
      var q1 = annual_collection.filter(ee.Filter.calendarRange(1, 3, 'month'))
        .reduce(ee.Reducer.sum().forEach(sum_bands)
          .combine(ee.Reducer.mean().forEach(mean_bands)));
          
      q1 = q1.addBands([
        q1.select('pr').multiply(-1).rename('pr_neg'),
        q1.select('tavg').multiply(-1).rename('t_neg')
        ]);
          
      var q2 = annual_collection.filter(ee.Filter.calendarRange(4, 6, 'month'))
        .reduce(ee.Reducer.sum().forEach(sum_bands)
          .combine(ee.Reducer.mean().forEach(mean_bands)));
      q2 = q2.addBands([
        q2.select('pr').multiply(-1).rename('pr_neg'),
        q2.select('tavg').multiply(-1).rename('t_neg')
        ]);

      var q3 = annual_collection.filter(ee.Filter.calendarRange(7, 9, 'month'))
        .reduce(ee.Reducer.sum().forEach(sum_bands)
            .combine(ee.Reducer.mean().forEach(mean_bands)));
      
      q3 = q3.addBands([
        q3.select('pr').multiply(-1).rename('pr_neg'),
        q3.select('tavg').multiply(-1).rename('t_neg')
        ]);

      var q4 = annual_collection.filter(ee.Filter.calendarRange(10, 12, 'month'))
        .reduce(ee.Reducer.sum().forEach(sum_bands)
          .combine(ee.Reducer.mean().forEach(mean_bands)));
          
      q4 = q4.addBands([
        q4.select('pr').multiply(-1).rename('pr_neg'),
        q4.select('tavg').multiply(-1).rename('t_neg')
        ])

      var annual = ee.ImageCollection([q1, q2, q3, q4]);
      
      var wettest = annual.qualityMosaic('pr')
        .select(['pr', 'srad', 'tavg'])
        .rename(['pr_wet', 'srad_wet', 'tavg_wet']);
      var hotest = annual.qualityMosaic('tavg')
        .select(['pr', 'srad', 'tavg'])
        .rename(['pr_hot', 'srad_hot', 'tavg_hot']);
      var driest = annual.qualityMosaic('pr_neg')
        .select(['pr', 'srad', 'tavg'])
        .rename(['pr_dry', 'srad_dry', 'tavg_dry']);
      var coldest = annual.qualityMosaic('t_neg')
        .select(['pr', 'srad', 'tavg'])
        .rename(['pr_cold', 'srad_cold', 'tavg_cold']);
      
      return wettest.addBands([hotest, driest, coldest])
      
  }));
}

function annual_cov(start_year, end_year, collection, band){
  return ee.ImageCollection(
    ee.List.sequence(start_year, end_year, 1).map(function(year){
      var annual_image = collection.select(band)
        .filter(ee.Filter.calendarRange(year, year, 'year'));
      var stdDev = annual_image.reduce(ee.Reducer.stdDev());
      var mean = annual_image.reduce(ee.Reducer.mean())
      return stdDev.divide(mean);
  }));
}



