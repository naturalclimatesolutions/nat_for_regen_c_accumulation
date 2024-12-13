var trees_list = ee.List.sequence(25, 500, 25);
var vars_list = ee.List.sequence(1, 20, 1);
var leaf_list = ee.List.sequence(1, 10, 1);
var bag_list = ee.List.sequence(0.1, 0.9, 0.1);
  

// var age_map = ee.FeatureCollection(age_list.map(function(ages){
//   var age = ee.Number(ages).int()
  var tree_map = ee.FeatureCollection(trees_list.map(function(trees){
    var n_trees = ee.Number(trees).int();
    var var_map = vars_list.map(function(vars){
      var n_vars = ee.Number(vars).int();
      var leaf_map = leaf_list.map(function(leaf){
        var n_leaf = ee.Number(leaf).int();
        var bag_map = bag_list.map(function(bags){
          var n_bags = ee.Number(bags);
          return ee.Feature(ee.Geometry.Point([0,0]), {
            // 'age': age,
            'n_bags': n_bags,
            'n_leaf': n_leaf,
            'n_vars': n_vars,
            'n_trees': n_trees
          });
  
        });
        return ee.FeatureCollection(bag_map);
      });
      return ee.FeatureCollection(leaf_map).flatten();
    });
    return ee.FeatureCollection(var_map).flatten();
  })).flatten();
  // return ee.FeatureCollection(tree_map).flatten();
// })).flatten();

Export.table.toAsset({
  collection: tree_map,
  assetId: 'projects/ee-groa-carbon-accumulation/assets/plot-data/hyperparameter_table'
})




// Export.table.toDrive({
//   collection: tree_map,
//   fileNamePrefix: 'parameter_list',
//   folder: 'eeTempExports'
// });

