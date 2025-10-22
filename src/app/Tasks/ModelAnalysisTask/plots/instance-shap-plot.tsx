import { useParams } from "react-router-dom";
import { RootState, useAppDispatch, useAppSelector } from "../../../../store/store";
import { useEffect, useMemo } from "react";
import { fetchModelAnalysisExplainabilityPlot } from "../../../../store/slices/explainabilitySlice";
import { explainabilityQueryDefault } from "../../../../shared/models/tasks/explainability.model";
import { Box } from "@mui/material";
import ClosableCardTable from "../../../../shared/components/closable-card-table";
import { TestInstance } from "../../../../shared/models/tasks/model-analysis.model";
import Loader from "../../../../shared/components/loader";
import { VegaLite } from "react-vega";
import type { TopLevelSpec as VisualizationSpec } from "vega-lite/build/src/spec";
import InfoMessage from "../../../../shared/components/InfoMessage";
import AssessmentIcon from '@mui/icons-material/Assessment';


interface ShpaPlotProps {
  shapPoint: TestInstance;
  onClose: () => void;
}

const fmtVal = (v: unknown) => {
  if (v === null || v === undefined) return 0; //if no featureValue is retured it means is 0
  if (typeof v === "number") {
    // compact numeric formatting without trailing zeros noise
    const abs = Math.abs(v);
    return abs >= 1000 ? v.toFixed(0) : abs >= 100 ? v.toFixed(1) : abs >= 10 ? v.toFixed(2) : v.toFixed(3).replace(/0+$/,'').replace(/\.$/,'');
  }
  return String(v);
};

