import {
  buildQueryContext,
  ensureIsArray,
  getXAxisColumn,
  isXAxisSet,
  normalizeOrderBy,
  PostProcessingPivot,
  QueryFormData,
} from '@superset-ui/core';
import {
  contributionOperator,
  extractExtraMetrics,
  flattenOperator,
  isTimeComparison,
  pivotOperator,
  prophetOperator,
  renameOperator,
  resampleOperator,
  rollingWindowOperator,
  sortOperator,
  timeComparePivotOperator,
  timeCompareOperator,
} from '@superset-ui/chart-controls';
import { set } from 'lodash';

///added otpions any
export default function buildQuery(formData: QueryFormData,options: any) {

  const { groupby,metrics, } = formData;
  console.log('formdataquery',formData);
  ///added
  const { ownState } = options;
  // const {rows,metric,column}= ownState||{};
  // let updatedOwnState=ownState;
  // const setrow = updatedOwnState?.rows !== undefined ? updatedOwnState.rows : null;
  // const setmetric= updatedOwnState?.metric !== undefined ? updatedOwnState.metric : 'AVG';
  // const setcolumn= updatedOwnState?.column !== undefined ? updatedOwnState.column : 'values';
//       const setcolumn= updatedOwnState?.column !== undefined ? updatedOwnState.column : 'timestamp';




  console.log('metricbaseobjecr',metrics[0].aggregate);
  // if (metrics && metrics.length > 0) {
  //   metrics[0].aggregate = setmetric;
  //   metrics[0].column.column_name=setcolumn



  return buildQueryContext(formData, baseQueryObject => {
   
    const extra_metrics = extractExtraMetrics(formData);
    console.log('baseobejct, edw mporw na kanw upadate oti thelw gia na ta valw',baseQueryObject);

    const pivotOperatorInRuntime: PostProcessingPivot = isTimeComparison(
      formData,
      baseQueryObject,
    )
      ? timeComparePivotOperator(formData, baseQueryObject)
      : pivotOperator(formData, baseQueryObject);

    const columns = [
      ...(isXAxisSet(formData) ? ensureIsArray(getXAxisColumn(formData)) : []),
      ...ensureIsArray(groupby),
    ];
    
    return [
      {
        ...baseQueryObject,
        metrics: [...(baseQueryObject.metrics || []), ...extra_metrics],
        // order_desc: setod,

        columns,
        // row_limit:setrow,
        series_columns: groupby,
        ...(isXAxisSet(formData) ? {} : { is_timeseries: true }),
        // todo: move `normalizeOrderBy to extractQueryFields`
        orderby: normalizeOrderBy(baseQueryObject).orderby,
        time_offsets: isTimeComparison(formData, baseQueryObject)
          ? formData.time_compare
          : [],
        post_processing: [
          pivotOperatorInRuntime,
          rollingWindowOperator(formData, baseQueryObject),
          timeCompareOperator(formData, baseQueryObject),
          resampleOperator(formData, baseQueryObject),
          renameOperator(formData, baseQueryObject),
          contributionOperator(formData, baseQueryObject),
          sortOperator(formData, baseQueryObject),
          flattenOperator(formData, baseQueryObject),
          // todo: move prophet before flatten
          prophetOperator(formData, baseQueryObject),
        ],
      },
    ];
  });
}
