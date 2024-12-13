/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var plots = ee.FeatureCollection("projects/ee-groa-carbon-accumulation/assets/plot-data/sp_agg_split__0_2"),
    b = ee.Image("projects/ee-groa-carbon-accumulation/assets/cr_pars/b"),
    k = ee.Image("projects/ee-groa-carbon-accumulation/assets/cr_pars/k"),
    a = ee.Image("projects/ee-groa-carbon-accumulation/assets/cr_pars/a"),
    cp = ee.Image("projects/TNC_Africa/carbon/cook-patton-2021/sequestration_rate__mean__aboveground__full_extent__Mg_C_ha_yr"),
    gez = ee.FeatureCollection("projects/ee-groa-carbon-accumulation/assets/validation/GEZ_Continents"),
    geometry = /* color: #d63000 */ee.Geometry.Point([-82.59073188538028, 48.18399032089498]);
/***** End of imports. If edited, may not auto-convert in the playground. *****/
var base = require("users/NathanielPaulRobinson/TNC-GCS:carbon-accumulation-app/app-base").app;
var validation = plots.filter(ee.Filter.eq('type', 'validation'));
// print(validation.aggregate_histogram('age').keys())
var ages = base.calc.ageList(5,100,1);

var pars = a.addBands([b,k]).rename(['A','B', 'K']);

var ageStrings = ages.map(function(i){
  return ee.String(ee.Number(i).int())
})

// gez = gez.filterBounds(geometry)
// Map.addLayer(gez)

var test = ee.FeatureCollection(ages.map(function(age){
  var t1 = ee.Number(age);
  var t2 = t1.add(1);
  var est1 = base.calc.calcCrEstimate(t1, pars);
  var est2 = base.calc.calcCrEstimate(t2, pars);
  var newAccumulation = est2.subtract(est1);
  var stats = gez.map(function(ft){
    var reducer = ee.Reducer.mean().combine(ee.Reducer.percentile([5,50,95]),null,true)
    var zone = ft.get('gez_name');
    var cont = ft.get('CONTINENT');
    var stat = newAccumulation.reduceRegion({
      geometry: ft.geometry(),
      reducer: reducer,
      scale: 1000,
      crs: 'EPSG:4326',
      maxPixels: 1e10,
    });
    return ee.Feature(null, stat).set({
      'ez':zone, 
      'continent': cont,
      'age': age
    })
  })
  return stats
})).flatten()
 
  
// Export.table.toDrive({
//   collection: test,
//   folder: "Carbon_Accumulation",
//   fileNamePrefix: "rates_gez_na_tmp_cnt_for",
//   fileFormat: "CSV",
//   description: "rates_gez"
// })


// var output = forestGEZ.map(function(ez){
//   var zone = ez.get('gez_name');
//   var cont = ez.get('CONTINENT');
//   var data = rates.stratifiedSample({
//     numPoints: 1000,
//     classBand: 'mask',
//     region: ez.geometry(),
//     scale: 1000,
//     projection: 'EPSG:4326',
//     geometries: false
//   }).map(function(pt){
//     return pt.set({'ez':zone, 'continent': cont})
//   })
// var growth = base.calc.calcCR(ages, pars);
// Map.addLayer(growth)
// var rate = growth.map(function(img){
//   var age = ee.Number(img.get('age'))
//   return img.divide(age).set({'age': age})
// });

// var cr = ee.ImageCollection(ages.map(function(age){
//   age = ee.Number(age).int();
//   var nullImage = ee.Image(0).selfMask().rename('actual');
//   var mean = linear.filter(ee.Filter.eq('age', age));
//   var t = mean.size();
//   var actual = ee.Image(
//     ee.Algorithms.If(t.eq(1), 
//     mean.first().select('mean').rename('actual'), 
//     nullImage));
    
