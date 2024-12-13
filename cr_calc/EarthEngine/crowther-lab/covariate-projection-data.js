/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var urbanLand2015 = ee.Image("projects/crowtherlab/johan/ChenEtAl_FutureUrbanLand/ChenEtAl_UrbanLand_2015"),
    bioclim_rcp85_2080 = ee.Image("projects/crowtherlab/Future_BioClim_Ensembles/rcp85_2080s_Mean"),
    bioclim_rcp85_2070 = ee.Image("projects/crowtherlab/Future_BioClim_Ensembles/rcp85_2070s_Mean"),
    bioclim_rcp85_2050 = ee.Image("projects/crowtherlab/Future_BioClim_Ensembles/rcp85_2050s_Mean"),
    bioclim_rcp85_2030 = ee.Image("projects/crowtherlab/Future_BioClim_Ensembles/rcp85_2030s_Mean"),
    bioclim_rcp45_2080 = ee.Image("projects/crowtherlab/Future_BioClim_Ensembles/rcp45_2080s_Mean"),
    bioclim_rcp45_2070 = ee.Image("projects/crowtherlab/Future_BioClim_Ensembles/rcp45_2070s_Mean"),
    bioclim_rcp45_2050 = ee.Image("projects/crowtherlab/Future_BioClim_Ensembles/rcp45_2050s_Mean"),
    bioclim_rcp45_2030 = ee.Image("projects/crowtherlab/Future_BioClim_Ensembles/rcp45_2030s_Mean"),
    bioclim_chelsa_rcp85_2070 = ee.Image("projects/crowtherlab/johan/CHELSA_Future_BioClim_Ensembles/rcp85_2070s_mean"),
    gcam_demeter_landuse_ssp1_rcp26_2015 = ee.Image("users/crowtherlab/GCAM_FutureLandUse/GCAM_Demeter_harmonized_PFTs/HarmonizedLandUse_11PFTs/ssp1_rcp26_2015_mean_11PFTs"),
    gcam_demeter_landuse_ssp1_rcp26_2060 = ee.Image("users/crowtherlab/GCAM_FutureLandUse/GCAM_Demeter_harmonized_PFTs/HarmonizedLandUse_11PFTs/ssp1_rcp26_2060_mean_11PFTs"),
    gcam_demeter_landuse_ssp1_rcp26_2080 = ee.Image("users/crowtherlab/GCAM_FutureLandUse/GCAM_Demeter_harmonized_PFTs/HarmonizedLandUse_11PFTs/ssp1_rcp26_2080_mean_11PFTs"),
    gcam_demeter_landuse_ssp2_rcp45_2015 = ee.Image("users/crowtherlab/GCAM_FutureLandUse/GCAM_Demeter_harmonized_PFTs/HarmonizedLandUse_11PFTs/ssp2_rcp45_2015_mean_11PFTs"),
    gcam_demeter_landuse_ssp2_rcp45_2060 = ee.Image("users/crowtherlab/GCAM_FutureLandUse/GCAM_Demeter_harmonized_PFTs/HarmonizedLandUse_11PFTs/ssp2_rcp45_2060_mean_11PFTs"),
    gcam_demeter_landuse_ssp2_rcp45_2080 = ee.Image("users/crowtherlab/GCAM_FutureLandUse/GCAM_Demeter_harmonized_PFTs/HarmonizedLandUse_11PFTs/ssp2_rcp45_2080_mean_11PFTs"),
    gcam_demeter_landuse_ssp3_rcp60_2015 = ee.Image("users/crowtherlab/GCAM_FutureLandUse/GCAM_Demeter_harmonized_PFTs/HarmonizedLandUse_11PFTs/ssp3_rcp60_2015_mean_11PFTs"),
    gcam_demeter_landuse_ssp3_rcp60_2060 = ee.Image("users/crowtherlab/GCAM_FutureLandUse/GCAM_Demeter_harmonized_PFTs/HarmonizedLandUse_11PFTs/ssp3_rcp60_2060_mean_11PFTs"),
    gcam_demeter_landuse_ssp3_rcp60_2080 = ee.Image("users/crowtherlab/GCAM_FutureLandUse/GCAM_Demeter_harmonized_PFTs/HarmonizedLandUse_11PFTs/ssp3_rcp60_2080_mean_11PFTs"),
    gcam_demeter_landuse_ssp4_rcp60_2015 = ee.Image("users/crowtherlab/GCAM_FutureLandUse/GCAM_Demeter_harmonized_PFTs/HarmonizedLandUse_11PFTs/ssp4_rcp60_2015_mean_11PFTs"),
    gcam_demeter_landuse_ssp4_rcp60_2060 = ee.Image("users/crowtherlab/GCAM_FutureLandUse/GCAM_Demeter_harmonized_PFTs/HarmonizedLandUse_11PFTs/ssp4_rcp60_2060_mean_11PFTs"),
    gcam_demeter_landuse_ssp4_rcp60_2080 = ee.Image("users/crowtherlab/GCAM_FutureLandUse/GCAM_Demeter_harmonized_PFTs/HarmonizedLandUse_11PFTs/ssp4_rcp60_2080_mean_11PFTs"),
    gcam_demeter_landuse_ssp5_rcp85_2015 = ee.Image("users/crowtherlab/GCAM_FutureLandUse/GCAM_Demeter_harmonized_PFTs/HarmonizedLandUse_11PFTs/ssp5_rcp85_2015_mean_11PFTs"),
    gcam_demeter_landuse_ssp5_rcp85_2060 = ee.Image("users/crowtherlab/GCAM_FutureLandUse/GCAM_Demeter_harmonized_PFTs/HarmonizedLandUse_11PFTs/ssp5_rcp85_2060_mean_11PFTs"),
    gcam_demeter_landuse_ssp5_rcp85_2080 = ee.Image("users/crowtherlab/GCAM_FutureLandUse/GCAM_Demeter_harmonized_PFTs/HarmonizedLandUse_11PFTs/ssp5_rcp85_2080_mean_11PFTs"),
    bioclim_chelsa_rcp85_2050 = ee.Image("projects/crowtherlab/johan/CHELSA_Future_BioClim_Ensembles/rcp85_2050s_mean"),
    bioclim_chelsa_rcp60_2070 = ee.Image("projects/crowtherlab/johan/CHELSA_Future_BioClim_Ensembles/rcp60_2070s_mean"),
    bioclim_chelsa_rcp60_2050 = ee.Image("projects/crowtherlab/johan/CHELSA_Future_BioClim_Ensembles/rcp60_2050s_mean"),
    bioclim_chelsa_rcp45_2070 = ee.Image("projects/crowtherlab/johan/CHELSA_Future_BioClim_Ensembles/rcp45_2070s_mean"),
    bioclim_chelsa_rcp45_2050 = ee.Image("projects/crowtherlab/johan/CHELSA_Future_BioClim_Ensembles/rcp45_2050s_mean"),
    bioclim_chelsa_rcp26_2070 = ee.Image("projects/crowtherlab/johan/CHELSA_Future_BioClim_Ensembles/rcp26_2070s_mean"),
    bioclim_chelsa_rcp26_2050 = ee.Image("projects/crowtherlab/johan/CHELSA_Future_BioClim_Ensembles/rcp26_2050s_mean"),
    urbanLand_ssp5_2080 = ee.Image("projects/crowtherlab/johan/ChenEtAl_FutureUrbanLand/ChenEtAl_UrbanLand_ssp5_2080"),
    urbanLand_ssp5_2060 = ee.Image("projects/crowtherlab/johan/ChenEtAl_FutureUrbanLand/ChenEtAl_UrbanLand_ssp5_2060"),
    urbanLand_ssp4_2080 = ee.Image("projects/crowtherlab/johan/ChenEtAl_FutureUrbanLand/ChenEtAl_UrbanLand_ssp4_2080"),
    urbanLand_ssp4_2060 = ee.Image("projects/crowtherlab/johan/ChenEtAl_FutureUrbanLand/ChenEtAl_UrbanLand_ssp4_2060"),
    urbanLand_ssp3_2080 = ee.Image("projects/crowtherlab/johan/ChenEtAl_FutureUrbanLand/ChenEtAl_UrbanLand_ssp3_2080"),
    urbanLand_ssp3_2060 = ee.Image("projects/crowtherlab/johan/ChenEtAl_FutureUrbanLand/ChenEtAl_UrbanLand_ssp3_2060"),
    urbanLand_ssp2_2080 = ee.Image("projects/crowtherlab/johan/ChenEtAl_FutureUrbanLand/ChenEtAl_UrbanLand_ssp2_2080"),
    urbanLand_ssp2_2060 = ee.Image("projects/crowtherlab/johan/ChenEtAl_FutureUrbanLand/ChenEtAl_UrbanLand_ssp2_2060"),
    urbanLand_ssp1_2080 = ee.Image("projects/crowtherlab/johan/ChenEtAl_FutureUrbanLand/ChenEtAl_UrbanLand_ssp1_2080"),
    urbanLand_ssp1_2060 = ee.Image("projects/crowtherlab/johan/ChenEtAl_FutureUrbanLand/ChenEtAl_UrbanLand_ssp1_2060");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
