import React, { useState, useEffect } from 'react'
import { Status } from '../lib/types'

import styles from '../styles/StatusBanner.module.scss'



interface StatusBannerProps {
    message: string
    status: Status
    lastUpdated?: Date
}

const statusColourMap = (status: Status): string => {
    if(status === Status.Ok) return "ok"
    // if(status === Status.Yellow) return "unknown"
    if(status === Status.Error) return "error"

    return "warning"
}

const secondsSince = (firstDate: Date, lastDate: Date): number => {
    return Math.ceil(Math.abs((firstDate.getTime() - lastDate.getTime()) / 1000)/5)*5;
}

const secondsSinceMessage = (seconds: number): string => {
    if(seconds < 5) {
        return "just now"
    }

    return seconds + "s ago"
}

const StatusBanner = (props: StatusBannerProps) => {
    const [time, setTime] = useState(Date.now());

    useEffect(() => {
        const interval = setInterval(() => setTime(Date.now()), 5000);
        return () => {
            clearInterval(interval);
        };
    }, []);

    return (
        <div className={`${styles.banner} ${styles[statusColourMap(props.status)]}`}>
            <p>{ props.message }</p>

            {props.lastUpdated !== undefined && <p>Last updated { secondsSinceMessage(secondsSince(props.lastUpdated, new Date())) }</p>}
            {props.lastUpdated === undefined && <p>Not checked yet</p>}
        </div>
    )
}


export default StatusBanner

export {
    StatusBanner,
    Status
}