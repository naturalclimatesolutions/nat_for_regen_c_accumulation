/*******************************************************************************
Author: Nathaniel Robinson
Organization: The Nature Conservancy
Date Created: 18 Jun 2024 @ 08:34:03

Script: Results for Natural Forest Regneration Carbon Manuscript

Description:

 
Contact:
     For questions or feedback, contact:
          1. n.robinson@tnc.org
          2. nathanielpaulrobinson@gmail.com
*******************************************************************************/

//----------------------------------------------------------------------------//
/**/ // [Inputs]

// Model Plots
var plots = ee.FeatureCollection("projects/ee-groa-carbon-accumulation/assets/plot-data/sp_agg_split__0_2");


// Random Forest Results
var rfPath = "projects/ee-groa-carbon-accumulation/assets/agc_accumulation/age_";

// CR Pars
var a = ee.Image('projects/ee-groa-carbon-accumulation/assets/cr_pars/a');
var b = ee.Image('projects/ee-groa-carbon-accumulation/assets/cr_pars/b');
var k = ee.Image('projects/ee-groa-carbon-accumulation/assets/cr_pars/k');

// Analyis Regions
var globalBounds = ee.Geometry.Polygon([-180, 88, 0, 88, 180, 88, 180, -88, 0, -88, -180, -88], null, false);
var ecoRegionFC = ee.FeatureCollection("RESOLVE/ECOREGIONS/2017");
var ecoRegionImage = ee.Image("projects/SCL/v1/source/resolve-ecoregion-img");
var ecoZoneFC = ee.FeatureCollection("projects/ee-groa-carbon-accumulation/assets/validation/GEX_Continents_Simp");


// Max Removal Potential

var maxRemovalPotential = ee.Image('projects/ee-groa-carbon-accumulation/assets/removal-potential/removal_potential_25');

// Input Pre-Processing
var forestAreaMask = ecoRegionImage.select(0).eq(ee.Image([1,12,2,3,4,5,6,8,7]))
  .reduce(ee.Reducer.max())
  .selfMask();

var ecoRegions = ecoRegionImage.updateMask(forestAreaMask).selfMask();

ecoZoneFC = ecoZoneFC.map(fixGeometries);

/**/
//----------------------------------------------------------------------------//

//----------------------------------------------------------------------------//
/**/ // [Contstants]

var m = 2/3;
var minAge = 1;
var maxAge = 100; 

var proj = a.projection();
var scale = proj.nominalScale();


/**/
//----------------------------------------------------------------------------//


//----------------------------------------------------------------------------//
/**/ // [Layer Creation]

// Create list of ages
var ages = ee.List.sequence(minAge, maxAge, 1);


// Calculate accumulation image collection
var accumulation = calcAnnualAccumulation(ages, a, k, b, m, forestAreaMask);



// Calculate maximum rate of removal
var maximumRemovalRate = accumulation.qualityMosaic('removal_rate');
var minimumRevmoralRate = calcMinRate(accumulation);

// Calculate removal rate range and variability
var maxRemovalRate = maximumRemovalRate.select('removal_rate')
  .rename('max_removal_rate');
var minRemovalRate = minimumRevmoralRate.select('removal_rate')
  .rename('min_removal_rate');
var ageAtMaxRate = maximumRemovalRate.select('age')
  .rename('max_removal_rate_age');
var ageAtMinRate = minimumRevmoralRate.select('age')
  .rename('min_removal_rate_age');
var removalRateRange = maxRemovalRate.subtract(minRemovalRate)
  .rename('range_removal_rate');
var removalRateFold = maxRemovalRate.divide(minRemovalRate)
  .rename('fold_removal_rate');


// Calate Age to a Given AGC Percentage
var agesLong = ee.List.sequence(1,125,1);
var accumulationLong = calcAnnualAccumulation(agesLong, a, k, b, m, forestAreaMask);

