import React from 'react'

import styles from '../styles/ServiceStatus.module.scss'

interface ServiceStatusProps {
    id: string
    title: string
    description: string
    status: string
}

const statusMap = (consulStatus: string):string => {
    if(consulStatus === 'passing') return 'Operational'
    if(consulStatus === 'critical') return 'Down'

    return 'Unknown'
}

const statusColourMap = (consulStatus: string):string => {
    if(consulStatus === 'passing') return 'ok'
    if(consulStatus === 'critical') return 'error'

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