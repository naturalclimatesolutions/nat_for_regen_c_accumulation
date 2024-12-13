exports.app = {
  styles: {
    colors: colors(),
    visPars: visPars,
    labelStyles: labelStyles(),
    panelStyles: panelStyles(),
    optionStyles: optionStyles()
  },
  panel: panel,
  label: label,
  actions: {
    selector: selector,
    checkbox: checkbox,
    textbox: textbox,
    slider: slider
  },
  logoImg: logoImg,
  mainText: mainText(),
  legend: legend,
  calc: {
    crPars: crPars(),
    ageList: ageList,
    calcCrEstimate: calcCrEstimate,
    calcCrEstimateNumber: calcCrEstimateNumber,
    calcCR: calcCR,
    rawModel: rawModel(),
    combineCollections: combineCollections,
    gBounds: gBounds()
  }
};

//****************************************************************************//
// ## App Calc ##

function mainText(){
  return {
    a: "Explore Carbon Accumulation Dyamics for Naturally Regenerating Forests",
    b: "Methods:",
    c: "We modeled carbon accumulation rates in naturally regenerating forests\
        for forest age classes (5-100 years). Using the modeled results we fitted\
        Chapman Richards Curves and produce global wall to wall maps of the key\
        Chapman Richards Parameters. This app is designed to help explore the\
        outputs of this analysis through a variety of possible approaches.",
    d: "CR Curve Parameters",
    e: "A: curve asymptote (maximum carbon accumulation potential)",
    f: "K: controls curve shape ",
    g: "B: controls the intercept (1 = 0 intercept)"
  };
}

function crPars(){
  var A = ee.Image("projects/ee-groa-carbon-accumulation/assets/cr_pars/a");
  var B = ee.Image("projects/ee-groa-carbon-accumulation/assets/cr_pars/b");
  var K = ee.Image("projects/ee-groa-carbon-accumulation/assets/cr_pars/k");
  return A.addBands([B, K])
    .rename(["A", "B", 'K']);
}

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

function gBounds(){
  var geometry = ee.Geometry.Polygon(
        [[[-126.225390625, 50.697987283720266],
          [-126.225390625, 32.49558376651376],
          [-113.744921875, 32.49558376651376],
          [-113.744921875, 50.697987283720266]]], null, false);
  return geometry;
}

function visPars(par, min, max){
  var palettes = {
    'k': ['040613', '292851', '3f4b96', '427bb7', '61a8c7', '9cd4da', 'eafdfd'],
    'a': ["ffffcc","d9f0a3","addd8e","78c679","41ab5d","238443","005a32"],
    'b': ["ffffcc","d9f0a3","addd8e","78c679","41ab5d","238443","005a32"]
    };
  return {min: min, max: max, palette: palettes[par]};
}

//****************************************************************************//
// ## App Panels ##
function panel(widgets, style, layout){
  return ui.Panel({
    widgets: widgets,
    layout: ui.Panel.Layout.Flow(layout),
    style: panelStyles()[style]

  });
}

//****************************************************************************//
// ## App Labels ##
function label(text, style){
  return ui.Label({
    value: text,
    style: labelStyles()[style]
  });

}

//****************************************************************************//
// ## App User Interface ##

function selector(items, placeholder, action){
  return ui.Select({
    items: items,
    placeholder: placeholder,
    onChange: action
  });
}

function checkbox(label, value, height, action){
  return ui.Checkbox({
    label: label,
    value: value,
    onChange: action,
    style: {
      height: height,
      backgroundColor: colors().icicle
    }
  });
}

function textbox(placholder, value, action){
  return ui.Textbox({
  placeholder: placholder,
  value: value,
  style: {
    width: '50px',
  },
  onChange: action
  });
}

function slider(min, max, value, step, height, action){
  return ui.Slider({
  min: min,
  max: max,
  value: value,
  step: step,
  onChange: action,
  style: {
    height: height,
    backgroundColor: colors().icicle
  }
  });
}


function logoImg(){
  return ui.Thumbnail({
    image: ee.Image("projects/ee-groa-carbon-accumulation/assets/TNCLogoPrimary"),
    params: {
      dimensions: 1080,
      format: 'png'
    },
    style: {
      width: '200px',
      margin: '20px 8px',
      backgroundColor: colors().icicle
    }
  });
}

//****************************************************************************//
// ## App Styles ##

