/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var a = ee.Image("projects/ee-groa-carbon-accumulation/assets/cr_pars/a"),
    a_e = ee.Image("projects/ee-groa-carbon-accumulation/assets/cr_pars/a-std-error"),
    b = ee.Image("projects/ee-groa-carbon-accumulation/assets/cr_pars/b"),
    b_e = ee.Image("projects/ee-groa-carbon-accumulation/assets/cr_pars/b-std-error"),
    k = ee.Image("projects/ee-groa-carbon-accumulation/assets/cr_pars/k"),
    k_e = ee.Image("projects/ee-groa-carbon-accumulation/assets/cr_pars/k-std-error"),
    table = ee.FeatureCollection("projects/ee-groa-carbon-accumulation/assets/validation/GEZ_Continents"),
    gez = ee.FeatureCollection("projects/ee-groa-carbon-accumulation/assets/validation/GEX_Continents_Simp"),
    plots = ee.FeatureCollection("projects/ee-groa-carbon-accumulation/assets/plot-data/sp_agg_split__0_2"),
    ecoregions = ee.FeatureCollection("RESOLVE/ECOREGIONS/2017"),
    geometry = /* color: #d63000 */ee.Geometry.Point([23.077881959933734, -1.0528826705565162]),
    forest = ee.Image("projects/ee-groa-carbon-accumulation/assets/potential_forest"),
    countries = ee.FeatureCollection("projects/SCL/v1/source/esri_countries_generalized"),
    pot_forest = ee.Image("projects/ee-groa-carbon-accumulation/assets/potential_forest"),
    ecoregionImg = ee.Image("projects/SCL/v1/source/resolve-ecoregion-img");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
var gBounds = ee.Geometry.Polygon([-180, 88, 0, 88, 180, 88, 180, -88, 0, -88, -180, -88], null, false);
// var reforestation = ee.ImageCollection('projects/ee-kurtfesenmyer/assets/Reforestation/Inputs/potential_forest');
// var re_proj = reforestation.first().projection();
// reforestation = reforestation.mosaic().setDefaultProjection(re_proj);
// reforestation = reforestation.eq(2).or(reforestation.eq(3)).selfMask();
// var reforestation = pot_forest.gt(0).selfMask();
var reforestation = ecoregionImg.select(0).eq(ee.Image([1,12,2,3,4,5,6,8,7 ]))
  .reduce(ee.Reducer.max())
  .selfMask();
// var no_reforestation = reforestation.unmask(0).eq(0).selfMask().updateMask(k.gte(0));

// var nonreforestation = reforestation.eq(1).or(reforestation.eq(4)).selfMask();
// // Map.addLayer(reforestation)
// // Map.addLayer(nonreforestation)
var proj = a.projection();
var scale = proj.nominalScale();


// print(countries)
// // print(gez.limit(1).first().geometry().geometries())
gez = gez.map(function(feature){
  var geoms = ee.FeatureCollection(ee.List(feature.geometry().geometries()).map(function(geom) { 
      return ee.Feature(ee.Geometry(geom))
    }).filter(ee.Filter.or(
      ee.Filter.hasType(".geo", "Polygon"),
      ee.Filter.hasType(".geo", "MultiPolygon"))
    )).geometry().dissolve()
    
    return ee.Feature(geoms).copyProperties(feature)
    
});



var blankObject = ee.Dictionary({
  '10.0': 0,
  '100.0': 0,
  '15.0': 0,
  '20.0': 0,
  '25.0': 0,
  '30.0': 0,
  '35.0': 0,
  '40.0': 0,
  '45.0': 0,
  '5.0': 0,
  '50.0': 0,
  '55.0': 0,
  '60.0': 0,
  '65.0': 0,
  '70.0': 0,
  '75.0': 0,
  '80.0': 0,
  '85.0': 0,
  '90.0': 0,
  '95.0': 0,
});
// print(plots.size())

var from = ['10.0', '100.0', '15.0', '20.0', '25.0', '30.0', '35.0', '40.0', '45.0', '5.0', '50.0', '55.0', 
  '60.0', '65.0', '70.0', '75.0', '80.0', '85.0', '90.0', '95.0'];
  
var to = ['10', '100', '15', '20', '25', '30', '35', '40', '45', '5', '50', '55', '60',
'65', '70', '75', '80', '85', '90', '95'];
  
// // var nPoints = gez.map(function(zone){
// //   var zonePoints = plots.filterBounds(zone.geometry());
// //   var test = zonePoints.size();
// //   var output = ee.Dictionary(ee.Algorithms.If(test.gt(0),
// //     blankObject.combine(zonePoints.aggregate_histogram('age')), 
// //     blankObject)).rename(from, to)

  
// //   return ee.Feature(null, output).copyProperties(zone);
// // })

// var nPointsCountries = countries.map(function(zone){
//   var zonePoints = plots.filterBounds(zone.geometry());
//   var test = zonePoints.size();
//   // var output = ee.Dictionary(ee.Algorithms.If(test.gt(0),
//   //   blankObject.combine(zonePoints.aggregate_histogram('age')), 
//   //   blankObject)).rename(from, to)

  
//   return zone.set({'points': test});
// });


