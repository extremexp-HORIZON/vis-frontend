"use strict";

exports.__esModule = true;
exports.default = void 0;
var _core = require("@superset-ui/core");
var _chartControls = require("@superset-ui/chart-controls");
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
console.log('Panel');
var config = {
  controlPanelSections: [_chartControls.sections.legacyTimeseriesTime, {
    label: (0, _core.t)('Query'),
    expanded: true,
    controlSetRows: [[{
      name: 'metrics',
      config: _extends({}, _chartControls.sharedControls.metrics, {
        // it's possible to add validators to controls if
        // certain selections/types need to be enforced
        validators: [_core.validateNonEmpty]
      })
    }], [{
      name: 'show_legend',
      config: {
        type: 'CheckboxControl',
        label: (0, _core.t)('Legend'),
        renderTrigger: true,
        default: false,
        description: (0, _core.t)('Whether to display the legend (toggles)')
      }
    }], [{
      name: 'panning',
      config: {
        type: 'CheckboxControl',
        label: (0, _core.t)('Panning'),
        renderTrigger: true,
        default: true,
        // onClick:()=>{},
        description: (0, _core.t)('Resets the graph to the starting point')
      }
    }], [{
      name: 'zooming',
      config: {
        type: 'CheckboxControl',
        label: (0, _core.t)('Zooming'),
        renderTrigger: true,
        default: true,
        // onClick:()=>{},
        description: (0, _core.t)('Resets the graph to the starting point')
      }
    }], ['adhoc_filters'],
    // emitFilterControl,
    ['limit'], ['timeseries_limit_metric'], [{
      name: 'row_limit',
      config: _chartControls.sharedControls.row_limit
    }]]
  },
  // sections.advancedAnalyticsControls,
  _chartControls.sections.colorScheme, _chartControls.sections.titleControls,
  // sections.forecastIntervalControls,

  {
    label: (0, _core.t)('Interactive??Controls!'),
    expanded: true,
    controlSetRows: [[{
      name: 'header_text',
      config: {
        type: 'TextControl',
        default: 'Hello,Iteractive world!',
        renderTrigger: true,
        // ^ this makes it apply instantaneously, without triggering a "run query" button
        label: (0, _core.t)('Header Text'),
        description: (0, _core.t)('This is an interactive example')
      }
    }], [{
      name: 'Click me',
      config: {
        type: 'CheckboxControl',
        label: (0, _core.t)('Click me '),
        renderTrigger: true,
        default: true,
        description: (0, _core.t)(' trolled pano')
      }
    }, {
      name: 'bold_text',
      config: {
        type: 'CheckboxControl',
        label: (0, _core.t)('Bold Text'),
        renderTrigger: true,
        default: true,
        description: (0, _core.t)('A checkbox to make the ')
      }
    }], [{
      name: 'header_font_size',
      config: {
        type: 'SelectControl',
        label: (0, _core.t)('Font Size'),
        default: 'xl',
        choices: [
        // [value, label]
        ['xxs', 'xx-small'], ['xs', 'x-small'], ['s', 'small'], ['m', 'medium'], ['l', 'large'], ['xl', 'x-large'], ['xxl', 'xx-large']],
        renderTrigger: true,
        description: (0, _core.t)('The size of your header font')
      }
    }]]
  }]
};
var _default = exports.default = config;