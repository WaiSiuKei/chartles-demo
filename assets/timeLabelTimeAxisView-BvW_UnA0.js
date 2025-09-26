class TimeLabelTimeAxisView {
  constructor(_data) {
    this._data = _data;
  }
  update(data) {
    Object.assign(this._data, data);
  }
  backColor() {
    return this._data.background;
  }
  coordinate() {
    return this._data.coordinate;
  }
  text() {
    return this._data.text;
  }
  textColor() {
    return this._data.foreground;
  }
  tickVisible() {
    return false;
  }
  visible() {
    return !!this._data.visible;
  }
  borderColor() {
    return this._data.border ?? this._data.background;
  }
}
export {
  TimeLabelTimeAxisView as T
};
