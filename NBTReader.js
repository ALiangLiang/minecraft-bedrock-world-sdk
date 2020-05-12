const {
  NBTByte,
  NBTShort,
  NBTInt,
  NBTLong,
  NBTFloat,
  NBTDouble,
  NBTByteArray,
  NBTIntArray,
  NBTLongArray,
  NBTTagArray,
  NBTString,
  NBTCoupound,
} = require('./NBTTags')

class NBTReader {
  constructor (buf) {
    this._buf = buf
    this._offset = 0
    this._readTagMap = {
      0: this._readTagEnd,
      1: this._readTagByte,
      2: this._readTagShort,
      3: this._readTagInt,
      4: this._readTagLong,
      5: this._readTagFloat,
      6: this._readTagDouble,
      7: this._readTagByteArray,
      8: this._readTagString,
      9: this._readTagArray,
      10: this._readTagCompound,
      11: this._readTagIntArray,
      12: this._readTagLongArray,
    }
  }

  _readTagEnd () {
    return 0
  }

  _readTagByte () {
    const bytes = this._buf.readInt8(this._offset)
    this._offset += 1
    return new NBTByte(bytes)
  }

  _readTagShort () {
    const bytes = this._buf.readInt16LE(this._offset)
    this._offset += 2
    return new NBTShort(bytes)
  }

  _readTagInt () {
    const bytes = this._buf.readInt32LE(this._offset)
    this._offset += 4
    return new NBTInt(bytes)
  }

  _readTagLong () {
    const bytes = this._buf.readBigInt64LE(this._offset)
    this._offset += 8
    return new NBTLong(bytes)
  }

  _readTagFloat () {
    const bytes = this._buf.readFloatLE(this._offset)
    this._offset += 4
    return new NBTFloat(bytes)
  }

  _readTagDouble () {
    const bytes = this._buf.readDoubleLE(this._offset)
    this._offset += 8
    return new NBTDouble(bytes)
  }

  _readTagByteArray () {
    const length = this._buf.readUIntLE(this._offset, 4)
    this._offset += 4

    const bytes = this._buf.readUIntLE(this._offset, length)
    this._offset += length
    return NBTByteArray.from(bytes)
  }

  _readTagIntArray () {
    const length = this._buf.readUIntLE(this._offset, 4)
    this._offset += 4

    return new NBTIntArray(length).fill(true).map(() => {
      const bytes = this._buf.readIntLE(this._offset, 4)
      this._offset += 4
      return bytes
    })
  }

  _readTagLongArray () {
    const length = this._buf.readUIntLE(this._offset, 4)
    this._offset += 4

    return new NBTLongArray(length).fill(true).map(() => {
      const bytes = this._buf.readIntLE(this._offset, 8)
      this._offset += 8
      return bytes
    })
  }

  _readTagString () {
    const length = this._buf.readUIntLE(this._offset, 2)
    this._offset += 2

    const string = this._buf.toString('utf8', this._offset, this._offset + length)
    this._offset += length
    return new NBTString(string)
  }

  _readTagArray () {
    const tagId = this._readTagByte()
    const length = this._buf.readUIntLE(this._offset, 4)
    this._offset += 4
    const readMethod = this._readTagMap[tagId]
    const tagArray = new NBTTagArray(length, tagId)
    tagArray.fill(true)
    for (let i = 0; i < tagArray.length; i++) {
      tagArray[i] = readMethod.call(this)
      tagArray[i].$$index = i
    }
    return tagArray
  }

  _readTagCompound () {
    const tags = new NBTCoupound()
    let i = 0
    while (true) {
      // read tag type
      const tagType = this._buf.readUIntLE(this._offset, 1)
      this._offset += 1

      if (tagType === 0)
        break

      // read tag name
      const name = this._readTagString()

      // read tag padload
      const payload = this._readTagMap[tagType].call(this)
      // if (name === 'InterativeText')
      //   console.log(payload + '\n----------------------------------')
      tags[name] = payload
      tags[name].$$index = i++
      tags[name].$$offset = this._offset
    }
    // console.log(tags)
    return tags
  }

  readAll () {
    const ret = []
    while (this._offset < this._buf.length) {
      const tagType = this._readTagByte()
      
      if (Number(tagType) !== 10)
        throw new Error('Expected a tag compound')

      const name = this._readTagString()
      ret.push([name, this._readTagCompound()])
    }
    return ret
  }
}

module.exports = NBTReader