print(urbanLand_ssp1_2060);
// print(urbanLand_ssp1_2080);
// print(urbanLand_ssp2_2060);
// print(urbanLand_ssp2_2080);
// print(urbanLand_ssp3_2060);
// print(urbanLand_ssp3_2080);
// print(urbanLand_ssp4_2060);
// print(urbanLand_ssp4_2080);
// print(urbanLand_ssp5_2060);
// print(urbanLand_ssp5_2080);

print(bioclim_chelsa_rcp26_2050);
// print(bioclim_chelsa_rcp26_2070);
// print(bioclim_chelsa_rcp45_2050);
// print(bioclim_chelsa_rcp45_2070);
// print(bioclim_chelsa_rcp60_2050);
// print(bioclim_chelsa_rcp60_2070);
// print(bioclim_chelsa_rcp85_2050);
// print(bioclim_chelsa_rcp85_2070);

print(bioclim_rcp45_2030);
// print(bioclim_rcp45_2050);
// print(bioclim_rcp45_2070);
// print(bioclim_rcp45_2080);
// print(bioclim_rcp85_2030);
// print(bioclim_rcp85_2050);
// print(bioclim_rcp85_2070);
// print(bioclim_rcp85_2080);

print(gcam_demeter_landuse_ssp1_rcp26_2015);
// print(gcam_demeter_landuse_ssp1_rcp26_2060);
// print(gcam_demeter_landuse_ssp1_rcp26_2080);
// print(gcam_demeter_landuse_ssp2_rcp45_2015);
// print(gcam_demeter_landuse_ssp2_rcp45_2060);
// print(gcam_demeter_landuse_ssp2_rcp45_2080);
// print(gcam_demeter_landuse_ssp3_rcp60_2015);
// print(gcam_demeter_landuse_ssp3_rcp60_2060);
// print(gcam_demeter_landuse_ssp3_rcp60_2080);
// print(gcam_demeter_landuse_ssp4_rcp60_2015);
// print(gcam_demeter_landuse_ssp4_rcp60_2060);
// print(gcam_demeter_landuse_ssp4_rcp60_2080);
// print(gcam_demeter_landuse_ssp5_rcp85_2015);
// print(gcam_demeter_landuse_ssp5_rcp85_2060);
// print(gcam_demeter_landuse_ssp5_rcp85_2080);