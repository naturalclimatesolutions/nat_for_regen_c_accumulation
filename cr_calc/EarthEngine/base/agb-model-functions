/*----------------------------------------------------------------------------*/
/*
  Script: 
  Carbon Sequestration Rates Model - Base Functions
  
  Description:  
  Contains helper functions for developing, training and predicting carbon 
  sequestration rates using a random forest model. 

  Input Data:
    NA

  Authors: 
    Nathaniel Robinson
  
  Contact:
    nathanielpaulrobinson@gmail.com
    
  Notes: 
    Add the following line to use this module:
    
    var f_agb = require('users/NathanielPaulRobinson/TNC-GCS:base/agb-model-functions').agb_func;
    
*/
/*----------------------------------------------------------------------------*/




//----------------------------------------------------------------------------//
/**/ // Section 1: Data Pre-Processing Functions


/*
hot_encode

Converts a categorical input (e.g. land cover classification) into a one-hot encoded input.

key word arguments:
  1. image: ee.Image containing a band with categorical values to be one-hot encoded
  2. band_name: name of band containing a band with categorical values to be one-hot encoded
  3. reducer_geometry: area to get the unique categorical values
  4. reducer_scale: scale at which to run the reducer
  5. band_suffix: string to append to output band names
  
returns:
  Image with bands for each category as a binary output
*/

function hot_encode(kwargs){
  var encode_image = kwargs.image.select(kwargs.band_name);
  var classified_values = encode_image.reduceRegion({
    geometry: kwargs.reducer_geometry,
    scale: kwargs.reducer_scale,
    crs: 'EPSG:4326',
    reducer: ee.Reducer.frequencyHistogram(),
    maxPixels: 1e13
  });
  
  var keys = ee.Dictionary(classified_values.get(kwargs.band_name)).keys();
  
  return ee.ImageCollection(keys.map(function(item){
    var class_num = ee.Number.parse(item);
    var class_binary = encode_image.eq(class_num);
    return (class_binary).rename(ee.String(item).cat(kwargs.band_suffix));
  })).toBands();
}


/*
remove_bands

Removes bands from the predictor variable image so as not to be used in the model

key word arguments:
  1. image: ee.Image containing bands to remove bands from
  2. remove_list: a list of band names to be removed
  
returns:
  Image: Without unwanted bands
*/

function remove_bands(kwargs){
  var band_names = kwargs.image.bandNames();
  var selectors = band_names.removeAll(kwargs.remove_list);
  return kwargs.image.select(selectors);
}


/*
standardize_predictors

Normalizes the continuous predictor variables

key word arguments:
  1. image: ee.Image containing bands to normalize
  2. reducer_geometry: region over which to calculate means and standard deviations 
    for each predictor
  3. reducer_scale: scale to run the reducer at
  
returns:
  Image: Normalized image
*/

function standardize_predictors(kwargs){
  var band_names = kwargs.image.bandNames();
  
  var means_stdDevs = kwargs.image.reduceRegion({
    geometry: kwargs.reducer_geometry,
    scale: kwargs.reducer_scale,
    crs: 'EPSG:4326',
    reducer: ee.Reducer.mean().combine(ee.Reducer.stdDev(), null, true),
    maxPixels: 1e13
  }).toImage();
  
  var mean_names = band_names.map(function(item){
    return ee.String(item).cat('_mean');
  });
  var stdDev_names = band_names.map(function(item){
    return ee.String(item).cat('_stdDev');
  });
  
  return kwargs.image.subtract(means_stdDevs.select(mean_names))
    .divide(means_stdDevs.select(stdDev_names));
}


/*
split_training_validation

Splits the training and validation points

key word arguments:

returns:
  Image: Normalized image
*/

