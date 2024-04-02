import React, { useState } from 'react';
import { Table, Button, Space, Collapse, Spin, Tag, TableProps, Modal } from 'antd';

type TablePagination<T extends object> = NonNullable<Exclude<TableProps<T>['pagination'], boolean>>;
type TablePaginationPosition = NonNullable<TablePagination<any>['position']>[number];

interface InteractiveTablePluginProps {
  data: any[];
  columns: any[];
  height: number;
  width: number;
  tableSize: any;
}

export default function InteractiveTablePlugin(props: InteractiveTablePluginProps) {
  const { data, columns, tableSize } = props;
  
  const [computedCounterfactuals, setComputedCounterfactuals] = useState([]);
  const [loadingRows, setLoadingRows] = useState([]); // State to track loading rows
  const [bottom, setBottom] = useState<TablePaginationPosition>('bottomRight');
  const [modalVisible, setModalVisible] = useState(false);

  const { Panel } = Collapse;


  const computeCounterfactuals = (rowId: number) =>{
    setLoadingRows([...loadingRows, rowId]); // Set loading state for the row
    setTimeout(() => {
      setComputedCounterfactuals([...computedCounterfactuals, rowId]);
      setLoadingRows(loadingRows.filter(id => id !== rowId)); // Remove loading state after 500ms
      setModalVisible(true); // Open the modal after computation finishes
    }, 500);
  }

  const convertToAntColumns = (columnsArray: []) => {
    const antdCols = columnsArray.map((column, index) => ({
      title: column,
      dataIndex: column,
      key: column,
    }));
    return [
      ...antdCols,
      {
        title: 'Action',
        key: 'action',
        sorter: false,
        fixed: 'right',
        render: (text: string, record: any, id: number) => (
          <Button onClick={() => showCounterfactualsModal(record.key)}>
            <Space>
              Counterfactuals
              {loadingRows.includes(record.key) && <Spin size="small" />} {/* Show Spin if loading */}
            </Space>
          </Button>
        ),
      }
    ];
  };

  const convertToAntRecords = (data: any) => {
    data.forEach((d:any, idx:number) => d["key"] = idx);
    return data;
  }

  const renderSubTable = () => {
    const subData = [
      { key: 1, Model__learning_rate: 0.1, Model__max_depth: 2, Model__min_child_weight: 1, Model__n_estimators: 75, 'preprocessor__num__scaler': 'StandardScaler()', BinaryLabel: 1 },
      { key: 2, Model__learning_rate: 0.01, Model__max_depth: 8, Model__min_child_weight: 1, Model__n_estimators: 75, 'preprocessor__num__scaler': 'StandardScaler()', BinaryLabel: 0 },
      { key: 3, Model__learning_rate: 0.001, Model__max_depth: 2, Model__min_child_weight: 1, Model__n_estimators: 84, 'preprocessor__num__scaler': 'StandardScaler()', BinaryLabel: 0 },
      { key: 4, Model__learning_rate: 0.001, Model__max_depth: 2, Model__min_child_weight: 1, Model__n_estimators: 48, 'preprocessor__num__scaler': 'StandardScaler()', BinaryLabel: 0 },
      { key: 5, Model__learning_rate: 0.001, Model__max_depth: 2, Model__min_child_weight: 1, Model__n_estimators: 81, 'preprocessor__num__scaler': 'StandardScaler()', BinaryLabel: 0 },
      { key: 6, Model__learning_rate: 0.001, Model__max_depth: 2, Model__min_child_weight: 1, Model__n_estimators: 44, 'preprocessor__num__scaler': 'StandardScaler()', BinaryLabel: 0 },
    ];
    const subColumns = [
      {
        title: 'Model__learning_rate',
        dataIndex: 'Model__learning_rate',
        key: 'Model__learning_rate',
      },
      {
        title: 'Model__max_depth',
        dataIndex: 'Model__max_depth',
        key: 'Model__max_depth',
      },
      {
        title: 'Model__min_child_weight',
        dataIndex: 'Model__min_child_weight',
        key: 'Model__min_child_weight',
      },
      {
        title: 'Model__n_estimators',
        dataIndex: 'Model__n_estimators',
        key: 'Model__n_estimators',
      },
      {
        title: 'preprocessor__num__scaler',
        dataIndex: 'preprocessor__num__scaler',
        key: 'preprocessor__num__scaler',
      },
      {
        title: 'BinaryLabel',
        dataIndex: 'BinaryLabel',
        key: 'BinaryLabel',
        render: (value: number) => (
          <Tag color={value === 1 ? 'red' : 'green'}>
            {value === 1 ? 'Query' : 'Counterfactual'}
          </Tag>
        ),
      },
      {
        title: 'Action',
        key: 'action',
        render: () => (
          <Button type="link">
            Train new model
          </Button>
        ),
      },
    ];
    return (
      <Modal
      title="Counterfactuals"
      visible={modalVisible}
      onCancel={closeModal}
      footer={null}
      width={800} // Set the desired width of the modal
    >
      <Table
        dataSource={subData}
        columns={subColumns}
        pagination={false}
        size="small"
        scroll={{ y: 400 }} // Add vertical scrolling if necessary
      />
    </Modal>
    );
  };

  const showCounterfactualsModal = (rowId: number) => {
    computeCounterfactuals(rowId);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <div>
      <Table
        size={tableSize}
        style={{position:"absolute", top: 0, left: 0}}
        scroll={{
          x: 1500
        }}
        dataSource={convertToAntRecords(data)}
        columns={convertToAntColumns(columns)}
        pagination={{ position: [bottom] }} 
      />
      {renderSubTable()}
    </div>
  );
}
