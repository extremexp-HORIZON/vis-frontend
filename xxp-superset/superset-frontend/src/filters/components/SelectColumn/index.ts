import { Behavior, ChartMetadata, ChartPlugin, t } from '@superset-ui/core';
import buildQuery from './buildQuery';
import controlPanel from './controlPanel';
import transformProps from './transformProps';
import thumbnail from './images/thumbnail.png';

export default class SelectColumn extends ChartPlugin {
  constructor() {
    const metadata = new ChartMetadata({
      name: t('Select Column'),
      description: t('Select column filter plugin'),
      behaviors: [Behavior.InteractiveChart, Behavior.NativeFilter],
      tags: [t('Experimental')],
      thumbnail,
    });

    super({
      buildQuery,
      controlPanel,
      loadChart: () => import('./SelectColumn'),
      metadata,
      transformProps,
    });
  }
}
