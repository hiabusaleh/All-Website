# IELTS MASTER PLATFORM — ফাইনাল প্ল্যান (v3)

**এক Website · চার Hub · Skill-First · Cambridge-Integrated**
Abu Saleh · ১৬ সেপ্টেম্বর ২০২৬
ফাইলের জায়গা: `G:\IELTS\IELTS_MASTER_PROJECT\00_PLAN\`
সাথের ফাইল: `_INVENTORY.md` (G:\IELTS-এর audit; ধাপ ১ শেষ)

> "আমি IELTS materials-ওয়ালা একটা website বানাচ্ছি না। আমি একটা IELTS learning system বানাচ্ছি, যার একটা website আছে।"

**নিয়ম:** G:\IELTS-এর সব content এই website-এ থাকবে। এর মধ্যে আছে Cambridge 10–21-এর passage, প্রশ্ন, transcript, audio, আর Recent Questions ও Makkar cue card। Launch-এর আগে Cambridge-এর অনুমতি নেওয়ার দায়িত্ব Abu Saleh-এর।

---

## ০. মূল সিদ্ধান্ত

1. **নতুন করে শুরু হবে না।** যা আছে তার উপরেই কাজ হবে। Speaking `_SITE` হবে platform-এর shell।
2. **এক domain, চার Hub আর Foundation।** Reading, Listening, Writing, Speaking, Vocabulary, সব এক website-এ থাকবে।
3. **আগে Portal, পরে শোষণ।** প্রথমে সব পুরনো app যেমন আছে তেমন এক website-এ বসবে, এক navigation দিয়ে। তারপর একটা একটা করে নতুন engine-এ আনা হবে। কোনো দিন সাইট অচল থাকবে না।
4. **ডেটা নেওয়া হবে `_tools`-এর JSON আর md থেকে।** HTML থেকে ডেটা কেটে বের করা (scrape) হবে না।
5. **সব skill-এর জন্য একটা Skill Registry।** এখন চারটা আলাদা ID ব্যবস্থা আছে; সেগুলো alias হিসেবে এক registry-তে থাকবে।
6. **আগে static, পরে database।** এখন HTML/CSS/JS আর Node build script চলবে। Login আর payment এলে তখন database আসবে।
7. **প্রথম সম্পূর্ণ skill (vertical slice): Paraphrase Recognition।**

---

## ১. Architecture: তিন স্তর

```
স্তর ১ — PORTAL        এক domain · এক navigation · এক design · এক search
                       পুরনো app গুলো /apps/-এ যেমন আছে তেমন চলে
          ↓
স্তর ২ — DATA LAYER    সব content JSON-এ, প্রতিটা আইটেম skill_id দিয়ে tag করা
          ↓
স্তর ৩ — ENGINE        Skill Page · Test Player · Practice Engine ·
                       Error Lab · Mastery Gate · Progress · Recommendation
```

```
                     IELTS
       ┌───────────────┼───────────────┐
     SKILLS      QUESTION TYPES    ASSESSMENT
       └───────────────┼───────────────┘
                       ↓
               CAMBRIDGE 10–21
                       ↓
      KNOWLEDGE GRAPH (question_skill_map)
                       ↓
      ERROR DATABASE → DIAGNOSTIC ENGINE
                       ↓
      LEARNING ENGINE → CONTENT (JSON)
                       ↓
      ONE WEBSITE → STUDENT DATA → MASTERY