const InstanceShapPlot = ({ shapPoint, onClose }: ShpaPlotProps) => {
  const { tab, isTabInitialized } = useAppSelector((s: RootState) => s.workflowPage);
  const { experimentId } = useParams();
  const dispatch = useAppDispatch();

  const plotModel = tab?.workflowTasks.modelAnalysis?.shap;
  const loading = Boolean(plotModel?.loading);
  const error = plotModel?.error as string | undefined;

  useEffect(() => {
    if (tab && experimentId && isTabInitialized) {
      dispatch(
        fetchModelAnalysisExplainabilityPlot({
          query: {
            ...explainabilityQueryDefault,
            explanation_type: "featureExplanation",
            explanation_method: "shap",
            instance_index: shapPoint.instanceId,
          },
          metadata: {
            workflowId: tab.workflowId,
            queryCase: "shap",
            experimentId,
          },
        }),
      );
    }
  }, [isTabInitialized, tab?.workflowId, experimentId, shapPoint.instanceId]);

  const { values, baseValue, fxValue, plotName, plotDescr } = useMemo(() => {
    const data = plotModel?.data;

    const baseValue =
      data?.xAxis?.axisValues?.[0] != null ? Number(data.xAxis.axisValues[0]) : 0;
    const fxValue =
      data?.xAxis?.axisValues?.[1] != null ? Number(data.xAxis.axisValues[1]) : 0;

    // Keep incoming order or sort by |shap| if you prefer:
    const contribs = (data?.shapContributions ?? [])?.filter(
      d => d && typeof d.featureName === "string" && typeof d.shapValue === "number",
    );

    // Sort by |SHAP| descending to match typical SHAP plots:
    contribs.sort((a, b) => Math.abs(b.shapValue) - Math.abs(a.shapValue));

    // Build waterfall rows
    let cum = baseValue;
    const reversed = [...contribs].reverse(); // process from bottom up
    const tempRows = reversed.map(d => {
      const start = cum;
      const end = cum + d.shapValue;
      cum = end;
      return { ...d, Start: start, End: end };
    });
    
    // Now flip it back to the original order for display
    const rows = contribs.map(d => {
      const r = tempRows.find(t => t.featureName === d.featureName)!;
      const leftLabel = `${fmtVal(d.featureValue)} = ${d.featureName}`;
      const contribLabel = `${d.shapValue >= 0 ? "+" : ""}${d.shapValue.toFixed(2)}`;
      return {
        Feature: d.featureName,
        LeftLabel: leftLabel,
        Start: r.Start,
        End: r.End,
        SHAP: d.shapValue,
        ContributionLabel: contribLabel,
        Value: d.featureValue ?? null,
      };
    });

    return {
      values: rows,
      baseValue,
      fxValue,
      plotName: data?.plotName ?? "SHAP",
      plotDescr: data?.plotDescr,
    };
  }, [plotModel?.data]);

const xDomain = useMemo<[number, number]>(() => {
  const nums = [
    baseValue,
    fxValue,
    ...values.flatMap(v => [v.Start, v.End]),
  ].filter(n => Number.isFinite(n)) as number[];

  const min = Math.min(...nums);
  const max = Math.max(...nums);
  return min === max ? [min - 1, max + 1] : [min, max];
}, [values, baseValue, fxValue]);

const spec: VisualizationSpec = useMemo(() => {
  const baseLabel = `E[f(X)] = ${Number.isFinite(baseValue) ? baseValue.toFixed(3) : "—"}`;
  const fxLabel = `f(x) = ${Number.isFinite(fxValue) ? fxValue.toFixed(3) : "—"}`;

  return {
    width: "container",
    autosize: { type: "fit", contains: "padding", resize: true },
    data: { values },
    transform: [{ calculate: "abs(datum.SHAP)", as: "absSHAP" }],
    layer: [
      // 1) Waterfall bars
      {
        mark: { type: "bar" },
        encoding: {
          y: {
            field: "LeftLabel",
            type: "ordinal",
            sort: { field: "absSHAP", order: "descending" },
            title: null,
          },
          x: {
            field: "Start",
            type: "quantitative",
            title: "Model output",
            scale: { domain: xDomain },
            axis: { ticks: true, grid: true, labelFlush: true },
          },
          x2: { field: "End" },
          color: {
            condition: { test: "datum.SHAP >= 0", value: "#ef5350" }, // up
            value: "#42a5f5",                                         // down
          },
          tooltip: [
            { field: "LeftLabel", type: "nominal", title: "Feature" },
            { field: "SHAP", type: "quantitative", title: "SHAP", format: ".5f" },
            { field: "Start", type: "quantitative", title: "Start", format: ".5f" },
            { field: "End", type: "quantitative", title: "End", format: ".5f" },
          ],
        },
      },

      // 2) Contribution labels at bar ends
      {
        mark: { type: "text" },
        encoding: {
          y: {
            field: "LeftLabel",
            type: "ordinal",
            sort: { field: "absSHAP", order: "descending" },
          },
          x: { field: "End", type: "quantitative", scale: { domain: xDomain } },
          text: { field: "ContributionLabel" },
          align: {
            condition: { test: "datum.SHAP > 0", value: "left" },
            value: "right",
          },
          dx: {
            condition: { test: "datum.SHAP > 0", value: 6 },
            value: -6,
          },
          color: { value: "#111" },
        },
      },

      // 3) Vertical dashed rule at E[f(X)]
      {
        data: { values: [{ x: baseValue }] },
        mark: { type: "rule", strokeDash: [5, 5] },
        encoding: {
          x: { field: "x", type: "quantitative", scale: { domain: xDomain } },
          size: { value: 1.5 },
          color: { value: "#9e9e9e" },
        },
      },

      // 4) E[f(X)] label
      {
        data: { values: [{}] },
        mark: { type: "text", dy: -10, baseline: "bottom" },
        encoding: {
          x: { datum: baseValue },
          y: { value: 0 },
          text: { value: baseLabel },
          color: { value: "#616161" },
          align: { value: "right" }, // lean right to reduce overlap with f(x)
          dx: { value: -6 },
        },
      },

      // 5) Vertical dashed rule at f(x)
      {
        data: { values: [{ x: fxValue }] },
        mark: { type: "rule", strokeDash: [5, 5] },
        encoding: {
          x: { field: "x", type: "quantitative", scale: { domain: xDomain } },
          size: { value: 1.5 },
          color: { value: "#9e9e9e" },
        },
      },

      // 6) f(x) label
      {
        data: { values: [{}] },
        mark: { type: "text", dy: -10, baseline: "bottom" },
        encoding: {
          x: { datum: fxValue },
          y: { value: 0 },
          text: { value: fxLabel },
          color: { value: "#616161" },
          align: { value: "left" },
          dx: { value: 6 },
        },
      },
    ],
    config: {
      axis: { labelLimit: 260 },
      view: { stroke: null },
    },
  };
}, [values, baseValue, fxValue, xDomain]);

  return (
    <Box sx={{ height: "100%" }}>
      <ClosableCardTable
        details={plotDescr}
        title={plotName || "SHAP"}
        onClose={onClose}
        noPadding
      >
        {error ? (
            <InfoMessage
                message="Error fetching shap plot."
                type="info"
                icon={<AssessmentIcon sx={{ fontSize: 40, color: 'info.main' }} />}
                fullHeight
            />
        ) : loading ?(
            <Loader />
        ) :(
            <VegaLite
                spec={spec}
                actions={false}
            />
        )}
      </ClosableCardTable>
    </Box>
  );
};

export default InstanceShapPlot;