// Export.table.toDrive({
//   collection:  nPointsCountries,
//   folder: "Carbon_Accumulation",
//   fileNamePrefix: 'plots_countries',
//   description: 'plots_countries',
//   fileFormat: 'SHP'
// });

// var nPointsGEZ = gez.map(function(zone){
//   var zonePoints = plots.filterBounds(zone.geometry());
//   var test = zonePoints.size();
//   // var output = ee.Dictionary(ee.Algorithms.If(test.gt(0),
//   //   blankObject.combine(zonePoints.aggregate_histogram('age')), 
//   //   blankObject)).rename(from, to)

//   return zone.set({'points': test});
// });


// // Export.table.toDrive({
// //   collection:  nPointsGEZ,
// //   folder: "Carbon_Accumulation",
// //   fileNamePrefix: 'plots_gez',
// //   description: 'plots_gez',
// //   fileFormat: 'SHP'
// // });


// Export.image.toDrive({
//   image: a.updateMask(reforestation),
//   folder: "Carbon_Accumulation",
//   fileNamePrefix: 'cr_a_ao_biomes',
//   description: 'cr_a',
//   scale: scale.getInfo(),
//   crs: 'EPSG:4326',
//   maxPixels: 1e13,
//   region: gBounds
// })

// Export.image.toDrive({
//   image: b.updateMask(reforestation),
//   folder: "Carbon_Accumulation",
//   fileNamePrefix: 'cr_b_ao_biomes',
//   description: 'cr_b',
//   scale: scale.getInfo(),
//   crs: 'EPSG:4326',
//   maxPixels: 1e13,
//   region: gBounds
// })

// Export.image.toDrive({
//   image: k.updateMask(reforestation),
//   folder: "Carbon_Accumulation",
//   fileNamePrefix: 'cr_k_biomes',
//   description: 'cr_k',
//   scale: scale.getInfo(),
//   crs: 'EPSG:4326',
//   maxPixels: 1e13,
//   region: gBounds
// })

var pars = a.addBands([b,k])
  .updateMask(reforestation)
  .rename(['a','b','k']);

var reducer = ee.Reducer.percentile([10,50,90])

var globalPars = pars.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: gBounds,
    scale: scale.getInfo(),
    crs: 'EPSG:4326',
    maxPixels: 1e12
  });

// print(globalPars);


// // Export.image.toDrive({
// //   image: a_e.updateMask(reforestation),
// //   folder: "Carbon_Accumulation",
// //   fileNamePrefix: 'cr_a_error_ao',
// //   description: 'cr_a_error',
// //   scale: scale.getInfo(),
// //   crs: 'EPSG:4326',
// //   maxPixels: 1e13,
// //   region: gBounds
// // })

// // Export.image.toDrive({
// //   image: b_e.updateMask(reforestation),
// //   folder: "Carbon_Accumulation",
// //   fileNamePrefix: 'cr_b_error_ao',
// //   description: 'cr_b_error',
// //   scale: scale.getInfo(),
// //   crs: 'EPSG:4326',
// //   maxPixels: 1e13,
// //   region: gBounds
// // })

// // Export.image.toDrive({
// //   image: k_e.updateMask(reforestation),
// //   folder: "Carbon_Accumulation",
// //   fileNamePrefix: 'cr_k_error_ao',
// //   description: 'cr_k_error',
// //   scale: scale.getInfo(),
// //   crs: 'EPSG:4326',
// //   maxPixels: 1e13,
// //   region: gBounds
// // })


var m = 2/3;
var ages = ee.List.sequence(0, 200, 1);

var growth = calcCR(ages, a, k, b, m);



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



var cr = ee.ImageCollection(ages.map(function(age){
  age = ee.Number(age).int();
  var nullImage = ee.Image(0).selfMask().rename('actual');
  // var mean = linear.filter(ee.Filter.eq('age', age));
  // var t = mean.size();
  // var actual = ee.Image(
  //   ee.Algorithms.If(t.eq(1), 
  //   mean.first().select('mean').rename('actual'), 
  //   nullImage));
    
  // var agc_max = ee.Image(amax).rename('max'); 
  var age_image = ee.Image(age).rename('age');
  var cr_estimate = calcCrEstimate(age, a, k, b, m);//
  var cr_prev = calcCrEstimate(age.subtract(1), a, k, b, m);
  var cr_post = calcCrEstimate(age.add(1), a, k, b, m);
  var rate = cr_post.subtract(cr_prev).divide(2).rename('r_1');
  // var rate2 = cr_estimate.divide(age).rename('r_2');
  
  return cr_estimate.addBands([rate, age])
    .rename(['agc', 'rate', 'age'])
    .float()
    .set({age: age});
}));

var zero = cr.filter(ee.Filter.eq('age', 0)).first()

Map.addLayer(0)

var er = ecoregionImg.updateMask(ecoregionImg.select(0).eq(ee.Image([1,12,2,3,4,5,6,8,7]))
  .reduce(ee.Reducer.max()))
  .selfMask();

