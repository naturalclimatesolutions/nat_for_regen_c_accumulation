/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var plots = ee.FeatureCollection("projects/ee-groa-carbon-accumulation/assets/plot-data/sp_agg_split__0_2"),
    b = ee.Image("projects/ee-groa-carbon-accumulation/assets/cr_pars/b"),
    k = ee.Image("projects/ee-groa-carbon-accumulation/assets/cr_pars/k"),
    a = ee.Image("projects/ee-groa-carbon-accumulation/assets/cr_pars/a"),
    cp = ee.Image("projects/TNC_Africa/carbon/cook-patton-2021/sequestration_rate__mean__aboveground__full_extent__Mg_C_ha_yr"),
    gez = ee.FeatureCollection("projects/ee-groa-carbon-accumulation/assets/validation/GEZ_Continents");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
var base = require("users/NathanielPaulRobinson/TNC-GCS:carbon-accumulation-app/app-base").app;

var validation = plots.filter(ee.Filter.eq('type', 'validation'));
print(validation.aggregate_histogram('age').keys())
var ages = base.calc.ageList(5,60,1);
var pars = a.addBands([b,k]).rename(['A','B', 'K']);

var growth = base.calc.calcCR(ages, pars);
var rate = growth.map(function(img){
  var age = ee.Number(img.get('age'))
  return img.divide(age).set({'age': age})
});

var mask = cp.gt(0).selfMask();

Map.addLayer(mask)
cp = cp.updateMask(mask);
Map.addLayer(cp)
var cpCompare = rate.filter(ee.Filter.lte('age', 30))
  .mean()
  .updateMask(mask);
var youngSecondary = rate.filter(ee.Filter.lte('age', 20))
  .mean()
  .updateMask(mask);
var oldSecondary = rate.filter(ee.Filter.gt('age', 20))
  .mean()
  .updateMask(mask);
  


var cp_ee_diff = cp.subtract(cpCompare).divide(cp).multiply(100);

Map.addLayer(cp_ee_diff, {min:-100, max:100, palette:['blue', 'white', 'red']})

var rates = cp.addBands([cpCompare, youngSecondary, oldSecondary, mask])
  .rename(['cp', 'lte_30', 'lte_20','gt_20', 'mask']);
  
// Map.addLayer(rates)
var gezList = 
  [
    'Tropical rainforest',
    'Tropical moist forest',
    'Tropical dry forest',
    'Tropical mountain system',
    'Subtropical humid forest',
    'Subtropical mountain system',
    'Subtropical dry forest',
    'Temperate mountain system',
    'Temperate continental forest',
    'Temperate oceanic forest',
    'Boreal coniferous forest',
    'Boreal mountain system',
    'Boreal tundra woodland'
    ]
    
print(gez.aggregate_histogram('gez_name'))
var forestGEZ = gez.filter(ee.Filter.inList('gez_name', gezList))

Map.addLayer(forestGEZ)
print(forestGEZ.first())
var output = forestGEZ.map(function(ez){
  var zone = ez.get('gez_name');
  var cont = ez.get('CONTINENT');
  var data = rates.stratifiedSample({
    numPoints: 1000,
    classBand: 'mask',
    region: ez.geometry(),
    scale: 1000,
    projection: 'EPSG:4326',
    geometries: false
  }).map(function(pt){
    return pt.set({'ez':zone, 'continent': cont})
  })
  return data
  // return ee.Feature(null).set({'ez':zone, 'continent': cont})
}).flatten()

// Export.table.toDrive({
//   collection: output,
//   folder: 'Carbon_Accumulation',
//   fileNamePrefix: 'agc_validation_ipcc_cp',
//   description: 'agc_validation_ipcc_cp',
//   fileFormat: 'CSV',
  
// })

// var validationSample = ee.FeatureCollection(ages.map(function(age){
//   age = ee.Number(age);
//   var predicted = base.calc.calcCrEstimate(age, pars);
//   var points = validation.filter(ee.Filter.eq('age', age)).select(['agc_mgha', 'age']);
  
//   var nPoints = points.size();
//   var nullFC = ee.FeatureCollection(ee.Feature(null,
//     { 'agc_mgha': 0,
//       'age': age,
//       'mean': 0
//     }));
    
//   var sample = ee.FeatureCollection(ee.Algorithms.If(
//     nPoints.eq(0), 
//     nullFC, 
//     predicted.reduceRegions({
//       collection: points,
//       reducer: ee.Reducer.mean(),
//       scale: 1000,
//       crs: 'EPSG:4326'
//     })
//     ));
  
//   return sample;
// })).flatten();

// Export.table.toDrive({
//   collection: validationSample,
//   folder: 'Carbon_Accumulation',
//   fileNamePrefix: 'agc_validation',
//   description: 'agc_validation',
//   fileFormat: 'CSV',
  
// })