import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {teachingSources,documentationSources} from '../dist/sources.js';
import {exercises} from '../dist/course.js';import {solutionOptions} from '../dist/solutions.js';
const audit=JSON.parse(fs.readFileSync(new URL('../course-audit.json',import.meta.url),'utf8'));
test('source catalog covers every audited teaching file without OLA material',()=>{
 assert.deepEqual(teachingSources.map(s=>s.path),audit.files);
 assert.equal(new Set(teachingSources.map(s=>s.path)).size,27);
 for(const source of teachingSources){assert.ok(source.description.length>20);assert.ok(!source.path.split('/').some(p=>/^ola/i.test(p)));for(const name of source.functions)assert.ok(audit.functions[name].includes(source.path));}
 assert.ok(documentationSources.some(s=>s.name==='ggplot2'));
 assert.ok(documentationSources.every(s=>s.url.startsWith('https://')&&s.description));
});
test('five runnable plot exercises include multiple solutions and grade plot contents',()=>{
 const plots=exercises.filter(e=>e.id.startsWith('gg-'));assert.equal(plots.length,5);
 for(const ex of plots){assert.ok(ex.packages.includes('ggplot2'));assert.ok(ex.check.includes('.plot_matches'));assert.ok(solutionOptions(ex).length>=2);assert.ok(ex.source.includes('.R'));}
});
