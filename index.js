const { Readable } = require('stream')
const levelup = require('levelup')
const leveldbMcpe = require('../node-leveldb-mcpe')
const db = levelup(new leveldbMcpe('db'))
const NBTReader = require('./NBTReader')
const NBTWriter = require('./NBTWriter')

async function entrypoint () {
  const stream = db.createReadStream()
  stream.on('data', function (record) {
    try {
      if (record.key.length > 8 && record.key.readIntLE(8, 1) === 50 && record.value.length) {
        const nbts = new NBTReader(record.value).readAll()
        for (const nbt of nbts)
          if (nbt[1].definitions.includes('+minecraft:npc')) {
            // console.log(nbt[1].Name + ':')
            // console.log(nbt[1].InterativeText)
            // console.log('----------------------------------')
            console.dir(nbt[1], { depth: 10 })
          }
            // console.log(record.key.readIntLE(0, 4), record.key.readIntLE(4, 4))//, record.key, nbt)
      }
    } catch (err) {
      console.log(record)
      throw err
    }
  })
}

entrypoint().catch(console.log)
