/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var a_e = ee.Image("projects/ee-groa-carbon-accumulation/assets/cr_pars/a-std-error"),
    a = ee.Image("projects/ee-groa-carbon-accumulation/assets/cr_pars/a"),
    b = ee.Image("projects/ee-groa-carbon-accumulation/assets/cr_pars/b"),
    b_e = ee.Image("projects/ee-groa-carbon-accumulation/assets/cr_pars/b-std-error"),
    k = ee.Image("projects/ee-groa-carbon-accumulation/assets/cr_pars/k"),
    k_e = ee.Image("projects/ee-groa-carbon-accumulation/assets/cr_pars/k-std-error"),
    point = /* color: #d63000 */ee.Geometry.Point([21.042524149659915, 0.4192471064155954]),
    mo = ee.Image("projects/ee-groa-carbon-accumulation/assets/validation/Full_TGB_potential_Map_ensembled_mean_merged"),
    walker = ee.Image("projects/ee-groa-carbon-accumulation/assets/agc-max/pot_agc_mgha");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
var app = require("users/NathanielPaulRobinson/TNC-GCS:carbon-accumulation-app/app-base").app;

var iterations = ee.List.sequence(1,100,1);

var ages = ageList(1, 200, 1);

var rnd = ee.Image.random(1, 'normal');

var error = b_e;
var est = b;
mo = mo.multiply(0.75);


var smpEst = est.add(rnd.multiply(error));
var n = Math.sqrt(20);
var rf = rawModel();

var crEstimates = ee.ImageCollection(ages.map(function(age){
  age = ee.Number(age);
  var crPars = a.addBands([k, b]).rename(['A', 'K', 'B']);
  var crEstimate = calcCrEstimate(age, crPars).rename('estimate');
  var confidence = ee.ImageCollection(iterations.map(function(i){
    var seedA = ee.Number(i);
    var seedK = seedA.add(1);
    var seedB = seedA.add(2);
    var randomA = ee.Image.random(seedA, 'normal');
    randomA = a.add(randomA.multiply(a_e));
    var randomK = ee.Image.random(seedK, 'normal');
    randomK = k.add(randomK.multiply(k_e));
    var randomB = ee.Image.random(seedB, 'normal');
    randomB = b.add(randomB.multiply(b_e));
    var pars = randomA.addBands([randomK, randomB]).rename(["A", "K", "B"]);
    var cr = calcCrEstimate(age, pars);
    return cr;
    }
  )).reduce(ee.Reducer.percentile([2.5,97.5]))
    .rename(['lower',  'upper']);
    
  var nullImage = ee.Image(0).selfMask().rename('actual');
  var raw = rf.filter(ee.Filter.eq('age', age));
  var test = raw.size();
  var actual = ee.Image(
    ee.Algorithms.If(test.eq(1), 
    raw.first().rename(['e', 'f', 'g']), 
    nullImage));
  var max = walker.addBands([mo, a]).rename(['h', 'i', 'j']);
  return  crEstimate.addBands(confidence).set({'age': age})
    .rename('a', 'b', 'c')
    .addBands([actual, max])
    ;
}));



var plot = ui.Chart.image.series({
      imageCollection: crEstimates,
      region: point,
      reducer: ee.Reducer.mean(),
      scale: 500,
      xProperty: 'age' 
    }).setSeriesNames(['Est', '95% CI', '', 'RF-mean', 'RF-min', 'RF-max', 'Walker Max', 'Mo Max', 'Predicted Max'])
      .setChartType('ScatterChart')
      .setOptions({
        // isStacked: true,
        title: 'Above Ground Carbon Accumulation',
        hAxis: {title: 'Age', titleTextStyle: {italic: false, bold: true}},
        vAxis: {
          title: 'AGC MgCha-1',
          titleTextStyle: {italic: false, bold: true},
          // viewWindow: {min: 0, max: 200}
              },
        // chartArea: {left:80, right:80},
        series: {
          2: {curveType: 'function', 
            pointSize: 0, 
            lineWidth: 1.5,
            lineDashStyle: [4, 2],
            visibleInLegend: false,
            color: app.styles.colors.rust},
          1: {curveType: 'function', 
            pointSize: 0, 
            lineWidth: 1.5,
            lineDashStyle: [4, 2],
            color: app.styles.colors.rust},
          0: {curveType: 'function', 
            pointSize: 0, 
            lineWidth: 2, 
            color: app.styles.colors.oakGreen},
          3: {type: 'scatter', 
            pointSize: 10, 
            dataOpacity: 0.9,  
            color: app.styles.colors.acadia, 
            pointShape: { type: 'star', sides: 8, dent: 0.3 }},
          4: {type: 'scatter', 
            pointSize: 10, 
            dataOpacity: 0.9, 
            color: app.styles.colors.yellowField, 
            pointShape: { type: 'star', sides: 8, dent: 0.3 }},
          5: {type: 'scatter', 
            pointSize: 10, 
            dataOpacity: 0.9, 
            color: app.styles.colors.rust, 
            pointShape: { type: 'star', sides: 8, dent: 0.3 }},
          6: {curveType: 'function', 
            pointSize: 0, 
            lineWidth: 2,
            lineDashStyle: [4, 2],
            color: app.styles.colors.ochre},
          7: {curveType: 'function', 
            pointSize: 0, 
            lineWidth: 2,
            lineDashStyle: [4, 2],
            color: app.styles.colors.lime},
          8: {curveType: 'function', 
            pointSize: 0, 
            lineWidth: 2,
            lineDashStyle: [4, 2],
            color: app.styles.colors.spruce}
        }
      });


