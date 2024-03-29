import { buildQueryContext, QueryFormData } from '@superset-ui/core';
  export default function buildQuery(formData: QueryFormData, options: any) {
    console.log('Query Start');
    const { ownState } = options;
    const { start, end, metriki,} = ownState || {};
    const{ metrics:kati}=formData;
    console.log('kati',kati);
    console.log('alldata',formData);

    


    
    let updatedOwnState = ownState;
    if (start !== null && end !== null && end - start < 100) {
      // Create a new object to avoid modifying the read-only property

      updatedOwnState = { ...ownState, start: null, end: null };
    }
  
    const startDatetime = updatedOwnState.start ? new Date(updatedOwnState.start).toISOString() : null;
    const endDatetime = updatedOwnState.end ? new Date(updatedOwnState.end).toISOString() : null;
    const metriki1 = updatedOwnState.metriki ? updatedOwnState.metriki : formData.metrics[0].aggregate;
    const col= updatedOwnState.colona ? updatedOwnState.colona : formData.metrics[0].column.column_name;
    const timeg=updatedOwnState.timegran ? updatedOwnState.timegran:formData.time_grain_sqla;
    const metricsWithDefaults = formData.metrics.map(metric => ({
      ...metric,
      aggregate: metriki1,
    }));
    formData.metrics[0].column.column_name =col;
    formData.metrics[0].aggregate=metriki1
    // formData.time_grain_sqla=timeg;

    

    console.log('Query stop');

    return buildQueryContext(formData, (baseQueryObject) => [
      {
        ...baseQueryObject,
        // metrics:metricsWithDefaults,
        // metrics: formData.metrics.map(metric => ({
        //   ...metric,
        //   aggregate: metriki1
        //    // Set the aggregate to MIN
        // })),
        force:true,
        is_timeseries: true,
        ////added this to handle the starting points
        time_range: startDatetime && endDatetime ? `${startDatetime} : ${endDatetime}` : undefined,
      },


    ]);
  }





