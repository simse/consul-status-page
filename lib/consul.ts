import fetch from 'node-fetch'
import { unionBy } from 'lodash'

import type { ConsulServiceMetadata, ConsulServiceStatus } from "./types"

const TAG_PREFIX = 'consulStatusPage.meta.'

// parseTagsForMetadata parses tags from Consul and returns a metadata object
const parseTagsForMetadata = (tags: Array<string>): ConsulServiceMetadata => {
    // filter tags
    let relevantTags = tags.filter(tag => tag.startsWith(TAG_PREFIX))

    // remove prefix for each tag to get key
    relevantTags = relevantTags.map(tag => {
        return tag.replace(TAG_PREFIX, '')
    })

    // convert tag strings to object
    let tagValues: any = {}
    
    relevantTags.forEach(tag => {
        let tagParts = tag.split('=')

        tagValues[tagParts[0]] = tagParts[1]
    })

    // create metadata object
    return {
        title: tagValues.title,
        description: tagValues.description || null
    }
}

// getSeenServices checks Consul KV for a list services previously seen
// this functions helps us know when a service is missing and should be marked DOWN
const getSeenServices = async (): Promise<Array<ConsulServiceStatus>> => {
    const seenServices = await fetch(process.env.CONSUL_ADDRESS + 'v1/kv/consulStatusPage/seenServices?raw=true')

    const seenServicesJson = await seenServices.json() as Array<ConsulServiceStatus>

    return seenServicesJson
}

// seeService adds a service to the Consul KV store
const seeServices = async (services: Array<ConsulServiceStatus>) => {
    // fetch already seen services and merge with passed services
    // doing the below avoids ereasing the memory of an already seen service
    const seenServices = await getSeenServices()
    services = unionBy(seenServices, services, 'id')

    // send merged list back to Consul
    await fetch(process.env.CONSUL_ADDRESS + 'v1/kv/consulStatusPage/seenServices', {
        method: 'PUT',
        body: JSON.stringify(services)
    })
}

// mergeServicesStatuses combines a list of seen and current services
const mergeServiceStatuses = (
    seenServices: Array<ConsulServiceStatus>,
    currentServices: Array<ConsulServiceStatus>
): Array<ConsulServiceStatus> => {
    let mergedServiceStatuses = unionBy(currentServices, seenServices, 'id')

    // sort alphabetically by id
    mergedServiceStatuses.sort((a, b) => {
        if(a.id < b.id) return -1
        if(a.id > b.id) return 1

        return 0
    })

    return mergedServiceStatuses
}

export {
    parseTagsForMetadata,
    getSeenServices,
    seeServices,
    mergeServiceStatuses
}