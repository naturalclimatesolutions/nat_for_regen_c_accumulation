/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var geometry = 
    /* color: #d63000 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-74.64382943289499, 6.220695704010328],
          [-74.64382943289499, -8.414371002129068],
          [-51.704376307895, -8.414371002129068],
          [-51.704376307895, 6.220695704010328]]], null, false),
    data1 = ee.FeatureCollection("projects/TNC_Africa/carbon/plot_data/agc_plot_cleaned"),
    data2 = ee.FeatureCollection("projects/ee-groa-carbon-accumulation/assets/plot-data/sp_agg_split_std_0_1"),
    data3 = ee.FeatureCollection("projects/TNC_Africa/carbon/plot_data/cl_sp_agg_plots_2"),
    geometry2 = 
    /* color: #98ff00 */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-85.33896761221717, 10.39188943207346],
          [-85.33896761221717, 10.37538433720117],
          [-85.33094244284462, 10.37538433720117],
          [-85.33094244284462, 10.39188943207346]]], null, false);
/***** End of imports. If edited, may not auto-convert in the playground. *****/
var data4a = ee.FeatureCollection("projects/wri-datalab/CarbonSequestrationAI/TrainingPoints/Train");
var data4b = ee.FeatureCollection("projects/wri-datalab/CarbonSequestrationAI/TrainingPoints/Test");
// Map.addLayer(data4a)
// data1 = data1.filterBounds(geometry)
// data2 = data2.filterBounds(geometry).filter(ee.Filter.eq('type', 'training'))
// data3 = data3.filterBounds(geometry)
// var data4 = data4a.filterBounds(geometry)
// var chart1 = ui.Chart.feature.byFeature(data1,'age', 'agc_mgha').setChartType('ScatterChart')
// var chart2 = ui.Chart.feature.byFeature(data2, 'age', 'agc_mgha').setChartType('ScatterChart')
// var chart3 = ui.Chart.feature.byFeature(data3, 'age', 'agc_mgha').setChartType('ScatterChart')
// var chart4 = ui.Chart.feature.byFeature(data4, 'stand_age', 'total_AGC_Mg_ha').setChartType('ScatterChart')

// print(chart1)
// print(chart2)
// print(chart3)
// print(chart4)

// print(data4a.merge(data4b).first())
Map.centerObject(geometry2)
print(data2.filterBounds(geometry2))
Map.addLayer(data1)
Map.addLayer(data2)
var chart3 = ui.Chart.feature.byFeature(data2.filterBounds(geometry2), 'age', 'agc_mgha').setChartType('ScatterChart')

var chart4 = ui.Chart.feature.byFeature(data1.filterBounds(geometry2), 'age', 'agc_mgha').setChartType('ScatterChart')

print(chart4);
print(chart3);



// Map.addLayer(data1)
// Map.addLayer(data2)
// Map.centerObject(geometry2)