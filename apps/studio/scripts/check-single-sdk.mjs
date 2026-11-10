#!/usr/bin/env node
/**
 * Fails the Studio build when the bundle has more than one copy of @sanity/sdk-react. Two copies
 * never share a React context, so the Writing Room would crash in the deployed Studio with
 * "SanityInstance context not found". (See `resolve.dedupe` in sanity.cli.ts.)
 */
import {readdirSync, readFileSync} from 'node:fs'
import {join} from 'node:path'

// The tail of the SDK's missing-context error: every copy of the SDK has it once. (The room's own
// setup-problem screen checks for the start of the message, so that part can't be counted.)
const MESSAGE = 'wrapped in a ResourceProvider or a SanityApp component'
const dist = new URL('../dist', import.meta.url).pathname

let copies = 0
function walk(dir) {
  for (const entry of readdirSync(dir, {withFileTypes: true})) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) walk(path)
    else if (entry.name.endsWith('.js')) copies += readFileSync(path, 'utf8').split(MESSAGE).length - 1
  }
}
walk(dist)

if (copies !== 1) {
  console.error(`✗ Expected one copy of @sanity/sdk-react in the Studio bundle, found ${copies}.`)
  process.exit(1)
}
console.log('✓ One copy of @sanity/sdk-react in the Studio bundle.')
