// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import type { ConsulServiceStatus } from '../../lib/types'
import fetch from 'node-fetch'

import { parseTagsForMetadata, seeServices, getSeenServices, mergeServiceStatuses } from '../../lib/consul'

interface ConsulServices {
  [key: string]: Array<string>
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  // fetch services from Consul
  let services = await fetch(process.env.CONSUL_ADDRESS + 'v1/catalog/services')
  let parsedServices = await services.json() as ConsulServices

  // filter services for which CSP (this) is enabled
  let enabledServices: Array<ConsulServiceStatus> = []

  Object.keys(parsedServices).forEach(serviceId => {
    if(parsedServices[serviceId].includes('consulStatusPage.enable=true')) {
      enabledServices.push({
        id: serviceId,
        tags: parsedServices[serviceId],
        status: 'critical'
      })
    }
  })

  // get seen services
  const seenServices = await getSeenServices()

  // see services
  await seeServices(enabledServices)

  // get status for each service
  let serviceStatuses: Array<ConsulServiceStatus> = await Promise.all(enabledServices.map(async service => {
    let serviceStatus = await fetch(process.env.CONSUL_ADDRESS + 'v1/health/checks/' + service.id)
    let parsedServiceStatus = await serviceStatus.json() as any

    service.status = parsedServiceStatus[0].Status

    return service
  }))

  // combine statuses
  serviceStatuses = mergeServiceStatuses(seenServices, serviceStatuses)

  // get metadata for each service
  serviceStatuses = serviceStatuses.map(service => {
    service.meta = parseTagsForMetadata(service.tags)

    return service
  })

  res.status(200).json(serviceStatuses)
}
