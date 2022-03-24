enum Status {
  Ok,
  Warning,
  Error
}

interface ConsulServiceStatus {
  id: string
  meta?: ConsulServiceMetadata
  tags: Array<string>
  status: string
}

interface ConsulServiceMetadata {
  title: string
  description?: string
}

export {
  Status
}

export type {
  ConsulServiceStatus,
  ConsulServiceMetadata
}