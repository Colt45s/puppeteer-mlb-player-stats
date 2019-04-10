import puppeteer, { Page } from 'puppeteer'
import inquirer, { Answers } from 'inquirer'
import tabletojson from 'tabletojson'
import stringify from 'csv-stringify'
import fs from 'fs'
import chalk from 'chalk'
import createLoggerWithSpinner from './createLoggerWithSpinner'
import { info, error, done } from './logger'
import path from 'path'
import { promisify } from 'util'

const mkdirAsync = promisify(fs.mkdir)
const writeFileAsync = promisify(fs.writeFile)

type Stats = {
  [key: string]: string
}

const ask = () => {
  const question = {
    type: 'input',
    name: 'url',
    message: 'Enter url \n',
    validate: (value: string) => {
      if (value.length) {
        return true
      } else {
        return 'Please enter url'
      }
    }
  }

  return inquirer.prompt<Answers>(question)
}

const writeFile = async (url: string, output: any): Promise<void> => {
  const fileName = url.split('/').slice(-1)[0]
  const targetDir = path.resolve(__dirname, '../results')

  try {
    !fs.existsSync(targetDir) && (await mkdirAsync(targetDir))

    await writeFileAsync(`${targetDir}/${fileName}.csv`, output)
  } catch (e) {
    throw e
  }
}

const getStats = async (page: Page): Promise<Stats[]> => {
  try {
    const selector = '#careerTable'
    await page.waitForSelector(selector)

    const html = await page.evaluate(tableSelector => {
      return document.querySelector(tableSelector).innerHTML
    }, `${selector} .responsive-datatable__scrollable > div`)

    return tabletojson.convert(html)[0]
  } catch (e) {
    throw e
  }
}

const createCsv = (stats: Stats[], url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    stringify(
      stats,
      { header: true, columns: Object.keys(stats[0]) },
      (err: any, output: any) => {
        err && reject(err)

        writeFile(url, output)
          .then(() => resolve())
          .catch(e => reject(e))
      }
    )
  })
}
;(async () => {
  const { startSpinner, stopSpinner } = createLoggerWithSpinner()
  const { url } = await ask()

  console.log()
  info('Running Puppeteer')

  console.log()
  startSpinner(chalk.green('✔'), 'Loading \n')

  const browser = await puppeteer.launch({ headless: true, devtools: false })

  try {
    const page = await browser.newPage()

    await page.goto(url)

    stopSpinner(true)
    startSpinner(chalk.green('✔'), 'Getting Player Stats \n')

    const stats = await getStats(page)

    stopSpinner(true)
    startSpinner(chalk.green('✔'), 'Creating CSV File \n')

    await createCsv(stats, url)

    stopSpinner(true)
    done(
      `Created CSV in ${chalk.yellow(path.resolve(__dirname, '../results'))} `
    )
  } catch (e) {
    stopSpinner(false)
    error(e)
  }

  await browser.close()
})()
