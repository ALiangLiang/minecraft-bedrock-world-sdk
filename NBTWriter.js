class NBTWriter {
  constructor (name, nbt) {
    this._name = name
    this._nbt = nbt
    this._buf = Buffer.alloc(0)
    this._writeTagMap = {
      0: this._readTagEnd,
      1: this._readTagByte,
      2: this._readTagShort,
      3: this._readTagInt,
      4: this._readTagLong,
      5: this._readTagFloat,
      6: this._readTagDouble,
      7: this._readTagByteArray,
      8: this._readTagString,
      9: this._readTagList,
      10: this._readTagCompound,
      11: this._readTagIntArray,
      12: this._readTagLongArray,
    }
  }

  _writeTagEnd () {
    this._buf.writeInt8(0, this._buf.length - 1)
  }

  _writeTagByte (tagByte) {
    this._buf.writeInt8(tagByte, this._buf.length - 1)
  }

  _writeTagShort (tagShort) {
    this._buf.writeInt16LE(tagShort, this._buf.length - 1)
  }

  _writeTagInt (tagInt) {
    this._buf.writeInt64LE(tagInt, this._buf.length - 1)
  }

  _writeTagLong (tagLong) {
    this._buf.writeIntLE(tagLong, this._buf.length - 1, 8)
  }

  _writeTagFloat (tagFloat) {
    this._buf.writeFloatLE(tagFloat, this._buf.length - 1)
  }

  _writeTagDouble (tagDouble) {
    this._buf.writeDoubleLE(tagDouble, this._buf.length - 1)
  }

  _writeTagByteArray (tagByteArray) {
    // write length
    this._buf.writeUIntLE(tagByteArray.length, this._buf.length - 1, 4)

    // write bytes
    tagByteArray.forEach((byte) => this._buf.writeInt8(byte, this._buf.length - 1))
  }

  _writeTagIntArray (tagIntArray) {
    // write length
    this._buf.writeUIntLE(tagIntArray.length, this._buf.length - 1, 4)

    // write integers
    tagIntArray.forEach((int) => this._buf.writeInt64LE(int, this._buf.length - 1))
  }

  _writeTagLongArray (tagLongArray) {
    // write length
    this._buf.writeUIntLE(tagLongArray.length, this._buf.length - 1, 4)

    // write longs
    tagLongArray.forEach((long) => this._buf.writeIntLE(long, this._buf.length - 1, 8))
  }
  
  _writeTagString (tagString) {
    // write length
    this._buf.writeUIntLE(tagString.length, this._buf.length - 1, 2)

    // write string
    this._buf.write(tagString, this._buf.length - 1)
  }
  
  _writeTagList (tagTagArray) {
    // write tag id
    this._writeTagByte(tagTagArray.tagId)

    // write length
    this._buf.writeUIntLE(tagTagArray.length, this._buf.length - 1, 4)

    // write tag array
    tagTagArray.forEach((tag) => this._buf.write(tag, this._buf.length - 1, tagTagList.tagLength))
  }

  _writeTagCompound () {
    const tags = {}
    while (true) {
      const tagType = this._buf.readUIntLE(this._offset, 1)
      this._offset += 1

      if (tagType === 0)
        break

      const name = this._readTagString()
      const payload = this._readTagMap[tagType].call(this)
      tags[name] = payload
    }
    return tags
  }

  writeAll () {
    const ret = []
    while (this._offset < this._buf.length) {
      const tagType = this._readTagByte()
      if (Number(tagType) !== 10)
        throw new Error('Expected a tag compound')
      const name = this._readTagString()
      ret.push([name, this._readTagCompound()])
    }
    return this._buf
  }
}

module.exports = NBTWriter