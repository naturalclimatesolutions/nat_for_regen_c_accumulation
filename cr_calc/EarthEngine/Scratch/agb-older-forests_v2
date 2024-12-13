/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var plot_data = ee.FeatureCollection("projects/TNC_Africa/carbon/plot_data/forest_carbon_plots"),
    output_sample = ee.Image("projects/TNC_Africa/carbon/cook-patton-2021/sequestration_rate__mean__aboveground__full_extent__Mg_C_ha_yr"),
    predictors = ee.ImageCollection("projects/wri-datalab/CarbonSequestrationAI/PredictorVariables/PredictorVariablesCookPatton2020"),
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
    terra_clim = ee.Image("projects/TNC_Africa/Global-Forests/terra_clim_vars"),
    aggregated_plots = ee.FeatureCollection("projects/TNC_Africa/carbon/plot_data/aggregated_plots"),
    agc_v1 = ee.Image("projects/TNC_Africa/carbon/cook-patton-2021/sequestration_rate__mean__aboveground__full_extent__Mg_C_ha_yr"),
    bin1 = ee.FeatureCollection("projects/TNC_Africa/carbon/plot_data/covariates_sample_bin_1"),
    bin2 = ee.FeatureCollection("projects/TNC_Africa/carbon/plot_data/covariates_sample_bin_2"),
    bin3 = ee.FeatureCollection("projects/TNC_Africa/carbon/plot_data/covariates_sample_bin_3"),
    bin4 = ee.FeatureCollection("projects/TNC_Africa/carbon/plot_data/covariates_sample_bin_4"),
    bin5 = ee.FeatureCollection("projects/TNC_Africa/carbon/plot_data/covariates_sample_bin_5"),
    bin6 = ee.FeatureCollection("projects/TNC_Africa/carbon/plot_data/covariates_sample_bin_6"),
    bin7 = ee.FeatureCollection("projects/TNC_Africa/carbon/plot_data/covariates_sample_bin_7"),
    bin8 = ee.FeatureCollection("projects/TNC_Africa/carbon/plot_data/covariates_sample_bin_8"),
    bin9 = ee.FeatureCollection("projects/TNC_Africa/carbon/plot_data/covariates_sample_bin_9"),
    bin10 = ee.FeatureCollection("projects/TNC_Africa/carbon/plot_data/covariates_sample_bin_10"),
    bin11 = ee.FeatureCollection("projects/TNC_Africa/carbon/plot_data/covariates_sample_bin_11"),
    bin12 = ee.FeatureCollection("projects/TNC_Africa/carbon/plot_data/covariates_sample_bin_12"),
    plots = ee.FeatureCollection("projects/TNC_Africa/carbon/plot_data/agc_plot_cleaned"),
    cl_sp_agg = ee.FeatureCollection("projects/TNC_Africa/carbon/plot_data/cl_sp_agg_plots"),
    poi = /* color: #d63000 */ee.Geometry.Point([20.79353773927164, -2.964857179355983]),
    geometry = 
    /* color: #d63000 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[8.075673739372835, 5.242844942447133],
          [8.075673739372835, -7.197035246775501],
          [36.194657073921576, -7.197035246775501],
          [36.194657073921576, 5.242844942447133]]], null, false),
    ma_a = ee.Image("projects/TNC_Africa/carbon/cr_pars/MA_A"),
    ma_k = ee.Image("projects/TNC_Africa/carbon/cr_pars/MA_K"),
    conus_a = ee.Image("projects/TNC_Africa/carbon/cr_pars/CONUS_A"),
    conus_k = ee.Image("projects/TNC_Africa/carbon/cr_pars/CONUS_K"),
    agbRate = ee.Image("projects/TNC_Africa/carbon/cook-patton-2021/sequestration_rate__mean__aboveground__full_extent__Mg_C_ha_yr");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
print(plot_data.size())
print(plot_data.first())

var f_agb = require('users/NathanielPaulRobinson/TNC-GCS:base/agb-model-functions').agb_func;

var vis_pars = {
  min: 0,
  max: 200,
  palette: ['613318', 'b99c6b', 'bdd09f', '668d3c', '404f24']
};


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
})//.addBands(biomeHotEncode);


var band_names = predictors.bandNames().cat(['bin']);

// Standardize predictor variables
var standardized = f_agb.standardize_predictors({
  image: predictors, 
  reducer_geometry: gBounds, 
  reducer_scale: 10000
}).addBands(biomeHotEncode)


var training_points = bin1.merge(bin2)
  .merge(bin3)
  .merge(bin4)
  .merge(bin5)
  .merge(bin6)
  .merge(bin7)
  .merge(bin8)
  .merge(bin9)
  .merge(bin10)
  .merge(bin11)
  .merge(bin12)
;


var model_train = ee.Classifier.smileRandomForest({
  numberOfTrees: 100,
  minLeafPopulation: 5,
  maxNodes: 1000
  })
    .setOutputMode('REGRESSION')
    .train({
      features: training_points, 
      classProperty: 'agc_mgha',
      inputProperties: band_names
});


var test = predictBiomass(1,12,1)
// Map.addLayer(test)

function predict(bin){
  var binImage = ee.Image(bin).rename('bin');
  var covariateImage = predictors.addBands(binImage);
  var prediction = covariateImage.classify(model_train, 'cartRegression')
    .set({'bin': bin});
  return prediction
    .rename(['agc_mgha']);
}

function predictBiomass(age1, age2, step){
  var seq = ee.List.sequence(age1, age2, step);
  var predictions = ee.ImageCollection(seq.map(function(age){
    age = ee.Number(age)
    var prediction = predict(age);
    return prediction
  }));
  return predictions
}



// var binning_filters = [
//   {"bin": 1, "bin_age": 10, "bin_filter": ee.Filter.and(ee.Filter.gt('age', 5), ee.Filter.lte('age', 15))},
//   {"bin": 2, "bin_age": 20, "bin_filter": ee.Filter.and(ee.Filter.gt('age', 15), ee.Filter.lte('age', 25))},
//   {"bin": 3, "bin_age": 30, "bin_filter": ee.Filter.and(ee.Filter.gt('age', 25), ee.Filter.lte('age', 35))},
//   {"bin": 4, "bin_age": 40, "bin_filter": ee.Filter.and(ee.Filter.gt('age', 35), ee.Filter.lte('age', 45))},
//   {"bin": 5, "bin_age": 50, "bin_filter": ee.Filter.and(ee.Filter.gt('age', 45), ee.Filter.lte('age', 55))},
//   {"bin": 6, "bin_age": 60, "bin_filter": ee.Filter.and(ee.Filter.gt('age', 55), ee.Filter.lte('age', 65))},
//   {"bin": 7, "bin_age": 70, "bin_filter": ee.Filter.and(ee.Filter.gt('age', 65), ee.Filter.lte('age', 75))},
//   {"bin": 8, "bin_age": 80, "bin_filter": ee.Filter.and(ee.Filter.gt('age', 75), ee.Filter.lte('age', 85))},
//   {"bin": 9, "bin_age": 90, "bin_filter": ee.Filter.and(ee.Filter.gt('age', 85), ee.Filter.lte('age', 95))},
//   {"bin": 10, "bin_age": 100, "bin_filter":  ee.Filter.and(ee.Filter.gt('age', 95), ee.Filter.lte('age', 105))},
//   {"bin": 11, "bin_age": 105, "bin_filter":  ee.Filter.gt('age', 105)},
//   ];


// var spatial_aggregation = ee.FeatureCollection(binning_filters.map(function(dict){
//   var bin_age = dict.bin_age;
//   var bin = dict.bin;
//   var filter = dict.bin_filter;
//   var binned_plot = plot_data.filter(filter);
//   var pre_n = binned_plot.size();
//   var points_to_image = binned_plot.reduceToImage(['agc_mgha'], ee.Reducer.mean())
//     .setDefaultProjection(output_sample.projection())
//     .reproject(output_sample.projection())
//     .multiply(100)
//     .int();
//   var image_to_points = points_to_image.reduceToVectors({
//     scale: output_sample.projection().nominalScale(),
//     crs: output_sample.projection(),
//     geometry: plot_data.geometry().bounds(),
//     geometryType: 'centroid',
//     maxPixels: 1e13
//   });
//   var post_n = image_to_points.size();
  
//   var sample_plots = image_to_points.map(function(point){
//     var agc_mgha = ee.Number(point.get('label')).divide(100);
//     return point.set({
//       'bin': bin,
//       'bin_age': bin_age,
//       'agc_mgha': agc_mgha,
//       'n_t1': pre_n,
//       'n_t2': post_n
//     })
//       .select([
//         'bin', 
//         'bin_age', 
//         'agc_mgha', 
//         'n_t1', 
//         'n_t2']);
//   }).randomColumn();
//   return sample_plots;
// })).flatten();


// var ages = ee.List.sequence(5,100,1)
// var spatial_aggregation = ee.FeatureCollection(ages.map(function(age){
//   age = ee.Number(age);
//   var samplesToAggregate = plots.filter(ee.Filter.eq('age', age))
//   var points_to_image = samplesToAggregate.reduceToImage(['agc_mgha'], ee.Reducer.mean())
//     .setDefaultProjection(output_sample.projection())
//     .reproject(output_sample.projection())
//     .multiply(100)
//     .int();
//   var image_to_points = points_to_image.reduceToVectors({
//     scale: output_sample.projection().nominalScale(),
//     crs: output_sample.projection(),
//     geometry: plots.geometry().bounds(),
//     geometryType: 'centroid',
//     maxPixels: 1e13
//   });
//   var pre_n = samplesToAggregate.size()
//   var post_n = image_to_points.size();
  
//   var sample_plots = image_to_points.map(function(point){
//     var agc_mgha = ee.Number(point.get('label')).divide(100);
//     var stats = predictors.reduceRegion({
//       geometry: point.geometry(),
//       reducer: ee.Reducer.mean(),
//       scale: 1000,
//       crs: 'EPSG:4326',
//     })
//     return point.set({
//       // 'bin': bin,
//       'age': age,
//       'agc_mgha': agc_mgha,
//       'n_t1': pre_n,
//       'n_t2': post_n
//     })
//       .select([
//         'age', 
//         'agc_mgha', 
//         'n_t1', 
//         'n_t2'])
//         .set(stats);
//   }).randomColumn();
  
//   return sample_plots;
// })).flatten();


// Export.table.toAsset({
//   collection: spatial_aggregation,
//   assetId: "projects/TNC_Africa/carbon/plot_data/cl_sp_agg_plots_2",
//   description: "aggregated_plots_v2" 
// });

// var spatial_sample = predictors.sampleRegions({
//   collection: cl_sp_agg,
//   scale: 1000,
//   projection: 'EPSG:4326',
//   tileScale: 16,
//   geometries: true
// });

// Export.table.toAsset({
//   collection: spatial_sample,
//   assetId: "projects/TNC_Africa/carbon/plot_data/cl_sp_agg_sample_v2",
//   description: "aggregated_plots"
// });



// for (var i=1; i <=12; i++){

//   var bin = i;
//   var bin_name = bin.toString();

//   var export_collection = aggregated_plots.filter(ee.Filter.eq('bin', bin))


  
//   var spatial_sample = predictors.sampleRegions({
//     collection: export_collection,
//     scale: 1000,
//     projection: 'EPSG:4326',
//     tileScale: 16,
//     geometries: true
//   });
  
//   // Export.table.toAsset({
//   //   collection: spatial_sample,
//   //   assetId: "projects/TNC_Africa/carbon/plot_data/covariates_sample_bin_" + bin_name,
//   //   description: "aggregated_plots_bin_" + bin_name 
//   // });

// }




var model_train_1 = ee.Classifier.smileRandomForest({
  numberOfTrees: 100,
  })
    .setOutputMode('REGRESSION')
    .train({
      features: bin1, 
      classProperty: 'agc_mgha',
      inputProperties: band_names
});

var model_train_2 = ee.Classifier.smileRandomForest({
  numberOfTrees: 100,
  })
    .setOutputMode('REGRESSION')
    .train({
      features: bin2, 
      classProperty: 'agc_mgha',
      inputProperties: band_names
});

var model_train_3 = ee.Classifier.smileRandomForest({
  numberOfTrees: 100,
  })
    .setOutputMode('REGRESSION')
    .train({
      features: bin3, 
      classProperty: 'agc_mgha',
      inputProperties: band_names
});

var model_train_4 = ee.Classifier.smileRandomForest({
  numberOfTrees: 100,
  })
    .setOutputMode('REGRESSION')
    .train({
      features: bin4, 
      classProperty: 'agc_mgha',
      inputProperties: band_names
});

var model_train_5 = ee.Classifier.smileRandomForest({
  numberOfTrees: 100,
  })
    .setOutputMode('REGRESSION')
    .train({
      features: bin5, 
      classProperty: 'agc_mgha',
      inputProperties: band_names
});

var model_train_6 = ee.Classifier.smileRandomForest({
  numberOfTrees: 100,
  })
    .setOutputMode('REGRESSION')
    .train({
      features: bin6, 
      classProperty: 'agc_mgha',
      inputProperties: band_names
});

var model_train_7 = ee.Classifier.smileRandomForest({
  numberOfTrees: 100,
  })
    .setOutputMode('REGRESSION')
    .train({
      features: bin7, 
      classProperty: 'agc_mgha',
      inputProperties: band_names
});

var model_train_8 = ee.Classifier.smileRandomForest({
  numberOfTrees: 100,
  })
    .setOutputMode('REGRESSION')
    .train({
      features: bin8, 
      classProperty: 'agc_mgha',
      inputProperties: band_names
});

var model_train_9 = ee.Classifier.smileRandomForest({
  numberOfTrees: 100,
  })
    .setOutputMode('REGRESSION')
    .train({
      features: bin9, 
      classProperty: 'agc_mgha',
      inputProperties: band_names
});

var model_train_10 = ee.Classifier.smileRandomForest({
  numberOfTrees: 100,
  })
    .setOutputMode('REGRESSION')
    .train({
      features: bin10, 
      classProperty: 'agc_mgha',
      inputProperties: band_names
});

var model_train_11 = ee.Classifier.smileRandomForest({
  numberOfTrees: 100,
  })
    .setOutputMode('REGRESSION')
    .train({
      features: bin11, 
      classProperty: 'agc_mgha',
      inputProperties: band_names
});

var model_train_12 = ee.Classifier.smileRandomForest({
  numberOfTrees: 100,
  })
    .setOutputMode('REGRESSION')
    .train({
      features: bin12, 
      classProperty: 'agc_mgha',
      inputProperties: band_names
});



var age_1 = predictors.addBands(ee.Image(1).rename('bin'));
var age_2 = predictors.addBands(ee.Image(2).rename('bin'));
var age_3 = predictors.addBands(ee.Image(3).rename('bin'));
var age_4 = predictors.addBands(ee.Image(4).rename('bin'));
var age_5 = predictors.addBands(ee.Image(5).rename('bin'));
var age_6 = predictors.addBands(ee.Image(6).rename('bin'));
var age_7 = predictors.addBands(ee.Image(7).rename('bin'));
var age_8 = predictors.addBands(ee.Image(8).rename('bin'));
var age_9 = predictors.addBands(ee.Image(9).rename('bin'));
var age_10 = predictors.addBands(ee.Image(10).rename('bin'));
var age_11 = predictors.addBands(ee.Image(11).rename('bin'));
// var age_12 = predictors.addBands(ee.Image(12).rename('bin'));


var age_1_predict = age_1.classify(model_train_1, 'cartRegression').set({'age': 10});
var age_2_predict = age_2.classify(model_train_2, 'cartRegression').set({'age': 20});
var age_3_predict = age_3.classify(model_train_3, 'cartRegression').set({'age': 30});
var age_4_predict = age_4.classify(model_train_4, 'cartRegression').set({'age': 40});
var age_5_predict = age_5.classify(model_train_5, 'cartRegression').set({'age': 50});
var age_6_predict = age_6.classify(model_train_6, 'cartRegression').set({'age': 60});
var age_7_predict = age_7.classify(model_train_7, 'cartRegression').set({'age': 70});
var age_8_predict = age_8.classify(model_train_8, 'cartRegression').set({'age': 80});
var age_9_predict = age_9.classify(model_train_9, 'cartRegression').set({'age': 90});
var age_10_predict = age_10.classify(model_train_10, 'cartRegression').set({'age': 100});
var age_11_predict = age_11.classify(model_train_11, 'cartRegression').set({'age': 110});
// var age_12_predict = age_2.classify(model_train_12, 'cartRegression').set({'age_class': 12});

var output = ee.ImageCollection([
  age_1_predict,
  age_2_predict,
  age_3_predict,
  age_4_predict,
  age_5_predict,
  age_6_predict,
  age_7_predict,
  age_8_predict,
  age_9_predict,
  age_10_predict,
  age_11_predict,
  // age_12_predict,
  ]
);

// var dif1 = age_2_predict.subtract(age_1_predict)
// var dif2 = age_3_predict.subtract(age_2_predict)
// var dif3 = age_4_predict.subtract(age_3_predict)
// var dif4 = age_5_predict.subtract(age_4_predict)
// var dif5 = age_6_predict.subtract(age_5_predict)
// var dif6 = age_7_predict.subtract(age_6_predict)
// var dif7 = age_8_predict.subtract(age_7_predict)
// var dif8 = age_9_predict.subtract(age_8_predict)
// var dif9 = age_10_predict.subtract(age_9_predict)
// var dif10 = age_11_predict.subtract(age_10_predict)




// Map.addLayer(dif1, {min:-10, max:10, palette:['red', 'yellow', 'green']}, "Drops time 1 - 2", false);
// Map.addLayer(bin1, null, 'Points 1', false);
// Map.addLayer(dif2, {min:-10, max:10, palette:['red', 'yellow', 'green']}, "Drops time 2 - 3", false);
// Map.addLayer(bin2, null, 'Points 2', false);
// Map.addLayer(dif3, {min:-10, max:10, palette:['red', 'yellow', 'green']}, "Drops time 3 - 4", false);
// Map.addLayer(bin3, null, 'Points 3', false);
// Map.addLayer(dif4, {min:-10, max:10, palette:['red', 'yellow', 'green']}, "Drops time 4 - 5", false);
// Map.addLayer(bin4, null, 'Points 4', false);
// Map.addLayer(dif5, {min:-10, max:10, palette:['red', 'yellow', 'green']}, "Drops time 5 - 6", false);
// Map.addLayer(bin5, null, 'Points 5', false);
// Map.addLayer(dif6, {min:-10, max:10, palette:['red', 'yellow', 'green']}, "Drops time 6 - 7", false);
// Map.addLayer(bin6, null, 'Points 6', false);
// Map.addLayer(dif7, {min:-10, max:10, palette:['red', 'yellow', 'green']}, "Drops time 7 - 8", false);
// Map.addLayer(bin7, null, 'Points 7', false);
// Map.addLayer(dif8, {min:-10, max:10, palette:['red', 'yellow', 'green']}, "Drops time 8 - 9", false);
// Map.addLayer(bin8, null, 'Points 8', false);
// Map.addLayer(dif9, {min:-10, max:10, palette:['red', 'yellow', 'green']}, "Drops time 9 - 10", false);
// Map.addLayer(bin9, null, 'Points 9', false);
// Map.addLayer(dif10, {min:-10, max:10, palette:['red', 'yellow', 'green']}, "Drops time 10 - 11", false);
// Map.addLayer(bin10, null, 'Points 10', false);
// Map.addLayer(bin11, null, 'Points 11', false);


// var test1 = bin3.filterBounds(geometry).reduceColumns({
//   reducer: ee.Reducer.mean(),
//   selectors: ['agc_mgha']
// })
// var test2 = bin4.filterBounds(geometry).reduceColumns({
//   reducer: ee.Reducer.mean(),
//   selectors: ['agc_mgha']
// })

// print(test1);
// print(test2);

function chart(data, xProperty, title) {
  var plot = ui.Chart.image.series({
    imageCollection: data,
    region: poi,
    reducer: ee.Reducer.mean(),
    scale: 1000,
    xProperty: xProperty 
  })
  .setChartType('ColumnChart')
  .setOptions({
          title: title,
          hAxis: {title: 'Age', titleTextStyle: {italic: false, bold: true}},
          vAxis: {
            title: 'AGC mg ha-1',
            titleTextStyle: {italic: false, bold: true}
          },
          lineWidth: 5,
          colors: ['228b22'],
          // curveType: 'function'
        });
  return plot;
}
print(chart(output, 'age', 'AGC By Binned Age - Independent Models'));


function cr_curve(a,k,t){
  var cr = ee.Image().expression({
    expression: "a * pow((1 - (exp(-1 * k * t))), 3.03)",
    map: {
      "a": a,
      "k": k,
      "t": t
    }
  }).float();
  
  return cr.set({'age': t})
}

var predictedYears = [10,20]

var a_pars = {min: 0, max: 100, palette: ['613318', 'b99c6b', 'bdd09f', '668d3c', '404f24']}
var k_pars = {min: 0, max: 0.05, palette: ['613318', 'b99c6b', 'bdd09f', '668d3c', '404f24']}
// Map.addLayer(ma_a, a_pars, 'MA - A', false)
// Map.addLayer(ma_k, k_pars, 'MA - K', false)
// Map.addLayer(conus_a, a_pars, 'CONUS - A', false)
// Map.addLayer(conus_k, k_pars, 'CONUS - K', false)

Map.addLayer(agbRate.multiply(30), null, null, false);


var ages = ee.List.sequence(0,120,1);
var growth = ee.ImageCollection(ages.map(function(age){
  age = ee.Number(age)
  var cr = cr_curve(conus_a, conus_k, age)
  return cr
}))

function chart(data, xProperty, title) {
  var year30 = agbRate.multiply(30).reduceRegion({
    reducer : ee.Reducer.mean(),
    scale: 500,
    crs: 'EPSG:4326',
    geometry: poi
  }).get('b1');

  var plot = ui.Chart.image.series({
    imageCollection: data,
    region: poi,
    reducer: ee.Reducer.mean(),
    scale: 1000,
    xProperty: xProperty 
  })
  // .setChartType('line')
  .setOptions({
          title: title,
          hAxis: {title: 'Age', titleTextStyle: {italic: false, bold: true}},
          vAxis: {
            title: 'AGC mg ha-1',
            titleTextStyle: {italic: false, bold: true}
          },
          lineWidth: 5,
          colors: ['228b22'],
          curveType: 'function'
        });
  return plot;
}


print(chart(growth, 'age', 'CR - Growth'));


// var years = [];
// for (var i = 1; i <= 110; i++){
//   var includeBinned = predictedYears.indexOf(i)>=0;
//   var dict = {
//     'age': i,
//     'includeBinned': includeBinned,
//   }
//   years.push(dict)
// }



// var output = output.filter(ee.Filter.eq('age', 10)).first()
// print(output)
// var years = ee.List.sequence(0,100,1);
// var growth = ee.ImageCollection(years.map(function(t){
//   var age = ee.Number(t.age);
//   var test = t.includeBinned;
  
//   if (test===true) {
//     var image = ee.Image(output.filter(ee.Filter.eq('age', age)).first())
//   } else {
//     image = ee.Image(0).selfMask();
//   }

  
//   var predicted = image;
//   return(predicted.toFloat())
//   // return cr_curve(ma_a, ma_k, t);
// }));


// Map.addLayer(growth)

// print(chart(test, 'bin', 'AGC By Binned Age - Single Model'));

// function visualize_maps(){
//   Map.addLayer(output, {}, 'series', false)
  
//   Map.addLayer(agc_v1.multiply(30).selfMask(), vis_pars, 'Original Model', false)
  
//   Map.addLayer(age_1_predict, vis_pars, "< 5", false);
//   Map.addLayer(age_2_predict, vis_pars, "6 - 15", false);
//   Map.addLayer(age_3_predict, vis_pars, "16 - 25", false);
//   Map.addLayer(age_4_predict, vis_pars, "26 - 35", false);
//   Map.addLayer(age_5_predict, vis_pars, "36 - 45", false);
//   Map.addLayer(age_6_predict, vis_pars, "46 - 55", false);
//   Map.addLayer(age_7_predict, vis_pars, "56 - 65", false);
//   Map.addLayer(age_8_predict, vis_pars, "66 - 75", false);
//   Map.addLayer(age_9_predict, vis_pars, "76 - 85", false);
//   Map.addLayer(age_10_predict, vis_pars, "86 - 95", false);
//   Map.addLayer(age_11_predict, vis_pars, "96 - 105", false);
//   Map.addLayer(age_11_predict, vis_pars, "106 +", false);
// }

// function visualize_plots(){
//   Map.addLayer(bin1, null, "plots <= 5 years", false);
//   Map.addLayer(bin2, null, "plots 6 <= 15 years", false);
//   Map.addLayer(bin3, null, "plots 16 - 25 years", false);
//   Map.addLayer(bin4, null, "plots 26 - 35 years", false);
//   Map.addLayer(bin5, null, "plots 36 <= 45 years", false);
//   Map.addLayer(bin6, null, "plots 46 <= 55 years", false);
//   Map.addLayer(bin7, null, "plots 56 <= 65 years", false);
//   Map.addLayer(bin8, null, "plots 66 <= 75 years", false);
//   Map.addLayer(bin9, null, "plots 76 <= 85 years", false);
//   Map.addLayer(bin10, null, "plots 86 <= 95 years", false);
//   Map.addLayer(bin11, null, "plots 96 <= 105 years", false);
//   Map.addLayer(bin12, null, "plots 106 +  years", false);
// }


// visualize_maps();
// visualize_plots();





// var plots = [
//     bin1,
//     bin2,
//     bin3,
//     bin4,
//     bin5,
//     bin6,
//     bin]

// for (var i=1; i <=12; i++){
  
 
  // var model_train = ee.Classifier.smileRandomForest({
  //   numberOfTrees: 100,
  //   // variablesPerSplit: n_vars_split,
  //   // minLeafPopulation: min_leaf,
  //   // bagFraction: bag_fraction,
  //   // maxNodes: max_nodes
  //   })
  //     .setOutputMode('REGRESSION')
  //     .train({
  //       features: training_points, 
  //       classProperty: 'agc_mgha',
  //       inputProperties: band_names
  //   });
  // var bin = i;
  // var bin_name = bin.toString();
  // var age_1 = predictors.addBands(ee.Image(i).rename('bin'))

  // var age_1_predict = age_1.classify(model_train, 'cartRegression').set({'age_class': 1});

  // Export.image.toAsset({
  //   image: age_1_predict,
  //   scale: 1000,
  //   crs: 'EPSG:4326',
  //   region: gBounds,
  //   assetId: "projects/TNC_Africa/carbon/outputs/agc_byage_0_1/agc_age_1",
  //   description: "agc_age_1",
  //   maxPixels:1e13
  // });
// }


// print(aggregated_plots.aggregate_histogram("bin"))
// print(training_points.aggregate_histogram("bin"))

// var gee_model = f_agb.agb_model({
//   predictor_image: standardized,
//   training_points: spatial_aggregation,
//   sample_scale: 1000,
//   band_name: 'gee_model',
//   variable: 'agc_mgha',
//   n_trees: 150,
//   n_vars_split: 2,
//   min_leaf: null,
//   bag_fraction: 0.5,
//   max_nodes: null
// });
  

