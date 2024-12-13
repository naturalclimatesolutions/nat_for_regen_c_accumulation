/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var geometry = /* color: #98ff00 */ee.Geometry.MultiPoint();
/***** End of imports. If edited, may not auto-convert in the playground. *****/
//============================================================================//
// ## App Load ##
/**/

var app = require("users/NathanielPaulRobinson/TNC-GCS:carbon-accumulation-app/app-base").app;

var labels = {
  title: app.label('Natural Forest Regrowth', 'title'),
  subTitle: app.label('Carbon Accumulation Explorer', 'subTitle'),
  select1: app.label('1. Choose what this App Does', 'appOptions')
};

var user = {
  select1: app.actions.selector(analyses(), 'Select Function', appUpdate)
};

var panels = {
  main: app.panel(null, 'main'),
  bg: app.panel(null, 'background'),
  title: app.panel([labels.title, labels.subTitle], 'sub'),
  select1: app.panel([labels.select1, user.select1], 'sub'),
  analysisPanel: app.panel(null, 'sub'),
  analysisPanel2: app.panel(null, 'sub'),
  logoPanel: app.panel([app.logoImg()], 'logo'),
  sectionBreak1: app.panel(null, 'section'),
  sectionBreak2: app.panel(null, 'section'),
  sectionBreak3: app.panel(null, 'section'),
  sectionBreak4: app.panel(null, 'section'),
  chartPanel: app.panel(null, 'popup2')
};

var APP = {};

APP.boot1 = function(){
  ui.root.insert(0, panels.bg);
  panels.bg.add(panels.main);
  clearGeometries()
};

APP.boot2 = function() {
  panels.main.add(panels.title);
  panels.main.add(panels.sectionBreak1);
  panels.main.add(panels.select1);
  panels.main.add(panels.sectionBreak2);
  panels.main.add(panels.analysisPanel);
  panels.main.add(panels.sectionBreak3);
  panels.main.add(panels.analysisPanel2);
  panels.main.add(panels.sectionBreak4);
  panels.main.add(panels.logoPanel);
  Map.add(panels.chartPanel);
  panels.chartPanel.style().set('shown', false);
};

APP.boot1();
APP.boot2();

function appUpdate(analysis){
  hardReset();
  
  if(analysis == analyses()[0])
    appDescription();
  else if (analysis == analyses()[1])
    crViz(),
    crParExplore();
  else if (analysis == analyses()[2])
    accumulation();
  else if (analysis == analyses()[3])
    growthRates();
  else if (analysis == analyses()[4])
    ages();
}
/**/


//============================================================================//
// ## App Description ##
/**/
function appDescription(){
  var button = ui.Button({
    label: "close",
    onClick: closePopup
  });
  
  var textPanel = app.panel([
    app.label(app.mainText.a, "textTitle"),
    app.label(app.mainText.b, "textHeading"),
    app.label(app.mainText.c, "textBody"),
    app.label(app.mainText.d, "textHeading"),
    app.label(app.mainText.e, "textBody"),
    app.label(app.mainText.f, "textBody"),
    app.label(app.mainText.g, "textBody"),
    button
    ],
    'popup');

  function closePopup(){
    textPanel.style().set('shown', false);
  }
  Map.add(textPanel);
}
/**/


//============================================================================//
// ## CR Visualization ##
/**/

