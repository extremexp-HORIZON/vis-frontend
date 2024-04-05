import { t, ChartMetadata, ChartPlugin } from '@superset-ui/core';
import buildQuery from './buildQuery';
import controlPanel from './controlPanel';
import transformProps from './transformProps';
import thumbnail from '../images/thumbnail.png';
export default class SupersetPluginInteractiveLineChartCopy extends ChartPlugin {
  constructor() {
    var metadata = new ChartMetadata({
      description: 'Superset Plugin Interactive Line Chart',
      name: t('Superset Plugin Interactive Line Chart Copy'),
      thumbnail
    });
    super({
      buildQuery,
      controlPanel,
      loadChart: () => import('../SupersetPluginInteractiveLineChartCopy'),
      metadata,
      transformProps
    });
  }
}