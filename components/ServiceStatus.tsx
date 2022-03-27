import React from 'react'

import { Status } from '../lib/types'

import styles from '../styles/ServiceStatus.module.scss'

interface ServiceStatusProps {
    id: string
    title: string
    description: string
    status: Status
}

const statusMap = (consulStatus: Status):string => {
    if(consulStatus === Status.Passing) return 'Operational'
    if(consulStatus === Status.Warning) return 'Partially Down'
    if(consulStatus === Status.Critical) return 'Down'

    return 'Unknown'
}

const statusColourMap = (consulStatus: Status):string => {
    if(consulStatus === Status.Passing) return 'ok'
    if(consulStatus === Status.Critical) return 'error'

    return 'warning'
}

const ServiceStatus = (props: ServiceStatusProps) => {
    return (
        <div className={styles.service} id={props.id}>
            <p>{ props.title }</p>

            <p className={`${styles['status']} ${styles[statusColourMap(props.status)]}`}>{ statusMap(props.status) }</p>
        </div>
    )
}

export default ServiceStatus