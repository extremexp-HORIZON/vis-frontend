import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
// import ThumbUpIcon from "@mui/icons-material/ThumbUp"
import { styled } from "@mui/material/styles"
import { useEffect, useState } from "react"
import type { RootState } from "../../../../store/store"
import { useAppDispatch, useAppSelector } from "../../../../store/store"
import { fetchModelAnalysisExplainabilityPlot } from "../../../../shared/models/tasks/model-analysis.model"
import type { IPlotModel } from "../../../../shared/models/plotmodel.model"
import { explainabilityQueryDefault } from "../../../../shared/models/tasks/explainability.model"
import { Tab, Tabs } from "@mui/material"
import { DataGrid } from "@mui/x-data-grid"
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp"
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
import ClosableCardTable from "../../../../shared/components/closable-card-table"
import Loader from "../../../../shared/components/loader"

interface ITableComponent {
  children?: React.ReactNode
  point: any
  handleClose: any
  counterfactuals: {
    data: IPlotModel | null
    loading: boolean
    error: string | null
  } | null
  experimentId: string | undefined
  workflowId: string
  onClose: any
}

const CounterfactualsTable = (props: ITableComponent) => {
  const {
    point,
    handleClose,
    counterfactuals,
    experimentId,
    workflowId,
    onClose,
  } = props
  const dispatch = useAppDispatch()
  const [activeTab, setActiveTab] = useState(0) //activeTab,setA
  const { tab, isTabInitialized } = useAppSelector(
    (state: RootState) => state.workflowPage,
  )
  useEffect(() => {
    if (activeTab === 0 && isTabInitialized) {
      dispatch(
        fetchModelAnalysisExplainabilityPlot({
          query: {
            ...explainabilityQueryDefault,
            explanation_type: "featureExplanation",
            explanation_method: "counterfactuals",

            query:
              "{'dns_interlog_time_q1': 1.0, 'dns_interlog_time_q2': 0.0, 'dns_interlog_time_q3': 0.0, 'dns_interlog_time_q4': 0.0, 'dns_interlog_time_q5': 0.0, 'ssl_interlog_time_q1': 54.0, 'ssl_interlog_time_q2': 4.0, 'ssl_interlog_time_q3': 1.0, 'ssl_interlog_time_q4': 0.0, 'ssl_interlog_time_q5': 0.0, 'http_interlog_time_q1': 8.0, 'http_interlog_time_q2': 0.0, 'http_interlog_time_q3': 1.0, 'http_interlog_time_q4': 0.0, 'http_interlog_time_q5': 1.0, 'mean_interlog_time_dns_interlog_time': 1.014, 'std_interlog_time_dns_interlog_time': 0.0, 'mean_interlog_time_ssl_interlog_time': 29.916, 'std_interlog_time_ssl_interlog_time': 0.0, 'mean_interlog_time_http_interlog_time': 75.5297, 'std_interlog_time_http_interlog_time': 0.0, 'dns_protocol_tcp_ratio': 0.0, 'dns_common_tcp_ports_ratio': 0.0, 'dns_common_udp_ports_ratio': 1.0, 'dns_rcode_error_ratio': 0.0, 'dns_rcode_nxdomain_ratio': 0.0, 'dns_rcode_noauth_ratio': 0.0, 'dns_rcode_refused_ratio': 0.0, 'dns_rcode_notzone_ratio': 0.0, 'dns_authoritative_ans_ratio': 1.0, 'dns_recursion_desired_ratio': 0.0, 'dns_rejected_ratio': 0.0, 'dns_truncation_ratio': 0.0, 'dns_mean_TTL': 60.0, 'dns_len_TTL': 2.0, 'dns_qtype_obsolete_ratio': 0.0, 'dns_non_reserved_srcport_ratio': 1.0, 'dns_non_reserved_dstport_ratio': 1.0, 'dns_usual_dns_srcport_ratio': 1.0, 'dns_usual_dns_dstport_ratio': 1.0, 'dns_shorturl_ratio': 0.0, 'dns_compromised_domain_ratio': 0.0, 'dns_compromised_dstip_ratio': 0.0, 'dns_socialmedia_ratio': 0.0, 'ssl_version_ratio_v10': 1.0, 'ssl_version_ratio_v20': 0.0, 'ssl_version_ratio_v30': 0.0, 'ssl_established_ratio': 0.4117647058823529, 'ssl_compromised_dst_ip_ratio': 0.0, 'ssl_resumed_ratio': 0.6617647058823529, 'ssl_validation_status_ratio': 0.5514705882352942, 'ssl_curve_standard_ratio': 0.8419354838709677, 'ssl_last_alert_ratio': 0.0, 'http_request_body_len_ratio': 48.94736842105263, 'http_response_body_len_ratio': 2790.5789473684213, 'http_method_get_ratio': 0.7368421052631579, 'http_method_post_ratio': 0.2105263157894736, 'http_method_head_ratio': 0.0526315789473684, 'http_method_put_ratio': 0.0, 'http_status_200_ratio': 0.7368421052631579, 'http_status_400_ratio': 0.2105263157894736, 'http_private_con_ratio': 6.157894736842105, 'http_compromised_dstip_ratio': 0.0, 'http_version_obsolete_ratio': 0.0, 'smtp_in_mean_hops': 0.0, 'smtp_subject_num_words': 0.0, 'smtp_subject_num_characters': 0.0, 'smtp_subject_richness': 0.0, 'smtp_subject_in_phishing_words': 0.0, 'smtp_in_is_reply': 0.0, 'smtp_in_is_forwarded': 0.0, 'smtp_in_is_normal': 0.0, 'smtp_in_is_spam': 0.0, 'smtp_in_files': 0.0, 'smtp_in_hazardous_extensions': 0.0, 'non_working_days_dns': 0.0, 'non_working_days_http': 0.0, 'non_working_days_ssl': 0.0, 'non_working_hours_dns': 0.0, 'non_working_hours_http': 0.0, 'non_working_hours_ssl': 0.0, 'label': 0.0, 'prediction':1.0}",
          },
          metadata: {
            workflowId: tab?.workflowId || "",
            queryCase: "counterfactuals",
            experimentId: experimentId || "",
          },
        }),
      )
    }
    if (activeTab === 1 && isTabInitialized) {
      dispatch(
        fetchModelAnalysisExplainabilityPlot({
          query: {
            explanation_type: "hyperparameterExplanation",
            explanation_method: "counterfactuals",
            query:
              "{'dns_interlog_time_q1': 1.0, 'dns_interlog_time_q2': 0.0, 'dns_interlog_time_q3': 0.0, 'dns_interlog_time_q4': 0.0, 'dns_interlog_time_q5': 0.0, 'ssl_interlog_time_q1': 54.0, 'ssl_interlog_time_q2': 4.0, 'ssl_interlog_time_q3': 1.0, 'ssl_interlog_time_q4': 0.0, 'ssl_interlog_time_q5': 0.0, 'http_interlog_time_q1': 8.0, 'http_interlog_time_q2': 0.0, 'http_interlog_time_q3': 1.0, 'http_interlog_time_q4': 0.0, 'http_interlog_time_q5': 1.0, 'mean_interlog_time_dns_interlog_time': 1.014, 'std_interlog_time_dns_interlog_time': 0.0, 'mean_interlog_time_ssl_interlog_time': 29.916, 'std_interlog_time_ssl_interlog_time': 0.0, 'mean_interlog_time_http_interlog_time': 75.5297, 'std_interlog_time_http_interlog_time': 0.0, 'dns_protocol_tcp_ratio': 0.0, 'dns_common_tcp_ports_ratio': 0.0, 'dns_common_udp_ports_ratio': 1.0, 'dns_rcode_error_ratio': 0.0, 'dns_rcode_nxdomain_ratio': 0.0, 'dns_rcode_noauth_ratio': 0.0, 'dns_rcode_refused_ratio': 0.0, 'dns_rcode_notzone_ratio': 0.0, 'dns_authoritative_ans_ratio': 1.0, 'dns_recursion_desired_ratio': 0.0, 'dns_rejected_ratio': 0.0, 'dns_truncation_ratio': 0.0, 'dns_mean_TTL': 60.0, 'dns_len_TTL': 2.0, 'dns_qtype_obsolete_ratio': 0.0, 'dns_non_reserved_srcport_ratio': 1.0, 'dns_non_reserved_dstport_ratio': 1.0, 'dns_usual_dns_srcport_ratio': 1.0, 'dns_usual_dns_dstport_ratio': 1.0, 'dns_shorturl_ratio': 0.0, 'dns_compromised_domain_ratio': 0.0, 'dns_compromised_dstip_ratio': 0.0, 'dns_socialmedia_ratio': 0.0, 'ssl_version_ratio_v10': 1.0, 'ssl_version_ratio_v20': 0.0, 'ssl_version_ratio_v30': 0.0, 'ssl_established_ratio': 0.4117647058823529, 'ssl_compromised_dst_ip_ratio': 0.0, 'ssl_resumed_ratio': 0.6617647058823529, 'ssl_validation_status_ratio': 0.5514705882352942, 'ssl_curve_standard_ratio': 0.8419354838709677, 'ssl_last_alert_ratio': 0.0, 'http_request_body_len_ratio': 48.94736842105263, 'http_response_body_len_ratio': 2790.5789473684213, 'http_method_get_ratio': 0.7368421052631579, 'http_method_post_ratio': 0.2105263157894736, 'http_method_head_ratio': 0.0526315789473684, 'http_method_put_ratio': 0.0, 'http_status_200_ratio': 0.7368421052631579, 'http_status_400_ratio': 0.2105263157894736, 'http_private_con_ratio': 6.157894736842105, 'http_compromised_dstip_ratio': 0.0, 'http_version_obsolete_ratio': 0.0, 'smtp_in_mean_hops': 0.0, 'smtp_subject_num_words': 0.0, 'smtp_subject_num_characters': 0.0, 'smtp_subject_richness': 0.0, 'smtp_subject_in_phishing_words': 0.0, 'smtp_in_is_reply': 0.0, 'smtp_in_is_forwarded': 0.0, 'smtp_in_is_normal': 0.0, 'smtp_in_is_spam': 0.0, 'smtp_in_files': 0.0, 'smtp_in_hazardous_extensions': 0.0, 'non_working_days_dns': 0.0, 'non_working_days_http': 0.0, 'non_working_days_ssl': 0.0, 'non_working_hours_dns': 0.0, 'non_working_hours_http': 0.0, 'non_working_hours_ssl': 0.0, 'label': 0.0, 'prediction':1.0}",
          },
          metadata: {
            workflowId: tab?.workflowId || workflowId,
            queryCase: "counterfactuals",
            experimentId: experimentId || "",
          },
        }),
      )
    }
  }, [point, activeTab])

  const getNonConstantColumns = (tableContents: any) => {
    if (!tableContents) return []

    return Object.entries(tableContents).filter(([key, columnData]: any) => {
      const values = columnData.values
      if (!values || values.length === 0) return false
      return new Set(values).size > 1 // Only keep if not all values are identical
    })
  }

  const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
    "& .MuiDataGrid-scrollbarFiller": {
      backgroundColor: theme.palette.customGrey.main,
    },
    "& .MuiDataGrid-columnHeader": {
      backgroundColor: theme.palette.customGrey.main,
    },
    '& .MuiDataGrid-columnHeader[data-field="__check__"]': {
      backgroundColor: theme.palette.customGrey.main,
    },
    "& .MuiDataGrid-columnHeaderTitle": {
      whiteSpace: "nowrap",
      overflow: "visible",
    },
    // Fix header to remain at top
    "& .MuiDataGrid-main": {
      // Critical for layout
      display: "flex",
      flexDirection: "column",
      height: "100%",
    },
    "& .MuiDataGrid-columnHeaders": {
      position: "sticky",
      top: 0,
      zIndex: 2,
    },
    // Ensure the cell container scrolls properly
    "& .MuiDataGrid-virtualScroller": {
      flex: 1,
      overflow: "auto",
    },
    // Fix pagination to remain at bottom
    "& .MuiDataGrid-footerContainer": {
      minHeight: "56px",
      borderTop: "1px solid rgba(224, 224, 224, 1)",
      position: "sticky",
      bottom: 0,
      zIndex: 2,
      backgroundColor: "#ffffff",
    },
    "& .MuiTablePagination-root": {
      overflow: "visible",
    },
    // Add border radius to bottom corners
    "&.MuiDataGrid-root": {
      borderRadius: "0 0 12px 12px",
      border: "none",
      height: "100%", // Ensure full height
    },
  }))

  const getFilteredTableContents = (
    tableContents: Record<string, { index: number; values: string[] }>,
  ) => {
    if (!tableContents) return {}

    const filteredEntries = Object.entries(tableContents).filter(
      ([key, column]) => {
        if (key === "BinaryLabel" || key === "Type" || key === "Cost")
          return false // Skip the BinaryLabel column
        const uniqueValues = new Set(column.values)
        return uniqueValues.size > 1 // Keep only if there is more than one unique value
      },
    )

    return Object.fromEntries(filteredEntries)
  }

  const filteredTableContents = getFilteredTableContents(
    counterfactuals?.data?.tableContents || {},
  )

  const columns = Object.entries(filteredTableContents).map(([key, column]) => {
    const referenceValue = parseFloat(column.values[0])

    return {
      field: key,
      headerName: key,
      flex: 1,
      minWidth: 100,
      maxWidth: 300,
      headerAlign: "center",
      align: "center",
      renderCell: (params: any) => {
        const currentValue = parseFloat(params.value)
        if (isNaN(referenceValue) || isNaN(currentValue)) {
          return params.value
        }

        let icon = null

        if (currentValue < referenceValue) {
          icon = (
            <ArrowDropDownIcon
              fontSize="small"
              sx={{ color: "red", ml: 0.5 }}
            />
          )
        } else if (currentValue > referenceValue) {
          icon = (
            <ArrowDropUpIcon
              fontSize="small"
              sx={{ color: "green", ml: 0.5 }}
            />
          )
        }

        return (
          <Box display="flex" alignItems="center" justifyContent="center">
            <Typography variant="body2">{params.value}</Typography>
            {icon}
          </Box>
        )
      },
    }
  })

  const rowCount =
    filteredTableContents[Object.keys(filteredTableContents)[0]]?.values
      .length || 0

  const rows = Array.from({ length: rowCount }, (_, rowIndex) => {
    const row: Record<string, any> = { id: rowIndex }
    for (const [key, column] of Object.entries(filteredTableContents)) {
      row[key] = column.values[rowIndex]
    }
    return row
  })

  return (
    <>
      <ClosableCardTable
        details={counterfactuals?.data?.plotDescr}
        title={
          activeTab === 0
            ? `feature ${counterfactuals?.data?.plotName}`
            : `hyperparameters ${counterfactuals?.data?.plotName}`
        }
        controlPanel={
          <ControlPanel
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            counterfactuals={counterfactuals}
          />
        }
        onClose={onClose}
        noPadding={true}
      >
        {counterfactuals?.loading ? (
          // Loader when loading
          <Loader/>
        ) : counterfactuals?.data?.plotType === "Error" ? (
          // Display error message
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h6" color="error">
              {counterfactuals?.data.plotName || "Error"}
            </Typography>
            <Typography variant="body2">
              {counterfactuals?.data?.plotDescr}
            </Typography>
          </Box>
        ) : counterfactuals?.data?.tableContents ? (
          // Display table
          <StyledDataGrid
            autoHeight
            rows={rows}
            columns={columns}
            disableSelectionOnClick
            sx={{
              border: theme => `1px solid ${theme.palette.customGrey.main}`,
              "& .MuiDataGrid-columnHeader": {
                backgroundColor: theme => theme.palette.customGrey.light,
                fontWeight: 600,
              },
              "& .MuiDataGrid-cell": {
                wordBreak: "break-word",
                whiteSpace: "normal",
              },
              // Hide footer completely since pagination is disabled
              "& .MuiDataGrid-footerContainer": {
                display: "none",
              },
            }}
          />
        ) : (
          // Default fallback if no content at all
          <Typography variant="body2" align="center">
            No data available.
          </Typography>
        )}
      </ClosableCardTable>
    </>
  )
}

export default CounterfactualsTable

const ControlPanel = ({
  activeTab,
  setActiveTab,
  counterfactuals,
}: {
  activeTab: number
  setActiveTab: (value: number) => void
  counterfactuals: any
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-end",
        mb: 0, // optional: margin bottom for spacing below tabs
      }}
    >
      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        sx={{
          "& .MuiTab-root": {
            fontSize: "0.8rem",
            minHeight: "8px",
          },
        }}
      >
        <Tab label="Features" disabled={counterfactuals?.loading} />
        <Tab label="Hyperparameters" disabled={counterfactuals?.loading} />
      </Tabs>
    </Box>
  )
}