// Map Layers
function crViz(){
  var analysisLabel = app.label('2. Set Visualization Parameters', 'appOptions');
  
  var vizLabel = app.label('Add To Map', 'appVars');
  var minLabel = app.label('Set Min', 'appVars');
  var maxLabel = app.label('Set Max', 'appVars');
  var opacityLabel = app.label('Opacity', 'appVars');
  var defaults = {
    amin: "20",
    amax: "200",
    bmin: "0.02",
    bmax: "1",
    kmin: "0",
    kmax: "0.05",
    opacity: 1,
  };
  var height = '25px';
  var aCheck = app.actions.checkbox("A", false, height, layerViz);
  var aMin = app.actions.textbox(defaults.amin, defaults.amin, layerViz);
  var aMax = app.actions.textbox(defaults.amax, defaults.amax, layerViz);
  var aSlide = app.actions.slider(0,1,defaults.opacity,0.01, height);
  
  aSlide.onSlide(function(value){
    Map.layers().get(0).setOpacity(value);
  });
  
  var bCheck = app.actions.checkbox("B", false, height, layerViz);
  var bMin = app.actions.textbox(defaults.bmin, defaults.bmin, layerViz);
  var bMax = app.actions.textbox(defaults.bmax, defaults.bmax, layerViz);
  var bSlide = app.actions.slider(0,1,defaults.opacity,0.01, height);
  
  bSlide.onSlide(function(value){
    Map.layers().get(1).setOpacity(value);
  });
  
  var kCheck = app.actions.checkbox("K", false, height, layerViz);
  var kMin = app.actions.textbox(defaults.kmin, defaults.kmin, layerViz);
  var kMax = app.actions.textbox(defaults.kmax, defaults.kmax, layerViz);
  var kSlide = app.actions.slider(0,1,defaults.opacity,0.01, height);
  kSlide.onSlide(function(value){
    Map.layers().get(2).setOpacity(value);
  });
  
  var vizPanel = app.panel([vizLabel, aCheck, bCheck, kCheck], 'subsplit25');
  var minPanel = app.panel([minLabel, aMin, bMin, kMin], 'subsplit25');
  var maxPanel = app.panel([maxLabel, aMax, bMax, kMax], 'subsplit25');
  var slidePanel = app.panel([opacityLabel, aSlide, bSlide, kSlide], 'subsplit25');
  var crPanel = app.panel([vizPanel, minPanel, maxPanel, slidePanel], 'sub', 'horizontal');
  
  var reset = ui.Button({
    label: "Restore Defaults",
    onClick: restoreDefaults
  });
  
  var pars = app.calc.crPars;
  var a = pars.select('A');
  var b = pars.select('B');
  var k = pars.select('K');
  
  
  function restoreDefaults(){
    aCheck.setValue(false);
    bCheck.setValue(false);
    kCheck.setValue(false);
    
    aMin.setValue(defaults.amin);
    aMax.setValue(defaults.amax);
    
    bMin.setValue(defaults.bmin);
    bMax.setValue(defaults.bmax);
    
    kMin.setValue(defaults.kmin);
    kMax.setValue(defaults.kmax);
    
    aSlide.setValue(defaults.opacity);
    bSlide.setValue(defaults.opacity);
    kSlide.setValue(defaults.opacity);
  }
  
  var legendPanel = app.panel(null, 'sub');
  panels.analysisPanel
    .add(analysisLabel)
    .add(crPanel)
    .add(legendPanel)
    .add(reset);
    
  function layerViz(){
    softReset();
    legendPanel.clear();
    var aViz = aCheck.getValue();
    var bViz = bCheck.getValue();
    var kViz = kCheck.getValue();
    var a_min = Number(aMin.getValue());
    var a_max = Number(aMax.getValue());
    var b_min = Number(bMin.getValue());
    var b_max = Number(bMax.getValue());
    var k_min = Number(kMin.getValue());
    var k_max = Number(kMax.getValue());
    
    var aLegend = app.legend(app.styles.visPars('a').palette, a_min, a_max, "A - curve asymptote");
    var bLegend = app.legend(app.styles.visPars('b').palette, b_min, b_max, "B - curve intercept");
    var kLegend = app.legend(app.styles.visPars('k').palette, k_min, k_max, "K - curve shape");
    
    legendPanel
      .add(aLegend)
      .add(bLegend)
      .add(kLegend);
    Map.addLayer(a, app.styles.visPars('a', a_min, a_max), "A", aViz);
    Map.addLayer(b, app.styles.visPars('b',b_min, b_max), "B", bViz);
    Map.addLayer(k, app.styles.visPars('k', k_min, k_max), "K", kViz);
    
  }
}


