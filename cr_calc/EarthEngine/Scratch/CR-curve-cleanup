/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var amax = ee.Image("projects/ee-groa-carbon-accumulation/assets/agc-max/pot_agc_mgha"),
    geometry = /* color: #d63000 */ee.Geometry.Point([22.96822748928016, 0.010239008738207983]),
    geometry2 = 
    /* color: #d63000 */
    /* shown: false */
    ee.Geometry.Polygon(
        [[[-180, 88],
          [0, 88],
          [180, 88],
          [180, -88],
          [0, -88],
          [-180, -88]]], null, false),
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
    rate_30 = ee.Image("projects/TNC_Africa/carbon/cook-patton-2021/sequestration_rate__mean__aboveground__full_extent__Mg_C_ha_yr"),
    plots = ee.FeatureCollection("projects/ee-groa-carbon-accumulation/assets/plot-data/sp_agg_plots_0_2"),
    training = ee.FeatureCollection("projects/wri-datalab/CarbonSequestrationAI/TrainingPoints/Train"),
    npp = ee.ImageCollection("MODIS/061/MOD17A3HGF");
/***** End of imports. If edited, may not auto-convert in the playground. *****/


var mPar = 2/3;
var bPar = 1;

var buffer = geometry.buffer(1000000, 10);
npp = npp.select('Npp')
  .mean()
  .multiply(0.0001)
  .divide(2)
  .multiply(0.001)
  .divide(0.0001)
  .rename('mod17_rate');
  
Map.addLayer(npp)
plots = plots.filterBounds(buffer);
training = training.filterBounds(buffer);
rate_30 = rate_30.rename('rate_30')

var test = plots.reduceColumns({
  reducer: ee.Reducer.linearFit(),
  selectors: ['age', 'agc_mgha']
})
var test2 = training.reduceColumns({
  reducer: ee.Reducer.linearFit(),
  selectors: ['stand_age', 'total_AGC_Mg_ha']
})
// print(test);
// print(test2);



var percentOfMaxBiomass = 90;
var plotMax = 300;
var ids = [];
var actualAgeVals = [];

for(var i = 5; i<=100; i+=5){
  var path = "projects/ee-groa-carbon-accumulation/assets/agc_accumulation/age_" + i.toString();
  ids.push(path);
  actualAgeVals.push(path);
}

var maxPredicted = ee.ImageCollection(ids.map(function(id){
  var collection = ee.ImageCollection(id);
  var ageInt = ee.Number(collection.first().get('age')).int();
  var age = ee.Image(ageInt).rename('x').float();
  var reducer = ee.Reducer.mean();
  var mean = collection.reduce(reducer).rename('mean');
  return mean.set({age: ageInt});
})).max();

amax = maxPredicted.addBands(amax).reduce(ee.Reducer.max()).rename('b1');



var linear = ee.ImageCollection(ids.map(function(id){
  var collection = ee.ImageCollection(id);
  var ageInt = ee.Number(collection.first().get('age')).int()
  var age = ee.Image(ageInt).rename('x').float();
  var reducer = ee.Reducer.mean();
  var mean = collection.reduce(reducer).rename('mean');
  var y = calcY(mean, amax, mPar, bPar);
  return age.addBands(y).addBands(mean).set({age: ageInt});
}));

var k = linear.select(['x','y']).reduce(ee.Reducer.linearFit()).select('scale');
// var x = linear.filter(ee.Filter.eq('age', 4)).size()

var ages = ee.List.sequence(0, 300, 1);

var cr = ee.ImageCollection(ages.map(function(age){
  age = ee.Number(age).int();
  var nullImage = ee.Image(0).selfMask().rename('actual');
  var mean = linear.filter(ee.Filter.eq('age', age));
  var t = mean.size();
  var actual = ee.Image(
    ee.Algorithms.If(t.eq(1), 
    mean.first().select('mean').rename('actual'), 
    nullImage));
    
  var agc_max = ee.Image(amax).rename('max'); 
  var age_image = ee.Image(age).rename('age');
  var cr_estimate = cr_curve(amax, k, age, mPar, bPar);//
  var cr_prev = cr_curve(amax, k, age.subtract(1), mPar, bPar);
  var cr_post = cr_curve(amax, k, age.add(1), mPar, bPar);
  var rate = cr_post.subtract(cr_prev).divide(2).rename('r_1');
  var rate2 = cr_estimate.divide(age).rename('r_2');
  
  return cr_estimate.addBands([agc_max, actual, rate, rate2, rate_30.rename('r_3'), npp.rename('r_4'), age_image])
    .float()
    .set({age: age});
}));


