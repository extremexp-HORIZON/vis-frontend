import { useEffect, useMemo, useState } from "react"
import InstanceClassification from "../../Tasks/SharedItems/Plots/instance-classification"
import { RootState, useAppDispatch, useAppSelector } from "../../../store/store"
import {
  fetchModelAnalysisExplainabilityPlot,
  getLabelTestInstances,
} from "../../../shared/models/tasks/model-analysis.model"
import CounterfactualsTable from "../../Tasks/SharedItems/Tables/counterfactuals-table"
import { explainabilityQueryDefault } from "../../../shared/models/tasks/explainability.model"
import { useParams } from "react-router-dom"
import { Box, Button, ButtonGroup, Grid } from "@mui/material"

const InstanceView = () => {
  const [point, setPoint] = useState<any | null>(
    null
    // "{'dns_interlog_time_q1': 1.0, 'dns_interlog_time_q2': 0.0, 'dns_interlog_time_q3': 0.0, 'dns_interlog_time_q4': 0.0, 'dns_interlog_time_q5': 0.0, 'ssl_interlog_time_q1': 54.0, 'ssl_interlog_time_q2': 4.0, 'ssl_interlog_time_q3': 1.0, 'ssl_interlog_time_q4': 0.0, 'ssl_interlog_time_q5': 0.0, 'http_interlog_time_q1': 8.0, 'http_interlog_time_q2': 0.0, 'http_interlog_time_q3': 1.0, 'http_interlog_time_q4': 0.0, 'http_interlog_time_q5': 1.0, 'mean_interlog_time_dns_interlog_time': 1.014, 'std_interlog_time_dns_interlog_time': 0.0, 'mean_interlog_time_ssl_interlog_time': 29.916, 'std_interlog_time_ssl_interlog_time': 0.0, 'mean_interlog_time_http_interlog_time': 75.5297, 'std_interlog_time_http_interlog_time': 0.0, 'dns_protocol_tcp_ratio': 0.0, 'dns_common_tcp_ports_ratio': 0.0, 'dns_common_udp_ports_ratio': 1.0, 'dns_rcode_error_ratio': 0.0, 'dns_rcode_nxdomain_ratio': 0.0, 'dns_rcode_noauth_ratio': 0.0, 'dns_rcode_refused_ratio': 0.0, 'dns_rcode_notzone_ratio': 0.0, 'dns_authoritative_ans_ratio': 1.0, 'dns_recursion_desired_ratio': 0.0, 'dns_rejected_ratio': 0.0, 'dns_truncation_ratio': 0.0, 'dns_mean_TTL': 60.0, 'dns_len_TTL': 2.0, 'dns_qtype_obsolete_ratio': 0.0, 'dns_non_reserved_srcport_ratio': 1.0, 'dns_non_reserved_dstport_ratio': 1.0, 'dns_usual_dns_srcport_ratio': 1.0, 'dns_usual_dns_dstport_ratio': 1.0, 'dns_shorturl_ratio': 0.0, 'dns_compromised_domain_ratio': 0.0, 'dns_compromised_dstip_ratio': 0.0, 'dns_socialmedia_ratio': 0.0, 'ssl_version_ratio_v10': 1.0, 'ssl_version_ratio_v20': 0.0, 'ssl_version_ratio_v30': 0.0, 'ssl_established_ratio': 0.4117647058823529, 'ssl_compromised_dst_ip_ratio': 0.0, 'ssl_resumed_ratio': 0.6617647058823529, 'ssl_validation_status_ratio': 0.5514705882352942, 'ssl_curve_standard_ratio': 0.8419354838709677, 'ssl_last_alert_ratio': 0.0, 'http_request_body_len_ratio': 48.94736842105263, 'http_response_body_len_ratio': 2790.5789473684213, 'http_method_get_ratio': 0.7368421052631579, 'http_method_post_ratio': 0.2105263157894736, 'http_method_head_ratio': 0.0526315789473684, 'http_method_put_ratio': 0.0, 'http_status_200_ratio': 0.7368421052631579, 'http_status_400_ratio': 0.2105263157894736, 'http_private_con_ratio': 6.157894736842105, 'http_compromised_dstip_ratio': 0.0, 'http_version_obsolete_ratio': 0.0, 'smtp_in_mean_hops': 0.0, 'smtp_subject_num_words': 0.0, 'smtp_subject_num_characters': 0.0, 'smtp_subject_richness': 0.0, 'smtp_subject_in_phishing_words': 0.0, 'smtp_in_is_reply': 0.0, 'smtp_in_is_forwarded': 0.0, 'smtp_in_is_normal': 0.0, 'smtp_in_is_spam': 0.0, 'smtp_in_files': 0.0, 'smtp_in_hazardous_extensions': 0.0, 'non_working_days_dns': 0.0, 'non_working_days_http': 0.0, 'non_working_days_ssl': 0.0, 'non_working_hours_dns': 0.0, 'non_working_hours_http': 0.0, 'non_working_hours_ssl': 0.0, 'label': 0.0, 'id': 0.0, 'prediction':1.0}",
  )
  const dispatch = useAppDispatch()
  const experimentId = useParams().experimentId
  console.log("experimentId", experimentId)

  const { tab, isTabInitialized } = useAppSelector(
    (state: RootState) => state.workflowPage,
  )

  console.log(point, "point")
  tab?.workflowId
  const workflow = tab?.workflowTasks.modelAnalysis?.counterfactuals
  const filteredPoint = useMemo(() => {
    if (!point) return null
    const { C0, _vgsid_, ...rest } = point
    return rest
  }, [point])

  useEffect(() => {
    if (tab) {
      dispatch(
        fetchModelAnalysisExplainabilityPlot({
          query: {
            ...explainabilityQueryDefault,
            explanation_type: "featureExplanation",
            explanation_method: "counterfactuals",
            model: ["metadata/proxy_data_models/I2Cat_nn.keras"],
            data: "metadata/datasets/phising.csv",
            query:
              "{'dns_interlog_time_q1': 1.0, 'dns_interlog_time_q2': 0.0, 'dns_interlog_time_q3': 0.0, 'dns_interlog_time_q4': 0.0, 'dns_interlog_time_q5': 0.0, 'ssl_interlog_time_q1': 54.0, 'ssl_interlog_time_q2': 4.0, 'ssl_interlog_time_q3': 1.0, 'ssl_interlog_time_q4': 0.0, 'ssl_interlog_time_q5': 0.0, 'http_interlog_time_q1': 8.0, 'http_interlog_time_q2': 0.0, 'http_interlog_time_q3': 1.0, 'http_interlog_time_q4': 0.0, 'http_interlog_time_q5': 1.0, 'mean_interlog_time_dns_interlog_time': 1.014, 'std_interlog_time_dns_interlog_time': 0.0, 'mean_interlog_time_ssl_interlog_time': 29.916, 'std_interlog_time_ssl_interlog_time': 0.0, 'mean_interlog_time_http_interlog_time': 75.5297, 'std_interlog_time_http_interlog_time': 0.0, 'dns_protocol_tcp_ratio': 0.0, 'dns_common_tcp_ports_ratio': 0.0, 'dns_common_udp_ports_ratio': 1.0, 'dns_rcode_error_ratio': 0.0, 'dns_rcode_nxdomain_ratio': 0.0, 'dns_rcode_noauth_ratio': 0.0, 'dns_rcode_refused_ratio': 0.0, 'dns_rcode_notzone_ratio': 0.0, 'dns_authoritative_ans_ratio': 1.0, 'dns_recursion_desired_ratio': 0.0, 'dns_rejected_ratio': 0.0, 'dns_truncation_ratio': 0.0, 'dns_mean_TTL': 60.0, 'dns_len_TTL': 2.0, 'dns_qtype_obsolete_ratio': 0.0, 'dns_non_reserved_srcport_ratio': 1.0, 'dns_non_reserved_dstport_ratio': 1.0, 'dns_usual_dns_srcport_ratio': 1.0, 'dns_usual_dns_dstport_ratio': 1.0, 'dns_shorturl_ratio': 0.0, 'dns_compromised_domain_ratio': 0.0, 'dns_compromised_dstip_ratio': 0.0, 'dns_socialmedia_ratio': 0.0, 'ssl_version_ratio_v10': 1.0, 'ssl_version_ratio_v20': 0.0, 'ssl_version_ratio_v30': 0.0, 'ssl_established_ratio': 0.4117647058823529, 'ssl_compromised_dst_ip_ratio': 0.0, 'ssl_resumed_ratio': 0.6617647058823529, 'ssl_validation_status_ratio': 0.5514705882352942, 'ssl_curve_standard_ratio': 0.8419354838709677, 'ssl_last_alert_ratio': 0.0, 'http_request_body_len_ratio': 48.94736842105263, 'http_response_body_len_ratio': 2790.5789473684213, 'http_method_get_ratio': 0.7368421052631579, 'http_method_post_ratio': 0.2105263157894736, 'http_method_head_ratio': 0.0526315789473684, 'http_method_put_ratio': 0.0, 'http_status_200_ratio': 0.7368421052631579, 'http_status_400_ratio': 0.2105263157894736, 'http_private_con_ratio': 6.157894736842105, 'http_compromised_dstip_ratio': 0.0, 'http_version_obsolete_ratio': 0.0, 'smtp_in_mean_hops': 0.0, 'smtp_subject_num_words': 0.0, 'smtp_subject_num_characters': 0.0, 'smtp_subject_richness': 0.0, 'smtp_subject_in_phishing_words': 0.0, 'smtp_in_is_reply': 0.0, 'smtp_in_is_forwarded': 0.0, 'smtp_in_is_normal': 0.0, 'smtp_in_is_spam': 0.0, 'smtp_in_files': 0.0, 'smtp_in_hazardous_extensions': 0.0, 'non_working_days_dns': 0.0, 'non_working_days_http': 0.0, 'non_working_days_ssl': 0.0, 'non_working_hours_dns': 0.0, 'non_working_hours_http': 0.0, 'non_working_hours_ssl': 0.0, 'label': 0.0, 'id': 0.0, 'prediction':1.0}",
            // query:"{'dns_interlog_time_q1': 1.0, 'dns_interlog_time_q2': 0.0, 'dns_interlog_time_q3': 0.0, 'dns_interlog_time_q4': 0.0, 'dns_interlog_time_q5': 0.0, 'ssl_interlog_time_q1': 54.0, 'ssl_interlog_time_q2': 4.0, 'ssl_interlog_time_q3': 1.0, 'ssl_interlog_time_q4': 0.0, 'ssl_interlog_time_q5': 0.0, 'http_interlog_time_q1': 8.0, 'http_interlog_time_q2': 0.0, 'http_interlog_time_q3': 1.0, 'http_interlog_time_q4': 0.0, 'http_interlog_time_q5': 1.0, 'mean_interlog_time_dns_interlog_time': 1.014, 'std_interlog_time_dns_interlog_time': 0.0, 'mean_interlog_time_ssl_interlog_time': 29.916, 'std_interlog_time_ssl_interlog_time': 0.0, 'mean_interlog_time_http_interlog_time': 75.5297, 'std_interlog_time_http_interlog_time': 0.0, 'dns_protocol_tcp_ratio': 0.0, 'dns_common_tcp_ports_ratio': 0.0, 'dns_common_udp_ports_ratio': 1.0, 'dns_rcode_error_ratio': 0.0, 'dns_rcode_nxdomain_ratio': 0.0, 'dns_rcode_noauth_ratio': 0.0, 'dns_rcode_refused_ratio': 0.0, 'dns_rcode_notzone_ratio': 0.0, 'dns_authoritative_ans_ratio': 1.0, 'dns_recursion_desired_ratio': 0.0, 'dns_rejected_ratio': 0.0, 'dns_truncation_ratio': 0.0, 'dns_mean_TTL': 60.0, 'dns_len_TTL': 2.0, 'dns_qtype_obsolete_ratio': 0.0, 'dns_non_reserved_srcport_ratio': 1.0, 'dns_non_reserved_dstport_ratio': 1.0, 'dns_usual_dns_srcport_ratio': 1.0, 'dns_usual_dns_dstport_ratio': 1.0, 'dns_shorturl_ratio': 0.0, 'dns_compromised_domain_ratio': 0.0, 'dns_compromised_dstip_ratio': 0.0, 'dns_socialmedia_ratio': 0.0, 'ssl_version_ratio_v10': 1.0, 'ssl_version_ratio_v20': 0.0, 'ssl_version_ratio_v30': 0.0, 'ssl_established_ratio': 0.4117647058823529, 'ssl_compromised_dst_ip_ratio': 0.0, 'ssl_resumed_ratio': 0.6617647058823529, 'ssl_validation_status_ratio': 0.5514705882352942, 'ssl_curve_standard_ratio': 0.8419354838709677, 'ssl_last_alert_ratio': 0.0, 'http_request_body_len_ratio': 48.94736842105263, 'http_response_body_len_ratio': 2790.5789473684213, 'http_method_get_ratio': 0.7368421052631579, 'http_method_post_ratio': 0.2105263157894736, 'http_method_head_ratio': 0.0526315789473684, 'http_method_put_ratio': 0.0, 'http_status_200_ratio': 0.7368421052631579, 'http_status_400_ratio': 0.2105263157894736, 'http_private_con_ratio': 6.157894736842105, 'http_compromised_dstip_ratio': 0.0, 'http_version_obsolete_ratio': 0.0, 'smtp_in_mean_hops': 0.0, 'smtp_subject_num_words': 0.0, 'smtp_subject_num_characters': 0.0, 'smtp_subject_richness': 0.0, 'smtp_subject_in_phishing_words': 0.0, 'smtp_in_is_reply': 0.0, 'smtp_in_is_forwarded': 0.0, 'smtp_in_is_normal': 0.0, 'smtp_in_is_spam': 0.0, 'smtp_in_files': 0.0, 'smtp_in_hazardous_extensions': 0.0, 'non_working_days_dns': 0.0, 'non_working_days_http': 0.0, 'non_working_days_ssl': 0.0, 'non_working_hours_dns': 0.0, 'non_working_hours_http': 0.0, 'non_working_hours_ssl': 0.0, 'label': 0.0, 'id': 0.0, 'prediction':1.0}",
            train_index: [
              0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
              19, 20, 21, 22, 23, 24, 25,
            ],
            // test_index: "",
            target_column: "label",
          },
          metadata: {
            workflowId: tab.workflowId,
            queryCase: "counterfactuals",
          },
        }),
      )
      dispatch(
        getLabelTestInstances({
          experimentId: experimentId || "",
          runId: tab?.workflowId,
        }),
      )
    }
  }, [isTabInitialized])

  return (
    <>
     

            <InstanceClassification
              plotData={
                tab?.workflowTasks.modelAnalysis?.modelInstances ?? null
              }
              point={point}
              setPoint={setPoint}
            />
          
        
            {point && workflow && (
            <CounterfactualsTable
              key={`counterfactuals-table`}
              point={point}
              handleClose={() => setPoint(null)}
              counterfactuals={workflow || null}
              experimentId={"I2Cat_phising"}
              workflowId={"1"}
            />
            )}
         
    </>
  )
}

export default InstanceView
