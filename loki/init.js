import { createLogger, transports, format } from "winston"
import LokiTransport from "winston-loki"

 
let logger

const initializeLogger = () => {
  if (logger) {
    return
  }
 
  logger = createLogger({
    transports: [new LokiTransport({
        host: "http://loki:3100/loki/api/v1/push",
        labels: { app: 'honeyshop'},
        json: true,
        format: format.json(),
        replaceTimestamp: true,
        onConnectionError: (err) => console.error(err)
      }),
      new transports.Console({
        format: format.combine(format.simple(), format.colorize())
      })]
  })
}
 
export const getLogger = () => {
  initializeLogger()
  return logger
}