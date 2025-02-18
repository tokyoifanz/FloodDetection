Map.centerObject(Flood)

var year_start = '2019', year_end = '2020'

function despeckel(img){
  return img.focalMean(50, 'square', 'meters')
  .copyProperties(img, img.propertyNames())
}

var before = imageCollection
.filterDate(year_start, year_end)
.filter(ee.Filter.calendarRange(2,2,'month'))
.filterBounds(Flood)
.filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
.filter(ee.Filter.eq('instrumentMode', 'IW'))
.select('VV')
.map(despeckel)
.min();

print(before);

Map.addLayer(before.clip(Flood), [], 'before', false)

var after = imageCollection
.filterDate(year_start, year_end)
.filter(ee.Filter.calendarRange(3,3,'month'))
.filterBounds(Flood)
.filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
.filter(ee.Filter.eq('instrumentMode', 'IW'))
.select('VV')
.map(despeckel)
.min();

Map.addLayer(after.clip(Flood), [], 'after', false)

var change = before.subtract(after);

Map.addLayer(change.clip(Flood), [], 'flooded region', false);

print(
  ui.Chart.image.histogram(change, Flood, 50))
  
Map.addLayer(change.gt(4.5).clip(Flood), [], 'flood thr', false);

var flood_thr = change.gt(4.5);
var flood_mask = flood_thr.updateMask(flood_thr);
var flood_area = flood_mask.multiply(ee.Image.pixelArea().divide(1e6));
var flood_area_region = flood_area.reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: Flood,
  scale: 50
}).values().get(0);

print('area of flooded region',ee.Number(flood_area_region))