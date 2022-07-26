const { generateDestinationURI, metricsCopyAndRenameGCS } = require('./index.js')

const validFileNames = [
  'cost_etl/v1/dt=2022-06-22/b=4/channel/part-00000-a00a254c-ad54-4ca0-9a65-376d897c5b62-c000.gz.parquet',
  'cost_etl/v1/dt=2022-06-21/b=4/channel/aaa.gz.parquet',
  'extra_cost_etl/v1/dt=2022-07-20/b=4/geo/bbb.gz.parquet'
]

const dstBucket = 'default-destination'
const expectedResults = [
  `cost_etl/v1/dt=2022-06-22/b=4/type=channel/2022-06-22-part-00000-a00a254c-ad54-4ca0-9a65-376d897c5b62-c000.gz.parquet`,
  `cost_etl/v1/dt=2022-06-21/b=4/type=channel/2022-06-21-aaa.gz.parquet`,
  `extra_cost_etl/v1/dt=2022-07-20/b=4/type=geo/2022-07-20-bbb.gz.parquet`
]

const invalidFileNames = [
  'cost_etl_invalid/v1/dt=2022-07-20/b=4/channel/bbb.gz.parquet',
  'invalid',
  'cost_etl_invalid/v1/dt=2022-07-20/b=1/channel/bbb.parquet',
  'cost_etl_invalid/v1/dt=2022-07-20/b=1/channel/bbb.gz',
  'cost_etl_invalid/v1/dt=/b=4//bbb.gz.parquet'
]

console.log('Testing valid combinations')
if (validFileNames.map((f) => generateDestinationURI(f, dstBucket)).every(uri => uri !== undefined && uri !== null)) {
  console.log('Ok')
} else {
  console.log('Failed')
}

console.log('Testing valid results')
if (validFileNames.map((f) => generateDestinationURI(f, dstBucket)).every((uri, i) => uri === expectedResults[i])) {
  console.log('Ok')
} else {
  console.log('Failed')
}

console.log('Testing invalid combinations')
if (invalidFileNames.map((f) => generateDestinationURI(f, dstBucket)).every(uri => uri === undefined || uri === null)) {
  console.log('Ok')
} else {
  console.log('Failed')
}

console.log('Main function should not fail')
try {
  validFileNames.forEach((name) => metricsCopyAndRenameGCS({ name }))
  console.log('Ok')
} catch {
  console.log('Failed')
}