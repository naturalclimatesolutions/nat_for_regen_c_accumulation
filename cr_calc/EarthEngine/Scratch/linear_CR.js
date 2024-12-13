/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var amax = ee.Image("projects/ee-groa-carbon-accumulation/assets/agc-max/pot_agc_mgha"),
    geometry = /* color: #d63000 */ee.Geometry.Point([-89.24752371692601, 19.248937154965027]);
/***** End of imports. If edited, may not auto-convert in the playground. *****/
var mPar = 2/3;
var bPar = 1;

var ids = [];
var actualAgeVals = [];

for(var i = 5; i<=100; i+=5){
  var path = "projects/ee-groa-carbon-accumulation/assets/agc_accumulation/age_" + i.toString();
  ids.push(path);
  actualAgeVals.push(path);
}


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
var x = linear.filter(ee.Filter.eq('age', 4)).size()



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
    
  var agc_max = ee.Image(amax).rename('max') 
  
  return cr_curve(amax, k, age, mPar, bPar).addBands([agc_max, actual]).float()
    .set({age: age});
}));


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
      titleTextStyle: {italic: false, bold: true}
          },
    lineWidth: 2,
    colors: ['f0af07', '76b349', '0f8755'],
    // curveType: 'function',
    series: {
      0: {curveType: 'scatter'},
      1: {curveType: 'function', lineWidth: 3},
      2: {lineWidth: 1.5, lineDashStyle: [2, 2, 20, 2, 20, 2]}}
  });

// 'f0af07', '0f8755', 
print(plot);


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

