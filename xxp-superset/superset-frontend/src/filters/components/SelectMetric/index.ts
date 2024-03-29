import { Behavior, ChartMetadata, ChartPlugin, t } from '@superset-ui/core';
import buildQuery from './buildQuery';
import controlPanel from './controlPanel';
import transformProps from './transformProps';
import thumbnail from './images/thumbnail.png';

export default class SelectMetric extends ChartPlugin {
  constructor() {
    const metadata = new ChartMetadata({
      name: t('Metric Select'),
      description: t('Range filter plugin using AntD'),
      behaviors: [Behavior.InteractiveChart, Behavior.NativeFilter],
      tags: [t('Experimental')],
      thumbnail,
    });

    super({
      buildQuery,
      controlPanel,
      loadChart: () => import('./SelectMetric'),
      metadata,
      transformProps,
    });
  }
}
