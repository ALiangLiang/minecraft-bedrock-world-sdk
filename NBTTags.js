class NBTByte extends Number {
  /**
   * 1(1). byte
   * */
  constructor (data) {
    super(data)
  }

  get $$id () { return 1 }

  toBuffer () {
    return Buffer.from([this])
  }
}

class NBTShort extends Number {
  /**
   * 1-2(2). short integer
   * */
  constructor (data) {
    super(data)
  }

  get $$id () { return 2 }

  toBuffer () {
    const buf = Buffer.alloc(2)
    buf.writeInt16LE(this)
    return buf
  }
}

class NBTInt extends Number {
  /**
   * 1-4(4). integer
   * */
  constructor (data) {
    super(data)
  }

  get $$id () { return 3 }

  toBuffer () {
    const buf = Buffer.alloc(4)
    buf.writeInt32LE(this)
    return buf
  }
}

class NBTLong extends Number {
  /**
   * 1-8(8). long integer
   * */
  constructor (data) {
    super(data)
    this._bigint = data
  }

  get $$id () { return 4 }

  toBuffer () {
    const buf = Buffer.alloc(8)
    buf.writeBigInt64LE(this._bigint)
    return buf
  }
}

class NBTFloat extends Number {
  /**
   * 1-4(4). float
   * */
  constructor (data) {
    super(data)
  }

  get $$id () { return 5 }

  toBuffer () {
    const buf = Buffer.alloc(4)
    buf.writeFloatLE(this)
    return buf
  }
}

class NBTDouble extends Number {
  /**
   * 1-8(8). double
   * */
  constructor (data) {
    super(data)
  }

  get $$id () { return 6 }

  toBuffer () {
    const buf = Buffer.alloc(8)
    buf.writeDoubleLE(this)
    return buf
  }
}

class NBTByteArray extends Array {
  /**
   * 1-4(4). array length
   * 5-(n*1). bytes
   * */
  constructor (data) {
    super(data)
  }

  get $$id () { return 7 }

  toBuffer () {
    // allocate buffer
    const buf = Buffer.alloc(4 + this.length)

    // write length
    buf.writeUInt32LE(this.length)

    // write bytes
    this.forEach((byte, i) => buf.writeInt8(byte, i + 4))

    return buf
  }
}

class NBTIntArray extends Array {
  /**
   * 1-4(4). array length
   * 5-(n*4). integers
   * */
  constructor (data) {
    super(data)
  }

  get $$id () { return 11 }

  toBuffer () {
    // allocate buffer
    const buf = Buffer.alloc(4 + this.length * 4)
    
    // write length
    buf.writeUInt32LE(this.length)

    // write integers
    this.forEach((int, i) => buf.writeInt32LE(int, i * 4 + 4))

    return buf
  }
}

class NBTLongArray extends Array {
  /**
   * 1-4(4). array length
   * 5-(n*8). long integers
   * */
  constructor (data) {
    super(data)
  }

  get $$id () { return 12 }

  toBuffer () {
    // allocate buffer
    const buf = Buffer.alloc(4 + this.length * 8)
    
    // write length
    buf.writeUInt32LE(this.length)

    // write long integers
    this.forEach((long, i) => buf.writeIntLE(long, i * 8 + 4, 8))

    return buf
  }
}

class NBTTagArray extends Array {
  /**
   * 1(1). tag type id 
   * 2-5(4). array length
   * 6-(n*size). tags
   * */
  constructor (tagLength, tagId) {
    super(tagLength)
    this.$$tagId = tagId
    this.$$index = null
  }

  get $$id () { return 9 }
  get tagId () {
    return this.$$tagId
  }

  get tagLength () {
    return this._tagLength
  }

  toBuffer () {
    const buf = Buffer.alloc(1 + 4)
    
    // write tag type id
    buf.writeInt8(this.$$tagId)
    
    // write length
    buf.writeUInt32LE(this.length, 1)

    // get buffer of every tags. and append to buffer created above.
    const bufs = this.map((tag) => tag.toBuffer())
    return Buffer.concat([buf, ...bufs])
  }
}

class NBTString extends String {
  /**
   * 1-2(2). string length
   * 3-(n). string
   * */
  constructor (data) {
    super(data)
  }

  get $$id () { return 8 }

  toBuffer () {
    const stringLength = Buffer.from(this).length
    const buf = Buffer.alloc(2 + stringLength)
    
    // write length
    buf.writeUInt16LE(stringLength)

    // write string
    buf.write(this.toString(), 2)

    return buf
  }
}

class NBTCoupound extends Object {
  /**
   * [
   *   (1). tag type id
   *   (2). tag name string length
   *   (stringlength). tag name string
   *   (?). tag payload
   * ]
   * ...
   * last(1). end symbol (zero)
   * */
  constructor (data) {
    super(data)
    this.$$index = null
  }

  get $$id () { return 10 }

  toBuffer () {
    const buf = Buffer.alloc(0)

    // get buffer of every tags. and append to buffer created above.
    const bufs = Object.keys(this).map((tagName) => {
      if (tagName === '$$index' || tagName === '$$offset') return

      const tag = this[tagName]
      const tagBuf = tag.toBuffer()
      const tagIndex = tag.$$index

      const buf = Buffer.alloc(1 + 2 + tagName.length + tagBuf.length)
    
      // write tag type id
      buf.writeInt8(tag.$$id)

      // write tag name length
      buf.writeUInt16LE(tagName.length, 1)
  
      // write tag name string
      buf.write(tagName, 3)

      // copy tag buffer to buffer created above
      tagBuf.copy(buf, 3 + tagName.length)
  
      return [buf, tagIndex]
    })
      .filter((e) => e)
      .sort((pairA, pairB) => pairA[1] - pairB[1])
      .map(([buf, tagIndex]) => buf)
    return Buffer.concat([buf, ...bufs, Buffer.from([0])])
  }
}

module.exports = {
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
}