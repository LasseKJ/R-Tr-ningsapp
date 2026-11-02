-- Run in SQL Editor. Test rows exist only within this rolled-back transaction.
begin;
insert into auth.users(id,email) values
 ('11111111-1111-4111-8111-111111111111','rlab-test-a@example.invalid'),
 ('22222222-2222-4222-8222-222222222222','rlab-test-b@example.invalid');
set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
select public.rlab_save('{"version":1,"attempts":[],"exams":[],"drafts":{},"dailyGoal":5,"activeExam":null}',0);
do $$ begin
 if (select count(*) from public.rlab_progress) <> 1 then raise exception 'Owner read failed'; end if;
 begin
  perform public.rlab_save('{"version":1,"attempts":[],"exams":[],"drafts":{}}',0);
  raise exception 'Conflict protection failed';
 exception when serialization_failure then null;
 end;
end $$;
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
do $$ begin
 if (select count(*) from public.rlab_progress) <> 0 then raise exception 'Cross-user read allowed'; end if;
 if has_table_privilege('authenticated','public.rlab_progress','UPDATE') then raise exception 'Direct update allowed'; end if;
 if has_table_privilege('anon','public.rlab_progress','SELECT') then raise exception 'Anonymous read allowed'; end if;
 if has_function_privilege('anon','public.rlab_save(jsonb,bigint)','EXECUTE') then raise exception 'Anonymous write allowed'; end if;
end $$;
select public.rlab_save('{"version":1,"attempts":[],"exams":[],"drafts":{},"dailyGoal":10,"activeExam":null}',0);
do $$ begin
 if (select progress->>'dailyGoal' from public.rlab_progress) <> '10' then raise exception 'Account isolation failed'; end if;
end $$;
rollback;
select 'PASS: owner read/write, account isolation, anonymous denial, revision conflict; test data rolled back' as verification;
