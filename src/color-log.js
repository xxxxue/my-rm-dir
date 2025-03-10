import chalk from "chalk";
/**
 * @param  {...string} text
 */
export function yellow(...text) {
  console.log(chalk.yellowBright(...text));
}
/**
 * @param  {...string} text
 */
export function green(...text) {
  console.log(chalk.greenBright(...text));
}
/**
 * @param  {...string} text
 */
export function red(...text) {
  console.log(chalk.redBright(...text));
}
