---
name: TNC CRM table map
description: Which CRM tables hold what data — critical because t_se (sessions) is empty but t_ch has 59k real YouTube videos
---

## Rule
NEVER query `t_se` for sessions — it returns `false` (empty). All video sessions are in `t_ch`.

## Table Map
- `t_co` — courses/batches (~14 records). Fields: `json._na` (name), `json._de` (description), `json._sno` (order), `json._at.url` (image).
- `t_su` — class dates/subjects within courses. Fields: `co_refid`, `json._na` (e.g. "21st September 2022"), `json._co`.
- `t_ch` — video chapters/sessions (59,806 records). Fields: `co_refid`, `su_refid`, `json._na` (title), `json._vi._vi_url` (YouTube URL), `json._sno`, `json._pr_ty` (0=free, 1=paid). Query by `co_refid` to get sessions for a course.
- `t_sl` — slider images. Fields: `json._at.url`, `json._na`.
- `t_us` — users. Fields: `json._us_id`, `json._us_na`, `json._mo`, `json._us_pa`, `json._em`, `json._cl`, `json._st`.
- `t_cu` — purchases. Fields: `us_refid`, `json._co_id`, `json._co_na`, `json._am`, `json._pa_id`.
- `t_ex` — exam sets (6,750 records). Fields: `row_id` (examId), `examno`, `qu_refid[]` (array of question row_ids), `json._ex_na` (name), `json._ma_ma` (max marks), `json._ne_ma` (negative marks), `json._ex_du` (duration minutes).
- `t_qu` — MCQ questions (157,326 records). Fields: `json._qu._qu` (question text), `json._op._op_A._op_ti` ... `_op_D` (options), `json._an` (correct answer letter), `json._so._ti` (explanation HTML), `json._qno`, `json._ch` (chapter rowid).
- `t_se` — EMPTY. Returns `false`. Do not use.
- `t_to` — Firebase device tokens (NOT topics). 68,545 records.
- `t_no` — 2 records only. Not useful.

## Hierarchy
`t_co` (course) → `t_su` (subject/class date) → `t_ch` (video session)
`t_ex` (exam) → `qu_refid[]` → `t_qu` (individual questions)

## Fetch strategies
- Sessions for a course: `cond: { co_refid: "<courseRowId>" }` on `t_ch`
- Single session: `cond: { row_id: "<rowId>" }` on `t_ch`
- Single question: `cond: { row_id: "<rowId>" }` on `t_qu` (157k rows, so always filter)
- Quiz questions: parallel-fetch up to 50 from `qu_refid[]` array

**Why:** The original APK used `t_se` but the CRM was migrated; all content now lives in `t_ch`. Using `t_se` returns `false` in every case.
