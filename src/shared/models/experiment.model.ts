export interface IExperimentResponse {
    experiment: {
        id: string;
        name: string;
        model: string;
        status: string;
        start: string;
        end: string;
        workflow_ids: string[];
        modelJSON: ModelJSON;
    };
}

interface ModelJSON {
    package: Package;
    task: any;
}

interface Package {
    name: string;
    components: Component[];
}

interface Component {
    workflow: Workflow | null;
    assembledWorkflow: AssembledWorkflow | null;
    experiment: Experiment | null;
}

interface Workflow {
    name: string;
    tasks: Task[];
    data: Data[];
    operators: any[];
    dataConfigs: DataConfig[];
    taskConfigs: TaskConfig[];
    nodeLinks: NodeLink[];
    dataLinks: DataLink[];
    metrics: Metric[];
    conditionalLinks: any[];
}

interface AssembledWorkflow {
    name: string;
    parentWorkflow: Workflow;
    taskConfigs: TaskConfig[];
}

interface Experiment {
    name: string;
    intent: string;
    control: Control;
    spaces: Space[];
    events: any[];
}

interface Control {
    expLink: ExpLink[];
}

interface ExpLink {
    started: boolean;
    nodes: Node[];
    ended: boolean;
}

interface Space {
    name: string;
    assembledWorkflow: AssembledWorkflow;
    strategy_name: StrategyName;
    params: Param[];
    tasks: TaskConfig[];
}

interface StrategyName {
    runs: number;
}

interface Param {
    name: string;
    assigned: boolean;
    value: Value | null;
    otherParam: Param | null;
    set: boolean;
    type: string | null;
    default: any;
    range: any;
}

interface Value {
    minimum?: number;
    maximum?: number;
    step?: number;
    values?: string[];
}

interface Task {
    name: string;
}

interface Data {
    name: string;
    output: boolean;
    input: boolean;
    assigned: boolean;
    values: any[];
}

interface DataConfig {
    alias: Data;
    path: string;
}

interface TaskConfig {
    alias: Alias;
    params: Param[];
    implementations: Implementation[];
    dependencies: Dependency[];
    subTaskConfigs: any[];
    metrics: Metric[];
}

interface Alias {
    name: string | null;
}

interface Implementation {
    workflow: string | null;
    filename: string;
}

interface Dependency {
    dependency: string;
}

interface Metric {
    name: string;
    type: string | null;
}

interface NodeLink {
    started: boolean;
    nodes: Node[];
    ended: boolean;
}

interface Node {
    name: string;
}

interface DataLink {
    initialQualifiedData: any;
    initialElement: Data;
    restElements: any[];
    restQualifiedElements: RestQualifiedElement[];
}

interface RestQualifiedElement {
    node: Node;
    data: Data;
}
