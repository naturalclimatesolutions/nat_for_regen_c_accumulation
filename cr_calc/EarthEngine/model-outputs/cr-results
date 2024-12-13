/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var aCollection = ee.ImageCollection("projects/ee-groa-carbon-accumulation/assets/cr_pars/A"),
    grid = ee.FeatureCollection("projects/ee-groa-carbon-accumulation/assets/grids/global_land_grid_5_deg"),
    kCollection = ee.ImageCollection("projects/ee-groa-carbon-accumulation/assets/cr_pars/K"),
    bCollection = ee.ImageCollection("projects/ee-groa-carbon-accumulation/assets/cr_pars/B"),
    geometry = /* color: #d63000 */ee.Geometry.Point([-92.25513731729382, 44.94448160803904]);
/***** End of imports. If edited, may not auto-convert in the playground. *****/
var a = aCollection.mosaic();
var k = kCollection.mosaic();
var b = bCollection.mosaic();
var m = 2/3;
var ages = ee.List.sequence(0, 200, 1);

var growth = calcCR(ages, a, k, b, m);

Map.addLayer(grid, null, "5 Deg Grid", false);

Map.addLayer(k, {min: 0.01, max:0.075, palette:visPars().k}, "K", true);
Map.addLayer(b, {min: 0.2, max:1, palette:["ffffe5","f7fcb9","d9f0a3","addd8e","78c679","41ab5d","238443","006837","004529"].reverse()}, "B", true);
Map.addLayer(a, {min:20, max:250, palette:["ffffe5","f7fcb9","d9f0a3","addd8e","78c679","41ab5d","238443","006837","004529"]}, "A", true);
Map.addLayer(growth, null, 'Growth', false);



var plot = ui.Chart.image.series({
  imageCollection: growth.select(['b1']),
  region: geometry,
  reducer: ee.Reducer.mean(),
  scale: 500,
  xProperty: 'age' 
}).setSeriesNames([ 'CR  Prediction'])
  .setOptions({
    title: 'Above Ground Carbon Accumulation',
    hAxis: {title: 'Age', titleTextStyle: {italic: false, bold: true}},
    vAxis: {
      title: 'AGC MgCha-1',
      titleTextStyle: {italic: false, bold: true},
      viewWindow: {min: 0, max: 300}
          },
    lineWidth: 2,
    colors: ['f0af07'],
    // curveType: 'function',
    // series: {
      // 0: {curveType: 'scatter'},
      // 1: {curveType: 'function', lineWidth: 3},
      // 2: {lineWidth: 1.5, lineDashStyle: [2, 2, 20, 2, 20, 2]}}
  });
  

print(plot);


function calcCR(t, A, K, B, M){
  var cr = ee.ImageCollection(t.map(function(age){
    age = ee.Number(age).int();
    var crEstimate = calcCrEstimate(age, A, K, B, M);
    return crEstimate.set({'age':age});
  }));
  return cr;
}

function calcCrEstimate(t, a, k, b, m){
  var cr = ee.Image().expression({
    expression: "a * pow(1-(b*exp(-k*t)), 1/(1-m))",
    map: {
      "t": t,
      "a": a,
      "k": k,
      "b": b,
      "m": m,
      "e": Math.E
    }
  }).float();
  return cr;
}

function visPars(){
 return {
   'k': ['040613', '292851', '3f4b96', '427bb7', '61a8c7', '9cd4da', 'eafdfd'],
   'a': ['yellow', 'green'],
   'b': ['yellow', 'green']
 };
}


// var cr = ee.ImageCollection(ages.map(function(age){
//   age = ee.Number(age).int();
//   var nullImage = ee.Image(0).selfMask().rename('actual');
//   var mean = linear.filter(ee.Filter.eq('age', age));
//   var t = mean.size();
//   var actual = ee.Image(
//     ee.Algorithms.If(t.eq(1), 
//     mean.first().select('mean').rename('actual'), 
//     nullImage));
    
//   var agc_max = ee.Image(amax).rename('max'); 
//   var age_image = ee.Image(age).rename('age');
//   var cr_estimate = cr_curve(amax, k, age, mPar, bPar);//
//   var cr_prev = cr_curve(amax, k, age.subtract(1), mPar, bPar);
//   var cr_post = cr_curve(amax, k, age.add(1), mPar, bPar);
//   var rate = cr_post.subtract(cr_prev).divide(2).rename('r_1');
//   var rate2 = cr_estimate.divide(age).rename('r_2');
  
//   return cr_estimate.addBands([agc_max, actual, rate, rate2, rate_30.rename('r_3'), npp.rename('r_4'), age_image])
//     .float()
//     .set({age: age});
// }));