//   var agc_max = a.rename('max'); 
//   var age_image = ee.Image(age).rename('age');
//   var cr_estimate = cr_curve(a, k, age, mPar, b);//
//   var cr_prev = cr_curve(amax, k, age.subtract(1), mPar, bPar);
//   var cr_post = cr_curve(amax, k, age.add(1), mPar, bPar);
//   var rate = cr_post.subtract(cr_prev).divide(2).rename('r_1');
//   var rate2 = cr_estimate.divide(age).rename('r_2');
  
//   return cr_estimate.addBands([agc_max, actual, rate, rate2, rate_30.rename('r_3'), npp.rename('r_4'), age_image])
//     .float()
//     .set({age: age});
// }));



var test = ee.ImageCollection(ages.map(function(age){
  var t1 = ee.Number(age);
  var t2 = t1.add(1);
  var est1 = base.calc.calcCrEstimate(t1, pars);
  var est2 = base.calc.calcCrEstimate(t2, pars);
  var newAccumulation = est2.subtract(est1).rename('new_accumulation_rate');
  var annualRate = est1.divide(t1).rename('total_carbon_rate');
  
  return newAccumulation.addBands(annualRate).set({'age':t1})
}));


  
// var rate = growth.map(function(img){
//   var age = ee.Number(img.get('age'))
//   return img.divide(age).set({'age': age})
// });
// Map.addLayer(rate)

var mask = cp.gt(0).selfMask();

// Map.addLayer(mask)
// cp = cp.updateMask(mask);
// Map.addLayer(cp)
// var cpCompare = rate.filter(ee.Filter.lte('age', 30))
//   .mean()
//   .updateMask(mask);
var youngSecondary = test.filter(ee.Filter.lte('age', 20))
  .mean()
  .updateMask(mask);
var oldSecondary = test.filter(ee.Filter.gt('age', 20))
  .mean()
  .updateMask(mask);
  


// var cp_ee_diff = cp.subtract(cpCompare).divide(cp).multiply(100);

// Map.addLayer(cp_ee_diff, {min:-100, max:100, palette:['blue', 'white', 'red']})

var rates =  youngSecondary.addBands([oldSecondary, mask])
  .rename(['lte_20_new','lte_20_total','gt_20_new', 'gt_20_total','mask']);
  
Map.addLayer(rates)
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
    
// print(gez.aggregate_histogram('gez_name'))
var forestGEZ = gez.filter(ee.Filter.inList('gez_name', gezList))

// Map.addLayer(forestGEZ)
// print(forestGEZ.first())
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

Export.table.toDrive({
  collection: output,
  folder: 'Carbon_Accumulation',
  fileNamePrefix: 'agc_validation_ipcc_cp',
  description: 'agc_validation_ipcc_cp',
  fileFormat: 'CSV',
})

// // var validationSample = ee.FeatureCollection(ages.map(function(age){
// //   age = ee.Number(age);
// //   var predicted = base.calc.calcCrEstimate(age, pars);
// //   var points = validation.filter(ee.Filter.eq('age', age)).select(['agc_mgha', 'age']);
  
// //   var nPoints = points.size();
// //   var nullFC = ee.FeatureCollection(ee.Feature(null,
// //     { 'agc_mgha': 0,
// //       'age': age,
// //       'mean': 0
// //     }));
    
// //   var sample = ee.FeatureCollection(ee.Algorithms.If(
// //     nPoints.eq(0), 
// //     nullFC, 
// //     predicted.reduceRegions({
// //       collection: points,
// //       reducer: ee.Reducer.mean(),
// //       scale: 1000,
// //       crs: 'EPSG:4326'
// //     })
// //     ));
  
// //   return sample;
// // })).flatten();

// // Export.table.toDrive({
// //   collection: validationSample,
// //   folder: 'Carbon_Accumulation',
// //   fileNamePrefix: 'agc_validation',
// //   description: 'agc_validation',
// //   fileFormat: 'CSV',
  
// // })