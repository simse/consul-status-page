import type { NextPage } from 'next'

import React, { useEffect, useState } from 'react'

import Head from 'next/head'
import styles from '../styles/Home.module.css'

// types
import { Status } from '../lib/types'

// components
import { StatusBanner } from '../components/StatusBanner'
import ServiceStatus from '../components/ServiceStatus'

interface Props {

}

const Home: NextPage<Props> = () => {
  const [services, setServices] = useState<any>([])
  const [lastUpdated, setLastUpdated] = useState<Date>()

  const refreshServices = () => {
    fetch('/api/status').then(response => response.json()).then(parsedResponse => {
      setServices(parsedResponse)
      setLastUpdated(new Date())
    })
  }

  const status = (services: any) => {
    let statusColour = Status.Ok;
    let statusMessage = "No issues detected"

    services.forEach((service: any) => {
      if(service.status === 'critical') {
        statusColour = Status.Error
        statusMessage = "Some services are down"
      }
    })

    return {
      colour: statusColour,
      message: statusMessage
    }
  }

  useEffect(() => {
    refreshServices()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => refreshServices(), 60000);

    return () => {
      clearInterval(interval);
    };
  }, [])

  return (
    <div className={styles.container}>
      <Head>
        <title>Consul Status Page</title>
        <meta name="description" content="Page showing statuses of consul services" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div>
          <h1 className={styles.title}>Consul Status Page</h1>
        </div>

        <div className={styles.statusBanner}>
          <StatusBanner message={status(services).message} status={status(services).colour} lastUpdated={lastUpdated} />
        </div>

        <div className={styles.services}>
          {services?.map((service: any) => (
            <ServiceStatus key={service.id} id={service.id} title={service.meta.title} description={service.meta.description} status={service.status} />
          ))}
        </div>
      </main>
    </div>
  )
}


export default Home