function split_training_validation(kwargs){
  // var randomized = kwargs.sample.randomColumn('random', kwargs.seed);
  var distance_m = kwargs.distance * 1000;
  var test_points = kwargs.sample.filter(ee.Filter.lt('rnd_1', kwargs.n_validation))
    .map(function(feature){
      return feature.set({'type': 'validation'});
    });
  var training_points = kwargs.sample.filter(ee.Filter.gte('rnd_1', kwargs.n_validation))
    .map(function(feature){
      return feature.set({'type': 'training'});
    });
  //   });
  // var validataion_buffers = test_points.map(function(feature){
  //   return feature.buffer(distance_m, 1);
  // });
  
  // var pot_training_points = kwargs.sample.filter(ee.Filter.gte('rnd_1', kwargs.n_validation));
  
  // var points_to_exclude = pot_training_points.filterBounds(validataion_buffers).map(function(feature){
  //     return feature.set({'type': 'exclude'});
  //   });
  
  // var keys_to_remove = points_to_exclude
  //   .aggregate_histogram('system:index')
  //   .keys();
  
  // var training_ids = pot_training_points.aggregate_histogram('system:index')
  //   .keys()
  //   .removeAll(keys_to_remove);

  // var training_points = pot_training_points.filter(ee.Filter.inList('system:index', training_ids))
  //   .map(function(feature){
  //     return feature.set({'type': 'training'});
  //   });

  return test_points.merge(training_points);
}


function split_training_validation_2(kwargs){
  var randomized = kwargs.sample.randomColumn('random', kwargs.seed);
  var distance_m = kwargs.distance * 1000;
  var training_points = randomized.filter(ee.Filter.gte('random', kwargs.n_validation))
    .map(function(feature){
      return feature.set({'type': 'training'});
    });
  
  var taining_buffers = training_points.map(function(feature){
    return feature.buffer(distance_m);
  });
  
  var pot_test_points = randomized.filter(ee.Filter.lt('random', kwargs.n_validation));
  
  var points_to_exclude = pot_test_points.filterBounds(taining_buffers)
    .aggregate_histogram('system:index')
    .keys();
  
  var test_ids = pot_test_points.aggregate_histogram('system:index')
    .keys()
    .removeAll(points_to_exclude);

  var test_points = pot_test_points.filter(ee.Filter.inList('system:index', test_ids))
    .map(function(feature){
      return feature.set({'type': 'test'});
    });

  return test_points.merge(training_points)
}



//----------------------------------------------------------------------------//
/**/ // Section 2: Model and Validation Functions

/*
agb_model

Train and predict the AGB model

key word arguments:
  1. n_trees: number of trees to use in the Random Forest Model (default: 100)
  2. n_vars_split: number of variables per split (defaul: sqrt of the number of variables)
  3. min_leaf: minimum leaf population (default: 1)
  4. bag_fraction: the fraction of input to bag per tree (default: 0.5)
  5. max_nodes: maximum number of nodes at each leaf (default: no limit)
  6. sample_scale: the scale to sample the predictors at
  7. predictor_image: ee.Image containing all the predictor variables
  8. training_points: point locations for training the sample

returns:
  Image: A predicted surface of carbon sequestration rates
*/

function agb_model(kwargs){
  
  var n_trees = kwargs.n_trees;
  n_trees =  ee.Algorithms.If(n_trees === null, 100, n_trees);
  
  var n_vars_split = kwargs.n_vars_split;
  n_vars_split =  ee.Algorithms.If(n_vars_split === null, null, n_vars_split);
  
  var min_leaf = kwargs.min_leaf;
  min_leaf =  ee.Algorithms.If(min_leaf === null, 1, min_leaf);
  
  var bag_fraction = kwargs.bag_fraction;
  bag_fraction =  ee.Algorithms.If(bag_fraction === null, 0.5, bag_fraction);
  
  var max_nodes = kwargs.max_nodes;
  max_nodes =  ee.Algorithms.If(max_nodes === null, null, max_nodes);
  
  var scale = kwargs.sample_scale;

  var predictor_image = kwargs.predictor_image;
  
  var predictor_bands = predictor_image.bandNames();
  
  var train_sample = predictor_image.sampleRegions({
    collection: kwargs.training_points,
    scale: kwargs.sample_scale,
    projection: 'EPSG:4326',
  });
  
  var model_train = ee.Classifier.smileRandomForest({
    numberOfTrees: n_trees,
    variablesPerSplit: n_vars_split,
    minLeafPopulation: min_leaf,
    bagFraction: bag_fraction,
    maxNodes: max_nodes
    })
      .setOutputMode('REGRESSION')
      .train({
        features: train_sample, 
        classProperty: 'carbon_seqr_rate_Mg_ha_yr',
        inputProperties: predictor_bands
      });
  
  return predictor_image.select(predictor_bands)
    .classify(model_train, 'cartRegression')
    .rename(kwargs.band_name)
    .set({
      'model': "smileRandomForest",
      'n_trees': n_trees,
      'n_vars_split': n_vars_split,
      'min_leaf': min_leaf,
      'bag_fraction': bag_fraction,
      'max_nodes': max_nodes,
    });
} 