// Chart Layers
function crParExplore(){
  var analysisLabel = app.label('3. Explore CR Curve Dynamics', 'appOptions');
    panels.analysisPanel2
      .add(analysisLabel);
  
  var agePanel = app.panel(null, 'sub');
  var ageLabel = app.label('Set Age Min and Max for Time Series', 'appSteps');
  var minLabel = app.label('Min:', 'appVars');
  var minBox = app.actions.textbox("0", "0");
  var maxLabel = app.label('Max:', 'appVars');
  var maxBox = app.actions.textbox("100", "100");
  var minPanel = app.panel([minLabel, minBox], 'subsplit50', 'horizontal');
  var maxPanel = app.panel([maxLabel, maxBox], 'subsplit50', 'horizontal');
  var ageParPanel = app.panel([minPanel, maxPanel], 'sub', 'horizontal');
  agePanel.add(ageLabel)
    .add(ageParPanel);
    
  var parPanel = app.panel(null, 'sub');
  var parLabel = app.label('Choose the Parameter to Vary', 'appSteps');
  var aCheck = app.actions.checkbox("A", false, null, aFunction);
  var bCheck = app.actions.checkbox("B", false, null, bFunction);
  var kCheck = app.actions.checkbox("K", false, null, kFunction);
  var parCheckPanel = app.panel([aCheck, bCheck, kCheck], 'sub', 'horizontal');
  var valPanel = app.panel(null, 'sub');
  var valPanel2 = app.panel(null, 'sub', 'horizontal');
  var valLabel = app.label('Set Parameter Constant Values', 'appSteps');
  var runPanel = app.panel(null, 'sub');
  var runButton = ui.Button({
    label: 'RUN',
    onClick: runCalc
  });
  valPanel.add(valLabel).add(valPanel2).add(runPanel);
  
  parPanel.add(parLabel)
    .add(parCheckPanel)
    .add(valPanel);
  
  panels.analysisPanel2.add(agePanel)
    .add(parPanel);
  
  var aLabel = app.label("A:", "appVars");
  var bLabel = app.label("B:", "appVars");
  var kLabel = app.label("K:", "appVars");
  
  var aVal = app.actions.textbox("150", "150");
  var bVal = app.actions.textbox("1", "1");
  var kVal = app.actions.textbox("0.02", "0.02");
  
  var aPanel = app.panel([aLabel, aVal], 'subsplit50', 'horizontal');
  var bPanel = app.panel([bLabel, bVal], 'subsplit50', 'horizontal');
  var kPanel = app.panel([kLabel, kVal], 'subsplit50', 'horizontal');

  function aPars(){
    valPanel2.clear();
    runPanel.clear();
    runPanel.add(runButton);
    valPanel2.add(bPanel).add(kPanel);
  }

  function bPars(){
    runPanel.clear();
    runPanel.add(runButton);
    valPanel2.clear();
    valPanel2.add(aPanel).add(kPanel);
  }
  
  function kPars(){
    runPanel.clear();
    runPanel.add(runButton);
    valPanel2.clear();
    valPanel2.add(aPanel).add(bPanel);
  }
  
  function runCalc(){
    var age1 = Number(minBox.getValue());
    var age2 = Number(maxBox.getValue());
    var ages = app.calc.ageList(age1, age2, 1);
    
    var a = null;
    var b = null;
    var k = null;
    var calc = null;
    var chart = null;
    var steps = 6;
    var aSteps = (300 - 20)/steps;
    var bSteps = (1-0.02)/steps;
    var kSteps = (0.05 - 0)/steps;
    
    if (aCheck.getValue()) {
      var aVals = ee.List.sequence(20, 300, aSteps);

      b = Number(bVal.getValue());
     
      k = Number(kVal.getValue());

      calc = ee.FeatureCollection(ages.map(function(age){
        age = ee.Number(age);
        return ee.FeatureCollection(aVals.map(function(a){
          a = ee.Number(a).round();
          var est = app.calc.calcCrEstimateNumber(age, a, b, k);
          return ee.Feature(null, {
            age: age,
            a: a,
            b: b,
            k: k,
            cr: est
          });
        }));
      })).flatten();
      chart = ui.Chart.feature.groups({
        features: calc,
        xProperty: "age",
        yProperty: "cr",
        seriesProperty: "a"
      }).setOptions({
        title: "CR Curvers for Different Values of A",
        hAxis: {title: "Stand Age"},
        vAxis: {title: "AGC MG/HA/YR"},
        colors: app.styles.visPars('a').palette
      });
       
    } else if (bCheck.getValue()){
      
      var bVals = ee.List.sequence(0.02, 1, bSteps);
  
      a = Number(aVal.getValue());
     
      k = Number(kVal.getValue());

      calc = ee.FeatureCollection(ages.map(function(age){
        age = ee.Number(age);
        return ee.FeatureCollection(bVals.map(function(b){
          b = ee.Number(b).multiply(100).round().divide(100);

          var est = app.calc.calcCrEstimateNumber(age, a, b, k);
          return ee.Feature(null, {
            age: age,
            a: a,
            b: b,
            k: k,
            cr: est
          });
        }));
      })).flatten();
      
      chart = ui.Chart.feature.groups({
        features: calc,
        xProperty: "age",
        yProperty: "cr",
        seriesProperty: "b"
      }).setOptions({
        title: "CR Curvers for Different Values of B",
        hAxis: {title: "Stand Age"},
        vAxis: {title: "AGC MG/HA/YR"},
        colors: app.styles.visPars('b').palette
      });
     
    } else if (kCheck.getValue()){
      var kVals = ee.List.sequence(0, 0.05, kSteps);

      a = Number(aVal.getValue());
     
      b = Number(bVal.getValue());

      calc = ee.FeatureCollection(ages.map(function(age){
        age = ee.Number(age);
        return ee.FeatureCollection(kVals.map(function(k){
          k = ee.Number(k).multiply(100).round().divide(100);
          var est = app.calc.calcCrEstimateNumber(age, a, b, k);
          return ee.Feature(null, {
            age: age,
            a: a,
            b: b,
            k: k,
            cr: est
          });
        }));
      })).flatten();
      chart = ui.Chart.feature.groups({
        features: calc,
        xProperty: "age",
        yProperty: "cr",
        seriesProperty: "k"
      }).setOptions({
        title: "CR Curvers for Different Values of K",
        hAxis: {title: "Stand Age"},
        vAxis: {title: "AGC MG/HA/YR"},
        colors: app.styles.visPars('k').palette
      });
    }
  var button = ui.Button({
    label: "close",
    onClick: closePopup
  });
  panels.chartPanel.clear();
  panels.chartPanel.add(chart).add(button).style().set('shown', true);
  }

 function closePopup(){
    panels.chartPanel.style().set('shown', false);
  }
  function aFunction(val){
    if (val===true){
      bCheck.setValue(false);
      kCheck.setValue(false);
      aPars();
      
    } else {
      return;
    }
  }
  
  function bFunction(val){
    if (val===true){
      aCheck.setValue(false);
      kCheck.setValue(false);
      bPars();
    } else {
      return;
    }
  }
  
  function kFunction(val){
    if (val===true){
      aCheck.setValue(false);
      bCheck.setValue(false);
      kPars();
    } else {
      return;
    }
  }
}
/**/


