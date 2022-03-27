enum Status {
  Passing,
  Warning,
  Critical
}

interface ConsulServicesResponse {
  [key: string]: Array<string>
}

interface ConsulServiceStatus {
  id: string
  meta?: ConsulServiceMetadata
  tags: Array<string>
  status: Status
}

interface ConsulServiceMetadata {
  title: string
  description?: string
  category?: string
  tags?: Array<string>
}

export {
  Status
}

export type {
  ConsulServiceStatus,
  ConsulServiceMetadata,
  ConsulServicesResponse
}