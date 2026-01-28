import config from './config.json'

export type ServiceName = typeof config.serviceNames[number];
export type Status = "Deployed" | "Failed"
export type ServiceEnv = "PROD" | "DEV"

export interface DeployPayload {
    service: ServiceName,
    branch: string,
    status: Status,
    env: ServiceEnv,
    time: string,
    actionUrl: string,
}