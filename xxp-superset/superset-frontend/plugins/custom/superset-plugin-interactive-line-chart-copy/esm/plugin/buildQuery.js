function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import { buildQueryContext } from '@superset-ui/core';
export default function buildQuery(formData, options) {
  console.log('Query Start');
  var {
    ownState
  } = options;
  var {
    start,
    end,
    metriki
  } = ownState || {};
  var {
    metrics: kati
  } = formData;
  console.log('kati', kati);
  console.log('alldata', formData);
  var updatedOwnState = ownState;
  if (start !== null && end !== null && end - start < 100) {
    // Create a new object to avoid modifying the read-only property

    updatedOwnState = _extends({}, ownState, {
      start: null,
      end: null
    });
  }
  var startDatetime = updatedOwnState.start ? new Date(updatedOwnState.start).toISOString() : null;
  var endDatetime = updatedOwnState.end ? new Date(updatedOwnState.end).toISOString() : null;
  var metriki1 = updatedOwnState.metriki ? updatedOwnState.metriki : formData.metrics[0].aggregate;
  var col = updatedOwnState.colona ? updatedOwnState.colona : formData.metrics[0].column.column_name;
  var timeg = updatedOwnState.timegran ? updatedOwnState.timegran : formData.time_grain_sqla;
  var metricsWithDefaults = formData.metrics.map(metric => _extends({}, metric, {
    aggregate: metriki1
  }));
  formData.metrics[0].column.column_name = col;
  formData.metrics[0].aggregate = metriki1;
  // formData.time_grain_sqla=timeg;

  console.log('Query stop');
  return buildQueryContext(formData, baseQueryObject => [_extends({}, baseQueryObject, {
    // metrics:metricsWithDefaults,
    // metrics: formData.metrics.map(metric => ({
    //   ...metric,
    //   aggregate: metriki1
    //    // Set the aggregate to MIN
    // })),
    force: true,
    is_timeseries: true,
    ////added this to handle the starting points
    time_range: startDatetime && endDatetime ? startDatetime + " : " + endDatetime : undefined
  })]);
}