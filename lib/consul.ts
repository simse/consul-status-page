import fetch from 'node-fetch'
import { unionBy } from 'lodash'

import type { ConsulServiceMetadata, ConsulServiceStatus, ConsulServicesResponse } from "./types"

const TAG_PREFIX = 'consulStatusPage.meta.'

// the Consul object contains methods for communicating with Consul
const Consul = {
    getServices: async (): Promise<ConsulServicesResponse> => {
        let services = await fetch(process.env.CONSUL_ADDRESS + 'v1/catalog/services')
        let parsedServices = await services.json() as ConsulServicesResponse

        return parsedServices
    },
    getKey: async (key: string): Promise<any> => {
        const keyResponse = await fetch(process.env.CONSUL_ADDRESS + 'v1/kv/consulStatusPage/' + key + '?raw=true')
        const keyValue = await keyResponse.json() as any

        return keyValue
    },
    writeKey: async (key: string, value: string): Promise<void> => {
        await fetch(process.env.CONSUL_ADDRESS + 'v1/kv/consulStatusPage/' + key, {
            method: 'PUT',
            body: value
        })

        return
    }
}

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
        description: tagValues.description || null,
        category: tagValues.category || null,
        tags: tagValues.tags?.split(',') || null
    }
}

// getSeenServices checks Consul KV for a list services previously seen
// this functions helps us know when a service is missing and should be marked DOWN
const getSeenServices = async (): Promise<Array<ConsulServiceStatus>> => {
    const keyResponse = await Consul.getKey('seenServices') as Array<ConsulServiceStatus>

    return keyResponse
}

// seeService adds a service to the Consul KV store
const seeServices = async (services: Array<ConsulServiceStatus>) => {
    // fetch already seen services and merge with passed services
    // doing the below avoids ereasing the memory of an already seen service
    const seenServices = await getSeenServices()
    services = unionBy(seenServices, services, 'id')

    // send merged list back to Consul
    await Consul.writeKey('seenServices', JSON.stringify(services))
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
    mergeServiceStatuses,
    Consul
}