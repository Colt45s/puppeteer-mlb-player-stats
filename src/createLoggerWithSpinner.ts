import ora from 'ora'

type Msg = {
  symbol: string
  text: string
}

const createLoggerWithSpinner = () => {
  const spinner = ora()
  let preMsg: Msg | null = null

  const updatePreMsg = (newMsg: Msg | null) => {
    preMsg = newMsg
  }

  const startSpinner = (symbol: string, msg: string) => {
    if (preMsg) {
      spinner.stopAndPersist({
        symbol: preMsg.symbol,
        text: preMsg.text
      })
    }

    spinner.text = ' ' + msg

    updatePreMsg({
      symbol: symbol + ' ',
      text: msg
    })

    spinner.start()
  }

  const stopSpinner = (isPersist: boolean) => {
    if (preMsg && isPersist) {
      spinner.stopAndPersist({
        symbol: preMsg.symbol,
        text: preMsg.text
      })
    } else {
      spinner.stop()
    }

    updatePreMsg(null)
  }

  return {
    startSpinner,
    stopSpinner
  }
}

export default createLoggerWithSpinner
