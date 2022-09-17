#!/usr/bin/env node

import { performance } from 'perf_hooks';
import pressAnyKey from 'press-any-key';
import rimraf from 'rimraf';
import { roundTo } from 'round-to';
import { yellow, green } from './utils/colorLog.js';
function main() {

    let path = process.argv[2];
    if (path == undefined) {

        console.log('❌', 'path is undefined');

        return;
    }

    yellow('🚀', "deleting...")
    green('  ', '📂', path);

    let start = performance.now()

    rimraf(path, {}, (err) => {
        if (err != null) {
            console.error('❗', '❌', err);
        }
        let end = performance.now();
        let elapsed = roundTo((end - start) / 1000, 2);
        yellow('✅', `time spent: ${elapsed} s`);
        pressAnyKey("",{})
    })
}

main();