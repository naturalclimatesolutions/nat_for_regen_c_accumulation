/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var a = ee.Image("projects/ee-groa-carbon-accumulation/assets/cr_pars/a"),
    aSE = ee.Image("projects/ee-groa-carbon-accumulation/assets/cr_pars/a-std-error"),
    b = ee.Image("projects/ee-groa-carbon-accumulation/assets/cr_pars/b"),
    bSE = ee.Image("projects/ee-groa-carbon-accumulation/assets/cr_pars/b-std-error"),
    k = ee.Image("projects/ee-groa-carbon-accumulation/assets/cr_pars/k"),
    kSE = ee.Image("projects/ee-groa-carbon-accumulation/assets/cr_pars/k-std-error"),
    outputMatch = ee.Image("projects/TNC_Africa/carbon/cook-patton-2021/sequestration_rate__mean__aboveground__full_extent__Mg_C_ha_yr");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
var projection = outputMatch.projection()
var scale = projection.nominalScale()
var transform = projection.getInfo().transform
var exportFolder = "agc_cr_par_exports"
var noDataVal = -32768;

var roi = ee.Geometry.Polygon([-180, 88, 0, 88, 180, 88, 180, -88, 0, -88, -180, -88], null, false);
var scale = a.projection().nominalScale().getInfo()

var aScaled = a.multiply(100).int16()
  .unmask(noDataVal);
var bScaled = b.multiply(100).int16()
  .unmask(noDataVal);
var kScaled = k.multiply(10000).int16()
  .unmask(noDataVal);

var aSeScaled = aSE.multiply(100).int16()
  .unmask(noDataVal);
var bSeScaled = bSE.multiply(1000).int16()
  .unmask(noDataVal);
var kSeScaled = kSE.multiply(10000).int16()
  .unmask(noDataVal);

// Export.image.toDrive({
//   image: aScaled,
//   fileNamePrefix: "cr_a",
//   description: "cr_a",
//   folder: exportFolder,
//   region: roi,
//   crs: "EPSG:4326",
//   crsTransform: transform,
//   scale: scale,
//   maxPixels: 1e12,
//   formatOptions: {'noData': noDataVal}
// });
// Export.image.toDrive({
//   image: bScaled,
//   fileNamePrefix: "cr_b",
//   description: "cr_b",
//   folder: exportFolder,
//   region: roi,
//   crs: "EPSG:4326",
//   crsTransform: transform,
//   scale: scale,
//   maxPixels: 1e12,
//   formatOptions: {'noData': noDataVal}
// });

// Export.image.toDrive({
//   image: kScaled,
//   fileNamePrefix: "cr_k",
//   description: "cr_k",
//   folder: exportFolder,
//   region: roi,
//   crs: "EPSG:4326",
//   crsTransform: transform,
//   scale: scale,
//   maxPixels: 1e12,
//   formatOptions: {'noData': noDataVal}
// });

Export.image.toDrive({
  image: aSeScaled,
  fileNamePrefix: "cr_a_std_error",
  description: "cr_a_std_error",
  folder: exportFolder,
  region: roi,
  crs: "EPSG:4326",
  crsTransform: transform,
  scale: scale,
  maxPixels: 1e12,
  formatOptions: {'noData': noDataVal}
});
Export.image.toDrive({
  image: bSeScaled,
  fileNamePrefix: "cr_b_std_error",
  description: "cr_b_std_error",
  folder: exportFolder,
  region: roi,
  crs: "EPSG:4326",
  crsTransform: transform,
  scale: scale,
  maxPixels: 1e12,
  formatOptions: {'noData': noDataVal}
});
Export.image.toDrive({
  image: kSeScaled,
  fileNamePrefix: "cr_k_std_error",
  description: "cr_k_std_error",
  folder: exportFolder,
  region: roi,
  crs: "EPSG:4326",
  crsTransform: transform,
  scale: scale,
  maxPixels: 1e12,
  formatOptions: {'noData': noDataVal}
});