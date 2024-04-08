import _pt from "prop-types";
import { Button, Col, Collapse, Modal, Row, Space, Spin, Table, Tag } from 'antd';
import React, { useState } from 'react';
import ParallelCoordinatesPlot from './ParallelCoordinatesPlot';
export default function InteractiveTablePlugin(props) {
  var {
    data,
    columns,
    tableSize
  } = props;
  var [computedCounterfactuals, setComputedCounterfactuals] = useState([]);
  var [loadingRows, setLoadingRows] = useState([]); // State to track loading rows

  var [bottom, setBottom] = useState('bottomRight');
  var [modalVisible, setModalVisible] = useState(false);
  var {
    Panel
  } = Collapse;

  var computeCounterfactuals = rowId => {
    setLoadingRows([...loadingRows, rowId]); // Set loading state for the row

    setTimeout(() => {
      setComputedCounterfactuals([...computedCounterfactuals, rowId]);
      setLoadingRows(loadingRows.filter(id => id !== rowId)); // Remove loading state after 500ms

      setModalVisible(true); // Open the modal after computation finishes
    }, 500);
  };

  var convertToAntColumns = columnsArray => {
    var antdCols = columnsArray.map((column, index) => ({
      title: column,
      dataIndex: column,
      key: column
    }));
    return [...antdCols, {
      title: 'Action',
      key: 'action',
      sorter: false,
      fixed: 'right',
      render: (text, record, id) => /*#__PURE__*/React.createElement(Button, {
        onClick: () => showCounterfactualsModal(record.key)
      }, /*#__PURE__*/React.createElement(Space, null, "Counterfactuals", loadingRows.includes(record.key) && /*#__PURE__*/React.createElement(Spin, {
        size: "small"
      }), " "))
    }];
  };

  var convertToAntRecords = data => {
    data.forEach((d, idx) => d["key"] = idx);
    return data;
  };

  var renderSubTable = () => {
    // const subData = [
    //   { key: 1, Model__learning_rate: 0.1, Model__max_depth: 2, Model__min_child_weight: 1, Model__n_estimators: 75, 'preprocessor__num__scaler': 'StandardScaler()', BinaryLabel: 1 },
    //   { key: 2, Model__learning_rate: 0.01, Model__max_depth: 8, Model__min_child_weight: 1, Model__n_estimators: 75, 'preprocessor__num__scaler': 'StandardScaler()', BinaryLabel: 0 },
    //   { key: 3, Model__learning_rate: 0.001, Model__max_depth: 2, Model__min_child_weight: 1, Model__n_estimators: 84, 'preprocessor__num__scaler': 'StandardScaler()', BinaryLabel: 0 },
    //   { key: 4, Model__learning_rate: 0.001, Model__max_depth: 2, Model__min_child_weight: 1, Model__n_estimators: 48, 'preprocessor__num__scaler': 'StandardScaler()', BinaryLabel: 0 },
    //   { key: 5, Model__learning_rate: 0.001, Model__max_depth: 2, Model__min_child_weight: 1, Model__n_estimators: 81, 'preprocessor__num__scaler': 'StandardScaler()', BinaryLabel: 0 },
    //   { key: 6, Model__learning_rate: 0.001, Model__max_depth: 2, Model__min_child_weight: 1, Model__n_estimators: 44, 'preprocessor__num__scaler': 'StandardScaler()', BinaryLabel: 0 },
    // ];
    var subData = [{
      "Model__learning_rate": 0.1,
      "Model__max_depth": 2,
      "Model__min_child_weight": 1,
      "Model__n_estimators": 75,
      "preprocessor__num__scaler": "StandardScaler()",
      "BinaryLabel": 1,
      "Cost": null
    }, {
      "Model__learning_rate": 0.001,
      "Model__max_depth": 2,
      "Model__min_child_weight": 1,
      "Model__n_estimators": 75,
      "preprocessor__num__scaler": "StandardScaler()",
      "BinaryLabel": 0,
      "Cost": "1.0"
    }, {
      "Model__learning_rate": 0.001,
      "Model__max_depth": 2,
      "Model__min_child_weight": 1,
      "Model__n_estimators": 95,
      "preprocessor__num__scaler": "StandardScaler()",
      "BinaryLabel": 0,
      "Cost": "1.2666666666666668"
    }, {
      "Model__learning_rate": 0.001,
      "Model__max_depth": 2,
      "Model__min_child_weight": 1,
      "Model__n_estimators": 99,
      "preprocessor__num__scaler": "StandardScaler()",
      "BinaryLabel": 0,
      "Cost": "1.32"
    }, {
      "Model__learning_rate": 0.1,
      "Model__max_depth": 8,
      "Model__min_child_weight": 1,
      "Model__n_estimators": 26,
      "preprocessor__num__scaler": "StandardScaler()",
      "BinaryLabel": 0,
      "Cost": "1.4033333333333333"
    }, {
      "Model__learning_rate": 0.1,
      "Model__max_depth": 9,
      "Model__min_child_weight": 1,
      "Model__n_estimators": 25,
      "preprocessor__num__scaler": "StandardScaler()",
      "BinaryLabel": 0,
      "Cost": "1.5416666666666665"
    }];
    var subColumns = [{
      title: 'Model__learning_rate',
      dataIndex: 'Model__learning_rate',
      key: 'Model__learning_rate'
    }, {
      title: 'Model__max_depth',
      dataIndex: 'Model__max_depth',
      key: 'Model__max_depth'
    }, {
      title: 'Model__min_child_weight',
      dataIndex: 'Model__min_child_weight',
      key: 'Model__min_child_weight'
    }, {
      title: 'Model__n_estimators',
      dataIndex: 'Model__n_estimators',
      key: 'Model__n_estimators'
    }, {
      title: 'BinaryLabel',
      dataIndex: 'BinaryLabel',
      key: 'BinaryLabel',
      render: value => /*#__PURE__*/React.createElement(Tag, {
        color: value === 1 ? 'red' : 'green'
      }, value === 1 ? 'Factual' : 'Counterfactual')
    }, {
      title: 'Action',
      key: 'action',
      render: () => /*#__PURE__*/React.createElement(Button, {
        type: "link"
      }, "Save configuration")
    }];
    var [displayChart, setDisplayChart] = useState(true);

    var handleToggleChart = () => {
      setDisplayChart(true);
    };

    var handleToggleTable = () => {
      setDisplayChart(false);
    };

    return /*#__PURE__*/React.createElement(Modal, {
      title: "Counterfactuals",
      visible: modalVisible,
      onCancel: closeModal,
      footer: null,
      width: 1000
    }, /*#__PURE__*/React.createElement(Row, {
      gutter: 16,
      justify: "center",
      style: {
        marginBottom: '10px'
      }
    }, /*#__PURE__*/React.createElement(Col, null, /*#__PURE__*/React.createElement(Button, {
      type: displayChart ? "primary" : "default",
      onClick: handleToggleChart
    }, "Chart View")), /*#__PURE__*/React.createElement(Col, null, /*#__PURE__*/React.createElement(Button, {
      type: displayChart ? "default" : "primary",
      onClick: handleToggleTable
    }, "Table View"))), /*#__PURE__*/React.createElement(Row, null, displayChart ? /*#__PURE__*/React.createElement(ParallelCoordinatesPlot, {
      data: subData.slice(1)
    }) : /*#__PURE__*/React.createElement(Table, {
      dataSource: subData,
      columns: subColumns,
      pagination: false,
      size: "small",
      scroll: {
        y: 400
      }
    })));
  };

  var showCounterfactualsModal = rowId => {
    computeCounterfactuals(rowId);
  };

  var closeModal = () => {
    setModalVisible(false);
  };

  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Table, {
    size: tableSize,
    style: {
      position: "absolute",
      top: 0,
      left: 0
    },
    scroll: {
      x: 1500
    },
    dataSource: convertToAntRecords(data),
    columns: convertToAntColumns(columns),
    pagination: {
      position: [bottom]
    }
  }), renderSubTable());
}
InteractiveTablePlugin.propTypes = {
  data: _pt.arrayOf(_pt.any).isRequired,
  columns: _pt.arrayOf(_pt.any).isRequired,
  height: _pt.number.isRequired,
  width: _pt.number.isRequired,
  tableSize: _pt.any.isRequired
};