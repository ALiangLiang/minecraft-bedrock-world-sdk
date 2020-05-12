class NBTWriter {
  constructor (...rootTags) {
    this._rootTags = rootTags
    this._buf = Buffer.alloc(0)
  }

  _appendBuffer (...bufs) {
    this._buf = Buffer.concat([this._buf, ...bufs])
  }

  writeAll () {
    for (const rootTag of this._rootTags) {
      const [rootTagName, rootNBT] = rootTag
      this._appendBuffer(Buffer.from([10]))
      this._appendBuffer(rootTagName.toBuffer())
      this._appendBuffer(rootNBT.toBuffer())
    }

    return this._buf
  }
}

module.exports = NBTWriter