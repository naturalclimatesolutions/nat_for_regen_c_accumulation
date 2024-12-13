/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var geometry = /* color: #d63000 */ee.Geometry.Point([-75.17885065680406, 41.88954120641574]),
    plots = ee.FeatureCollection("projects/ee-groa-carbon-accumulation/assets/plot-data/sp_agg_split_std_0_1");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
var buffer = geometry.buffer(100000);
var test = plots.filterBounds(buffer)
  .filter(ee.Filter.eq('type', 'test'));

var ids = [];

for(var i = 5; i<=100; i+=5){
  var path = "projects/ee-groa-carbon-accumulation/assets/agc_accumulation/age_" + i.toString()
  ids.push(path)
}


var agc_by_age_raw = ee.ImageCollection(ids.map(function(id){
  var collection = ee.ImageCollection(id);
  var age = collection.first().get('age')
  var reducer = ee.Reducer.mean().combine(
    ee.Reducer.stdDev(), null, true).combine(
    ee.Reducer.percentile([5,95]), null, true);

  var image = collection.toBands().set({age: age})
  return image  
}))

Map.addLayer(agc_by_age_raw, null, 'agc by age', false)

var agc_by_age = ee.ImageCollection(ids.map(function(id){
  var collection = ee.ImageCollection(id);
  var age = collection.first().get('age')
  var reducer = ee.Reducer.mean().combine(
    ee.Reducer.stdDev(), null, true).combine(
    ee.Reducer.percentile([5,95]), null, true);
  var image = collection.reduce(reducer)
  var pts = test.filter(ee.Filter.eq('age', age))
  var mean = pts.reduceColumns({
    reducer: ee.Reducer.mean(),
    selectors: ['agc_mgha']
  })//.get('mean')
  
  var errorRatio = image.select('agc_stdDev')
    .divide(image.select('agc_mean'))
    .rename('error_ratio')
  return image.addBands(errorRatio).set({age: age});
}))

var error_chart = ui.Chart.image.series({
  imageCollection: agc_by_age.select('error_ratio'),
  region: geometry,
  reducer: ee.Reducer.mean(),
  scale: 1000,
  xProperty: 'age'
}).setOptions({
    title: 'Error Ratio through Time',
    hAxis: {title: 'AGE', titleTextStyle: {italic: false, bold: true}},
    vAxis: {
      title: 'Error Ratio (stdDev / mean agc)',
      titleTextStyle: {italic: false, bold: true}
    },
    colors: [ '#B73239'],
    curveType: 'function',
    series: {
      0: {lineWidth: 3}
    }
  });



var agc_chart = ui.Chart.image.series({
  imageCollection: agc_by_age.select(['agc_p5','agc_mean', 'agc_p95']),
  region: geometry,
  reducer: ee.Reducer.mean(),
  scale: 1000,
  xProperty: 'age'
}).setSeriesNames(['Mean AGC', '5 percentile', '95th percentile'])
  .setOptions({
    title: 'Mean AGC Accumulation through Time',
    hAxis: {title: 'AGE', titleTextStyle: {italic: false, bold: true}},
    vAxis: {
      title: 'AGC Mg C ha-1',
      titleTextStyle: {italic: false, bold: true}
    },
    colors: [ '76b349','f0af07', '0f8755',],
    curveType: 'function',
    series: {
      0: {lineWidth: 3},
      1: {lineWidth: 1.5, lineDashStyle: [2, 2, 20, 2, 20, 2]},
      2: {lineWidth: 1.5, lineDashStyle: [2, 2, 20, 2, 20, 2]}
    }
  });
print(agc_chart);
print(error_chart);