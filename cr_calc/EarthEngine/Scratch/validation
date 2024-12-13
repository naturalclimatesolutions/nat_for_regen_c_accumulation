/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var congo = ee.FeatureCollection("projects/ee-groa-carbon-accumulation/assets/validation/congo_forest_single"),
    borneo = ee.FeatureCollection("projects/ee-groa-carbon-accumulation/assets/validation/borneo_and_islands_reproj"),
    a = ee.Image("projects/ee-groa-carbon-accumulation/assets/cr_pars/a"),
    b = ee.Image("projects/ee-groa-carbon-accumulation/assets/cr_pars/b"),
    k = ee.Image("projects/ee-groa-carbon-accumulation/assets/cr_pars/k"),
    amazon = ee.FeatureCollection("projects/ee-groa-carbon-accumulation/assets/validation/amazon_basin"),
    mo = ee.Image("projects/ee-groa-carbon-accumulation/assets/validation/Full_TGB_potential_Map_ensembled_mean_merged"),
    philipePars = ee.Image("projects/ee-groa-carbon-accumulation/assets/validation/fire_para"),
    a_org = ee.ImageCollection("projects/ee-groa-carbon-accumulation/assets/cr_pars/A"),
    b_org = ee.ImageCollection("projects/ee-groa-carbon-accumulation/assets/cr_pars/B"),
    k_org = ee.ImageCollection("projects/ee-groa-carbon-accumulation/assets/cr_pars/K"),
    convergence = ee.Image("projects/ee-groa-carbon-accumulation/assets/cr_pars/convergence"),
    a_error = ee.Image("projects/ee-groa-carbon-accumulation/assets/cr_pars/a-std-error"),
    b_error = ee.Image("projects/ee-groa-carbon-accumulation/assets/cr_pars/b-std-error"),
    k_error = ee.Image("projects/ee-groa-carbon-accumulation/assets/cr_pars/k-std-error"),
    borneoTemp = ee.Image("projects/ee-groa-carbon-accumulation/assets/validation/borneo_MaxTemp_mask"),
    congoTemp = ee.Image("projects/ee-groa-carbon-accumulation/assets/validation/congo_MaxTemp_mask"),
    forestAOO = ee.ImageCollection("projects/ee-kurtfesenmyer/assets/Reforestation/Inputs/potential_forest"),
    amazonTemp = ee.Image("projects/ee-groa-carbon-accumulation/assets/validation/amazon_basin_MaxTemp_mask"),
    plots = ee.FeatureCollection("projects/ee-groa-carbon-accumulation/assets/plot-data/sp_agg_split__0_2");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
var pars = a.addBands([b, k]).rename(['A', 'B', 'K']);
var validationPlots = plots.filter(ee.Filter.eq('type', 'validation'));

var parsOrg = a_org.mosaic()
  .addBands(b_org.mosaic())
  .addBands(k_org.mosaic())
  .rename(['A', 'B', 'K']);
  
var parsPhilipe = philipePars.select([0,1,2])
  .rename('A', 'tau', 'c').updateMask(philipePars.select(3).lte(0.4)).selfMask()

forestAOO = forestAOO.mosaic();
forestAOO = forestAOO.eq(2).or(forestAOO.eq(3)).selfMask();
pars = pars.updateMask(forestAOO);

  
var heinrichPars = {
  'borneo' : {
    "A" : 121.1739,
    "k" : 0.026406,
    "c" : 0.95896
  },
  'brazil' : {
    "A" : 121.0104,
    "k" : 0.01297,
    "c" : 0.671297
  },
  'congo' : {
    "A" : 116.617,
    "k" : 0.022315,
    "c" : 0.767582
  }
};

var ages = ageList(1, 100, 1);

function classifyTemp(temp, low, high){
  var lowImg = temp.lt(low).multiply(1).selfMask();
  var medImg = temp.gte(low).and(temp.lt(high)).multiply(2).selfMask();
  var highImg = temp.gte(high).multiply(3).selfMask();
  
  return lowImg.addBands([medImg, highImg]).reduce(ee.Reducer.max())
}


congoTemp = classifyTemp(congoTemp, 299, 304)
amazonTemp = classifyTemp(amazonTemp, 310, 320)
borneoTemp = classifyTemp(borneoTemp, 310, 315)


