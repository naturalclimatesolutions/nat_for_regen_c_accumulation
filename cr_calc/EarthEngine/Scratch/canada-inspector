/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var canada_carbon1 = ee.Image("projects/TNC_Africa/carbon/outputs/canada_001"),
    extent = ee.Image("projects/TNC_Africa/carbon/extents/canada_grid"),
    canada_carbon = ee.Image("projects/TNC_Africa/carbon/outputs/canada_ensemble"),
    points = ee.FeatureCollection("projects/TNC_Africa/carbon/inventory/canada_agc");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
var vis_pars = {
  min: 0,
  max: 2,
  palette: ['#8C8053', '#867C4E', '#7B7648', '#737146', '#63623E', '#515832', '#3C4924', '#344220', '#2B391D']
};
Map.centerObject(extent, 4);

Map.addLayer(canada_carbon.select(3).updateMask(1),{min:0.01, max:0.3, palette:['#000004', '#2C105C', '#711F81', '#B63679', '#EE605E', '#FDAE78', '#FCFDBF']}, 'AGC')
Map.addLayer(canada_carbon.select(0).updateMask(1), vis_pars, 'standard deviation');
Map.addLayer(points, {color: 'yellow'}, 'Training Points', false);

// Create an inspector panel with a horizontal layout.
var inspector = ui.Panel({
  layout: ui.Panel.Layout.flow('horizontal')
});

// Add a label to the panel.
inspector.add(ui.Label('Click to get Carbon Sequestration Rate'));

// Add the panel to the default map.
Map.add(inspector);

// Set the default map's cursor to a "crosshair".
Map.style().set('cursor', 'crosshair');

// Register a callback on the map to be invoked when the map is clicked.
Map.onClick(function(coords) {
  // Clear the panel and show a loading message.
  inspector.clear();
  inspector.style().set('shown', true);
  inspector.add(ui.Label('Loading...', {color: 'gray'}));

  // Compute the mean NDVI; a potentially long-running server operation.
  var point = ee.Geometry.Point(coords.lon, coords.lat);
  var carbon = canada_carbon.select([0,3]);

  var carbon_samp = carbon.reduceRegion(ee.Reducer.mean(), point, 30);
  // var sd_samp = sd.reduceRegion(ee.Reducer.mean(), point, 30);
  var computedValue = carbon_samp//.get('mean');

  // var computedValue2 = sd_samp.get('mean');
  // Request the value from the server and use the results in a function.
  computedValue.evaluate(function(result) {
    inspector.clear();
    result = ee.Dictionary(result)
    var c = ee.Number(result.get('agc_mg_ha_yr')).getInfo()
    var s = result.get('agc_mg_ha_yr_stdDev').getInfo()
    // Add a label with the results from the server.
    inspector.add(ui.Label({
      value: 'AGC Mg/ha/yr: ' + c,
      style: {stretch: 'vertical'}
    })).add(ui.Label({
      value: 'Standard Deviation: ' + s,
      style: {stretch: 'vertical'}
    }))
    // Add a button to hide the Panel.
    inspector.add(ui.Button({
      label: 'Close',
      onClick: function() {
        inspector.style().set('shown', false);
      }
    }));
  });
});

