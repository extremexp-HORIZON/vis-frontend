import type React from "react";
import { useEffect, useMemo, useState } from "react"
import type {
  SelectChangeEvent} from "@mui/material";
import {
  Button,
  Typography,
  Select,
  MenuItem,
  Box,
  InputLabel,
  FormControl,
  OutlinedInput,
  Collapse,
  Tooltip,
  Paper,
  CircularProgress
} from "@mui/material"
import type { IWorkflowPageModel } from "../shared/models/workflow.tab.model"
import WorkflowCard from "../shared/components/workflow-card"
import {
  explainabilityQueryDefault,
  fetchExplainabilityPlotPayloadDefault,
} from "../shared/models/tasks/explainability.model"
import GlovesScatter from "./gloves-scatter"
import GlovesMetricSummary from "./gloves-metric-summary"
import { useAppDispatch } from "../store/store"
import { fetchAffected } from "../store/slices/modelAnalysisSlice";
import { fetchModelAnalysisExplainabilityPlot } from "../store/slices/explainabilitySlice";

interface CGlanceExecutionProps {
  workflow: IWorkflowPageModel
  availableCfMethods: string[]
  availableActionStrategies: string[]
  availableFeatures: string[]
  plotRequestMetadata: any
}

interface ApplyAffectedActionsResponse {
  applied_affected_actions: Record<string, ITableContents>
}
interface ITableContents {
  [key: string]: IValues
}

interface IValues {
  values: string[]
  index: number
  colour: string[]
}

