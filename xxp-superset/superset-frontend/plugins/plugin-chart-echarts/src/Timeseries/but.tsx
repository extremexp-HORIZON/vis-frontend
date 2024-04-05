// // import React from 'react';
// // import { DownOutlined, SmileOutlined } from '@ant-design/icons';
// // import { Dropdown, Space } from 'antd';
// // const items = [
// //   {
// //     key: '1',
    
    
// //   },
// //   {
// //     key: '2',
    
// //     icon: <SmileOutlined />,
// //     disabled: true,
// //   },
// //   {
// //     key: '3',
    
// //     disabled: true,
// //   },
// //   {
// //     key: '4',
// //     danger: true,
// //     label: 'a danger item',
// //   },
// // ];
// // const Butant = () => (
  
// //     <a onClick={(e) => e.preventDefault()}>
// //       <Space>
// //         Hover me
// //         <DownOutlined />
// //       </Space>
// //     </a>
  
// // );
// // export default Butant;

// import React, { useState } from 'react';
// import { TimeseriesChartTransformedProps } from './types';


// function DropdownBar() {
//   // State to hold the selected value
//   const [selectedOption, setSelectedOption] = useState('');

//   // Function to handle option change
//   const handleOptionChange = (event) => {
//     setSelectedOption(event.target.value);
//   };

//   return (
//     <div>
//       {/* <h1>Dropdown Bar Example</h1> */}
//       <select value={selectedOption} onChange={handleOptionChange}>
//         <option value="">Select an option</option>
//         <option value="option1">Option 1</option>
//         <option value="option2">Option 2</option>
//         <option value="option3">Option 3</option>
//         <option value="option4">Option 4</option>
//       </select>
//       <p>Selected Option: {selectedOption}</p>
//     </div>
//   );
// }

// export default DropdownBar;