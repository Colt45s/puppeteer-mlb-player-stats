import chalk from 'chalk'

export const info = (msg: string) => {
  console.log(chalk.bgBlue.black(' INFO ') + ' ' + msg)
}

export const error = (msg: string) => {
  console.error(chalk.bgRed(' ERROR ') + ' ' + chalk.red(msg))
}

export const done = (msg: string) => {
  console.log(chalk.bgGreen.black(' DONE ') + ' ' + msg)
}
