const { Storage } = require('@google-cloud/storage')

exports.generateDestinationURI = (fileNamePath) => {
  const re = new RegExp('(.*cost_etl/v1)/dt=([^/]+)/b=4/([^/]+)/(.*\.gz\.parquet)')
  if (re.test(fileNamePath)) {
    const matchResult = fileNamePath.match(re)
    const basePrefix = matchResult[1]
    const date = matchResult[2]
    const type = matchResult[3]
    const fileName = matchResult[4]
    if ((date ?? '') !== '' && (type ?? '') !== '' && (fileName ?? '') !== '' && (basePrefix ?? '') !== '') {
      const dstURI = `${basePrefix}/dt=${date}/b=4/type=${type}/${date}-${fileName}`
      return dstURI
    } else {
      throw new Error (`invalid items were parsed from the file name: ${file.name}`)
    }
  }
}

exports.metricsCopyAndRenameGCS = (file, context) => {
  try {
    const dstBucketName = process.env.DST_BUCKET ?? 'default-destination'
    const dstFileName = exports.generateDestinationURI(file.name)
    if (dstFileName === undefined || dstFileName === null || dstFileName === '') {
      console.log(`skipping file: ${file.name}`)
    } else {
      if (process.env.ENV !== 'test') {
        const storage = new Storage()
        async function copyFile() {
          await storage
            .bucket(file.bucket)
            .file(file.name)
            .copy(storage.bucket(dstBucketName).file(dstFileName))
        }
        copyFile().catch(console.error);
      } else {
        console.log(`Simulated copy to ${dstBucketName} filename ${dstFileName}` )
      }
    }
  } catch (error) {
    console.error(`Unexpected error, reason`, error.message ?? error)
  }
}

exports.metricsCopyAndRenameGCSProd = exports.metricsCopyAndRenameGCS