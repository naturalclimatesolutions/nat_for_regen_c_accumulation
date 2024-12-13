/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var cr_a = ee.ImageCollection("projects/ee-groa-carbon-accumulation/assets/cr_pars/A"),
    cr_b = ee.ImageCollection("projects/ee-groa-carbon-accumulation/assets/cr_pars/B"),
    cr_k = ee.ImageCollection("projects/ee-groa-carbon-accumulation/assets/cr_pars/K"),
    geometry = /* color: #d63000 */ee.Geometry.Point([27.619657354260106, 0.3009848782597235]),
    g = ee.FeatureCollection("projects/ee-groa-carbon-accumulation/assets/grids/global_land_grid_5_deg");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
Map.addLayer(g)
cr_a = cr_a.mosaic().float();
cr_b = cr_b.mosaic().float();
cr_k = cr_k.mosaic().float();

var ids = [];
for(var i = 5; i<=100; i+=5){
  var path = "projects/ee-groa-carbon-accumulation/assets/agc_accumulation/age_" + i.toString();
  ids.push(path);
  // actualAgeVals.push(path);
}

var rf = ee.ImageCollection(ids.map(function(id){
  var collection = ee.ImageCollection(id);
  var ageInt = ee.Number(collection.first().get('age')).int()
  var age = ee.Image(ageInt).rename('x').float();
  var reducer = ee.Reducer.mean();
  var mean = collection.reduce(reducer).rename('mean');
  return age.addBands(mean).set({age: ageInt});
}));

var ages = ee.List.sequence(0, 300, 1);

var cr = ee.ImageCollection(ages.map(function(age){
  age = ee.Number(age).int();
  var nullImage = ee.Image(0).selfMask().rename('actual');
  var mean = rf.filter(ee.Filter.eq('age', age));
  var t = mean.size();
  var actual = ee.Image(
    ee.Algorithms.If(t.eq(1), 
    mean.first().select('mean').rename('actual'), 
    nullImage));
    
  var age_image = ee.Image(age).rename('age');
  var cr_estimate = cr_curve(cr_a, cr_k, age, 2/3, cr_b);//
  
  return cr_estimate.addBands([actual])
    .float()
    .set({age: age});
}));

var plot = ui.Chart.image.series({
  imageCollection: cr.select(['b1', 'actual']),
  region: geometry,
  reducer: ee.Reducer.mean(),
  scale: 500,
  xProperty: 'age' 
}).setSeriesNames([ 'RF Prediction', 'CR  Prediction'])
  .setOptions({
    title: 'Above Ground Carbon Accumulation',
    hAxis: {title: 'Age', titleTextStyle: {italic: false, bold: true}},
    vAxis: {
      title: 'AGC MgCha-1',
      titleTextStyle: {italic: false, bold: true},
      viewWindow: {min: 0, max: 250}
          },
    lineWidth: 2,
    colors: ['f0af07', '76b349', '0f8755'],
    // curveType: 'function',
    series: {
      0: {curveType: 'scatter'},
      1: {curveType: 'function', lineWidth: 3}}
  });

print(plot)



function cr_curve(a, k, t, m, b){
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