/*
validate

Validates the model against training points, and the established model from
https://www.nature.com/articles/s41586-020-2686-x

key word arguments:
  1. gee_image: model outpuf from GEE workflow
  2. azure_image: model output from https://www.nature.com/articles/s41586-020-2686-x
  3. validation_points: independent points for validation
  4. sample_scale: the scale to sample the validation points
  5. print_chart: boolean; true: prints chart to console
  6. print_stats: boolean; true: print validation stats to console
  7. return_stats: boolean; true: return stats in feature collection for export

returns:
  Image: A predicted surface of carbon sequestration rates
*/

function validate(kwargs){
  var validation_image = kwargs.gee_image.addBands(kwargs.azure_image);
  var validation_poits = validation_image.sampleRegions({
    collection: kwargs.validation_points,
    scale: kwargs.sample_scale,
    projection: "EPSG:4326"
  });
  
  // var chart1 = ui.Chart.feature.byFeature({
  //   features: validation_poits,
  //   xProperty: 'carbon_seqr_rate_Mg_ha_yr',
  //   yProperties: ['azure_model', 'gee_model']
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
  //   features: validation_poits,
  //   xProperty: 'azure_model',
  //   yProperties: ['gee_model']
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
    
  //   if (kwargs.print_chart) {
  //     print(chart1);
  //     print(chart2);
  //   }
    
  var cor_gee = validation_poits.reduceColumns({
      reducer:ee.Reducer.pearsonsCorrelation(), 
      selectors: ['gee_model', 'carbon_seqr_rate_Mg_ha_yr']})
      .get('correlation');
  
  // var cor_azure = validation_poits.reduceColumns({
  //   reducer:ee.Reducer.pearsonsCorrelation(), 
  //   selectors: ['azure_model', 'carbon_seqr_rate_Mg_ha_yr']})
  //   .get('correlation');
  
  var reg_gee = ee.Array(validation_poits.reduceColumns({
      reducer:ee.Reducer.linearRegression(1,1), 
      selectors: ['gee_model', 'carbon_seqr_rate_Mg_ha_yr']})
       .get('residuals')).toList().get(0);
  
  // var reg_azure = ee.Array(validation_poits.reduceColumns({
  //   reducer:ee.Reducer.linearRegression(1,1), 
  //   selectors: ['azure_model', 'carbon_seqr_rate_Mg_ha_yr']})
  //   .get('residuals')).toList().get(0);
    
  // var cor_gee_azure = validation_poits.reduceColumns({
  //   reducer:ee.Reducer.pearsonsCorrelation(), 
  //   selectors: ['azure_model', 'gee_model']})
  //   .get('correlation');
  
  // var reg_gee_azure = ee.Array(validation_poits.reduceColumns({
  //     reducer:ee.Reducer.linearRegression(1,1), 
  //     selectors: ['azure_model', 'gee_model']})
  //     .get('residuals')).toList().get(0);

  // if (kwargs.print_stats) {
  //   print("Correlation: Test vs GEE — " + kwargs.print_mod, cor_gee);
  //   // print("Correlation: Test vs Azure — " + kwargs.print_mod, cor_azure);
  //   print("RMSE: Test vs GEE — " + kwargs.print_mod, reg_gee);
  //   // print("RMSE: Test vs Azure — " + kwargs.print_mod, reg_azure);
  //   // print("Correlation: GEE vs Azure — " + kwargs.print_mod, cor_gee_azure);
  //   // print("RMSE: GEE vs Azure — " + kwargs.print_mod, reg_gee_azure);
  // }
  
  // if (kwargs.return_stats) {
    return {
      "r": cor_gee,
      "rmse": reg_gee
    }
    // return ee.Feature(null, {
    //   "Cor: Test ~ GEE": cor_gee,
    //   "Cor: Test ~ Azure": cor_azure,
    //   "Cor: GEE ~ Azure": cor_gee_azure,
    //   "RMSE: Test ~ GEE": reg_gee,
    //   "RMSE: Test ~ Azure": reg_azure,
    //   "RMSE: GEE ~ Azure": reg_gee_azure
    // })//.copyProperties(kwargs.gee_image);
// }
}