```

**Core Equation:** Skill → Learn → Practice → Apply (Cambridge) → Diagnose → Repair → Transfer → Master

---

## ২. কোডের কাঠামো

```
G:\IELTS\IELTS_MASTER_PROJECT\08_WEBSITE_CODE\
├── src\
│   ├── shell\              ← Speaking _SITE: router, search, theme, SRS, sw.js, manifest
│   ├── hubs\               ← home, reading, listening, writing, speaking, skills,
│   │                         practice, cambridge, errors, vocab, progress, test-center
│   ├── engine\             ← test-player, practice, error-lab, mastery, recommend
│   ├── data\
│   │   ├── skills.json               ← Skill Registry (alias সহ)
│   │   ├── question_types.json       ← Reading ১৬ + Listening ১০ type
│   │   ├── cambridge\
│   │   │   ├── reading\C10…C21.json   ← passage, প্রশ্ন, উত্তর, solve path
│   │   │   ├── listening\C10…C21.json ← প্রশ্ন, উত্তর, transcript, anchor
│   │   │   └── speaking\…json
│   │   ├── question_skill_map.json   ← সবচেয়ে গুরুত্বপূর্ণ
│   │   ├── paraphrase.json · vocab.json · errors.json · traps.json
│   │   ├── recent_questions\         ← ১৬৮টা Reading টেস্ট
│   │   └── lessons\{skill_id}.json   ← Master Note থেকে
│   ├── media\audio\C10…C21\          ← mp3 (Listening)
│   ├── apps\               ← পুরনো app (Portal ধাপে); শোষণের পর খালি হবে
│   └── builders\           ← ft_build, lt_build, hub_build, az_build ইত্যাদি module
├── build.js                ← node build.js → dist\
├── tests\                  ← link, data, key-migration, search check
└── dist\                   ← deploy হবে
```

**Hosting:**
- ১ GB-এর বেশি audio আছে। তাই পাতাগুলো থাকবে Netlify বা Cloudflare Pages-এ, আর mp3 থাকবে আলাদা storage-এ (Cloudflare R2 বা Bunny CDN)। `media\audio` path-টা config থেকে বদলানো যাবে।
- Local-এ চালানোর জন্য Speaking site-এর `serve.js` থাকবে।

---

## ৩. Skill Registry: চারটা ID এক জায়গায়

**Canonical ID** হবে Skill Map-এর ID: `L-SK-`, `R-SK-`, `W-SK-`, `S-SK-`, `X-SK-`। বাকি তিন ব্যবস্থার ID এগুলোর alias হবে।

```json
{
  "id": "X-SK-004",
  "name": "Paraphrase Recognition",
  "bn": "প্যারাফ্রেজ চেনা",
  "modules": ["reading", "listening"],
  "aliases": ["R-SK-009", "R-S14", "L-S08", "L-SK-004", "Skill_10"],
  "level": 1,
  "prerequisites": ["X-SK-001", "X-SK-003"],
  "question_types": ["R-QT-004", "R-QT-005", "L-QT-001"],
  "lesson_source": "000 IELTS 53-Skill Mastery Course/Master_Notes/Skill_10_Paraphrase_Recognition",
  "mastery_threshold": 85,
  "status": "APPROVED"
}
```

- `solve_paths.json`-এর `S1`–`S12`-এর সংজ্ঞা Reading-এর বিদ্যমান ফাইল থেকে বের করে map করা হবে। না পাওয়া গেলে `REVIEW_REQUIRED` লেখা হবে।
- Matrix-এর `W1-S…` আর `W2-S…` হবে Skill Map-এর `W-SK-…`-এর alias।
- একই skill দুবার থাকলে একটা বাদ যাবে। কোনটা থাকবে, সেটা Abu Saleh ঠিক করবে।

**Question record-এর নমুনা:**

```json
{
  "id": "C15-R-T1-P2-Q17",
  "book": 15, "test": 1, "module": "reading", "section": 2, "q": 17,
  "question_type": "R-QT-004",
  "prompt": "…", "options": [], "answer": "…",
  "evidence": { "para": "C", "sentence": "…" },
  "primary_skill": "R-SK-007",
  "secondary_skills": ["R-SK-003", "X-SK-004", "R-SK-038"],
  "reasoning": ["RO01", "RO02"],
  "paraphrase": ["P01", "P10"],
  "traps": ["RT01"],
  "solve_path": { "steps": [], "wrong": {}, "rule": "…" },
  "difficulty": { "language": 2, "paraphrase": 3, "reasoning": 3, "distractor": 2, "search": 4, "time": 3 },
  "evidence_source": "02. Reading/Reading Analysis/_tools/solve_paths.json#C15T1#17"
}
```

প্রশ্নের skill tag অনুমান করে বসানো যাবে না। প্রতিটা tag-এর সাথে `evidence_source` থাকবে। নিশ্চিত না হলে `"UNMAPPED"` লেখা হবে।

---

## ৪. Navigation (চূড়ান্ত)

```
HOME ── dashboard: আজকের কাজ · দুর্বল skill · module progress · শেষ টেস্টের স্কোর
│
├── 🌱 শূন্য থেকে ......... Zero (Level 0–12) · Sentence Decoder · S+V+O Lab
│
├── 📖 READING
│   ├── Full Tests C10–21 (৪৮)          ├── Question Type Bank (১৬ type)
│   ├── Recent Questions (১৬৮)          ├── Paragraph Structure Engine
│   ├── Skim Lab                        ├── Paraphrase Bank · Vocabulary Bank
│   └── Battle Cards · Rescue Plan
│
├── 🎧 LISTENING
│   ├── Full Tests C10–21 (৪৮, audio সহ) ├── Spelling & Number Drill (১,০০১)
│   ├── Synonym Map (১,৭২৪)              ├── A–Z Guides (১০ type)
│   ├── Vocabulary Vault                 ├── 258 Paraphrase Trainer
│   └── Stress Map · Battle Cards · Master Banks
│
├── ✍️ WRITING ........... Task 1 · Task 2 · Free Hand · Master Note (Skill 27–32)
├── 🗣️ SPEAKING .......... Learn · Speak · Structure · Phrase · Questions ·
│                          সারাদিন ইংরেজি · Natural · Cue Card · Core Story · Makkar
│
├── 🧠 SKILL LIBRARY ..... সব skill · dependency map · আমার দুর্বল skill
├── 📝 PRACTICE .......... Guided · Blind · Transfer · Timed
├── 📖 CAMBRIDGE LAB ..... বই → টেস্ট → module → প্রশ্ন → skill (দুই দিকে)
├── 🔬 DEEP ANALYSIS ..... প্রতিটা প্রশ্নের evidence, paraphrase, trap, parsing
├── ❌ ERROR LAB ......... চার module-এর সব ভুল এক জায়গায়
├── 📚 VOCABULARY ........ Reading + Listening + Speaking + 06. Vocabulary → এক SRS
├── 🏆 MASTERY · 📊 PROGRESS
└── 🧪 TEST CENTER ....... placement → skill test → mock
```

সব পাতায় থাকবে: উপরে স্থায়ী search bar, ⚙ theme আর লেখার আকারের panel, progress export/import, offline mode।

### Unique বৈশিষ্ট্য
1. **Skill ↔ Cambridge দুই দিকের লিংক।** দুই রকম প্রশ্নের উত্তর পাওয়া যাবে: "Inference শিখব, Cambridge-এ এটা কোথায় আছে?" আর "এই প্রশ্নে ভুল করেছি, কোন skill দুর্বল?"
2. **এক Error Lab, চার module।** Listening-এর বানান ভুল আর Writing-এর spelling ভুল একই skill-এ জমা হবে।
3. **এক Paraphrase Engine।** Reading আর Listening-এর সব জোড়া এক জায়গায়, P01–P16 ধরন অনুযায়ী।
4. **প্রতিটা প্রশ্নে বাংলায় ধাপে-ধাপে সমাধান।** `solve_paths`-এর মতো: কী দাগাতে হবে, কোন ধাপে যেতে হবে, ভুল উত্তরটা কেন ভুল।
5. **Test Player-এ সব একসাথে।** Audio, timestamp, দাগানো transcript, ▶ শুনুন বোতাম, আর ভুলের বিন্যাস।

---

## ৫. পাতার নকশা

**Skill Page:**
কী → কেন IELTS-এ লাগে → আগে কী জানতে হবে → নিয়ম (ছক) → বাংলা ব্যাখ্যা → উদাহরণ → সাধারণ ভুল → Guided → Blind → Cambridge উদাহরণ → Transfer → Timed → Mastery → পরের skill

**Cambridge প্রশ্ন পাতা (Reading):** দুই পাশে ভাগ করা
```
┌───────── PASSAGE ─────────┬──────── QUESTION ────────┐
│ ক্লিক করলে vocabulary     │ উত্তর · hint              │
│ evidence হাইলাইট           │ Deep Analysis             │
│ sentence parsing          │ Paraphrase Map · Trap     │
│                           │ Skill tag → Skill Page    │
└───────────────────────────┴──────────────────────────┘
```

**Listening Test Player:**
Audio → Timestamp → Transcript → Live Highlight → Evidence → Distractor → Error type

**Writing:**
প্রশ্ন → নিজের লেখা → Reference → কাঠামো → Criteria → Grammar/Vocabulary → Revision

**Speaking:**
প্রশ্ন → Record → Speech-to-Text → Feedback → Retry
(Speaking site-এর বিদ্যমান engine ব্যবহার হবে)

**Learning Ladder (সব skill-এ একই):**

| Level | নাম | Mastery weight |
|---|---|---|
| 0 | Understand | — |
| 1 | Rule (ছক/skeleton) | — |
| 2 | Guided | 20% |
| 3 | Blind | 20% |
| 4 | Cambridge | 25% |
| 5 | Transfer | 20% |
| 6 | Timed | 15% |
| 7 | Mastery Gate **≥ ৮৫%** | — |

৮৫%-এর নিচে গেলে: Error Diagnosis → দুর্বল subskill → Targeted Practice → Retest।

**শিক্ষাদান নীতি (সব lesson-এ):**
- প্রতি ধাপে একটাই micro-step শেখানো হবে।
- প্রতিটা exercise-এর সাথে সম্পূর্ণ model answer আর স্পষ্ট blank label থাকবে।
- ব্যাখ্যা বাংলায়, IELTS terminology ইংরেজিতে inline।
- প্রতিটা English sample line contracted form-এ (I'd, I've, don't) থাকবে, পাশে পুরো লাইনের বাংলা উচ্চারণ।

---

## ৬. Design System

এখন পাঁচ রকম design আছে। শেষে একটাই থাকবে।

- **Base:** Speaking `_SITE`-এর theme ব্যবস্থা (৭ theme, লেখার আকার, dark mode)।
- **Font:** শিরোনামে Anek Bangla, বাংলা লেখায় Hind Siliguri, ইংরেজিতে Inter।
- **রঙের অর্থ সব জায়গায় এক:**
  - সবুজ = সঠিক বা প্রমাণ
  - লাল = ভুল
  - অকার = trap
  - হলুদ = anchor
  - মিন্ট = main idea
- **Module-এর accent রঙ:**
  - Reading = নীল
  - Listening = বেগুনি
  - Writing = সবুজ
  - Speaking = teal
- **Portal ধাপে** পুরনো app-এর ভেতরের design বদলাবে না; উপরে শুধু একটা shared top bar বসবে। শোষণের সময় design বদলাবে।
- **Reusable component:** SkillCard · LessonViewer · PassageViewer · QuestionViewer · AudioPlayer · TranscriptViewer · AnalysisPanel · ParaphraseMap · VocabMap · EvidenceHighlighter · TrapPanel · ErrorReport · MasteryGate · ProgressChart · RecommendationCard

---

## ৭. Progress ডেটা (কিছুই হারাবে না)

এক domain-এ এলে সব app একই localStorage ব্যবহার করবে। তাই প্রতিটা key-এর নামের আগে module-এর অক্ষর বসবে:

| এখন | নতুন |
|---|---|
| `ielts_lt::C10T1` | `L.test::C10T1` |
| `ielts_drill` | `L.drill` |
| `ielts_syn::…` | `L.syn::…` |
| `navstate`, `shopt`, `smopt`, `vaultoff`, `vtheme`, `vfs` | `L.vault.*` |
| `ielts_ft::…` | `R.test::…` |
| `ielts_vocab::…` | `V.learned::…` |
| `sg.*` | `S.*` |

- প্রথমবার সাইট খুললে একটা migration script পুরনো key কপি করবে। পুরনো key মুছবে না।
- কম্পিউটারে ফাইল হিসেবে খোলা পুরনো পাতার progress আর নতুন website-এর progress আলাদা জায়গায় থাকে। তাই একবার পুরনো পাতা থেকে Export আর নতুন সাইটে Import করতে হবে। Export/Import বোতাম সব হাবে থাকবে।
- পরে login এলে এই ডেটা database-এর `student_progress`, `skill_scores` আর `student_errors` table-এ যাবে।

---

## ৮. Execution Order (গেটসহ)

প্রতিটা ধাপ শেষে কাজ থামবে। "NEXT" লেখা না পর্যন্ত পরের ধাপ শুরু হবে না।

| # | ধাপ | কে | Gate |
|---|---|---|---|
| ~~১~~ | ~~Inventory + Audit~~ | ✅ শেষ | `_INVENTORY.md` |
| ২ | **Cleanup:** duplicate আর `.bak` ফাইল `_ARCHIVE`-এ সরানো (মোছা হবে না); G:\IELTS-এর root-এর Word lock ফাইল মোছা | Cowork + Abu Saleh-এর অনুমতি | তালিকা দেখে "হ্যাঁ" বলা হয়েছে |
| ৩ | **Skill Registry (`skills.json`):** ৪টা ID ব্যবস্থা এক করা, alias, prerequisite, level | Claude → Abu Saleh approve | কোনো duplicate নেই |
| ৪ | **`question_types.json`:** Reading ১৬ আর Listening ১০ type, প্রতিটার primary/secondary skill, trap, error | Claude → Abu Saleh approve | প্রতিটা type অন্তত একটা skill-এ map হয়েছে |
| ৫ | **Portal:** `08_WEBSITE_CODE` বানানো; Speaking shell কপি; সব app `/apps/`-এ; shared top bar; সব হাবের পাতা; পুরো সাইটে search; key migration; `build.js` | Cowork | সব পুরনো ফিচার চলে; সব লিংক কাজ করে |
| ৬ | **Deploy v0:** Netlify বা Cloudflare Pages-এ পাতা, R2 বা Bunny-তে audio; ফোনে install করে offline test | Abu Saleh + Cowork | https লিংকে পুরো সাইট চলে, audio বাজে |
| ৭ | **Data Layer:** Reading-এর `data.json`, `text.json`, `solve_paths.json` আর Listening-এর INBOX md ও `lt_meta.json` থেকে `cambridge\*.json`; Recent Questions থেকে JSON; প্রতিটা প্রশ্নে skill tag | Cowork | প্রতিটা tag-এর সাথে `evidence_source` আছে |
| ৮ | **Vocabulary এক করা:** Reading bank, Listening Vault, Speaking-এর ৫০০ শব্দ আর 06. Vocabulary থেকে `vocab.json`, একটাই SRS; ৪.৮ MB-এর Vault ভেঙে দরকারমতো লোড | Cowork | কী merge হলো আর কী বাদ গেল, তার হিসাব দেখানো হয়েছে |
| ৯ | **Error Database + Error Lab v1:** Listening-এর error type আর Reading-এর `wrong` কারণ থেকে `errors.json` | Cowork | ভুল → skill → lesson লিংক কাজ করে |
| ১০ | **Vertical Slice: Paraphrase Recognition** (§৯) | Cowork | Abu Saleh ≥৮৫% পায়; ৩–৫ জনের মতামত নেওয়া হয়েছে |
| ১১ | **Writing Hub:** Task 1, Task 2, Free Hand আর Master Note (Skill 27–32) থেকে lesson JSON আর পাতা | Cowork | অন্তত ৩টা Writing skill page চলে |
| ১২ | **শোষণ:** প্রতি সপ্তাহে ১–২টা পুরনো app নতুন engine-এ আনা (ক্রম নিচে) | Cowork | প্রতিটার পর test পাস; app-টা `/apps/` থেকে বাদ |
| ১৩ | **Skill Library সম্পূর্ণ:** ২৬টা Master Note থেকে skill page, সব ladder সহ | Cowork | প্রতিটা skill-এর নিজস্ব gate পাস |
| ১৪ | **যাচাই:** search, migration, service worker, মোবাইল, offline, broken link | Cowork (প্রতি ধাপে) | রিপোর্টে কোনো ভাঙা ফিচার নেই |
| ১৫ | **Cambridge-এর অনুমতি → Public launch** | Abu Saleh | অনুমতি হাতে আছে |
| ১৬ | **Accounts + Premium** | Abu Saleh সিদ্ধান্ত নেবে | পেমেন্ট ছাড়া access নেই, পেমেন্ট দিলে আছে |
| ১৭ | **Personalization Engine + Android (PWA)** | Cowork | recommendation সঠিক |

**শোষণের ক্রম (ধাপ ১২):**
1. Listening Spelling & Number Drill
2. Synonym Map, Paraphrase Bank আর 258 Trainer মিলে Paraphrase Engine
3. Reading-এর Question Type Bank আর Listening-এর A–Z Guide মিলে Question-type page
4. Reading আর Listening-এর Full Tests মিলে একটা Test Player
5. Recent Questions → Test Player-এ
6. Sentence Decoder আর S+V+O Lab → Foundation
7. Skim Lab আর Paragraph Structure Engine → Reading skill page
8. Vocabulary Vault → Vocabulary hub
9. Speaking Practice Tool, Stress Map আর Battle Cards → যার যার হাবে

**Premium-এর দুটো পথ (ধাপ ১৬):**
- **A: WordPress + LMS plugin।** Login আর payment আগে থেকে পরীক্ষিত, ঝুঁকি কম।
- **B: Next.js + Supabase + Vercel।** এটা Blueprint-এর stack। JSON ফাইল সরাসরি Postgres table-এ যাবে।
- **পেমেন্ট:** শুরুতে bKash বা নগদ। Trade license হলে SSLCommerz।

---

## ৯. Vertical Slice: Paraphrase Recognition (ধাপ ১০)

| Ladder | উৎস |
|---|---|
| 0 Understand | Skill_10 Master Note |
| 1 Rule | Skill_10 Exam Card, Signal Word Bank, P01–P16 taxonomy |
| 2 Guided | 258 Paraphrase Trainer (hint সহ) |
| 3 Blind | Synonym Map-এর ঢাকা mode (hint ছাড়া) |
| 4 Cambridge | Reading Paraphrase Bank (test-wise) + Listening Synonym Map (১,৭২৪) |
| 5 Transfer | নতুন item; Claude খসড়া করবে, Abu Saleh যাচাই করবে |
| 6 Timed | উপরের সবকিছুর mix, সময় ধরে |
| 7 Gate | ≥৮৫%; না পেলে Error Lab → দুর্বল P-type → আবার |

এই কাঠামো ঠিকমতো কাজ করলে বাকি সব skill-এ একই কাঠামো ব্যবহার হবে।

---

## ১০. Data Safety

- কাজের ক্রম: RAW → COPY → NORMALIZE → STRUCTURE। মূল ফাইলে সরাসরি হাত দেওয়া হবে না।
- কিছু মোছা হবে না, শুধু `_ARCHIVE`-এ সরানো হবে।
- প্রতিটা ধাপ শেষে `_BACKUPS`-এ তারিখসহ zip রাখা হবে। mp3 আর ভিডিও zip-এ যাবে না, কারণ এগুলো বদলায় না; এগুলোর একটা আলাদা কপি থাকবে।
- Cambridge-এর প্রশ্নে skill tag শুধু বিদ্যমান analysis থেকে নেওয়া হবে, সাথে `evidence_source` থাকবে।
- বাংলা উচ্চারণে "ও‍য়" joiner শুধু ইংরেজি শব্দের উচ্চারণে বসবে। পুরো ফাইলে find-replace করা যাবে না।
- পুরনো progress কখনো মোছা হবে না।
- `09. Full Courses` আর `Soumo khan…` (৪১ GB ভিডিও) website-এ যাবে কি না, সেই সিদ্ধান্ত পরে নেওয়া হবে। আকারের কারণে এগুলো আলাদা video host-এ রাখতে হবে।

---

## ১১. ফোল্ডার কাঠামো

```
G:\IELTS\IELTS_MASTER_PROJECT\
├── 00_PLAN\              ← এই ফাইল · _INVENTORY.md · PROGRESS.md
├── 01_RAW_ANALYSIS\      ← মূল ফাইলের তালিকা ও path (কপি নয়)
├── 02_SKILL_SYSTEM\      ← SKILL_MAP.md · SKILL_QUESTION_MATRIX.md · skills.json
├── 03_CAMBRIDGE_DATABASE\
├── 04_ERROR_DATABASE\
├── 05_LEARNING_ENGINE\
├── 06_CONTENT\           ← Reading · Listening · Writing · Speaking · Foundation
├── 07_WEBSITE_SPEC\      ← FINAL_ROADMAP.md
├── 08_WEBSITE_CODE\      ← §২
├── 09_TESTING\
├── 10_EBOOKS\
├── _ARCHIVE\
└── _BACKUPS\
```

---

## ১২. Cowork Prompt (পেস্ট করার জন্য)

```
তুমি আমার IELTS Master Platform বানাবে। প্ল্যান আছে এখানে:
G:\IELTS\IELTS_MASTER_PROJECT\00_PLAN\IELTS_MASTER_PROJECT_FINAL_PLAN_v3.md
audit আছে: 00_PLAN\_INVENTORY.md
আগে দুটো ফাইল পুরো পড়ো। তারপর 00_PLAN\PROGRESS.md পড়ো; না থাকলে বানাও।
তারপর §৮ Execution Order-এর পরের অসম্পূর্ণ ধাপটা করো।

