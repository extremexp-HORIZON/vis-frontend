interface ICreateRunRequest {
  experimentId: string;
  runName: string;
  params: Record<string, string>;
}

interface ICreateRunResponse {
  message: string;
  kfpRunId: string;
  runName: string;
}
