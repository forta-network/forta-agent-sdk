import { assertExists, GetJsonFile } from '../../utils';
import { GetAgentHandlers } from '../../utils/get.agent.handlers';

// runs agent handlers against a specified json file with test data
export type RunFile = (filePath: string) => Promise<void>

export function provideRunFile(
  getAgentHandlers: GetAgentHandlers,
  getJsonFile: GetJsonFile
): RunFile {
  assertExists(getAgentHandlers, 'getAgentHandlers')
  assertExists(getJsonFile, 'getJsonFile')

  return async function runFile(filePath: string) {
    const { handleBlock, handleTransaction, handleAlert } = await getAgentHandlers()
    if (!handleBlock && !handleTransaction && !handleAlert) {
      throw new Error("no block/transaction/alert handler found")
    }
    
    console.log('parsing file data...')
    const { transactionEvents, blockEvents, alertEvents } = getJsonFile(filePath)

    if (handleBlock && blockEvents?.length) {
      console.log('running block events...')
      for (const blockEvent of blockEvents) {
        const findings = await handleBlock(blockEvent)
        console.log(`${findings.length} findings for block ${blockEvent.hash} ${findings}`)
      }
    }

    if (handleTransaction && transactionEvents?.length) {
      console.log('running transaction events...')
      for (const transactionEvent of transactionEvents) {
        const findings = await handleTransaction(transactionEvent)
        console.log(`${findings.length} findings for transaction ${transactionEvent.transaction.hash} ${findings}`)
      }
    }

    if (handleAlert && alertEvents?.length) {
      console.log('running alert events...')
      for (const alertEvent of alertEvents) {
        const findings = await handleAlert(alertEvent)
        console.log(`${findings.length} findings for alert ${alertEvent.alert.hash} ${findings}`)
      }
    }
  }
}