var ageAt95 = calcAgeAtPercentAGC(95, accumulationLong);
var ageAt90 = calcAgeAtPercentAGC(90, accumulationLong);
var ageAt5 = calcAgeAtPercentAGC(5, accumulationLong);

/**/
//----------------------------------------------------------------------------//


//----------------------------------------------------------------------------//
/**/ // [Statistic Calculations]



// var statsImage = maxRemovalRate.addBands([
//   ageAtMaxRate,
//   minRemovalRate,
//   ageAtMinRate,
//   removalRateRange,
//   removalRateFold,
//   ageAt95,
//   ageAt5
//   ]);
  
// var mainBands = statsImage.bandNames();

// // By EcoRegion
// var statsImageER = statsImage.addBands(ecoRegions);
// var nBands = statsImageER.bandNames().size();
// var groupBand = nBands.subtract(1);

// var modeBands = ["BIOME_NUM"];

// var reducer1 = ee.Reducer.mode().unweighted().forEach(modeBands);

// var reducer2 = ee.Reducer.mean().unweighted()
//   .combine(ee.Reducer.minMax(), null, true)
//   .combine(ee.Reducer.stdDev(), null, true)
//   .combine(ee.Reducer.percentile([5,50,95]).unweighted(), null, true)
//   .forEach(mainBands);
  
// var reducer = reducer2.combine(reducer1).group(groupBand, 'ecoregion_id');
  
// var statsER = ee.FeatureCollection(ee.List(statsImageER.reduceRegion({
//   reducer: reducer,
//   geometry: globalBounds,
//   scale: 1000,
//   crs: 'EPSG:4326',
//   maxPixels: 1e11,
//   tileScale: 8
// }).get('groups')).map(function(group){
//   var ecoRegionId = 
//     ee.Number(ee.Dictionary(group).get('ecoregion_id')).int();
    
//   var ecoRegion = ecoRegionFC.filter(ee.Filter.eq("ECO_ID", ecoRegionId)).first();
//   var ecoRegionName = ecoRegion.get('ECO_NAME');
//   var biomeName = ecoRegion.get('BIOME_NAME');
//   return ee.Feature(null, group).set({
//     'ecoregion_name': ecoRegionName,
//     'biome_name': biomeName
//   });
// }));


// var statsImageBiome = statsImage.addBands(ecoRegions.select("BIOME_NUM"));
// var nBandsBiome = statsImageBiome.bandNames().size();
// var groupBandBiome = nBandsBiome.subtract(1);

// var statsImageGlobal = statsImage.addBands(ecoRegions.select("BIOME_NUM").gte(1).selfMask());
// var nBandsGlobal = statsImageGlobal.bandNames().size();
// var groupBandGlobal = nBandsGlobal.subtract(1);

// var reducerBiome = ee.Reducer.mean().unweighted()
//   .combine(ee.Reducer.minMax(), null, true)
//   .combine(ee.Reducer.stdDev(), null, true)
//   .combine(ee.Reducer.percentile([5,50,95]).unweighted(), null, true)
//   .forEach(mainBands)
//   .group(groupBandBiome, 'biome_id');
  
// var statsBiome = ee.FeatureCollection(ee.List(statsImageBiome.reduceRegion({
//   reducer: reducerBiome,
//   geometry: globalBounds,
//   scale: 1000,
//   crs: 'EPSG:4326',
//   maxPixels: 1e11,
//   tileScale: 8
// }).get('groups')).map(function(group){
//   var biomeId = 
//     ee.Number(ee.Dictionary(group).get('biome_id')).int();
//   var biome = ecoRegionFC.filter(ee.Filter.eq("BIOME_NUM", biomeId)).first();
//   var biomeName = biome.get('BIOME_NAME');
//   return ee.Feature(null, group).set({
//     'biome_name': biomeName
//   });
// }));


// var statsImageGlobal = statsImage;

