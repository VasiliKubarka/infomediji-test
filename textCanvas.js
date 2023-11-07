const CONF = {
  textPadding: 0.3,
  get textHeight() {
    return 1 - this.textPadding * 2
  },
  text: 'hello world example text',
  _textConfig: null,
  get textConfig() {
    if ( this._textConfig ) return this._textConfig;
    return this._textConfig = this.text.split(' ')
  },
}


export const drawText = (r = 1) => {
  const canvas = document.getElementById('text')
  const ctx = canvas.getContext('2d')

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.textAlign = "center";
  ctx.textBaseline = "middle"
  ctx.font = "bold 94px monospace";
  ctx.save();
  CONF.textConfig.map((text, index, arr) => {
    const wordIndex = index + 1; // word index used to detect hovered word
    ctx.fillStyle = `rgba(1, ${wordIndex}, 0)`
    const x = canvas.height * (index / (arr.length - 1)) * CONF.textHeight;
    ctx.fillText(text, canvas.width / 2, canvas.height * CONF.textPadding + x);
  })
  ctx.restore();
}
