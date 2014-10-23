
pumas_in_nyc = set(map(int, ['3710', '3705', '3708', '3707', '3706', '3701', '3709', '3703', '3704', '3702', '4001', '4004', '4003', '4002', '4008', '4005', '4012', '4006', '4011', '4013', '4017', '4014', '4018', '4015', '4016', '4007', '4010', '4009', '3810', '3809', '3807', '3808', '3806', '3805', '3802', '3803', '3804', '3801', '3903', '3902', '3901', '4001', '4004', '4003', '4002', '4008', '4005', '4012', '4006', '4011', '4013', '4017', '4014', '4018', '4015', '4016', '4007', '4010', '4009', '4101', '4109', '4102', '4107', '4110', '4108', '4103', '4106', '4111', '4113', '4104', '4112', '4105', '4114']))

import shapefile, json

sf = shapefile.Reader("/Users/nateparrott/Desktop/pums/nhgis0001_shape/nhgis0001_shapefile_tl2012_us_puma_2012/US_puma_2012.shp")
print sf.fields
polygons_for_pumas = {}
for record, shape in zip(sf.iterRecords(), sf.iterShapes()):
	parts = list(shape.parts)
	points = list(shape.points)
	polygons = [map(list, points[start:end]) for (start, end) in zip(parts, parts[1:]+[len(points)])]
	polygons_for_pumas[int(record[1])] = polygons
json.dump(polygons_for_pumas, open("polygons.json", "w"))
