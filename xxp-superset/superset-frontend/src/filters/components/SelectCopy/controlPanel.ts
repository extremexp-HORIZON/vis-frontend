
import { t, validateNonEmpty } from '@superset-ui/core';
import {
  ControlPanelConfig,
  sharedControls,
  sections,
} from '@superset-ui/chart-controls';
import { DEFAULT_FORM_DATA } from './types';

const {
  enableEmptyFilter,
  inverseSelection,
  multiSelect,
  defaultToFirstItem,
  searchAllOptions,
  sortAscending,
} = DEFAULT_FORM_DATA;

const config: ControlPanelConfig = {
  
  controlPanelSections: [
    sections.legacyTimeseriesTime,

    
    {
      label: t('Querly'),
      expanded: true,
      controlSetRows: [

        
        [
        
          {
            name: 'groupby',
            config: {
              ...sharedControls.metric,
              
              label: t('Metrics'),
              required: true,
            },
          },

        ],
        ['adhoc_filters'],
      ],
    },
    {
      label: t('UI Configuration'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'sortAscending',
            config: {
              type: 'CheckboxControl',
              renderTrigger: true,
              label: t('Sort ascending'),
              default: sortAscending,
              description: t('Check for sorting ascending'),
            },
          },
        ],
        [
          {
            name: 'multiSelect',
            config: {
              type: 'CheckboxControl',
              label: t('Can select multiple values'),
              default: multiSelect,
              resetConfig: true,
              affectsDataMask: true,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'enableEmptyFilter',
            config: {
              type: 'CheckboxControl',
              label: t('Filter value is required'),
              default: enableEmptyFilter,
              renderTrigger: true,
              description: t(
                'User must select a value before applying the filter',
              ),
            },
          },
        ],
        [
          {
            name: 'defaultToFirstItem',
            config: {
              type: 'CheckboxControl',
              label: t('Select first filter value by default'),
              default: defaultToFirstItem,
              resetConfig: true,
              affectsDataMask: true,
              renderTrigger: true,
              requiredFirst: true,
              description: t(
                'When using this option, default value can’t be set',
              ),
            },
          },
        ],
        [
          {
            name: 'inverseSelection',
            config: {
              type: 'CheckboxControl',
              renderTrigger: true,
              affectsDataMask: true,
              label: t('Inverse selection'),
              default: inverseSelection,
              description: t('Exclude selected values'),
            },
          },
        ],
        [
          {
            name: 'searchAllOptions',
            config: {
              type: 'CheckboxControl',
              renderTrigger: true,
              affectsDataMask: true,
              label: t('Dynamically search all filter values'),
              default: searchAllOptions,
              description: t(
                'By default, each filter loads at most 1000 choices at the initial page load. ' +
                  'Check this box if you have more than 1000 filter values and want to enable dynamically ' +
                  'searching that loads filter values as users type (may add stress to your database).',
              ),
            },
          },
        ],
      ],
    },
  ],
  controlOverrides: {
    groupby: {
      multi: false,
      validators: [validateNonEmpty],
    },
  },
};
console.log('Final Control Panel Configuration:', config);


export default config;