// var reducerGlobal = ee.Reducer.mean().unweighted()
//   .combine(ee.Reducer.minMax(), null, true)
//   .combine(ee.Reducer.stdDev(), null, true)
//   .combine(ee.Reducer.percentile([5,50,95]).unweighted(), null, true)
//   .forEach(mainBands);

// var statsGlobal = ee.FeatureCollection(
//   ee.Feature(null,
//     statsImageGlobal.reduceRegion({
//     reducer: reducerGlobal,
//     geometry: globalBounds,
//     scale: 1000,
//     crs: 'EPSG:4326',
//     maxPixels: 1e11,
//     tileScale: 8
//     })
//     ));


// Export.table.toDrive({
//   collection: statsER,
//   folder: "Carbon_Accumulation",
//   fileNamePrefix: "ecoregion_carbon_removal_stats_v_0_2",
//   description: "ecoregion_carbon_removal_stats_v_0_2"
// });

// Export.table.toDrive({
//   collection: statsBiome,
//   folder: "Carbon_Accumulation",
//   fileNamePrefix: "biome_carbon_removal_stats_v_0_2",
//   description: "biome_carbon_removal_stats_v_0_2"
// });

// Export.table.toDrive({
//   collection: statsGlobal,
//   folder: "Carbon_Accumulation",
//   fileNamePrefix: "global_carbon_removal_stats_v_0_2",
//   description: "global_carbon_removal_stats_v_0_2"
// });

/**/
//----------------------------------------------------------------------------//


//----------------------------------------------------------------------------//
/**/ // [Removal through time]

var agesShort = ee.List.sequence(1,100,1);

var removals = ee.ImageCollection(agesShort.map(function(age){
  var age1 = ee.Number(age);
  var age2 = age1.add(24);
  var accumulationPeriod = accumulationLong.filter(
    ee.Filter.and(
      ee.Filter.gte('age', age1), ee.Filter.lte('age', age2)))
    .select('removal_rate').sum()
    .addBands(ee.Image(age1).float())
    .rename(['removals', 'start_age']);
  return accumulationPeriod.set({'start_age': age});
}));


var removalStats = ee.FeatureCollection(agesShort.map(function(age){
  var age1 = ee.Number(age);
  var age2 = age1.add(24);
  var accumulationPeriod = accumulationLong.filter(
    ee.Filter.and(
      ee.Filter.gte('age', age1), ee.Filter.lte('age', age2)))
    .select('removal_rate').sum()
    .rename(['removals'])
    .addBands(ecoRegions);
  var n = accumulationPeriod.bandNames().size();
  var g = n.subtract(1);
  
  var r1 = ee.Reducer.mode().unweighted().forEach(["BIOME_NUM"]);
  var r2 = ee.Reducer.mean().unweighted()
    .combine(ee.Reducer.minMax(), null, true)
    .combine(ee.Reducer.stdDev(), null, true)
    .combine(ee.Reducer.percentile([5,50,95]).unweighted(), null, true)
    .forEach(['removals']);
  
  var r = r2.combine(r1)
  .group(g, 'ecoregion_id');
    
  var accumulationStats = ee.FeatureCollection(ee.List(accumulationPeriod.reduceRegion({
    reducer: r,
    geometry: globalBounds,
    scale: 1000,
    crs: 'EPSG:4326',
    maxPixels: 1e11,
    tileScale: 8
  }).get('groups')).map(function(group){
    var ecoRegionId = 
      ee.Number(ee.Dictionary(group).get('ecoregion_id')).int();
      
    var ecoRegion = ecoRegionFC.filter(ee.Filter.eq("ECO_ID", ecoRegionId)).first();
    var ecoRegionName = ecoRegion.get('ECO_NAME');
    var biomeName = ecoRegion.get('BIOME_NAME');
    return ee.Feature(null, group).set({
      'ecoregion_name': ecoRegionName,
      'biome_name': biomeName,
      'start_age': age1
    });
  }));

  return accumulationStats;
})).flatten();

  
// Export.table.toDrive({
//   collection: removalStats,
//   folder: "Carbon_Accumulation",
//   fileNamePrefix: "global_removal_byAge_v_0_2",
//   description: "global_removal_byAge_v_0_2"
// });
  