function labelStyles(){
  return {
    title: {
      fontWeight: "bold",
      fontSize: "20px",
      color: colors().spruce,
      backgroundColor: colors().icicle,
      width: '350px',
      textAlign: 'center',
      margin: '0px 0px -10px 0px'
    },
    subTitle: {
      fontSize: "14px",
      color: colors().olive,
      width: '350px',
      fontFamily: 'serif',
      backgroundColor: colors().icicle,
      textAlign: 'center',
      margin: '10px 0px 5px 0px'
    },
    textTitle: {
      fontSize: "14px",
      fontWeight: "bold",
      color: colors().oakGreen,
      width: '800px',
      backgroundColor: colors().icicle,
      textAlign: 'left',
      margin: '10px 0px 5px 0px'
    },
    textHeading: {
      fontSize: "12px",
      fontWeight: "bold",
      color: colors().cocoa,
      fontFamily: 'serif',
      width: '800px',
      backgroundColor: colors().icicle,
      textAlign: 'left',
      margin: '5px 0px 0px 0px'
    },
    textBody: {
      fontSize: "12px",
      color: colors().cocoa,
      width: '800px',
      backgroundColor: colors().icicle,
      textAlign: 'left',
      margin: '0px 0px 0px 10px'
    },
    appOptions: {
      fontSize: "16px",
      fontWeight: "bold",
      color: colors().spruce,
      backgroundColor: colors().icicle,
    },
    appSteps: {
      fontSize: "14px",
      fontWeight: "bold",
      color: colors().cocoa,
      backgroundColor: colors().icicle,
    },
    appVars: {
      fontSize: "12px",
      fontWeight: "bold",
      color: colors().cocoa,
      backgroundColor: colors().icicle,
    }
  };
}

function panelStyles(){
  return {
    background: {
      width: '350px',
      height: '100%',
      backgroundColor: colors().carnelian,
    },
    main: {
      width: '340px',
      height: '100%',
      margin: '5px 5px 5px 5px',
      backgroundColor: colors().icicle,
    },
    sub: {
      width: '100%',
      backgroundColor: colors().icicle,
    },
    subsplit25: {
      width: '25%',
      backgroundColor: colors().icicle,
    },
    subsplit50: {
      width: '50%',
      backgroundColor: colors().icicle,
    },
    logo: {
      width: '100%',
      backgroundColor: colors().icicle,
    },
    title: {
      width: '350px',
      position: 'top-center',
      backgroundColor: colors().crimson,
    },
    section: {
      width: '100%',
      height: "2px",
      backgroundColor: colors().spruce,
    },
    popup: {
      backgroundColor: colors().icicle
    },
    popup2: {
      width: '500px',
      backgroundColor: colors().icicle,
      shown: false,
      position: 'bottom-right'
    }
  };
    
}

function optionStyles(){
  return {
    selector: {
      backgroundColor: colors().drySage,
      color: colors().spruce,
    },
  };
}

function colors(){
  return {
    crimson: "#c5351c",
    redRock: "#f3901d",
    yellowField: "#ffe14f",
    spring: "#a0c04d",
    leafGreen: "#49a942",
    oakGreen: "#00703c",
    lake: "#0096d6",
    indigo: "#23487a",
    plum: "#90214a",
    carnelian: "#8a2f1d",
    rust: "#c95c1a",
    butternut: "#e39717",
    nutmeg: "#b48724",
    ochre: "#a88701",
    gold: "#e6b120",
    lime: "#cdc90f",
    olive: "#737c29",
    moss: "#6a8a22",
    spruce: "#4d632d",
    everglade: "#5e8827",
    clover: "#45812b",
    acadia: "#95ba79",
    mallard: "#007932",
    aqua: "#00a0af",
    marine: "#009ecb",
    glacier: "#b7dee0",
    frost: "#5e94b6",
    cirrus: "#3a89b4",
    trueBlue: "#1b75bc",
    deepWaters: "#005387",
    iris: "#46166b",
    sandstone: "#f7e7c9",
    icicle: "#e4e6d7",
    beach: "#dac792",
    driftwood: "#d2bfaa",
    drySage: "#afb087",
    mudstone: "#989482",
    storm: "#7e6a65",
    canyon: "#80561b",
    cocoa: "#623c25"
  };
}

function legend(palette, min, max, title){
  function makeColorBarParams(palette, min, max) {
      return {
        bbox: [0, 0, 1, 0.1],
        dimensions: '100x10',
        format: 'png',
        min: 0,
        max: 1,
        palette: palette,
      };
  }
  // Create the color bar for the legend.
  var colorBar = ui.Thumbnail({
    image: ee.Image.pixelLonLat().select(0),
    params: makeColorBarParams(palette, min, max),
    style: {stretch: 'horizontal', margin: '0px 8px', maxHeight: '24px'},
  });

  // Create a panel with three numbers for the legend.
  var legendLabels = ui.Panel({
    widgets: [
      ui.Label(min, {margin: '4px 8px', backgroundColor: colors().icicle}),
      ui.Label(
          ((max - min) / 2),
          {margin: '4px 8px', textAlign: 'center', stretch: 'horizontal', backgroundColor: colors().icicle}),
      ui.Label(max, {margin: '4px 8px', backgroundColor: colors().icicle})
    ],
    layout: ui.Panel.Layout.flow('horizontal'),
    style: {backgroundColor: colors().icicle}
  });

  var legendTitle = ui.Label({
    value: title,
    style: {fontWeight: 'bold', backgroundColor: colors().icicle}
  });

  var legendPanel = ui.Panel({widgets: [legendTitle, colorBar, legendLabels], style: {backgroundColor: colors().icicle}});
  return legendPanel;
}

