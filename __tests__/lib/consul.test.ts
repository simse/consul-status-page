// functions to test
import { parseTagsForMetadata, getSeenServices, seeServices, Consul } from '../../lib/consul.js'

// parseTagsForMetadata
// perfect scenario
test('parse tags and return meta correctly', () => {
    const tags = [
        'consulStatusPage.meta.title=whoami',
        'consulStatusPage.meta.description=A test service I deployed'
    ]

    expect(parseTagsForMetadata(tags)).toMatchObject({
        title: 'whoami',
        description: 'A test service I deployed'
    })
})

// nearly perfact scenarion
test('parse and ignore irrelevant tags and return meta correctly', () => {
    const tags = [
        'consulStatusPage.meta.title=whoami',
        'consulStatusPage.meta.description=A test service I deployed',
        'traefik.http.middlewares.httpsRedirect.redirectscheme.scheme=https',
        'traefik.enable=true',
        'traefik.http.routers.${NOMAD_TASK_NAME}.tls.certresolver=sample'
    ]

    expect(parseTagsForMetadata(tags)).toMatchObject({
        title: 'whoami',
        description: 'A test service I deployed'
    })
})

/*
// getSeenServices
test('getSeenServices returns list of seen services', () => {

})*/
/*
// Consul/getServices
test('Consul.getServices returns list of services and tags', () => {
    
})*/