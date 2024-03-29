// import { t } from '@superset-ui/core';
// import {
//   ControlPanelConfig,
//   sharedControls,
//   ControlPanelsContainerProps,
//   ControlSubSectionHeader,
//   D3_TIME_FORMAT_DOCS,
//   getStandardizedControls,
//   sections,
// } from '@superset-ui/chart-controls';
// import { SingleValueType } from './SingleValueType';

// const config: ControlPanelConfig = {
//   controlPanelSections: [
//     sections.advancedAnalyticsControls,
//     sections.annotationsAndLayersControls,
//     sections.forecastIntervalControls,
//     {
//       label: t('Query'),
//       expanded: true,
//       controlSetRows: [
//         [
//           {
//             name: 'metrics',
//             config: {
//               ...sharedControls.metrics,
//               required: false,
//               // it's possible to add validators to controls if
//               // certain selections/types need to be enforced
//               // validators: [validateNonEmpty],
//             },
//           },
          
//         ],
       
//         [
//           {
//             name: 'groupby',
//             config: {
//               ...sharedControls.groupby,
//               label: t('Column'),
//               required: true,
//             },
//           },
//         ],
//       ],
//     },
//     {
//       label: t('UI_new Configuration'),
//       expanded: true,
//       controlSetRows: [
//         [
//           {
//             name: 'enableEmptyFilter',
//             config: {
//               type: 'CheckboxControl',
//               label: t('Filter value is required'),
//               default: false,
//               renderTrigger: true,
//               description: t(
//                 'User must select a value before applying the filter',
//               ),
//             },
//           },
//           {
//             name: 'enableSingleValue',
//             config: {
//               type: 'CheckboxControl',
//               label: t('Single value'),
//               default: SingleValueType.Exact,
//               renderTrigger: true,
//               description: t('Use only a single value.'),
//             },
//           },
//         ],
//       ],
//     },
//   ],
// };

// export default config;






import { t, validateNonEmpty } from '@superset-ui/core';
import { ControlPanelConfig, sections, sharedControls } from '@superset-ui/chart-controls';
console.log('Panel');



const config: ControlPanelConfig = {

  
  
  controlPanelSections: [
    sections.legacyTimeseriesTime,
    
    {
      label: t('Query'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'metrics',
            config: {
              ...sharedControls.metrics,
              // it's possible to add validators to controls if
              // certain selections/types need to be enforced
              validators: [validateNonEmpty],
            },
          },
          
        ],
       
      
        [
          {
            name: 'show_legend',
            config: {
              type: 'CheckboxControl',
              label: t('Legend'),
              renderTrigger: true,
              default: false,
              description: t('Whether to display the legend (toggles)'),
            },
          },
        ],
        [
          {
            name: 'panning',
            config: {
              type: 'CheckboxControl',
              label: t('Panning'),
              renderTrigger: true,
              default: true,
              // onClick:()=>{},
              description: t('Resets the graph to the starting point'),
            },
          },
        ],
        [
          {
            name: 'zooming',
            config: {
              type: 'CheckboxControl',
              label: t('Zooming'),
              renderTrigger: true,
              default: true,
              // onClick:()=>{},
              description: t('Resets the graph to the starting point'),
            },
          },
        ],
        ['adhoc_filters'],
        // emitFilterControl,
        ['limit'],
        ['timeseries_limit_metric'],

        
      
        [
          {
            name: 'row_limit',
            config: sharedControls.row_limit,
          },
        ],
       
      ],
    },
    // sections.advancedAnalyticsControls,
    sections.colorScheme,
    sections.titleControls,
    // sections.forecastIntervalControls,
    
    {
      label: t('Interactive??Controls!'),
      expanded: true,
      controlSetRows: [
        [
          
          
          {
            name: 'header_text',
            config: {
              type: 'TextControl',
              default: 'Hello,Iteractive world!',
              renderTrigger: true,
              // ^ this makes it apply instantaneously, without triggering a "run query" button
              label: t('Header Text'),
              description: t('This is an interactive example'),
            },
          },
        ],
        [
          {
            name: 'Click me',
            config: {
              type: 'CheckboxControl',
              label: t('Click me '),
              renderTrigger: true,
              default: true,
              description: t(' trolled pano'),
            },
          },
          {
            name: 'bold_text',
            config: {
              type: 'CheckboxControl',
              label: t('Bold Text'),
              renderTrigger: true,
              default: true,
              description: t('A checkbox to make the '),
            },
          },
          
        ],
        [
          {
            name: 'header_font_size',
            config: {
              type: 'SelectControl',
              label: t('Font Size'),
              default: 'xl',
              choices: [
                // [value, label]
                ['xxs', 'xx-small'],
                ['xs', 'x-small'],
                ['s', 'small'],
                ['m', 'medium'],
                ['l', 'large'],
                ['xl', 'x-large'],
                ['xxl', 'xx-large'],
              ],
              renderTrigger: true,
              description: t('The size of your header font'),
            },
          },
        ],
      ],
    },
  ],
};

export default config;