কঠোর নিয়ম:
- G:\IELTS-এর সব content website-এ থাকবে (Cambridge, audio, Recent Questions, Makkar সহ)।
- কোনো মূল ফাইল বদলাবে না, মুছবে না।
  কিছু সরাতে হলে _ARCHIVE-এ সরাবে; আগে তালিকা দেখিয়ে আমার অনুমতি নেবে।
- প্রতিবার একটাই ধাপ করবে। শেষে ফলাফল দেখিয়ে থামবে।
  আমি "NEXT" লিখলে তবেই পরের ধাপে যাবে।
- প্রতিটা ধাপ শেষে PROGRESS.md-এ লিখবে: কী হলো, কোন ফাইল তৈরি হলো, পরের ধাপ কী।
- প্রতিটা ধাপ শেষে _BACKUPS-এ তারিখসহ zip রাখবে (mp3/ভিডিও বাদে)।
- localStorage key বদলালে পুরনো key কপি করবে, মুছবে না।
- বাংলা উচ্চারণে "ও‍য়" joiner শুধু ইংরেজি শব্দের উচ্চারণে বসাবে। পুরো ফাইলে find-replace করবে না।
- English sample line সবসময় contracted form-এ লিখবে (I'd, I've, don't)।

Skill-First নিয়ম:
- Skill ID শুধু 02_SKILL_SYSTEM\skills.json থেকে নেবে। নতুন ID নিজে বানাবে না।
- প্রতিটা আইটেমে থাকবে: primary_skill, secondary_skills, question_type, evidence_source।
- কোন skill বসবে তা অনুমান করবে না; নিশ্চিত না হলে "UNMAPPED" লিখবে।
- Cambridge-এর skill mapping শুধু আমার বিদ্যমান ফাইল থেকে নেবে
  (solve_paths.json, data.json, text.json, Listening INBOX md, lt_meta.json)।
- HTML থেকে ডেটা scrape করবে না। ডেটা নেবে _tools-এর JSON আর md থেকে।
```

---

## ✅ শুরু করার ক্রম

1. G:\IELTS-এর root থেকে Word lock ফাইলটা (`~$LTS Speaking…docx`) মুছে ফেলো। Word তখন বন্ধ রাখতে হবে।
2. `_INVENTORY.md`-এর §গ পড়ে duplicate সরানোর অনুমতি দাও (ধাপ ২)।
3. Cowork-এ §১২-এর prompt পেস্ট করো।
