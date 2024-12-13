/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var predictors = ee.ImageCollection("projects/wri-datalab/CarbonSequestrationAI/PredictorVariables/PredictorVariablesCookPatton2020"),
    terra_clim = ee.Image("projects/TNC_Africa/Global-Forests/terra_clim_vars"),
    samples = ee.FeatureCollection("projects/TNC_Africa/carbon/plot_data/cl_sp_agg_plots_2"),
    cp_2020 = ee.Image("projects/TNC_Africa/carbon/cook-patton-2021/sequestration_rate__mean__aboveground__full_extent__Mg_C_ha_yr"),
    poi = /* color: #98ff00 */ee.Geometry.Point([24.148080736609042, -0.9500274725801952]),
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
    bin12 = ee.FeatureCollection("projects/TNC_Africa/carbon/plot_data/covariates_sample_bin_12");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
var ageToMap = 50;

var f_agb = require('users/NathanielPaulRobinson/TNC-GCS:base/agb-model-functions').agb_func;
var props = samples.first().propertyNames();
var complete = samples.filter(ee.Filter.notNull(props));


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
  
predictors = f_agb.remove_bands({
  image: predictors, 
  remove_list: bandsToRemove
})


var band_names = predictors.bandNames();

var band_names_bin = band_names.cat(['bin']);
var band_names_age = band_names.cat(['age']);


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


var binned_model_train = ee.Classifier.smileRandomForest({
  numberOfTrees: 100,
  minLeafPopulation: 5,
  maxNodes: 1000
  })
    .setOutputMode('REGRESSION')
    .train({
      features: training_points, 
      classProperty: 'agc_mgha',
      inputProperties: band_names_bin
});


var binnedSingleModel = binPredictBiomass(1,12,1);

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
var age_12 = predictors.addBands(ee.Image(12).rename('bin'));


var age_1_predict = age_1.classify(model_train_1, 'cartRegression').set({'age_class': 2.5});
var age_2_predict = age_2.classify(model_train_2, 'cartRegression').set({'age_class': 10});
var age_3_predict = age_3.classify(model_train_3, 'cartRegression').set({'age_class': 20});
var age_4_predict = age_4.classify(model_train_4, 'cartRegression').set({'age_class': 30});
var age_5_predict = age_5.classify(model_train_5, 'cartRegression').set({'age_class': 40});
var age_6_predict = age_6.classify(model_train_6, 'cartRegression').set({'age_class': 50});
var age_7_predict = age_7.classify(model_train_7, 'cartRegression').set({'age_class': 60});
var age_8_predict = age_8.classify(model_train_8, 'cartRegression').set({'age_class': 70});
var age_9_predict = age_9.classify(model_train_9, 'cartRegression').set({'age_class': 80});
var age_10_predict = age_10.classify(model_train_10, 'cartRegression').set({'age_class': 90});
var age_11_predict = age_11.classify(model_train_11, 'cartRegression').set({'age_class': 100});
var age_12_predict = age_12.classify(model_train_12, 'cartRegression').set({'age_class': 110});

var binnedInd = ee.ImageCollection([
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
  age_12_predict,
  ]
);

var training = complete.filter(ee.Filter.gt('random', 0.5));
// var young = training.filter(ee.Filter.lte('age', 30));

var trained_model_age = ee.Classifier.smileRandomForest({
  numberOfTrees: 100,
  minLeafPopulation: 5,
  maxNodes: 5000
  })
    .setOutputMode('REGRESSION')
    .train({
      features: training, 
      classProperty: 'agc_mgha',
      inputProperties: band_names_age
});


var agePredictions = predictBiomass(5, 100, 1);

// print(chart(binnedInd, 'age_class', 'AGC By Binned Age - Ind. Models'));
print(chart(binnedSingleModel, 'bin', 'AGC By Binned Age - Single Model'));
// print(chart(agePredictions.select('agc_mgha'), 'age', 'AGC By Age - Single Model'));

function binPredict(bin){
  var binImage = ee.Image(bin).rename('bin');
  var covariateImage = predictors.addBands(binImage);
  var prediction = covariateImage.classify(binned_model_train, 'cartRegression')
    .set({'bin': bin});
  return prediction
    .rename(['agc_mgha']);
}

function binPredictBiomass(age1, age2, step){
  var seq = ee.List.sequence(age1, age2, step);
  var predictions = ee.ImageCollection(seq.map(function(age){
    age = ee.Number(age);
    var prediction = binPredict(age);
    return prediction;
  }));
  return predictions;
}


function predict(age){
  var ageImage = ee.Image(age).rename('age');
  var covariateImage = predictors.addBands(ageImage);
  var prediction = covariateImage.classify(trained_model_age, 'cartRegression')
    .set({'age': age});
  var rate = prediction.divide(age)
  return prediction
    .addBands(rate)
    .rename(['agc_mgha', 'agc_mghayr']);
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
          curveType: 'function'
        });
  return plot;
}


var test = predict(ageToMap);


var vis_pars = {
  min: 0,
  max: 100,
  palette: ['613318', 'b99c6b', 'bdd09f', '668d3c', '404f24']
};

Map.addLayer(test.select(0), vis_pars)