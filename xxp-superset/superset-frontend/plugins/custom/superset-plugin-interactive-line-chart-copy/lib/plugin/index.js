"use strict";

exports.__esModule = true;
exports.default = void 0;
var _core = require("@superset-ui/core");
var _buildQuery = _interopRequireDefault(require("./buildQuery"));
var _controlPanel = _interopRequireDefault(require("./controlPanel"));
var _transformProps = _interopRequireDefault(require("./transformProps"));
var _thumbnail = _interopRequireDefault(require("../images/thumbnail.png"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
class SupersetPluginInteractiveLineChartCopy extends _core.ChartPlugin {
  constructor() {
    var metadata = new _core.ChartMetadata({
      description: 'Superset Plugin Interactive Line Chart',
      name: (0, _core.t)('Superset Plugin Interactive Line Chart Copy'),
      thumbnail: _thumbnail.default
    });
    super({
      buildQuery: _buildQuery.default,
      controlPanel: _controlPanel.default,
      loadChart: () => Promise.resolve().then(() => _interopRequireWildcard(require('../SupersetPluginInteractiveLineChartCopy'))),
      metadata,
      transformProps: _transformProps.default
    });
  }
}
exports.default = SupersetPluginInteractiveLineChartCopy;