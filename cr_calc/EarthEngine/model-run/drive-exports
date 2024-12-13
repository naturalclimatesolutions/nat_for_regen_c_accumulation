/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var output_sample = ee.Image("projects/TNC_Africa/carbon/cook-patton-2021/sequestration_rate__mean__aboveground__full_extent__Mg_C_ha_yr"),
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
    roi_congo = 
    /* color: #d63000 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[7.81264700744416, 4.022131003815147],
          [7.81264700744416, -9.986115667673358],
          [31.98256888244416, -9.986115667673358],
          [31.98256888244416, 4.022131003815147]]], null, false),
    roi_pnw = 
    /* color: #98ff00 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-128.96628186248464, 51.001523822496914],
          [-128.96628186248464, 45.937633221204514],
          [-118.68307873748462, 45.937633221204514],
          [-118.68307873748462, 51.001523822496914]]], null, false),
    roi_ne = 
    /* color: #0b4a8b */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-75.83584219471241, 45.093944174153705],
          [-75.83584219471241, 41.00173153068959],
          [-69.57363516346241, 41.00173153068959],
          [-69.57363516346241, 45.093944174153705]]], null, false),
    max_walker = ee.Image("projects/ee-groa-carbon-accumulation/assets/agc-max/pot_agc_mgha"),
    roi_gabon = 
    /* color: #ffc82d */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[9.513794064374105, 1.1892673043451194],
          [9.513794064374105, 0.7498781765145944],
          [9.953247189374105, 0.7498781765145944],
          [9.953247189374105, 1.1892673043451194]]], null, false),
    grid_1 = ee.FeatureCollection("projects/ee-groa-carbon-accumulation/assets/grids/global_land_grid_1_deg"),
    grid_5 = ee.FeatureCollection("projects/ee-groa-carbon-accumulation/assets/grids/global_land_grid_5_deg"),
    geometry = 
    /* color: #d63000 */
    /* shown: false */
    ee.Geometry.Point([-88.14859891666028, 45.97454193169006]),
    geometry2 = 
    /* color: #d63000 */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-124.09637617470817, 47.87982882400692],
          [-124.09637617470817, 47.652755045857155],
          [-123.62396406533317, 47.652755045857155],
          [-123.62396406533317, 47.87982882400692]]], null, false);
/***** End of imports. If edited, may not auto-convert in the playground. *****/
var path = "projects/ee-groa-carbon-accumulation/assets/agc_accumulation/age_";
var proj = output_sample.projection();

var scale = proj.nominalScale();
var transform = proj.getInfo().transform;
var g5 = grid_5.filterBounds(geometry).geometry().buffer(-10)
var g1 = grid_1.filterBounds(g5);


// Map.addLayer(g1)
// Map.addLayer(g5)
var grid = grid_5;
Map.addLayer(grid)
var folder = "agc_pnw";

var size = grid.size();
var idList = grid.aggregate_array('id').getInfo();


// var gridStart = 0;
// var gridEnd = 50;

// for (var j = gridStart; j <= gridEnd; j++ ){
//   var id = idList[j];
//   var gridCell = grid.filter(ee.Filter.eq('id', id));
//   var gridId = id.toString();
  // var roi = gridCell.geometry().bounds();

  // var roiName = "grd_" + gridId;
  var roi = geometry2;
  var roiName = 'pnw'
  var ages = [];
  var ids = [];
  
  for (var i = 5; i<=100; i+=5){
    var ageStr = i.toString();
    var ageName = "age_" + ageStr;
    var fileName = 'agc_' + roiName + "_" + ageName;
    
    var id = path + i;
    ids.push(id);
    
    var collection = ee.ImageCollection(id);
    var reducer = ee.Reducer.mean().combine(
      ee.Reducer.stdDev(), null, true).combine(
        ee.Reducer.percentile([5,95]), null, true);
    // var image = collection.reduce(reducer).multiply(100).int()
    // Map.addLayer(collection)
    var mean = collection.mean().int();
    var bands = collection.toBands();
  //   Export.image.toDrive({
  //     image: bands,
  //     fileNamePrefix: fileName,
  //     description: fileName,
  //     folder: folder,
  //     region: roi,
  //     crsTransform: transform,
  //     crs: "EPSG:4326",
  //     maxPixels: 1e10,
  // });
  }
  
  var maxValue = ee.ImageCollection(ids.map(function(id){
      return ee.ImageCollection(id).max();
  })).max().neq(0);
  var combinedMax = maxValue
    .addBands(max_walker.unmask(0))
    .reduce(ee.Reducer.max());
  
  var maxFileName = "agc_pot_" + roiName;
  Export.image.toDrive({
    image: maxValue,
    fileNamePrefix: 'valid_agc_' + roiName,
    description:  'valid_agc_' + roiName,
    folder: "EarthEngineExports",
    region: roi,
    crsTransform: transform,
    crs: "EPSG:4326",
    maxPixels: 1e10,
  });

  // Export.image.toDrive({
  //   image: combinedMax,
  //   fileNamePrefix: maxFileName,
  //   description:  maxFileName,
  //   folder: folder,
  //   region: roi,
  //   crsTransform: transform,
  //   crs: "EPSG:4326",
  //   maxPixels: 1e10,
  // });

// }



    // Export.image.toDrive({
    //   image: mean,
    //   fileNamePrefix: roi_name + '_agc_mean_' + ageStr,
    //   description:  roi_name + '_agc_mean_' + ageStr,
    //   folder: 'agc_outputs',
    //   region: roi,
    //   crsTransform: transform,
    //   crs: "EPSG:4326",
    //   maxPixels: 1e13,
    // });
    

    
    // Export.image.toDrive({
    //   image: image.select('agc_stdDev'),
    //   fileNamePrefix: 'agc_stdDev_' + ageStr,
    //   description: 'agc_stdDev_' + ageStr,
    //   folder: 'agc_outputs',
    //   region: gBounds,
    //   crsTransform: transform,
    //   crs: "EPSG:4326",
    //   maxPixels: 1e13,
    // });
    
    // Export.image.toDrive({
    //   image: image.select('agc_p5'),
    //   fileNamePrefix: 'agc_p5_' + ageStr,
    //   description: 'agc_p5_' + ageStr,
    //   folder: 'agc_outputs',
    //   region: gBounds,
    //   crsTransform: transform,
    //   crs: "EPSG:4326",
    //   maxPixels: 1e13,
    // });
    
    // Export.image.toDrive({
    //   image: image.select('agc_p95'),
    //   fileNamePrefix: 'agc_agc_p95_' + ageStr,
    //   description: 'agc_agc_p95_' + ageStr,
    //   folder: 'agc_outputs',
    //   region: gBounds,
    //   crsTransform: transform,
    //   crs: "EPSG:4326",
    //   maxPixels: 1e13,
    // });

  

