#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.join(repoRoot, 'changelog.json');

const errors = [];
const fail = (where, message) => errors.push(`${where}: ${message}`);

let data;
try {
  data = JSON.parse(fs.readFileSync(file, 'utf8'));
} catch (error) {
  console.error(`changelog.json is not valid JSON: ${error.message}`);
  process.exit(1);
}

const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const isText = (value) => typeof value === 'string' && value.trim().length > 0;

const checkMarkup = (where, text) => {
  if (typeof text !== 'string') {
    fail(where, 'must be a string');
    return;
  }

  if (text.includes('<') || text.includes('>')) {
    fail(where, 'use inline markup instead of raw HTML (< / >)');
  }

  const count = (needle) => text.split(needle).length - 1;

  if (count('`') % 2 !== 0) {
    fail(where, 'has an unclosed `code` span');
  }

  if (count('**') % 2 !== 0) {
    fail(where, 'has an unclosed **bold** span');
  }

  if (count('{{') !== count('}}')) {
    fail(where, 'has unbalanced {{accent}} markers');
  }

  if (count('**') % 2 === 0 && count('`') % 2 === 0) {
    // Make sure every markdown link is well formed.
    const linkPattern = /\[[^\]]*\]\([^)]*\)/g;
    const withoutLinks = text.replace(linkPattern, '');
    if (withoutLinks.includes('](')) {
      fail(where, 'has a malformed link, expected [label](https://url)');
    }
    if (/(^|[^!])\[[^\]]*\]\([^)]*$/.test(text)) {
      fail(where, 'has a link with a missing closing parenthesis');
    }
    for (const match of text.matchAll(/\[[^\]]*\]\(([^)]*)\)/g)) {
      if (!/^https?:\/\//i.test(match[1])) {
        fail(where, `link target must start with http(s):// (got "${match[1]}")`);
      }
    }
  }
};

if (!isPlainObject(data)) {
  fail('root', 'must be a JSON object');
} else {
  if (data.schemaVersion !== 1) {
    fail('root', 'schemaVersion must be 1');
  }

  if (!Array.isArray(data.entries) || data.entries.length === 0) {
    fail('root', 'entries must be a non-empty array');
  }

  if (data.updatedAt !== undefined && !isText(data.updatedAt)) {
    fail('root', 'updatedAt must be a non-empty string when present');
  }

  const seen = new Set();

  (Array.isArray(data.entries) ? data.entries : []).forEach((entry, index) => {
    const where = `entries[${index}]`;

    if (!isPlainObject(entry)) {
      fail(where, 'must be an object');
      return;
    }

    if (!isText(entry.version)) {
      fail(where, 'version must be a non-empty string');
    } else {
      const label = `entries[${index}] (${entry.version})`;
      if (seen.has(entry.version)) {
        fail(label, 'duplicate version');
      }
      seen.add(entry.version);
      if (entry.version !== entry.version.trim()) {
        fail(label, 'version must not have surrounding whitespace');
      }
    }

    if (entry.tag !== 'release' && entry.tag !== 'beta') {
      fail(where, 'tag must be "release" or "beta"');
    }

    if (entry.intro !== undefined) {
      checkMarkup(`${where}.intro`, entry.intro);
    }

    if (!Array.isArray(entry.sections) || entry.sections.length === 0) {
      fail(where, 'sections must be a non-empty array');
    } else {
      entry.sections.forEach((section, sectionIndex) => {
        const sectionWhere = `${where}.sections[${sectionIndex}]`;
        if (!isPlainObject(section)) {
          fail(sectionWhere, 'must be an object');
          return;
        }
        if (section.title !== undefined) {
          if (!isText(section.title)) {
            fail(`${sectionWhere}.title`, 'must be a non-empty string when present');
          } else {
            checkMarkup(`${sectionWhere}.title`, section.title);
          }
        }
        if (!Array.isArray(section.items) || section.items.length === 0) {
          fail(sectionWhere, 'items must be a non-empty array');
          return;
        }
        section.items.forEach((item, itemIndex) => {
          checkMarkup(`${sectionWhere}.items[${itemIndex}]`, item);
        });
      });
    }

    if (entry.footnotes !== undefined) {
      if (!Array.isArray(entry.footnotes)) {
        fail(`${where}.footnotes`, 'must be an array when present');
      } else {
        entry.footnotes.forEach((note, noteIndex) => {
          checkMarkup(`${where}.footnotes[${noteIndex}]`, note);
        });
      }
    }
  });
}

if (errors.length > 0) {
  console.error(`changelog.json has ${errors.length} problem(s):`);
  for (const error of errors) {
    console.error(`  - ${error}`);
  }
  process.exit(1);
}

const entryCount = Array.isArray(data.entries) ? data.entries.length : 0;
console.log(`changelog.json OK (${entryCount} entries, newest: ${data.entries[0].version})`);
