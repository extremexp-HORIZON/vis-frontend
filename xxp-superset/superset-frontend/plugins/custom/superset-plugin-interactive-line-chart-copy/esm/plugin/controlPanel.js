function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import { t, validateNonEmpty } from '@superset-ui/core';
import { sections, sharedControls } from '@superset-ui/chart-controls';
console.log('Panel');
var config = {
  controlPanelSections: [sections.legacyTimeseriesTime, {
    label: t('Query'),
    expanded: true,
    controlSetRows: [[{
      name: 'metrics',
      config: _extends({}, sharedControls.metrics, {
        // it's possible to add validators to controls if
        // certain selections/types need to be enforced
        validators: [validateNonEmpty]
      })
    }], [{
      name: 'show_legend',
      config: {
        type: 'CheckboxControl',
        label: t('Legend'),
        renderTrigger: true,
        default: false,
        description: t('Whether to display the legend (toggles)')
      }
    }], [{
      name: 'panning',
      config: {
        type: 'CheckboxControl',
        label: t('Panning'),
        renderTrigger: true,
        default: true,
        // onClick:()=>{},
        description: t('Resets the graph to the starting point')
      }
    }], [{
      name: 'zooming',
      config: {
        type: 'CheckboxControl',
        label: t('Zooming'),
        renderTrigger: true,
        default: true,
        // onClick:()=>{},
        description: t('Resets the graph to the starting point')
      }
    }], ['adhoc_filters'],
    // emitFilterControl,
    ['limit'], ['timeseries_limit_metric'], [{
      name: 'row_limit',
      config: sharedControls.row_limit
    }]]
  },
  // sections.advancedAnalyticsControls,
  sections.colorScheme, sections.titleControls,
  // sections.forecastIntervalControls,

  {
    label: t('Interactive??Controls!'),
    expanded: true,
    controlSetRows: [[{
      name: 'header_text',
      config: {
        type: 'TextControl',
        default: 'Hello,Iteractive world!',
        renderTrigger: true,
        // ^ this makes it apply instantaneously, without triggering a "run query" button
        label: t('Header Text'),
        description: t('This is an interactive example')
      }
    }], [{
      name: 'Click me',
      config: {
        type: 'CheckboxControl',
        label: t('Click me '),
        renderTrigger: true,
        default: true,
        description: t(' trolled pano')
      }
    }, {
      name: 'bold_text',
      config: {
        type: 'CheckboxControl',
        label: t('Bold Text'),
        renderTrigger: true,
        default: true,
        description: t('A checkbox to make the ')
      }
    }], [{
      name: 'header_font_size',
      config: {
        type: 'SelectControl',
        label: t('Font Size'),
        default: 'xl',
        choices: [
        // [value, label]
        ['xxs', 'xx-small'], ['xs', 'x-small'], ['s', 'small'], ['m', 'medium'], ['l', 'large'], ['xl', 'x-large'], ['xxl', 'xx-large']],
        renderTrigger: true,
        description: t('The size of your header font')
      }
    }]]
  }]
};
export default config;