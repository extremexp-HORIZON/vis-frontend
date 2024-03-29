// // import {
// //   buildQueryContext,
// //   GenericDataType,
// //   QueryFormData,
// // } from '@superset-ui/core';


// // export default function buildQuery(formData: QueryFormData) {
// //   console.log("Query Start");
// //   console.log("formData:", formData); // Logging formData for inspection

// //   const { groupby } = formData;
// //   const [column = ''] = groupby || [];
// //   // @ts-ignore (need update interface Column )
// //   return buildQueryContext(formData, baseQueryObject => [
// //     {
// //       ...baseQueryObject,
// //       columns: [],
// //       metrics: [
// //         {
// //           aggregate: 'MIN',
// //           column: {
// //             column_name: column,
// //             id: 1,
// //             type_generic: GenericDataType.Numeric,
// //           },
// //           expressionType: 'SIMPLE',
// //           hasCustomLabel: true,
// //           label: 'min',
// //         },
// //         {
// //           aggregate: 'MAX',
// //           column: {
// //             column_name: column,
// //             id: 2,
// //             type_generic: GenericDataType.Numeric,
// //           },
// //           expressionType: 'SIMPLE',
// //           hasCustomLabel: true,
// //           label: 'max',
// //         },
// //       ],
// //     },
// //   ]);
// // }






// import {
//   buildQueryContext,
//   GenericDataType,
//   QueryFormData,
// } from '@superset-ui/core';

// export default function buildQuery(formData: QueryFormData,options:any) {
//   console.log("Query Start");
//   console.log("formData:", formData); // Logging formData for inspection

//   const { groupby,metrics } = formData;
//   console.log('m',metrics);
//   const [column = ''] = groupby || [];
//   const { ownState } = options;

//   const metriki1 = ownState.metriki ? ownState.metriki : 'MIN';

//   const metricsWithDefaults = formData.metrics.map(metric => ({
//     ...metric,
//     aggregate: metriki1,
//   }));
//   const queryContext = buildQueryContext(formData, baseQueryObject => [
//     {
//       ...baseQueryObject,
//       metrics:metricsWithDefaults,

//       // columns: [],
//       // metrics: [
//       //   {
//       //     aggregate: 'MIN',
//       //     column: {
//       //       column_name: column,
//       //       id: 1,
//       //       type_generic: GenericDataType.Numeric,
//       //     },
//       //     expressionType: 'SIMPLE',
//       //     hasCustomLabel: true,
//       //     label: 'min',
//       //   },
//       //   {
//       //     aggregate: 'MAX',
//       //     column: {
//       //       column_name: column,
//       //       id: 2,
//       //       type_generic: GenericDataType.Numeric,
//       //     },
//       //     expressionType: 'SIMPLE',
//       //     hasCustomLabel: true,
//       //     label: 'max',
//       //   },
//       // ],
//     },
//   ]);

//   console.log("Query Context:", queryContext); // Logging queryContext for inspection
//   console.log("Query End");
//   return queryContext;
// }





import { buildQueryContext, QueryFormData } from '@superset-ui/core';
export default function buildQuery(formData: QueryFormData, options: any) {
  console.log('Query Start');

  // const { cols: groupby,row_limit:row_limit} = formData;
  const { ownState } = options;
  console.log('ownstate',ownState);
 
  console.log('formdata',formData);
  


  
  let updatedOwnState = ownState;
  

  
  const metriki1 = updatedOwnState.metriki ? updatedOwnState.metriki : 'MIN';
  const metricsWithDefaults = formData.metrics.map(metric => ({
    ...metric,
    aggregate: metriki1,
  }));

  console.log('Query stop');

  return buildQueryContext(formData, (baseQueryObject) => [
    {
    
      ...baseQueryObject,
      metrics:metricsWithDefaults,
      
      force:true,
      is_timeseries: true,
      ////added this to handle the starting points
          },

  ]);
}