print(plot);

var error = a_e.addBands([b_e, k_e]).rename(["A-Error", 'B-Error', 'K-Error']);

var errorPoint = error.reduceRegion({
  geometry: point,
  reducer: ee.Reducer.mean(),
  scale: 500,
  crs: 'EPSG:4326'
});

print(errorPoint)

Map.addLayer(a_e, {min:0.25, max:20, palette: ["a0c04d","A88701","e39717","c95c1a"]}, "a_error", false);
Map.addLayer(b_e, {min:0.002, max:0.03, palette: ["a0c04d","A88701","e39717","c95c1a"]}, "b_error", false);
Map.addLayer(k_e, {min:0.0003, max:0.0027, palette: ["a0c04d","A88701","e39717","c95c1a"]}, "k_error", false);


function ageList(start, end, by){
  var defaultAges = ee.List.sequence(1,100, 1);
  
  if (start>=0) {
    return ee.List.sequence(start, end, by);
  } else {
    return defaultAges;
  }
}

function calcCrEstimate(t, parImage){
  var cr = ee.Image().expression({
    expression: "a * pow(1-(b*exp(-k*t)), 1/(1-m))",
    map: {
      "t": t,
      "a": parImage.select('A'),
      "k": parImage.select('K'),
      "b": parImage.select('B'),
      "m": 2/3,
      "e": Math.E
    }
  }).float();
  return cr.rename('AGC');
}

function calcCrEstimateNumber(t, a, b, k){
  var cr = ee.Number.expression({
    expression: "a * pow(1-(b*exp(-k*t)), 1/(1-m))",
    vars: {
      "t": t,
      "a": a,
      "k": k,
      "b": b,
      "m": 2/3,
      "e": Math.E
    }
  });
  return cr;
}

function calcCR(t, parImage){
  var cr = ee.ImageCollection(t.map(function(age){
    age = ee.Number(age).int();
    var crEstimate = calcCrEstimate(age, parImage);
    return crEstimate.set({'age':age});
  }));
  return cr;
}


function combineCollections(crCol, rawCol){
  return crCol.map(function(img){
    var age = img.get('age');
    var nullImage = ee.Image(0).selfMask().rename('actual');
    var raw = rawCol.filter(ee.Filter.eq('age', age));
    var test = raw.size();
    var actual = ee.Image(
      ee.Algorithms.If(test.eq(1), 
      raw.first(), 
      nullImage));
    return img.addBands(actual);
  });
}



function rawModel(){
  var ids = [];
  
  for(var i = 5; i<=100; i+=5){
    var path = "projects/ee-groa-carbon-accumulation/assets/agc_accumulation/age_" + i.toString();
    ids.push(path);
  }
  
  var agc_by_age = ee.ImageCollection(ids.map(function(id){
    var collection = ee.ImageCollection(id);
    var age = collection.first().get('age');
    var reducer = ee.Reducer.mean().combine(ee.Reducer.minMax(), null, true);
    var image = collection.reduce(reducer).set({age: age});
    return image;  
  }));
  return agc_by_age;
}



// var plot = ui.Chart.image.series({
//       imageCollection: crEstimates.select(['lower', 'uppper']),
//       region: point,
//       reducer: ee.Reducer.mean(),
//       scale: 500,
//       xProperty: 'age' 
//     }).setSeriesNames([ 'CR  Prediction', 'Lower CI', 'Upper CI', 'Mean CI'])
//       .setChartType('ScatterChart')
//       .setOptions({
//         title: 'Above Ground Carbon Accumulation',
//         hAxis: {title: 'Age', titleTextStyle: {italic: false, bold: true}},
//         vAxis: {
//           title: 'AGC MgCha-1',
//           titleTextStyle: {italic: false, bold: true},
//           // viewWindow: {min: 0, max: max}
//               },
//         series: {
//           1: {type: 'scatter', 
//             pointSize: 10, 
//             dataOpacity: 0.9,  
//             color: app.styles.colors.acadia, 
//             pointShape: { type: 'star', sides: 8, dent: 0.3 }},
//           2: {type: 'scatter', 
//             pointSize: 10, 
//             dataOpacity: 0.9, 
//             color: app.styles.colors.yellowField, 
//             pointShape: { type: 'star', sides: 8, dent: 0.3 }},
//           3: {type: 'scatter', 
//             pointSize: 10, 
//             dataOpacity: 0.9, 
//             color: app.styles.colors.rust, 
//             pointShape: { type: 'star', sides: 8, dent: 0.3 }},
//           0: {curveType: 'function', 
//             pointSize: 0, 
//             lineWidth: 2, 
//             color: app.styles.colors.oakGreen},
//         }
//       });
