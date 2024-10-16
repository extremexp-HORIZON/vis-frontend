import { ActionReducerMapBuilder, createAsyncThunk } from "@reduxjs/toolkit"
import { IPlotModel } from "../plotmodel.model"
import { IWorkflowTab } from "../../../store/slices/workflowTabsSlice"
import axios from "axios"
import {
  IDataExplorationRequest,
  IDataExplorationResponse,
} from "../dataexploration.model"

const prepareDataExplorationResponse = (payload: IDataExplorationResponse) => ({
  ...payload,
  data: JSON.parse(payload.data),
})

export interface IModelAnalysis {
  featureNames: string[]
  pdp: { data: IPlotModel | null; loading: boolean; error: string | null }
  ale: { data: IPlotModel | null; loading: boolean; error: string | null }
  counterfactuals: {
    data: IPlotModel | null
    loading: boolean
    error: string | null
  }
  influenceFunctions: {
    data: IPlotModel | null
    loading: boolean
    error: string | null
  }
  modelInstances: { data: IDataExplorationResponse | null; loading: boolean; error: string | null }
  modelConfusionMatrix: {
    data: IDataExplorationResponse | null
    loading: boolean
    error: string | null
  }
  multipleTimeSeries: {
    data: IDataExplorationResponse | null
    loading: boolean
    error: string | null
  }
  multipleTimeSeriesMetadata: {
    data: IDataExplorationResponse | null
    loading: boolean
    error: string | null
  }
}

export const modelAnalysisDefault: IModelAnalysis = {
  featureNames: [
    "dns_interlog_time_q1",
    "dns_interlog_time_q2",
    "dns_interlog_time_q3",
    "dns_interlog_time_q4",
    "dns_interlog_time_q5",
    "ssl_interlog_time_q1",
    "ssl_interlog_time_q2",
    "ssl_interlog_time_q3",
    "ssl_interlog_time_q4",
    "ssl_interlog_time_q5",
    "http_interlog_time_q1",
    "http_interlog_time_q2",
    "http_interlog_time_q3",
    "http_interlog_time_q4",
    "http_interlog_time_q5",
    "mean_interlog_time_dns_interlog_time",
    "std_interlog_time_dns_interlog_time",
    "mean_interlog_time_ssl_interlog_time",
    "std_interlog_time_ssl_interlog_time",
    "mean_interlog_time_http_interlog_time",
    "std_interlog_time_http_interlog_time",
    "dns_protocol_tcp_ratio",
    "dns_common_tcp_ports_ratio",
    "dns_common_udp_ports_ratio",
    "dns_rcode_error_ratio",
    "dns_rcode_nxdomain_ratio",
    "dns_rcode_noauth_ratio",
    "dns_rcode_refused_ratio",
    "dns_rcode_notzone_ratio",
    "dns_authoritative_ans_ratio",
    "dns_recursion_desired_ratio",
    "dns_rejected_ratio",
    "dns_truncation_ratio",
    "dns_mean_TTL",
    "dns_len_TTL",
    "dns_qtype_obsolete_ratio",
    "dns_non_reserved_srcport_ratio",
    "dns_non_reserved_dstport_ratio",
    "dns_usual_dns_srcport_ratio",
    "dns_usual_dns_dstport_ratio",
    "dns_shorturl_ratio",
    "dns_compromised_domain_ratio",
    "dns_compromised_dstip_ratio",
    "dns_socialmedia_ratio",
    "ssl_version_ratio_v10",
    "ssl_version_ratio_v20",
    "ssl_version_ratio_v30",
    "ssl_established_ratio",
    "ssl_compromised_dst_ip_ratio",
    "ssl_resumed_ratio",
    "ssl_validation_status_ratio",
    "ssl_curve_standard_ratio",
    "ssl_last_alert_ratio",
    "http_request_body_len_ratio",
    "http_response_body_len_ratio",
    "http_method_get_ratio",
    "http_method_post_ratio",
    "http_method_head_ratio",
    "http_method_put_ratio",
    "http_status_200_ratio",
    "http_status_400_ratio",
    "http_private_con_ratio",
    "http_compromised_dstip_ratio",
    "http_version_obsolete_ratio",
    "smtp_in_mean_hops",
    "smtp_subject_num_words",
    "smtp_subject_num_characters",
    "smtp_subject_richness",
    "smtp_subject_in_phishing_words",
    "smtp_in_is_reply",
    "smtp_in_is_forwarded",
    "smtp_in_is_normal",
    "smtp_in_is_spam",
    "smtp_in_files",
    "smtp_in_hazardous_extensions",
    "non_working_days_dns",
    "non_working_days_http",
    "non_working_days_ssl",
    "non_working_hours_dns",
    "non_working_hours_http",
    "non_working_hours_ssl",
  ],
  pdp: { data: null, loading: false, error: null },
  ale: { data: null, loading: false, error: null },
  counterfactuals: { data: null, loading: false, error: null },
  influenceFunctions: { data: null, loading: false, error: null },
  modelInstances: { data: null, loading: false, error: null },
  modelConfusionMatrix: { data: null, loading: false, error: null },
  multipleTimeSeries: { data: null, loading: false, error: null },
  multipleTimeSeriesMetadata: { data: null, loading: false, error: null },
}