/*
spatial_validation

key word arguments:

returns:

*/

function spatial_validation(kwargs){
  var randomized = kwargs.sample.randomColumn('random', kwargs.seed);
  var n_test = kwargs.percent_validation * 0.01;

  var distance_m = kwargs.distance * 1000;

  var test_points = randomized.filter(ee.Filter.lt('random', n_test));

  var predictors = kwargs.predictor_image; 
  var azure = kwargs.azure_image;
    
  var model_runs = test_points.map(function(point){
    var buffer = point.geometry().buffer(distance_m);
    var points_to_exclude = randomized.filterBounds(buffer)
      .aggregate_histogram('system:index')
      .keys();
      
    var training_ids = randomized.aggregate_histogram('system:index')
        .keys()
        .removeAll(points_to_exclude);
    
    var training_points = randomized.filter(ee.Filter.inList('system:index', training_ids));
    
    
    
    var model_run = agb_model({
      predictor_image: predictors,
      training_points: training_points,
      sample_scale: 1000,
      band_name: 'gee_model',
      n_trees: 150,
      n_vars_split: 2,
      min_leaf: null,
      bag_fraction: 0.5,
      max_nodes: null
    });
    
    var validation_image = model_run//.addBands(azure);

    var validation_point = validation_image.reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: point.geometry(),
      scale: 100,
      crs: 'EPSG:4326',
    });
    return ee.Feature(point.geometry(), validation_point).copyProperties(point)
      .set({'excl_distance_km': kwargs.distance});    
  });
  
  return ee.FeatureCollection(model_runs)
}



//----------------------------------------------------------------------------//
/**/ // Section 3: Parameter Testing


/*
model_pars_test

Test a one of parameters in the the random forest model, while holding others constant

key word arguments:
  1. parameter: string, parameter to test
  2. parameter_min: minimum value of parameter
  3. parameter_max: maximum value of parameter
  4. paretmeter_step: steps value between min and max
  5. sample_scale: the scale to sample the predictors at
  6. predictor_image: ee.Image containing all the predictor variables
  7. training_points: point locations for training the sample
  8. azure_image: model output from https://www.nature.com/articles/s41586-020-2686-x
  9. validation_points: independent points for validation
  10. sample_scale: the scale to sample the validation points
  11. print_chart: boolean; true: prints chart to console
  12. print_stats: boolean; true: print validation stats to console
  13. return_stats: boolean; true: return stats in feature collection for export

returns:
  a feature colleciton of statistics
*/

function model_pars_test(kwargs_a){
  var min_par = kwargs_a.parameter_min;
  var max_par = kwargs_a.parameter_max;
  var step_par = kwargs_a.parameter_step;
  
  var parameter_list = [];
  for (var i = min_par; i <= max_par; i+=step_par) {
    parameter_list.push(i);
  }
  
  var n_trees = kwargs_a.n_trees;
  var n_vars_split = kwargs_a.n_vars_split;
  var min_leaf = kwargs_a.min_leaf;
  var bag_fraction = kwargs_a.bag_fraction;
  var max_nodes = kwargs_a.max_nodes;


  var test = parameter_list.map(function(item){
    var parameter = ee.Number(item);
    if (kwargs_a.parameter == "n_trees") {
      n_trees = parameter.int();
    }  else if (kwargs_a.parameter == "n_vars_split") {
      n_vars_split = parameter.int();
    }  else if (kwargs_a.parameter == "min_leaf") {
      min_leaf = parameter.int();
    } else if (kwargs_a.parameter == "bag_fraction") {
      bag_fraction = parameter;
    } else if (kwargs_a.parameter == "max_nodes") {
      max_nodes = parameter.int();
    }
    
    var test_item = agb_model({
      predictor_image: kwargs_a.predictor_image,
      training_points: kwargs_a.training_points,
      sample_scale: kwargs_a.sample_scale,
      band_name: kwargs_a.band_name,
      n_trees: n_trees,
      n_vars_split: n_vars_split,
      min_leaf: min_leaf,
      bag_fraction: bag_fraction,
      max_nodes: max_nodes
    });
    
    var validate_model = validate({
      gee_image: test_item,
      azure_image: kwargs_a.azure_image,
      validation_points: kwargs_a.validation_points,
      sample_scale: kwargs_a.sample_scale,
      print_chart: kwargs_a.print_chart,
      print_stats: kwargs_a.print_stats,
      return_stats: kwargs_a.return_stats
    });
    return validate_model;
  });
  
  if (kwargs_a.return_stats) {
    return ee.FeatureCollection(test);
  }
}