var maxRemovals = removals.qualityMosaic('removals');
var newForestRemoval = removals.filter(ee.Filter.eq('start_age', 1)).first().select('removals');
var maxRemoval = maxRemovals.select('removals');

var maxRemovalDiff = (maxRemoval.subtract(newForestRemoval))
  .divide(newForestRemoval).multiply(100);

var maxRemovalAge = maxRemovals.select('start_age');

// var maxRemovalStats = newForestRemoval
//   .addBands([maxRemoval,maxRemovalDiff,maxRemovalAge])
//   .rename(['new_removal_25', 'max_removal_25', 'max_removal_diff_25', 'max_removal_start_age_25']);

var maxRemovalStats = maxRemovalPotential;
var percent0 = maxRemovalStats.select('max_removal_diff_25').lte(5).selfMask();

var perecneNon0 = maxRemovalStats.select('max_removal_diff_25').gt(5).selfMask();

var test= percent0.addBands(perecneNon0).rename(['zero', 'nonZero'])
  .reduceRegion({
    reducer: ee.Reducer.count(),
    scale: 1000,
    crs: 'EPSG:4326',
    geometry: globalBounds,
    maxPixels: 1e11
  })
var low = ee.Number(test.get('zero'))
var high = ee.Number(test.get('nonZero'))

print(low.divide(low.add(high)).multiply(100))
var removalBands = maxRemovalStats.bandNames();


// By EcoRegion
var removalImageER = maxRemovalStats.addBands(ecoRegions);
var nRemovalBandsEr = removalImageER.bandNames().size();
var removalGroupBandEr = nRemovalBandsEr.subtract(1);

var modeBands = ["BIOME_NUM"];

var removalReducer1 = ee.Reducer.mode().unweighted().forEach(modeBands);
var removalReducer2 = ee.Reducer.mean().unweighted()
  .combine(ee.Reducer.minMax(), null, true)
  .combine(ee.Reducer.stdDev(), null, true)
  .combine(ee.Reducer.percentile([5,50,95]).unweighted(), null, true)
  .forEach(removalBands);
  
var removalReducer = removalReducer2.combine(removalReducer1)
  .group(removalGroupBandEr, 'ecoregion_id');
  
var removalStatsER = ee.FeatureCollection(ee.List(removalImageER.reduceRegion({
  reducer: removalReducer,
  geometry: globalBounds,
  scale: 1000,
  crs: 'EPSG:4326',
  maxPixels: 1e11,
  tileScale: 16
}).get('groups')).map(function(group){
  var ecoRegionId = 
    ee.Number(ee.Dictionary(group).get('ecoregion_id')).int();
    
  var ecoRegion = ecoRegionFC.filter(ee.Filter.eq("ECO_ID", ecoRegionId)).first();
  var ecoRegionName = ecoRegion.get('ECO_NAME');
  var biomeName = ecoRegion.get('BIOME_NAME');
  return ee.Feature(null, group).set({
    'ecoregion_name': ecoRegionName,
    'biome_name': biomeName
  });
}));



// By Biome
var removalImageBiome = maxRemovalStats.addBands(ecoRegions.select("BIOME_NUM"));
var nRemobalBandsBiome = removalImageBiome.bandNames().size();
var removalGroupBandBiome = nRemobalBandsBiome.subtract(1);


var removalReducerBiome = ee.Reducer.mean().unweighted()
  .combine(ee.Reducer.minMax(), null, true)
  .combine(ee.Reducer.stdDev(), null, true)
  .combine(ee.Reducer.percentile([5,50,95]).unweighted(), null, true)
  .forEach(removalBands)
  .group(removalGroupBandBiome, 'biome_id');
  
