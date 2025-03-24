/*******************************************************************************
Author: Nathaniel Robinson
Organization: The Nature Conservancy
Date Created: 18 Jun 2024 @ 08:34:03

Script: Script to produce and export geoTiffs used in ED Figure 2

Description:

 
Contact:
     For questions or feedback, contact:
          1. n.robinson@cifor-icraf.org
          2. nathanielpaulrobinson@gmail.com
*******************************************************************************/

//----------------------------------------------------------------------------//
/**/ // [Inputs]

// CR Pars
var a = ee.Image('projects/ee-groa-carbon-accumulation/assets/cr_pars/a');
var b = ee.Image('projects/ee-groa-carbon-accumulation/assets/cr_pars/b');
var k = ee.Image('projects/ee-groa-carbon-accumulation/assets/cr_pars/k');

// Analyis Regions
var globalBounds = ee.Geometry.Polygon([-180, 88, 0, 88, 180, 88, 180, -88, 0, -88, -180, -88], null, false);
var ecoRegionFC = ee.FeatureCollection("RESOLVE/ECOREGIONS/2017");
var ecoRegionImage = ee.Image("projects/SCL/v1/source/resolve-ecoregion-img");
var ecoZoneFC = ee.FeatureCollection("projects/ee-groa-carbon-accumulation/assets/validation/GEX_Continents_Simp");

// Input Pre-Processing
var forestAreaMask = ecoRegionImage.select(0).eq(ee.Image([1,12,2,3,4,5,6,8,7]))
  .reduce(ee.Reducer.max())
  .selfMask();

var ecoRegions = ecoRegionImage.updateMask(forestAreaMask).selfMask();


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

a = a.updateMask(forestAreaMask);
b = b.updateMask(forestAreaMask);
k = k.updateMask(forestAreaMask);

// Create list of ages
var ages = ee.List.sequence(minAge, maxAge, 1);
var agesLong = ee.List.sequence(1,125,1);

// Calculate accumulation image collection
var accumulation = calcAnnualAccumulation(ages, a, k, b, m, forestAreaMask);



/**/
//----------------------------------------------------------------------------//


// // Visualize Layers
Map.addLayer(
  a,
  {min:50, max:200, palette:["#d1d35a","#a5b344","#79922e","#4c7217", "#205101"]},
  'A',
  true);
  
Map.addLayer(
  k,
  {min:0.01, max:0.03, palette:["#ffffb2","#fecc5c","#fd8d3c","#f03b20", "#bd0026"]},
  'k',
  true);
  
Map.addLayer(
  b,
  {min:0.4, max:0.8, palette:["#253494", "#41b6c4", "#ffffcc"]},
  'B',
  true);
  
  
var exportFolder = "Export Folder" // set folder name to name of folder on Google Drive

// Export Layers
Export.image.toDrive({
  image: a.int().unmask(-999), // set scale factor and no data value
  folder: exportFolder,
  fileNamePrefix: 'cr_a',
  description: 'cr_a',
  scale: scale.getInfo(),
  crs: 'EPSG:4326',
  maxPixels: 1e13,
  region: globalBounds
});


Export.image.toDrive({
  image: k.multiply(1000).unmask(-999), // set no data value
  folder: exportFolder,
  fileNamePrefix: 'cr_k',
  description: 'cr_k',
  scale: scale.getInfo(),
  crs: 'EPSG:4326',
  maxPixels: 1e13,
  region: globalBounds
});

Export.image.toDrive({
  image: b.multiply(100).unmask(-999), // set no data value
  folder: exportFolder,
  fileNamePrefix: 'cr_b',
  description: 'cr_b',
  scale: scale.getInfo(),
  crs: 'EPSG:4326',
  maxPixels: 1e13,
  region: globalBounds
});


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