var maxRate = cr.qualityMosaic('rate').addBands(er)
  .updateMask(reforestation);


var ageMask = maxRate.select("age").gt(5);

maxRate = maxRate.updateMask(ageMask);




var output = maxRate;

var reducer = ee.Reducer.mean().unweighted().combine(ee.Reducer.stdDev(), null, true).repeat(4).group(4)

output = ee.FeatureCollection(
  ee.List(
    output.reduceRegion({
    reducer: reducer,
    scale: scale.getInfo(),
    geometry: gBounds,
    maxPixels: 1e13,
    crs: 'EPSG:4326'
  }).get('groups'))
  .map(function(obj){
    obj = ee.Dictionary(obj)
    var group = obj.get('group');
    var means = ee.List(obj.get('mean'))
    var stdDevs = ee.List(obj.get('stdDev'))
    var mean_accumulation = means.get(0);
    var mean_rate = means.get(1);
    var mean_age = means.get(2);
    var biome = means.get(3);
    var stdev_accumulation = stdDevs.get(0);
    var stdev_rate = stdDevs.get(1);
    var stdev_age = stdDevs.get(2);
    
    return ee.Feature(null, {
      'ecoregion': group,
      'biome': biome,
      'agc': mean_accumulation,
      'rate': mean_rate,
      'age': mean_age,
      'stdev_agc': stdev_accumulation,
      'stdev_rate': stdev_rate,
      'stdev_age': stdev_age
    });
    
  }));

// Export.table.toDrive({
//   collection: output,
//   folder: "Carbon_Accumulation",
//   fileNamePrefix: "CR_Max_Rate_Ecoregion_Stats_age_mask"
// })



// // Map.addLayer(cr.select('b1'))
// // Map.addLayer(cr.select('r_1'))
// // Map.addLayer(maxRate)


// var test2 = maxRate.reduceRegions({
//   reducer: ee.Reducer.mean(),
//   collection: ecoregions,
//   scale: scale.getInfo(),
//   crs: 'EPSG:4326',
//   tileScale: 16
// })


// // ecoregions = ecoregions.filterBounds(geometry);
// // Map.addLayer(ecoregions)
// var output = ecoregions.map(function(er){
//   var reduce = maxRate.reduceRegion({
//     reducer: ee.Reducer.mean(),
//     geometry: er.geometry(),
//     scale: scale.getInfo(),
//     crs: 'EPSG:4326',
//     maxPixels: 1e12
//   });
//   return ee.Feature(null, reduce).copyProperties(er)
// })

// // print(output.first())
var test = maxRate.reduceRegion({
  reducer: ee.Reducer.minMax(),
  scale: scale.getInfo(),
  crs: "EPSG:4326",
  maxPixels: 1e13,
  geometry: gBounds
})

var rateMinMax = ee.FeatureCollection(
  ee.Feature(null, test))
print(rateMinMax)

// Export.table.toDrive({
//   collection:  rateMinMax,
//   folder: "Carbon_Accumulation",
//   fileNamePrefix: 'rate_min_max',
//   description: 'rate_min_max',
//   fileFormat: 'CSV'
// })

// // Export.table.toDrive({
// //   collection:  output,
// //   folder: "Carbon_Accumulation",
// //   fileNamePrefix: 'max_rates_ages_ecoregions',
// //   description: 'max_rates_ages_ecoregions',
// //   fileFormat: 'CSV'
// // })

// Export.image.toDrive({
//   image: maxRate.select('rate'),
//   folder: "Carbon_Accumulation",
//   fileNamePrefix: 'max_rate_er',
//   description: 'max_rate',
//   scale: scale.getInfo(),
//   crs: 'EPSG:4326',
//   maxPixels: 1e13,
//   region: gBounds
// })

// Export.image.toDrive({
//   image: maxRate.select('age'),
//   folder: "Carbon_Accumulation",
//   fileNamePrefix: 'age_at_max_rate_er',
//   description: 'age_at_max_rate',
//   scale: scale.getInfo(),
//   crs: 'EPSG:4326',
//   maxPixels: 1e13,
//   region: gBounds
// })

// // Export.image.toDrive({
// //   image: maxRate.select('b1'),
// //   folder: "Carbon_Accumulation",
// //   fileNamePrefix: 'accumulation_at_max_rate',
// //   description: 'accumulation_at_max_rate',
// //   scale: scale.getInfo(),
// //   crs: 'EPSG:4326',
// //   maxPixels: 1e13,
// //   region: gBounds
// // })
// // Map.addLayer(no_reforestation)
// // print(no_reforestation.projection().nominalScale())
// // Export.image.toDrive({
// //   image: no_reforestation,
// //   folder: "Carbon_Accumulation",
// //   fileNamePrefix: 'no_reforestation',
// //   description: 'no_reforestation',
// //   scale: scale.getInfo(),
// //   crs: 'EPSG:4326',
// //   maxPixels: 1e13,
// //   region: gBounds
// // })



