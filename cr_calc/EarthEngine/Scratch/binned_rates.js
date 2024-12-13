/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var a = ee.Image("projects/ee-groa-carbon-accumulation/assets/cr_pars/a"),
    b = ee.Image("projects/ee-groa-carbon-accumulation/assets/cr_pars/b"),
    k = ee.Image("projects/ee-groa-carbon-accumulation/assets/cr_pars/k");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
var m = 2/3;
var ages = ee.List.sequence(1, 100, 1);

var cr = calcCr(ages, a, k, b, m)

var annual_rates = cr.select('annual_rate');

var rate_0_5 = getAverageRate(annual_rates, 1, 5);
var rate_6_10 = getAverageRate(annual_rates, 6, 10);
var rate_11_15 = getAverageRate(annual_rates, 11, 15);
var rate_16_20 = getAverageRate(annual_rates, 16, 20);
var rate_21_100 = getAverageRate(annual_rates, 21, 100);


var visPars = {min:0, max:3, palette: ['yellow', 'red']};

Map.addLayer(rate_0_5, visPars, 'Avg Rate: 1 - 5');
Map.addLayer(rate_6_10, visPars, 'Avg Rate: 6 - 10');
Map.addLayer(rate_11_15, visPars, 'Avg Rate: 11 - 15');
Map.addLayer(rate_16_20, visPars, 'Avg Rate: 16 - 20');
Map.addLayer(rate_21_100, visPars, 'Avg Rate: 21 - 100');

function getAverageRate(crCollection, ageStart, ageEnd){
  return crCollection.filter(
    ee.Filter.and(
      ee.Filter.gte('age', ageStart),
      ee.Filter.lte('age', ageEnd)
    )).mean();
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


function calcCr(ageList, aPars, kPars, bPars, mPar){
  return ee.ImageCollection(ageList.map(function(age){
    age = ee.Number(age).int();
    var nullImage = ee.Image(0).selfMask().rename('actual');
    var age_image = ee.Image(age).rename('age');
    var agc = calcCrEstimate(age, aPars, kPars, bPars, mPar);
    var agc_prev = calcCrEstimate(age.subtract(1), aPars, kPars, bPars, mPar);
    var agc_post = calcCrEstimate(age.add(1),aPars, kPars, bPars, mPar);
    var rate = agc_post.subtract(agc_prev).divide(2).rename('annual_rate');
    var rate2 = agc.divide(age).rename('linear_rate');
    
    return age_image.addBands([agc,rate, rate2])
      .rename(['age', 'agc', 'annual_rate', 'linear_rate'])
      .float()
      .set({age: age});
  }));
}