var maxEstimate = cr.select(0).reduce(ee.Reducer.max());
var percentOfMax = maxEstimate.multiply(percentOfMaxBiomass/100);

var ageOfPercentOfMax = cr.map(function(img){
  var agc = img.select('b1');
  var age = img.select('age');
  var test = agc.gte(percentOfMax);
  age = age.updateMask(test);
  return age.copyProperties(img);
}).min()


var ageOfMaximumGrowthRate = cr.select(['r_1', 'age']).qualityMosaic('r_1');
// Map.addLayer(image)
Map.addLayer(ageOfMaximumGrowthRate.select('age'), {min: 10, max: 150, palette:['#00204C', '#213D6B', '#555B6C', '#7B7A77', '#A59C74', '#D3C064', '#FFE945']}, 'Age of Inflection');
Map.addLayer(ageOfMaximumGrowthRate.select('r_1'), {min: 0, max: 3, palette:['#060303', '#620100', '#B20022', '#DE2007', '#D78E00', '#C9CE00', '#F2F2B7']}, 'Rate at Inflection');
// Map.addLayer(ageOfPercentOfMax.select('age'), {min: 50, max: 250, palette:['#00204C', '#213D6B', '#555B6C', '#7B7A77', '#A59C74', '#D3C064', '#FFE945']}, 'Age to reach ' + percentOfMaxBiomass.toString() + ' % carbon accumulation' );
// Export.image.toDrive({
//   image: ageOfPercentOfMax,
//   region: gBounds,
//   folder: 'eeTemp',
//   fileNamePrefix: 'age_at_90_perecent',
//   description: 'age_at_90_perecent',
//   crs: 'EPSG:4326',
//   scale: 1000,
//   maxPixels: 1e10
// })

var plot = ui.Chart.image.series({
  imageCollection: cr.select(['b1', 'max', 'actual']),
  region: geometry,
  reducer: ee.Reducer.mean(),
  scale: 500,
  xProperty: 'age' 
}).setSeriesNames([ 'RF Prediction', 'CR  Prediction', 'Max Potential'])
  .setOptions({
    title: 'Above Ground Carbon Accumulation',
    hAxis: {title: 'Age', titleTextStyle: {italic: false, bold: true}},
    vAxis: {
      title: 'AGC MgCha-1',
      titleTextStyle: {italic: false, bold: true},
      viewWindow: {min: 0, max: plotMax}
          },
    lineWidth: 2,
    colors: ['f0af07', '76b349', '0f8755'],
    // curveType: 'function',
    series: {
      0: {curveType: 'scatter'},
      1: {curveType: 'function', lineWidth: 3},
      2: {lineWidth: 1.5, lineDashStyle: [2, 2, 20, 2, 20, 2]}}
  });


var plotRate = ui.Chart.image.series({
  imageCollection: cr.select(['r_1', 'r_2', 'r_3', 'r_4']),
  region: geometry,
  reducer: ee.Reducer.mean(),
  scale: 500,
  xProperty: 'age' 
}).setSeriesNames(['Local Rate', 'Annual Rate', '30 Year Rate', 'MOD17 Rate'])
  .setOptions({
    title: 'Above Ground Carbon Accumulation Rate',
    hAxis: {title: 'Age', titleTextStyle: {italic: false, bold: true}},
    vAxis: {
      title: 'AGC MgCha-1 year-1',
      titleTextStyle: {italic: false, bold: true},
      viewWindow: {min: 0, max: 6}
          },
    lineWidth: 2,
    // colors: ['f0af07', '76b349'],
    curveType: 'function'
  });



print(plot);
print(plotRate);


function cr_curve(a,k,t,m,b){
  var cr = ee.Image().expression({
    expression: "a * pow(1-(b*exp(-k*t)), 1/(1-m))",
    map: {
      "a": a,
      "k": k,
      "t": t,
      "m": m,
      "b": b,
      "e": Math.E
    }
  }).float();
  return cr
}

// y' = ln((Amax^(1/c))  * b) - ln((Amax^(1/c)) - (y^(1/c)))
function calcY(image, max, m, b) {
  return  image.expression(
    'log((a ** (1 / (1/(1 - m)))) * b) - log((a ** (1 / (1/(1 - m)))) - (y ** (1 / (1/(1 - m)))))', {
      'y': image,
      'a': max,
      'm': m,
      'b': b
  }).rename('y');
}


//It sieems to me that b and K optimization could be done in two separate steps
// 1. k the slope of the ctuve.
// 2. with the result of 1 fixed, lest regress with b (It moves left or right
// the fitted function like the order of a regression)


//y2=-(y/Amax)^1/c, where x' will be exp^(-kt) and "b" is the varaible we want to minimize 

