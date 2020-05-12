class NBTByte extends Number {
  constructor (data) {
    super(data)
  }

  get size () {
    return 1
  }
}

class NBTShort extends Number {
  constructor (data) {
    super(data)
  }

  get size () {
    return 2
  }
}

class NBTInt extends Number {
  constructor (data) {
    super(data)
  }

  get size () {
    return 4
  }
}

class NBTLong extends Number {
  constructor (data) {
    super(data)
  }

  get size () {
    return 8
  }
}

class NBTFloat extends Number {
  constructor (data) {
    super(data)
  }

  get size () {
    return 4
  }
}

class NBTDouble extends Number {
  constructor (data) {
    super(data)
  }

  get size () {
    return 8
  }
}

class NBTByteArray extends Array {
  constructor (data) {
    super(data)
  }

  get size () {
    return this._data.length
  }
}

class NBTIntArray extends Array {
  constructor (data) {
    super(data)
  }

  get size () {
    return this._data.length * 4
  }
}

class NBTLongArray extends Array {
  constructor (data) {
    super(data)
  }

  get size () {
    return this._data.length * 8
  }
}

class NBTTagArray extends Array {
  constructor (tagLength, tagId) {
    super(tagLength)
    this._tagId = tagId
  }

  get tagId () {
    return this._tagId
  }

  get tagLength () {
    return this._tagLength
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
}