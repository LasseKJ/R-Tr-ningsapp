import test from 'node:test';import assert from 'node:assert/strict';
import {emptyProgress,prepareExerciseDraft,validateProgress} from '../dist/progress.js';import {mergeGuest} from '../dist/sync.js';
test('returning after revealing solutions clears the draft, including before submission',()=>{
 const p=emptyProgress();p.drafts.x='copied answer';p.revealedDrafts.x=true;
 assert.equal(prepareExerciseDraft(p,'x','x'),true);assert.equal(p.drafts.x,undefined);assert.equal(p.revealedDrafts.x,false);
 p.drafts.x='my new attempt';assert.equal(prepareExerciseDraft(p,'x','x'),false);assert.equal(p.drafts.x,'my new attempt');
});
test('independent drafts and exam drafts are preserved',()=>{
 const p=emptyProgress();p.drafts.x='my code';p.drafts['exam:x']='exam code';
 assert.equal(prepareExerciseDraft(p,'x','x'),false);assert.equal(p.drafts.x,'my code');assert.equal(prepareExerciseDraft(p,'exam:x','x'),false);assert.equal(p.drafts['exam:x'],'exam code');
});
test('older facit-assisted drafts are cleared once and new attempts survive',()=>{
 const p=emptyProgress();delete p.revealedDrafts;p.drafts.x='old facit';p.attempts=[{exerciseId:'x',revealed:true,examId:null}];
 assert.equal(prepareExerciseDraft(p,'x','x'),true);p.drafts.x='fresh code';assert.equal(prepareExerciseDraft(p,'x','x'),false);assert.equal(p.drafts.x,'fresh code');
});
test('facit marker follows the selected draft during guest merge and backups',()=>{
 const a=emptyProgress(),g=emptyProgress();g.drafts.x='facit';g.revealedDrafts.x=true;
 const merged=mergeGuest(a,g);assert.equal(merged.revealedDrafts.x,true);assert.equal(validateProgress(JSON.parse(JSON.stringify(merged))).revealedDrafts.x,true);
 a.drafts.x='independent';const preferred=mergeGuest(a,g);assert.equal(preferred.drafts.x,'independent');assert.equal(preferred.revealedDrafts.x,false);
});
test('correct independent solutions become non-executable comments without repeated headers',()=>{
 const p=emptyProgress();p.attempts=[{exerciseId:'x',correct:true,revealed:false}];p.drafts.x='resultat <- 1\nresultat\n# min note';
 prepareExerciseDraft(p,'x','x');assert.equal(p.drafts.x,'# Tidligere besvarelse\n# resultat <- 1\n# resultat\n# min note');
 const once=p.drafts.x;prepareExerciseDraft(p,'x','x');assert.equal(p.drafts.x,once);
 p.drafts.x+='\nny <- 2';prepareExerciseDraft(p,'x','x');assert.ok(p.drafts.x.endsWith('# ny <- 2'));
});
test('text answers are not wrapped as R comments and facit removal takes precedence',()=>{
 const p=emptyProgress();p.attempts=[{exerciseId:'x',correct:true,revealed:false}];p.drafts.x='9 15 12';prepareExerciseDraft(p,'x','x',false);assert.equal(p.drafts.x,'9 15 12');
 p.revealedDrafts.x=true;prepareExerciseDraft(p,'x','x');assert.equal(p.drafts.x,undefined);
});