var removalStatsBiome = ee.FeatureCollection(ee.List(removalImageBiome.reduceRegion({
  reducer: removalReducerBiome,
  geometry: globalBounds,
  scale: 1000,
  crs: 'EPSG:4326',
  maxPixels: 1e11,
  tileScale: 16
}).get('groups')).map(function(group){
  var biomeId = 
    ee.Number(ee.Dictionary(group).get('biome_id')).int();
  var biome = ecoRegionFC.filter(ee.Filter.eq("BIOME_NUM", biomeId)).first();
  var biomeName = biome.get('BIOME_NAME');
  return ee.Feature(null, group).set({
    'biome_name': biomeName
  });
}));

// Global
var removalStatsImageGlobal = maxRemovalStats//.addBands(ecoRegions.select("BIOME_NUM").gte(1).selfMask());
// var nBandsGlobal = removalStatsImageGlobal.bandNames().size();
// var groupBandGlobal = nBandsGlobal.subtract(1);

var removalReducerGlobal = ee.Reducer.mean().unweighted()
  .combine(ee.Reducer.minMax(), null, true)
  .combine(ee.Reducer.stdDev(), null, true)
  .combine(ee.Reducer.percentile([5,50,95]).unweighted(), null, true)
  .forEach(removalBands);

var removalStatsGlobal = ee.FeatureCollection(
  ee.Feature(null,
    removalStatsImageGlobal.reduceRegion({
    reducer: removalReducerGlobal,
    geometry: globalBounds,
    scale: 1000,
    crs: 'EPSG:4326',
    maxPixels: 1e11,
    tileScale: 16
    })
    ));


// Export.table.toDrive({
//   collection: removalStatsER,
//   folder: "Carbon_Accumulation",
//   fileNamePrefix: "ecoregion_max_removal_stats_v_0_2",
//   description: "ecoregion_carbon_removal_stats_v_0_2"
// });

// Export.table.toDrive({
//   collection: removalStatsBiome,
//   folder: "Carbon_Accumulation",
//   fileNamePrefix: "biome_max_removal_stats_v_0_2",
//   description: "biome_carbon_removal_stats_v_0_2"
// });

// Export.table.toDrive({
//   collection: removalStatsGlobal,
//   folder: "Carbon_Accumulation",
//   fileNamePrefix: "global_max_removal_stats_v_0_2",
//   description: "global_carbon_removal_stats_v_0_2"
// });

  
// Map.addLayer(maxRemovalPotential);

// Export.image.toDrive({
//   image: maxRemovalPotential.select('max_removal_25').int().unmask(-999),
//   folder: "Carbon_Accumulation",
//   fileNamePrefix: 'max_removal_potential_25',
//   description: 'max_removal_potential_25',
//   scale: scale.getInfo(),
//   crs: 'EPSG:4326',
//   maxPixels: 1e13,
//   region: globalBounds
// });

// Export.image.toDrive({
//   image: maxRemovalPotential.select('max_removal_diff_25').int().unmask(-999),
//   folder: "Carbon_Accumulation",
//   fileNamePrefix: 'max_removal_potential_benefit_25',
//   description: 'max_removal_potential_benefit_25',
//   scale: scale.getInfo(),
//   crs: 'EPSG:4326',
//   maxPixels: 1e13,
//   region: globalBounds
// });

// Export.image.toDrive({
//   image: maxRemovalPotential.select('max_removal_start_age_25').int().unmask(-999),
//   folder: "Carbon_Accumulation",
//   fileNamePrefix: 'max_removal_potential_age_25',
//   description: 'max_removal_potential_age_25',
//   scale: scale.getInfo(),
//   crs: 'EPSG:4326',
//   maxPixels: 1e13,
//   region: globalBounds
// });