export const modelAnalysisReducers = (
  builder: ActionReducerMapBuilder<IWorkflowTab>,
) => {
  builder
    .addCase(
      fetchModelAnalysisExplainabilityPlot.fulfilled,
      (state, action) => {
        const compareCompletedTask = state.tabs.find(
          tab => tab.workflowId === action.meta.arg.modelId,
        )?.workflowTasks.modelAnalysis
        const plotType = action.payload.explanationMethod as keyof IModelAnalysis;
        if (compareCompletedTask && plotType !== 'featureNames') {
              compareCompletedTask[plotType].data = action.payload
              compareCompletedTask[plotType].loading = false
              compareCompletedTask[plotType].error = null
        }
      },
    )
    .addCase(fetchModelAnalysisData.fulfilled, (state, action) => {
      const compareCompletedTask = state.tabs.find(
        tab => tab.workflowId === action.meta.arg.metadata.workflowId,
      )?.workflowTasks.modelAnalysis
      const queryCase = action.meta.arg.metadata.queryCase as keyof IModelAnalysis
      if (compareCompletedTask && queryCase !== 'featureNames') {
        compareCompletedTask[queryCase].data = prepareDataExplorationResponse(action.payload)
        compareCompletedTask[queryCase].loading = false
        compareCompletedTask[queryCase].error = null
      }
    })
    .addCase(fetchModelAnalysisExplainabilityPlot.pending, (state, action) => {
      const compareCompletedTask = state.tabs.find(
        tab => tab.workflowId === action.meta.arg.modelId,
      )?.workflowTasks.modelAnalysis
      const plotType = action.meta.arg.explanationMethod as keyof IModelAnalysis;
        if (compareCompletedTask && plotType !== 'featureNames') {
              compareCompletedTask[plotType].loading = true
        }
    })
    .addCase(fetchModelAnalysisData.pending, (state, action) => {
      const compareCompletedTask = state.tabs.find(
        tab => tab.workflowId === action.meta.arg.metadata.workflowId,
      )?.workflowTasks.modelAnalysis
      const queryCase = action.meta.arg.metadata.queryCase as keyof IModelAnalysis
      if (compareCompletedTask && queryCase !== 'featureNames') {
        compareCompletedTask[queryCase].loading = true
      }
    })
    .addCase(fetchModelAnalysisExplainabilityPlot.rejected, (state, action) => {
      const compareCompletedTask = state.tabs.find(
        tab => tab.workflowId === action.meta.arg.modelId,
      )?.workflowTasks.modelAnalysis
      const plotType = action.meta.arg.explanationMethod as keyof IModelAnalysis;
        if (compareCompletedTask && plotType !== 'featureNames') {
              compareCompletedTask[plotType].loading = false
              compareCompletedTask[plotType].error = "Failed to fetch data"
        }
    })
    .addCase(fetchModelAnalysisData.rejected, (state, action) => {
      const compareCompletedTask = state.tabs.find(
        tab => tab.workflowId === action.meta.arg.metadata.workflowId,
      )?.workflowTasks.modelAnalysis
      const queryCase = action.meta.arg.metadata.queryCase as keyof IModelAnalysis
      if (compareCompletedTask && queryCase !== 'featureNames') {
        compareCompletedTask[queryCase].loading = false
        compareCompletedTask[queryCase].error = "Failed to fetch data"
      }
    })
}

export type FetchExplainabilityPlotPayload = {
  explanationType: string
  explanationMethod: string
  model: string
  feature1: string
  feature2: string
  modelId: any
}

export const fetchModelAnalysisExplainabilityPlot = createAsyncThunk(
  "workflowTasks/model_analysis/fetch_explainability_plot",
  async (payload: FetchExplainabilityPlotPayload) => {
    const requestUrl = "/api/explainability"
    return axios.post<any>(requestUrl, payload).then(response => response.data)
  },
)

export const fetchModelAnalysisData = createAsyncThunk(
  "workflowTasks/model_analysis/fetch_data",
  async (payload: IDataExplorationRequest) => {
    const requestUrl = "api/visualization/data"
    return axios
      .post<IDataExplorationResponse>(requestUrl, payload.query)
      .then(response => response.data)
  }
)