function validationData(region, temp, points, fileName, folder){
  
  var regionalPars = pars.addBands(temp.rename('temp'));
  
  var validationPars = regionalPars.stratifiedSample({
    numPoints: points,
    classBand: 'temp',
    region: region,
    scale: 500,
    projection: 'EPSG:4326'
  });
  
  // return validationPars
  // var validationPts = ee.FeatureCollection.randomPoints({
  //   region: region,//.geometry(),
  //   points: points
  // });
  
  
  // var validationPars = pars.reduceRegions({
  //   collection: validationPts,
  //   reducer: ee.Reducer.mean(),
  //   scale: 500,
  //   crs: "EPSG:4326"
  // });
  
  Export.table.toDrive({
    collection: validationPars,
    fileNamePrefix: fileName,
    description: fileName,
		fileFormat: 'CSV',
		folder: 'Carbon_Accumulation'
  })
}


// var cngPars = validationData(congo, congoTemp, 100, 'congo_temp_cr_pars_100');
// var borPars = validationData(borneo, borneoTemp, 100, 'borneo_temp_cr_pars_100');
// var amzPars = validationData(amazon, amazonTemp, 100, 'amazon_temp_cr_pars_100');



var viz_original = calcCrEstimate(50, parsOrg);
var viz_updated = calcCrEstimate(50, pars);

// Map.addLayer(viz_original, {min:0, max:200, palette: ["ffffcc","d9f0a3","addd8e","78c679","41ab5d","238443","005a32"]}, "original");
// Map.addLayer(viz_updated, {min:0, max:200, palette: ["ffffcc","d9f0a3","addd8e","78c679","41ab5d","238443","005a32"]}, "updated");
// Map.addLayer(convergence, {min:1, max:4, palette: ["a0c04d","A88701","e39717","c95c1a"]}, "convergence");
// Map.addLayer(a_error, {min:0.25, max:20, palette: ["a0c04d","A88701","e39717","c95c1a"]}, "a_error", false);
// Map.addLayer(b_error, {min:0.002, max:0.03, palette: ["a0c04d","A88701","e39717","c95c1a"]}, "b_error", false);
// Map.addLayer(k_error, {min:0.0003, max:0.0027, palette: ["a0c04d","A88701","e39717","c95c1a"]}, "k_error", false);

var CR = ee.ImageCollection(ages.map(function(age){
  age = ee.Number(age);
  var est1 = calcCrEstimate(age, pars)
    .rename('est_1')
  var est2 = calcCrPhilipe(age, parsPhilipe).divide(2)
    .rename('est_2')
  return est1.addBands(est2)
    .set({'age': age})
}))


// Map.addLayer(CR)
// var carbon = ee.FeatureCollection(ages.map(function(age){
//   age = ee.Number(age);
//   var violaEstimates = calcCrHeinrich(age, validationPars.congo.A, validationPars.congo.k, validationPars.congo.c)
//   violaEstimates = ee.Feature(null, {'age': age, 'est': violaEstimates, 'id':'cng_val'})
//   var congoEstimates = congoPars.map(function(pars){
//     var A = pars.get('A');
//     var B = pars.get('B');
//     var K = pars.get('K');
//     var est = calcCrEstimateNumber(age, A, B, K);
//     var id = pars.get('system:index');
//     return ee.Feature(null, {age: age, est: est, id:id});
//   })
//   return congoEstimates.merge(violaEstimates);
// })).flatten()


// print(carbon)

function calcCrHeinrich(t, A, c, k){
  var cr = ee.Number.expression({
    expression: "a * pow(1-exp(-k*t), c)",
    vars: {
      "t": t,
      "a": A,
      "k": k,
      "c": c,
      "e": Math.E
    }
  });
  return cr;
}

function calcCrEstimate(t, parImage){
  var cr = ee.Image().expression({
    expression: "a * pow(1-(b*exp(-k*t)), 1/(1-m))",
    map: {
      "t": t,
      "a": parImage.select('A'),
      "k": parImage.select('K'),
      "b": parImage.select('B'),
      "m": 2/3,
      "e": Math.E
    }
  }).float();
  return cr.rename('AGC');
}

function calcCrPhilipe(t, parImage){
  var cr = ee.Image().expression({
    expression: "a * pow(1-exp(-t/tau), c)",
    map: {
      "t": t,
      "a": parImage.select('A'),
      "tau": parImage.select('tau'),
      "c": parImage.select('c'),
      "e": Math.E
    }
  }).float();
  return cr.rename('AGC');
}

function calcCrEstimateNumber(t, a, b, k){
  var cr = ee.Number.expression({
    expression: "a * pow(1-(b*exp(-k*t)), 1/(1-m))",
    vars: {
      "t": t,
      "a": a,
      "k": k,
      "b": b,
      "m": 2/3,
      "e": Math.E
    }
  });
  return cr;
}

function ageList(start, end, by){
  var defaultAges = ee.List.sequence(1, 100, 1);
  
  if (start>=0) {
    return ee.List.sequence(start, end, by);
  } else {
    return defaultAges;
  }
}