// Export.image.toAsset({
//   image: maxRemovalStats,
//   assetId: 'projects/ee-groa-carbon-accumulation/assets/removal-potential/removal_potential_25',
//   description: 'max_removal_potential_25',
//   scale: scale.getInfo(),
//   crs: 'EPSG:4326',
//   maxPixels: 1e13,
//   region: globalBounds
// });

/**/
//----------------------------------------------------------------------------//

//----------------------------------------------------------------------------//
/**/ // [RF - Results]

var paths = [];

for (var i = 5; i<=100; i+=5){
  var iString = i.toString()
  var rfPaths = rfPath + iString
  paths.push(rfPaths)
}


var rfUncertainty = ee.ImageCollection(paths.map(function(path){
  var rfCollection = ee.ImageCollection(path);
  var rfMean = rfCollection.reduce(ee.Reducer.mean().combine(ee.Reducer.stdDev(), null, true));
  
  var percentError = rfMean.select('agc_stdDev')
    .divide(rfMean.select('agc_mean'))
    .multiply(100)
  
  return percentError
}));

// Map.addLayer(rfUncertainty.mean().updateMask(forestAreaMask), {min:5, max:20, palette: ['green', 'red']})


/**/
//----------------------------------------------------------------------------//



//----------------------------------------------------------------------------//
/**/ // [Key Functions]

function fixGeometries(feature){
  var geoms = ee.FeatureCollection(ee.List(feature.geometry().geometries()).map(function(geom) { 
      return ee.Feature(ee.Geometry(geom));
    }).filter(ee.Filter.or(
      ee.Filter.hasType(".geo", "Polygon"),
      ee.Filter.hasType(".geo", "MultiPolygon"))
    )).geometry().dissolve();
  return ee.Feature(geoms).copyProperties(feature);
}

function calcAnnualAccumulation(t, A, K, B, M, mask){
  var accumulationEstimate0 = calcEstimate(0, A, K, B, M);
  var annualPredictions = ee.ImageCollection(t.map(function(age){
    age = ee.Number(age).int();
    var ageImage = ee.Image(age).float();
    var age2 = age.add(1);
    
    var accumulationEstimate = calcEstimate(age, A, K, B, M);
    var accumulationEstimate2 = calcEstimate(age2, A, K, B, M);
    var newAccumulation = accumulationEstimate.subtract(accumulationEstimate0); 
    var accumulationRate = accumulationEstimate
      .divide(age);
    var removalRate = accumulationEstimate2
      .subtract(accumulationEstimate);
    
    var annualPrediction = accumulationEstimate.addBands([
      newAccumulation, accumulationRate, removalRate, ageImage])
      .rename(['total_accumulation', 'new_accumulation', 'accumulation_rate', 'removal_rate', 'age'])
      .set({'age':age});
      
    if (mask){
      return annualPrediction.updateMask(mask);
    } else
      return annualPrediction;
  }));
  return annualPredictions;
}

function calcEstimate(t, a, k, b, m){
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


function calcMinRate(accumulationCollection){
  var invMin = accumulationCollection.map(function(image){
    var rate = image.select('removal_rate').multiply(-1).rename('inv_removal_rate');
    return image.addBands(rate);
  });
  return invMin.qualityMosaic('inv_removal_rate');
}


function calcAgeAtPercentAGC(percent, accumulationCollection){
  var agcPercentile = a.multiply(percent/100);
  
  var ageAtPercent = accumulationCollection.map(function(image){
    var mask = image.select('total_accumulation')
      .gte(agcPercentile)
      .unmask(500)
      .updateMask(image.select(0))
      .selfMask();
    
    return image.updateMask(mask);
  }).min();
  var percentString = percent.toString();
  return ageAtPercent
    .rename([
      'total_accumulation_at_' + percentString + "_agc",
      'new_accumulation_at_' + percentString + "_agc",
      'accumuulation_rate_at_' + percentString + "_agc",
      'removal_rate_at_' + percentString + "_agc",
      'age_at_' + percentString + "_agc"
      ]);
}


/**/
//----------------------------------------------------------------------------//