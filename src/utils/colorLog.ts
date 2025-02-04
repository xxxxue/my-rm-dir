import chalk from "chalk";

export function yellow(...text: string[]) {
  console.log(chalk.yellowBright(...text));
}
export function green(...text: string[]) {
  console.log(chalk.greenBright(...text));
}
export function red(...text: string[]) {
  console.log(chalk.redBright(...text));
}