//============================================================================//
// ## Accumulation ##
/**/
function accumulation(){
  var analysisLabel = app.label('2. Set Parameters', 'appOptions');
  var vizLabel = app.label('Age to Visualize', 'appVars');
  var agePanel = app.panel(null, 'sub');
  var ageLabel = app.label('Set Age Min and Max for Time Series', 'appSteps');
  var ageVizLabel = app.label('Set Stand Age to Visualize', 'appSteps');
  var minLabel = app.label('Min:', 'appVars');
  var minBox = app.actions.textbox("0", "0");
  var maxLabel = app.label('Max:', 'appVars');
  var maxBox = app.actions.textbox("100", "100");
  var minPanel = app.panel([minLabel, minBox], 'subsplit50', 'horizontal');
  var maxPanel = app.panel([maxLabel, maxBox], 'subsplit50', 'horizontal');
  var ageParPanel = app.panel([minPanel, maxPanel], 'sub', 'horizontal');
  
  var ageBoxLabel = app.label('Age:', 'appVars');
  var ageBox = app.actions.textbox("50", "50");
  var ageVizPanel = app.panel([ageBoxLabel, ageBox], 'subsplit50', 'horizontal');
  

  var runLabel = app.label('Calculate Curves', 'appSteps');
  var runButton = ui.Button({
    label: 'Run',
    onClick: updateMap
  });
  var punPanel = app.panel([runLabel, runButton], 'sub');
  var geometryLabel = app.label('3. Click on a Point to Get Results', 'appOptions');
  
  agePanel.add(ageLabel)
    .add(ageParPanel)
    .add(ageVizLabel)
    .add(ageVizPanel)
    .add(runButton);
    
  panels.analysisPanel.add(analysisLabel)
    .add(agePanel);
    
  panels.analysisPanel2.add(geometryLabel);
  
  // Limit the draw modes to point.
  Map.drawingTools().setDrawModes(['point']);
  
  // Add an empty layer to hold the drawn point.
  Map.drawingTools().addLayer([]);
  
  // Set the geometry type to be point.
  Map.drawingTools().setShape('point');
  
  // Enter drawing mode.
  Map.drawingTools().draw();
  // This function gets called when the geometry layer changes.

  
  queryLastS2Image = ui.util.debounce(queryLastS2Image, 200);
  Map.drawingTools().onDraw(queryLastS2Image);
  var growth = null;
  var combined = null;
  function updateMap(){
    softReset();
    var age1 = Number(minBox.getValue());
    var age2 = Number(maxBox.getValue());
    var ageViz = Number(ageBox.getValue());
    var ages = app.calc.ageList(age1, age2, 1);
    var crPars = app.calc.crPars;
    var rawModel = app.calc.rawModel;
    growth = app.calc.calcCR(ages, crPars);
    combined = app.calc.combineCollections(growth, rawModel);
    var layer = growth.filter(ee.Filter.eq('age',ageViz)).first();
    var layerMinMax = layer.reduceRegion({
      geometry: app.calc.gBounds,
      reducer: ee.Reducer.minMax(),
      scale: 10000,
      crs: 'EPSG:4326',
      maxPixels: 1e10
    });
    var layerMin = ee.Number(layerMinMax.get('AGC_min')).round().getInfo();
    var layerMax = ee.Number(layerMinMax.get('AGC_max')).round().getInfo();
    Map.addLayer(layer, {min: layerMin, max: layerMax, palette: app.styles.visPars('a').palette}, "Carbon at Age " + ageViz, true);
  }
  
  function queryLastS2Image() {
    if(Map.drawingTools().layers().get(0).geometries().length() > 1) {
  
      // delete previously drawn points first
      Map.drawingTools().layers().get(0).geometries().remove(Map.drawingTools().layers().get(0).geometries().get(0));
    }
    var point = Map.drawingTools().layers().get(0).toGeometry();
    var max = ee.Number(growth.max().reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: point,
      scale: 500,
      crs: 'EPSG:4326'
    }).get('AGC'));
    
    var plot = ui.Chart.image.series({
      imageCollection: combined,
      region: point,
      reducer: ee.Reducer.mean(),
      scale: 500,
      xProperty: 'age' 
    }).setSeriesNames([ 'CR  Prediction', 'RF Max', 'RF Mean', 'RF Min'])
      .setChartType('ScatterChart')
      .setOptions({
        title: 'Above Ground Carbon Accumulation',
        hAxis: {title: 'Age', titleTextStyle: {italic: false, bold: true}},
        vAxis: {
          title: 'AGC MgCha-1',
          titleTextStyle: {italic: false, bold: true},
          viewWindow: {min: 0, max: max}
              },
        series: {
          1: {type: 'scatter', 
            pointSize: 10, 
            dataOpacity: 0.9,  
            color: app.styles.colors.acadia, 
            pointShape: { type: 'star', sides: 8, dent: 0.3 }},
          2: {type: 'scatter', 
            pointSize: 10, 
            dataOpacity: 0.9, 
            color: app.styles.colors.yellowField, 
            pointShape: { type: 'star', sides: 8, dent: 0.3 }},
          3: {type: 'scatter', 
            pointSize: 10, 
            dataOpacity: 0.9, 
            color: app.styles.colors.rust, 
            pointShape: { type: 'star', sides: 8, dent: 0.3 }},
          0: {curveType: 'function', 
            pointSize: 0, 
            lineWidth: 2, 
            color: app.styles.colors.oakGreen},
        }
      });
      
    var button = ui.Button({
      label: "close",
      onClick: closePopup
    });

    panels.chartPanel.style().set('shown', true);
    panels.chartPanel.clear();
    panels.chartPanel.add(plot).add(button);
  }
}
/**/


//============================================================================//
// ## Rates ##
/**/
function growthRates(){
  Map.addLayer(app.calc.rawModel)
}
/**/


//============================================================================//
// ## Ages ##
/**/
function ages(){
  print('test5');
}
/**/


//============================================================================//
// ## Helpers ##
/**/
function analyses(){
  return [
    "App Overview",
    "Visualize CR Parameters",
    "Carbon Accumulation Through Time",
    "Compare Growth Rates",
    "Examine Accumulation at Different Ages"
    ];
}

function closePopup(){
  panels.chartPanel.style().set('shown', false);
}
  
function softReset(){
  Map.clear();
  panels.chartPanel.style().set('shown', false);
  Map.add(panels.chartPanel);
}

function hardReset(){
  Map.clear();
  Map.drawingTools().clear();
  clearGeometries();
  panels.main.clear();
  panels.chartPanel.style().set('shown', false);
  panels.analysisPanel.clear();
  panels.analysisPanel2.clear();
  APP.boot2();
}

function clearGeometries(){
  var geometries = Map.drawingTools().layers();
  var n = geometries.length();
  if(n > 0) {
    var layerToDelete = Map.drawingTools().layers().get(0);
    Map.drawingTools().layers().remove(layerToDelete)
  }
}
/**/