const CGlanceExecution: React.FC<CGlanceExecutionProps> = ({
  workflow,
  availableCfMethods,
  availableActionStrategies,
  availableFeatures,
  plotRequestMetadata,
}) => {
  const [cfMethod, setCfMethod] = useState<string>(availableCfMethods[0] || "")
  const [actionChoiceStrategy, setActionChoiceStrategy] = useState<string>(
    availableActionStrategies[0] || "",
  )
  const [gcfSizes, setGcfSizes] = useState<Map<string, number>>(new Map())
  const [gcfSize, setGcfSize] = useState<number>(3) // Default size
  const [selectedFeature, setSelectedFeature] = useState<string[]>([]) // Start with empty array
  const [advancedOptionsOpen, setAdvancedOptionsOpen] = useState(true) // To control the collapse state

  const dispatch = useAppDispatch()

  // Sync the local gcfSize with the workflow-specific size on workflow change
  useEffect(() => {
    const size = gcfSizes.get(workflow.workflowId) || 3 // Default to 3 if not set
    setGcfSize(size)
  }, [workflow.workflowId, gcfSizes])

  useEffect(() => {
    if (availableCfMethods.length > 0 && !cfMethod) {
      setCfMethod(availableCfMethods[0])
    }
    if (availableFeatures.length > 0 && selectedFeature.length === 0) {
      setSelectedFeature(availableFeatures) // Only set if `selectedFeature` is empty
    }
  }, [availableCfMethods, availableFeatures])

  const fetchData = async () => {
    try {
      // Dispatch global_counterfactuals
      await dispatch(
        fetchModelAnalysisExplainabilityPlot({
          query: {
            ...explainabilityQueryDefault,
            explanation_type: "featureExplanation",
            explanation_method: "global_counterfactuals",

            gcf_size: gcfSize,
            cf_generator: cfMethod,
            cluster_action_choice_algo: actionChoiceStrategy,
            model: plotRequestMetadata.model,
            data: plotRequestMetadata.data,
            train_index: [
              7397, 1935, 7821, 4951, 3515, 807, 2045, 8163, 462, 1956, 2445,
              4081, 799, 2402, 4104, 1073, 3357, 144, 5505, 1340, 2885, 4567,
              2091, 7637, 5265, 3096, 5846, 4866, 2939, 5491, 4604, 1003, 5623,
              7950, 555, 3469, 6878, 1485, 5842, 1272, 1411, 7660, 7468, 1471,
              6391, 4936, 5860, 7675, 5379, 5817, 981, 6929, 2908, 7210, 1268,
              2462, 3315, 268, 654, 2718, 2966, 5528, 5014, 7897, 589, 3916,
              4010, 2899, 4483, 8151, 8029, 7957, 1808, 7031, 7701, 4112, 677,
              6036, 6492, 7676, 5897, 4776, 7086, 2432, 4254, 6336, 4015, 4195,
              2845, 5324, 1611, 5190, 7899, 7817, 4253, 8130, 3997, 3404, 605,
              4927, 4092, 1468, 6769, 7134, 4245, 4047, 5035, 3936, 2155, 3745,
              7826, 2077, 6058, 5748, 3680, 6380, 584, 5605, 6405, 3951, 2918,
              8089, 8171, 3441, 6623, 2586, 7825, 7870, 2550, 7592, 344, 4649,
              6693, 2697, 7671, 871, 6330, 4028, 2868, 90, 3937, 4319, 5071,
              7245, 2117, 4331, 6211, 4684, 5678, 947, 5922, 3792, 4335, 883,
              7748, 4140, 4800, 5533, 3333, 7493, 7128, 6008, 4879, 5448, 5857,
              5738, 2415, 3956, 6200, 3412, 5494, 5830, 3003, 2398, 7249, 1710,
              7662, 4808, 1186, 3989, 7850, 7597, 6221, 7992, 151, 915, 1305,
              6638, 5317, 7550, 7922, 5397, 1398, 2519, 183, 5103, 3355, 6395,
              2417, 471, 967, 5454, 5388, 209, 1961, 896, 6198, 6472, 5001,
              1773, 7094, 2299, 1209, 4377, 4664, 1270, 1251, 3891, 5825, 7224,
              4928, 7551, 292, 6704, 1051, 2874, 4608, 272, 2042, 5187, 2755,
              3016, 5978, 1086, 3733, 3968, 7173, 5859, 2847, 4657, 5199, 5509,
              3482, 7502, 2913, 7933, 613, 7970, 3939, 3518, 7142, 6885, 1748,
              7370, 6256, 3307, 4513, 6011, 2662, 3282, 3774, 2154, 1344, 7901,
              6141, 5099, 952, 3885, 1504, 4813, 8128, 3207, 1121, 4620, 4922,
              3985, 4836, 6055, 7233, 3184, 416, 4842, 2431, 3027, 564, 2526,
              1224, 142, 5146, 1490, 8096, 3647, 3905, 2653, 2004, 1194, 2991,
              3014, 1756, 497, 2809, 4058, 7987, 912, 721, 5955, 6301, 1496,
              6557, 1520, 5227, 2746, 6554, 4048, 4903, 6583, 108, 1754, 5740,
              1351, 4619, 4534, 4541, 1973, 336, 2764, 5141, 5761, 3539, 4698,
              3145, 6056, 3455, 724, 765, 4434, 7791, 7015, 307, 1278, 348,
              7061, 6365, 4295, 7410, 1791, 6533, 3826, 6908, 2053, 3268, 5824,
              71, 5649, 2759, 4168, 7782, 3458, 4424, 5452, 3340, 1260, 1666,
              8016, 4157, 6326, 6743, 2167, 7783, 2533, 1695, 1095, 6154, 7181,
              3973, 1630, 5011, 1881, 5650, 7395, 1612, 978, 1413, 5818, 3464,
              848, 8084, 3816, 2271, 2392, 6453, 1830, 2877, 47, 8070, 4454,
              1350, 7611, 6317, 446, 2248, 1743, 844, 4060, 8115, 3244, 2440,
              678, 3543, 4601, 1294, 3649, 6969, 4631, 7639, 6536, 7948, 1112,
              7824, 776, 7730, 2231, 2228, 2153, 5564, 4883, 3478, 7398, 1366,
              1469, 1851, 1963, 5022, 4905, 4726, 7124, 485, 2239, 4518, 6894,
              4560, 6272, 30, 4101, 1879, 5934, 3078, 3254, 3541, 5283, 5597,
              1036, 636, 5202, 6720, 1083, 2615, 861, 7068, 903, 4091, 109,
              7859, 7103, 3396, 3121, 6858, 2997, 6255, 1831, 6355, 3213, 782,
              7973, 5009, 4520, 6741, 3199, 5377, 1825, 2617, 6249, 1094, 5744,
              4147, 3639, 4979, 5809, 4304, 2987, 1654, 6689, 7488, 2323, 2413,
              8166, 2654, 7450, 3263, 2678, 4633, 5888, 6712, 5118, 3574, 178,
              7359, 3934, 3481, 1204, 2202, 4860, 6630, 6306, 3182, 8129, 3771,
              1770, 829, 941, 7908, 2486, 627, 3139, 4817, 925, 295, 1052, 2707,
              5216, 7327, 4539, 7060, 2789, 944, 6501, 7929, 12, 1117, 6746,
              7994, 8055, 8058, 4574, 1319, 779, 7984, 7477, 7626, 3921, 433,
              653, 2477, 3337, 6332, 4769, 4932, 7030, 6519, 7964, 3799, 2886,
              6591, 7135, 5964, 7673, 6648, 5689, 8138, 570, 1448, 6568, 4594,
              4387, 3409, 6724, 1745, 2741, 1590, 7772, 3980, 287, 1738, 5133,
              7217, 4216, 5075, 4886, 4630, 4742, 2827, 1684, 7371, 1338, 4302,
              2742, 3978, 6703, 4031, 4852, 2902, 2258, 4738, 2986, 7259, 2121,
              6728, 3352, 4504, 1564, 6244, 4753, 3922, 7808, 2185, 4639, 1231,
              5154, 1258, 2254, 1951, 7599, 113, 6931, 2509, 5993, 4161, 3091,
              2548, 3544, 507, 4478, 4184, 5900, 3377, 7289, 6088, 4347, 2850,
              4787, 5542, 7692, 350, 6311, 2906, 5606, 4581, 2505, 2620, 5102,
              1114, 2846, 5780, 298, 1675, 6487, 7746, 3540, 6234, 6667, 3755,
              5525, 229, 76, 4235, 5682, 7958, 5267, 2103, 6428, 4956, 3593,
              7736, 5672, 5469, 1614, 607, 4013, 4829, 1093, 7854, 2622, 6618,
              8026, 7761, 203, 2387, 8078, 4707, 837, 2934, 5117, 8109, 1230,
              6210, 5519, 1609, 7648, 5852, 7034, 4824, 6657, 2732, 7145, 4693,
              6280, 5427, 6685, 4606, 3886, 6239, 3689, 4734, 4165, 657, 790,
              3757, 7011, 8027, 2561, 2640, 1359, 6006, 2347, 5550, 4192, 2781,
              6187, 6009, 6444, 6424, 7143, 6845, 615, 2575, 6252, 2314, 1705,
              7658, 3378, 6972, 1780, 7318, 803, 857, 6816, 7138, 990, 5501,
              4320, 7262, 5783, 219, 3406, 1288, 3163, 582, 2618, 43, 1234,
              5769, 3567, 3428, 7905, 1892, 4984, 7156, 7786, 6753, 1071, 718,
              2364, 1505, 4641, 670, 4712, 2952, 4939, 6537, 7316, 897, 6577,
              2666, 3193, 2890, 7092, 1530, 7265, 6832, 4704, 6524, 3982, 7765,
              5419, 3513, 7084, 1874, 2370, 1769, 5950, 4003, 1983, 531, 5866,
              6171, 4148, 2881, 81, 5204, 6650, 4313, 2163, 731, 2339, 5952,
              2232, 3932, 6004, 7707, 5185, 4708, 3334, 3941, 6631, 2705, 1255,
              2104, 6590, 4505, 5090, 898, 428, 5663, 4773, 6399, 7399, 1222,
              5822, 4661, 5875, 5263, 6135, 6176, 1621, 7299, 3164, 4962, 6525,
              1096, 2715, 2072, 7383, 5357, 4174, 3379, 6889, 2588, 3479, 1788,
              5935, 5430, 528, 4173, 192, 6692, 1126, 3612, 3550, 7198, 304,
              6101, 1292, 70, 3704, 4671, 2687, 6943, 3805, 831, 4128, 1456,
              2607, 5004, 238, 92, 2977, 3608, 4405, 7649, 4087, 4509, 3552,
              4597, 5153, 1001, 4233, 7832, 2377, 6995, 7063, 6733, 3246, 3422,
              1532, 2410, 4967, 411, 4085, 7839, 4955, 2805, 7549, 6020, 3082,
              4538, 1736, 3912, 5140, 7457, 6468, 6896, 3542, 633, 3021, 498,
              4317, 2463, 4603, 637, 720, 288, 757, 6383, 7751, 3089, 6343,
              7129, 4907, 449, 596, 6410, 3751, 1068, 1942, 1647, 494, 5386,
              2700, 1700, 6582, 6553, 4856, 3887, 2942, 6699, 3621, 7308, 2123,
              4239, 86, 2308, 2677, 5520, 4472, 6802, 2594, 3833, 3058, 1029,
              136, 2876, 7197, 3616, 2144, 4127, 6452, 5137, 1200, 2025, 621,
              7435, 566, 4885, 1837, 1334, 5461, 7774, 2099, 7361, 5091, 6268,
              4423, 1688, 745, 7724, 4336, 2187, 195, 1152, 4410,
            ],
            test_index: [
              4332, 5696, 3611, 6869, 5165, 1918, 5162, 3289, 6963, 5904, 5246,
              8118, 5269, 7557, 2215, 5902, 4529, 4500, 4414, 4845, 4366, 5891,
              4653, 7953, 4772, 3365, 319, 6130, 3877, 6727, 3400, 6267, 811,
              429, 2412, 2476, 503, 2083, 2685, 5049, 5647, 457, 472, 2929,
              8036, 3101, 6347, 2173, 3018, 6625, 3827, 7975, 4863, 7064, 7810,
              4687, 5933, 2436, 1022, 7443, 3794, 7000, 7461, 7096, 4747, 5549,
              3095, 2456, 315, 965, 5660, 4381, 2183, 33, 5593, 6455, 5664,
              2112, 4993, 2879, 2589, 7682, 7438, 1608, 7309, 1741, 7819, 7949,
              1606, 7190, 1172, 1127, 233, 3393, 5307, 5259, 1009, 7365, 4315,
              2319, 5665, 6739, 2864, 5113, 7972, 4421, 5192, 7848, 6127, 4262,
              263, 239, 4871, 5804, 6861, 5570, 6277, 533, 6119, 8123, 3299,
              349, 3573, 4645, 5802, 1905, 4038, 5500, 4775, 2818, 3527, 1922,
              6934, 496, 676, 2706, 6836, 6279, 2778, 8106, 3395, 3033, 1897,
              93, 5648, 4952, 101, 5632, 4709, 1623, 1346, 6207, 908, 736, 2157,
              6674, 6994, 7295, 828, 3107, 6189, 4987, 5786, 1877, 6497, 5196,
              540, 4224, 1511, 5251, 1916, 2807, 2955, 6765, 6844, 1593, 2592,
              6353, 6114, 3742, 1934, 5059, 318, 5200, 1053, 4019, 3103, 4355,
              6812, 5942, 5669, 4369, 7149, 7907, 5562, 5909, 742, 7433, 6060,
              5537, 6675, 1176, 7753, 5943, 5758, 3668, 453, 3992, 789, 3305,
              1417, 3090, 4012, 866, 6899, 222, 3127, 4586, 682, 2842, 5741,
              625, 2926, 4764, 5798, 4393, 5743, 2669, 7770, 6418, 2439, 3960,
              1221, 2404, 6653, 957, 1042, 2865, 1835, 3728, 4210, 1339, 7853,
              65, 4401, 4215, 5687, 4359, 4370, 6535, 7264, 3534, 7440, 1507,
              3133, 6050, 3176, 6906, 3836, 5555, 1044, 706, 1414, 6798, 23,
              1662, 940, 465, 6475, 6247, 7668, 4291, 3429, 6687, 7485, 1454,
              2510, 982, 6131, 1078, 1002, 3693, 7407, 2776, 7729, 6219, 8040,
              3297, 858, 4022, 3360, 8043, 8112, 4222, 4240, 3454, 518, 4417,
              1480, 7806, 6264, 7248, 3707, 7788, 5400, 6532, 132, 5391, 1438,
              5239, 4039, 1595, 8170, 1656, 6729, 1313, 7983, 1650, 7844, 4176,
              7868, 7261, 4270, 730, 1027, 3820, 5278, 4071, 1535, 4965, 4975,
              1057, 743, 2221, 2358, 37, 4868, 5858, 6626, 6351, 3411, 3260,
              586, 3077, 4595, 3039, 2970, 7640, 3781, 95, 5928, 6382, 7544,
              5835, 2699, 4617, 1183, 3592, 7941, 1618, 3459, 5201, 4441, 879,
              2862, 251, 6877, 334, 2815, 7402, 3382, 5067, 2580, 1074, 2867,
              6377, 4640, 927, 7677, 7283, 2554, 5362, 6053, 1056, 7377, 7612,
              1407, 800, 3915, 8117, 157, 3381, 5946, 7666, 5968, 2115, 2569,
              7167, 4674, 4508, 1005, 4446, 7845, 1886, 487, 5168, 7866, 6839,
              1405, 932, 7221, 6823, 4655, 1880, 997, 1402, 1144, 1840, 3555,
              1295, 4326, 4436, 2927, 5558, 3346, 4706, 2647, 353, 4778, 3296,
              6718, 5965, 5502, 7376, 7878, 1940, 1978, 2691, 4832, 4205, 8052,
              4350, 3017, 1954, 1928, 6957, 4427, 5598, 4323, 8011, 2094, 7708,
              2646, 712, 3463, 2840, 5849, 7499, 1575, 856, 5666, 2373, 7785,
              1732, 5245, 7379, 994, 7814, 7189, 1616, 3844, 5410, 3105, 3955,
              7324, 3971, 6290, 7353, 5729, 3558, 7110, 7315, 3025, 4338, 2988,
              483, 4570, 6912, 6057, 5160, 6803, 3505, 3528, 3653, 4614, 3071,
              5309, 696, 4098, 5559, 5987, 1677, 6156, 2441, 2178, 4074, 7042,
              2609, 7525, 1569, 4919, 7236, 3721, 2321, 2641, 393, 4110, 230,
              1807, 3872, 6596, 6178, 5899, 6385, 7328, 7175, 647, 5587, 1426,
              8005, 554, 61, 3753, 6750, 1142, 710, 4991, 332, 6202, 2470, 5963,
              1545, 7235, 1287, 8066, 794, 5697, 4471, 7925, 2574, 7976, 1731,
              3571, 1867, 1701, 6740, 6340, 1730, 538, 4527, 7888, 79, 1839,
              4169, 2126, 4767, 1061, 4241, 2338, 1010, 7835, 3467, 4692, 1882,
              4559, 2513, 7719, 6821, 149, 2925, 3151, 5156, 4264, 169, 7535,
              5566, 3856, 8120, 2357, 1385, 4449, 5422, 7894, 7373, 1075, 1479,
              7638, 7577, 3477, 6261, 509, 5668, 2579, 8082, 2306, 1739, 2177,
              4786, 6925, 7406, 5576, 5082, 1864, 1790, 6126, 5061, 6661, 4094,
              1277, 3290, 4511, 2629, 3509, 5108, 544, 3961, 7428, 1400, 5057,
              6695, 7680, 1915, 3098, 7247, 2543, 3838, 6436, 3708, 7775, 5896,
              6082, 5382, 1850, 5887, 6321, 6988, 601, 4502, 408, 7416, 1671,
              7737, 6558, 7792, 8068, 7471, 7694, 1858, 1180, 6276, 1373, 6107,
              4269, 7943, 4651, 4189, 4789, 2894, 576, 1281, 5608, 5459, 1811,
              2858, 6773, 5157, 5767, 177, 1862, 4818, 6173, 2107, 7116, 2131,
              7863, 328, 4383, 2753, 8145, 4816, 5914, 3317, 8168, 3706, 748,
              2611, 7219, 2263, 6223, 2149, 1025, 4053, 2603, 7356, 3813, 4844,
              5281, 6837, 1087, 181, 5862, 4374, 7604, 2688, 4166, 4756, 4032,
              4925, 2447, 4731, 3966, 3538, 2656, 41, 4591, 6120, 2354, 3172,
              217, 185, 3898, 6813, 5041, 970, 2264, 2484, 683, 4228, 2921, 87,
              3085, 7902, 4034, 4766, 1263, 7709, 6587, 5960, 257, 3907, 3383,
              1302, 3914, 6517, 7636, 1586, 1420, 763, 5081, 737, 3620, 6488,
              543, 6522, 5850, 1055, 3605, 2627, 1965, 7033, 1452, 7915, 1345,
              6216, 381, 56, 69, 5879, 7711, 7584, 6393, 1670, 4793, 3460, 7204,
              2821, 7037, 1871, 445, 4059, 5411, 7645, 4490, 6658, 3126, 4963,
              6084, 5076, 1566, 3484, 6375, 19, 2860, 4075, 3055, 1632, 2288,
              2495, 3181, 751, 4316, 6792, 5107, 476, 4812, 2098, 1197, 6339,
              468, 8062, 5702, 308, 7589, 7605, 2851, 2726, 4395, 6598, 5546,
              7618, 6760, 5901, 2905, 4416, 5929, 1971, 80, 1747, 641, 3045,
              5517, 5470, 2968, 3720, 6357, 5863, 4292, 1515, 3303, 3135, 1046,
              5807, 7569, 2722, 7160, 3044, 1103, 118, 4714, 1883, 4947, 6253,
              5577, 1699, 3080, 7039, 6917, 1746, 6664, 7057, 3927, 7979, 2614,
              7932, 5489, 2272, 5661, 3006, 8131, 4942, 7512, 4217, 1168, 6021,
              3964, 5333, 3437, 5395, 7542, 8033, 6556, 2572, 5193, 2602, 4139,
              618, 7860, 6112, 4607, 773, 6597, 4660, 3413, 1084, 50, 5620, 733,
              245, 5312, 179, 7055, 17, 2266, 4273, 2578, 3128, 5405, 3855,
              2406, 4348, 6805, 8157, 4861, 4328, 511, 321, 2208, 6999, 1429,
              7165, 4462, 5659, 4379, 3661, 2111, 8045, 6968, 6615, 7877, 7553,
              6606, 1123, 4827, 1945, 7977, 2957, 6856, 7981, 7325, 7961, 5773,
              4765, 1199, 3857, 3994, 1163, 3666, 4310, 6827, 8083, 4329, 6199,
              3424, 7320, 1193, 6551, 1203, 7285, 1315, 3064, 435, 2002, 2142,
              4830, 3615, 6476, 1034, 1261, 4522, 6939, 7995, 1017, 7019, 1320,
              1672, 2673, 6438, 4231, 3859, 5591, 8126, 486, 6989, 199, 2605,
              6637, 7578, 5624, 1755, 5111,
            ],
            target_column: plotRequestMetadata.target_column,
          },
          metadata: {
            workflowId: workflow.workflowId,
            queryCase: "globalCounterfactuals",
          },
        }),
      )

      // Dispatch affected
      await dispatch(
        fetchAffected({
          workflowId: parseInt(workflow.workflowId, 10),
          queryCase: "affected",
        }),
      )

      console.log(
        "Dispatched global_counterfactuals and affected successfully.",
      )
    } catch (error) {
      console.error("Error dispatching data:", error)
    }
  }

  const handleGcfSizeChange = (event: SelectChangeEvent<number>) => {
    const newSize = event.target.value as number

    // Update the size in the `Map`
    setGcfSizes(prevSizes => {
      const newSizes = new Map(prevSizes) // Create a new `Map` to trigger re-render
      newSizes.set(workflow.workflowId, newSize)
      return newSizes
    })

    // Update the local state for the dropdown
    setGcfSize(newSize)
  }

  return (
    <>
      <Box
        className="Category-Item"
        sx={{
          borderRadius: 4,
          display: "flex",
          flexDirection: "column",
          rowGap: 0,
          minWidth: "300px",
          width: "100%",
          height: "100%",
        }}
      >
        {/* Box container to arrange elements side by side */}
        <Box
          alignItems="center"
          justifyContent="center"
          gap={2}
          marginBottom={2}
          marginTop={2}
          flexWrap="wrap"
        >
          {/* Dropdown for GCF Size */}
          <Tooltip title="The number of actions to be generated in the end of the algorithm">
            <FormControl
              sx={{
                width: "10%",
                flex: 1,
                minWidth: "150px",
                marginLeft: "10px",
                marginRight: "10px",
              }}
            >
              <InputLabel id="gcf-size-select-label">
                Number of CounterFactual Actions
              </InputLabel>
              <Select
                MenuProps={{
                  PaperProps: { style: { maxHeight: 224, width: 250 } },
                }}
                labelId="gcf-size-select-label"
                input={
                  <OutlinedInput label="Number of CounterFactual Actions" />
                }
                value={gcfSize}
                onChange={handleGcfSizeChange}
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map(value => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Tooltip>
          <Button
            variant="contained"
            onClick={fetchData}
            color="primary"
            sx={{ flex: 1, minWidth: "150px", marginRight: "10px" }}
          >
            Run
          </Button>
          <Button
            variant="contained"
            onClick={() => setAdvancedOptionsOpen(!advancedOptionsOpen)}
          >
            {advancedOptionsOpen
              ? "Hide Advanced Options"
              : "Show Advanced Options"}
          </Button>
        </Box>

        {/* Advanced Options */}
        <Collapse in={advancedOptionsOpen}>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap={2}
            marginTop={3}
          >
            <Box display="flex" gap={1} flexWrap="wrap" justifyContent="center">
              {/* Local Counterfactual Method Dropdown */}
              <Tooltip title="Methods that generate candidate counterfactual explanations">
                <FormControl fullWidth sx={{ flex: 1, minWidth: "350px" }}>
                  <InputLabel id="cf-method-select-label">
                    Local Counterfactual Method
                  </InputLabel>
                  <Select
                    labelId="cf-method-select-label"
                    input={
                      <OutlinedInput label="Local Counterfactual Method" />
                    }
                    value={cfMethod}
                    onChange={e => setCfMethod(e.target.value as string)}
                    MenuProps={{
                      PaperProps: { style: { maxHeight: 224, width: 250 } },
                    }}
                  >
                    {availableCfMethods.map(method => (
                      <MenuItem key={method} value={method}>
                        {method}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Tooltip>

              {/* Action Choice Strategy Dropdown */}
              <Tooltip title="Different strategies for selecting the best actions from the generated counterfactuals based on different criteria">
                <FormControl fullWidth sx={{ flex: 1, minWidth: "350px" }}>
                  <InputLabel id="action-choice-strategy-select-label">
                    Action Choice Strategy
                  </InputLabel>
                  <Select
                    MenuProps={{
                      PaperProps: { style: { maxHeight: 224, width: 250 } },
                    }}
                    labelId="action-choice-strategy-select-label"
                    input={<OutlinedInput label="Action Choice Strategy" />}
                    value={actionChoiceStrategy}
                    onChange={e =>
                      setActionChoiceStrategy(e.target.value as string)
                    }
                  >
                    {availableActionStrategies.map(strategy => (
                      <MenuItem key={strategy} value={strategy}>
                        {strategy}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Tooltip>
            </Box>
          </Box>
        </Collapse>

        <Box>
          {workflow.workflowTasks.modelAnalysis?.global_counterfactuals
            .loading ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              mt={2}
            >
              <CircularProgress size={24} />
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Loading
              </Typography>
            </Box>
          ) : workflow.workflowTasks.modelAnalysis?.global_counterfactuals
              .error ||
            workflow.workflowTasks.modelAnalysis?.global_counterfactuals.data
              ?.plotName === "Error" ? (
            <Typography
              variant="body2"
              color="error"
              align="center"
              sx={{ mt: 2 }}
            >
              {
                workflow.workflowTasks.modelAnalysis?.global_counterfactuals
                  .data?.plotDescr
              }
            </Typography>
          ) : (
            workflow.workflowTasks.modelAnalysis?.global_counterfactuals.data &&
            workflow.workflowTasks.modelAnalysis?.affected.data && (
              <>
                <GlovesMetricSummary
                  cost={
                    workflow.workflowTasks.modelAnalysis.global_counterfactuals
                      .data.TotalCost
                  }
                  eff={
                    workflow.workflowTasks.modelAnalysis.global_counterfactuals
                      .data.TotalEffectiveness
                  }
                  actions={
                    workflow.workflowTasks.modelAnalysis.global_counterfactuals
                      .data.actions
                  }
                  instances={undefined}
                  eff_cost_actions={
                    workflow.workflowTasks.modelAnalysis.global_counterfactuals
                      .data.effCostActions
                  }
                />
                <Box marginTop={2}>
                  <WorkflowCard
                    title={""}
                    description="Set of final global counterfactual actions generated"
                  >
                    <GlovesScatter
                      data1={
                        workflow.workflowTasks.modelAnalysis
                          .global_counterfactuals.data.affectedClusters
                      }
                      data2={workflow.workflowTasks.modelAnalysis.affected.data}
                      actions={
                        workflow.workflowTasks.modelAnalysis
                          .global_counterfactuals.data.actions
                      }
                      eff_cost_actions={
                        workflow.workflowTasks.modelAnalysis
                          .global_counterfactuals.data.effCostActions
                      }
                    />
                  </WorkflowCard>
                </Box>
              </>
            )
          )}
        </Box>
      </Box>
    </>
  )
}

export default CGlanceExecution