/*
parameter search

Calculate statistics for every set of model parameters

key word arguments:
  1. collection: table of all model parameter combinations
  2. sample_scale: the scale to sample the predictors at
  3. predictor_image: ee.Image containing all the predictor variables
  4. training_points: point locations for training the sample
  5. azure_image: model output from https://www.nature.com/articles/s41586-020-2686-x
  6. validation_points: independent points for validation
  7. sample_scale: the scale to sample the validation points
  8. print_chart: boolean; true: prints chart to console
  9. print_stats: boolean; true: print validation stats to console
  10. return_stats: boolean; true: return stats in feature collection for export

returns:
  a feature colleciton of statistics
*/

function parameter_search(kwargs_a){  

  var parameter_map = kwargs_a.collection.map(function(feature){
    var n_trees = feature.get('n_trees');
    var n_vars = feature.get('n_vars');
    var n_leaf = feature.get('n_leaf');
    var n_bags = feature.get('n_bags');
    
    var test_item = agb_model({
      predictor_image: kwargs_a.predictor_image,
      training_points: kwargs_a.training_points,
      sample_scale: kwargs_a.sample_scale,
      band_name: kwargs_a.band_name,
      n_trees: n_trees,
      n_vars_split: n_vars,
      min_leaf: n_leaf,
      bag_fraction: n_bags,
      max_nodes: null
    });
    
    var validate_model = validate({
      gee_image: test_item,
      azure_image: kwargs_a.azure_image,
      validation_points: kwargs_a.validation_points,
      sample_scale: kwargs_a.sample_scale,
      print_chart: false,
      print_stats: false,
      return_stats: true
    });

  return ee.FeatureCollection(validate_model);
  })
  return parameter_map;
}



//----------------------------------------------------------------------------//
/**/ // Section 4: Script utils


/*
chart_test
create chart for parameter testing
*/

function chart_test(featureColleciton, property, h_axis){
  var chart1 = ui.Chart.feature.byFeature({
    features: featureColleciton,
    xProperty: property,
    yProperties: ['RMSE: Test ~ Azure', 'RMSE: Test ~ GEE']
  })
    .setSeriesNames(['Azure Model', 'GEE Model'])
    .setOptions({
      title: "Azure & GEE Models RMSE vs Test Data",
      hAxis: {
        title: h_axis
      },
      vAxis: {
        title: 'RMSE'
      },
    });
  return chart1;
}



/*
vis_pars
visualization parameters for predicted surfaces
*/
var vis_pars = {
  min: 0,
  max: 2,
  palette: ['613318', 'b99c6b', 'bdd09f', '668d3c', '404f24']
};


//----------------------------------------------------------------------------//
/**/ // Section 5: Function Exports

exports.agb_func = {
  'hot_encode': hot_encode,
  'remove_bands': remove_bands,
  'standardize_predictors': standardize_predictors,
  'split_training_validation': split_training_validation,
  'split_training_validation_2': split_training_validation_2,
  'agb_model': agb_model,
  'validate_model': validate,
  'spatial_validation': spatial_validation,
  'model_pars_test': model_pars_test,
  'parameter_search': parameter_search,
  'chart_test': chart_test,
  'vis_pars': vis_pars
};