function calcY2(image, max, m) {
  return  image.expression(
    '1-(y/a)**(1 / (1/(1 - m)))', {
      'y': image,
      'a': max,
      'm': m
  }).rename('y2');
}


//
var linear2 = ee.ImageCollection(ids.map(function(id){
  var collection = ee.ImageCollection(id);
  var ageInt = ee.Number(collection.first().get('age')).int()
  var x2 = ee.Image(ageInt).multiply(k).multiply(ee.Image(-1)).exp().rename('x2').float();
  var reducer = ee.Reducer.mean();
  var mean = collection.reduce(reducer).rename('mean');
  var y = calcY2(mean, amax, mPar);
  return x2.addBands(y).addBands(mean).set({age: ageInt});
}));

var bfit = linear2.select(['x2','y2']).reduce(ee.Reducer.linearFit()).select('scale');


var cr2 = ee.ImageCollection(ages.map(function(age){
  age = ee.Number(age).int();
  var nullImage = ee.Image(0).selfMask().rename('actual');
  var mean = linear.filter(ee.Filter.eq('age', age));
  var t = mean.size();
  var actual = ee.Image(
    ee.Algorithms.If(t.eq(1), 
    mean.first().select('mean').rename('actual'), 
    nullImage));
    
  var agc_max = ee.Image(amax).rename('max'); 
  var age_image = ee.Image(age).rename('age');

  // var age_image = ee.Image(age).rename('age');
  var cr_estimate = cr_curve(amax, k, age, mPar, bfit);
  var cr_prev = cr_curve(amax, k, age.subtract(1), mPar, bfit);
  var cr_post = cr_curve(amax, k, age.add(1), mPar, bfit);
  var rate = cr_post.subtract(cr_prev).divide(2).rename('r_1');
  var rate2 = cr_estimate.divide(age_image).rename('r_2');
  return cr_estimate.addBands([agc_max, actual, rate, rate2, rate_30.rename('r_3'), npp.rename('r_4'), age_image ]).float()
    .set({age: age});
}));


var plot2 = ui.Chart.image.series({
  imageCollection: cr2.select(['b1', 'max', 'actual']),
  region: geometry,
  reducer: ee.Reducer.mean(),
  scale: 500,
  xProperty: 'age' 
}).setSeriesNames([ 'RF Prediction', 'CR  Prediction', 'Max Potential'])
  .setOptions({
    title: 'Above Ground Carbon Accumulation 2nd fit',
    hAxis: {title: 'Age', titleTextStyle: {italic: false, bold: true}},
    vAxis: {
      title: 'AGC MgCha-1',
      titleTextStyle: {italic: false, bold: true},
      viewWindow: {min: 0, max: plotMax}
          },
    lineWidth: 2,
    colors: ['f0af07', '76b349', '0f8755'],
    // curveType: 'function',
    series: {
      0: {curveType: 'scatter'},
      1: {curveType: 'function', lineWidth: 3},
      2: {lineWidth: 1.5, lineDashStyle: [2, 2, 20, 2, 20, 2]}}
  });

var plotRate2 = ui.Chart.image.series({
  imageCollection: cr2.select(['r_1', 'r_2', 'r_3', 'r_4']),
  region: geometry,
  reducer: ee.Reducer.mean(),
  scale: 500,
  xProperty: 'age' 
}).setSeriesNames(['Local Rate', 'Annual Rate', '30 Year Rate', 'MOD17 Rate'])
  .setOptions({
    title: 'Above Ground Carbon Accumulation Rate',
    hAxis: {title: 'Age', titleTextStyle: {italic: false, bold: true}},
    vAxis: {
      title: 'AGC MgCha-1 year-1',
      titleTextStyle: {italic: false, bold: true},
      viewWindow: {min: 0, max: 6}
          },
    lineWidth: 2,
    // colors: ['f0af07','76b349', ],
    curveType: 'function'
  });



var avg_30 = cr2.filter(ee.Filter.lte('age', 30)).select('r_2', 'r_3').mean();

Map.addLayer(avg_30)

print(plot2);
print(plotRate2);
// Global number - 
// peak sequestration rate - global mean and average

// 2050 - climate netruel theoretical curve from
// new forest/ 10 year old, 20, 30.....
// you have a 100 ha, to play with.

// sensitivity test

//  

// Map.addLayer(k, {min: 0, max: 0.1, palette: ['331418', '682325', '973b1c', 'b66413', 'cb921a', 'dac62f', 'e1fd4b']})
// Map.addLayer(amax, {min: 0, max: 200, palette: ['331418', '682325', '973b1c', 'b66413', 'cb921a', 'dac62f', 'e1fd4b']})

