
import { buildQueryContext, QueryFormData } from '@superset-ui/core';
export default function buildQuery(formData: QueryFormData, options: any) {
  console.log('Query');

  const { cols: groupby,row_limit:row_limit} = formData;
  const { ownState } = options;
  // console.log('options',options);
  console.log('form data',formData);
  /// added this to handle the null 
  const { start, end} = ownState || {};
  
  
  let updatedOwnState = ownState;

  // if (formData.resetGraph){
  //   updatedOwnState = { ...ownState, start: null, end: null };

  // }

  if (start !== null && end !== null && end - start < 100) {
    // Create a new object to avoid modifying the read-only property

    updatedOwnState = { ...ownState, start: null, end: null };
  }
  // if (formData.keepData){
  //   updatedOwnState = { ...ownState.copy};

  // }

  // const startDatetime = start ? new Date(start).toISOString() : null;
  // const endDatetime = end ? new Date(end).toISOString() : null;
  const startDatetime = updatedOwnState.start ? new Date(updatedOwnState.start).toISOString() : null;
  const endDatetime = updatedOwnState.end ? new Date(updatedOwnState.end).toISOString() : null;


  return buildQueryContext(formData, (baseQueryObject) => [
    {
      ...baseQueryObject,
      force:true,
      // groupby,
      // row_limit:10,

      is_timeseries: true,
      ////added this to handle the starting points
      time_range: startDatetime && endDatetime ? `${startDatetime} : ${endDatetime}` : undefined,
          },

  ]);
}





