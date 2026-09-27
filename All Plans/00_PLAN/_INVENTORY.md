# _INVENTORY — G:\IELTS (ধাপ ১: Audit)

তারিখ: ১৬ সেপ্টেম্বর ২০২৬ · কোনো ফাইল বদলানো হয়নি, শুধু পড়া হয়েছে।

## ক. পুরো ফোল্ডার এক নজরে

| ফোল্ডার | HTML | মোট ফাইল | আকার | Website-এ ভূমিকা |
|---|---:|---:|---:|---|
| 01. Listening | 120 | 1,376 | 1.1 GB | 🎧 Listening hub (সবচেয়ে সম্পূর্ণ app) |
| 02. Reading | 611 | 2,632 | 241 MB | 📖 Reading hub (সবচেয়ে বেশি content) |
| 04. Speaking | 9 | 289 | 52 MB | 🗣️ Speaking + 🌱 Foundation + **platform shell** |
| 03. Writing | 0 | 936 | 175 MB | ✍️ Writing hub — **কোনো web app নেই** (docx/md) |
| 000 IELTS 53-Skill Mastery Course | 0 | 153 | 4.5 MB | 🧠 Skill Library-র মূল লেখা (২৬টা skill-এর Master Note) |
| 00. Study Plan & Index | 4 | 16 | 2.3 MB | "কোন রিসোর্স পড়বেন" — ৪টা ছোট index পাতা |
| 05. Grammar / 06. Vocabulary / 07. Pronunciation | 0 | 190 | 35 MB | docx/pdf/jpg — পরে Vocabulary ও Foundation-এ |
| 08. Cambridge Practice | 0 | 11 | 0.3 MB | Cambridge Lab |
| 09. Full Courses / Soumo khan grammar course | 0 | 278 | **41 GB** | তৃতীয় পক্ষের ভিডিও কোর্স — **website-এ যাবে না** |
| Master Plan, Study routine, Note, Special Book, 10. Others | 0 | 78 | ~1 GB | পরিকল্পনা ও নোট — website-এ নয় |

## খ. যেসব "website / app" আছে

### 🎧 Listening — `01. Listening\Listening Analysis\` (node generator: `_tools\lt_*.js`)
| অংশ | পাতা | ভেতরে কী | localStorage key |
|---|---:|---|---|
| 00. START HERE (hub) | 1 | dashboard, সব লিংক | পড়ে: `ielts_lt::`, `ielts_drill`, `ielts_syn::` |
| 10. FULL TESTS | 48 + index | C10–21, অডিও প্লেয়ার, ১,৯২০ প্রশ্নের answer key, error type, দাগানো transcript | `ielts_lt::C{b}T{t}` |
| 20. SPELLING & NUMBER DRILL | 1 | ১,০০১ আসল উত্তর | `ielts_drill` |
| 30. SYNONYM MAP | 48 + index | ১,৭২৪ জোড়া (প্রশ্ন ↔ অডিও) | `ielts_syn::` |
| 40. A–Z GUIDES | 10 + index | ১০টা question type-এর কৌশল | — |
| 03. MASTER BANKS | 5 | Vocabulary Vault (4.8 MB!), 258 Paraphrase Trainer, Synonym 245–258 | `navstate`, `shopt`, `smopt`, `vaultoff` ⚠ |
| Stress Marking Practice | 1 | C10T1 Part 4 color-coded stress map | — |
| ডেটা | — | ৪৮ টেস্টের md (INBOX) + ~২০০ mp3 + `lt_meta.json` | — |

### 📖 Reading — `02. Reading\Reading Analysis\` (node generator: `_tools\ft_*.js`, `hub_build.js`, `az_build.js`)
| অংশ | পাতা | ভেতরে কী | localStorage key |
|---|---:|---|---|
| 00. START HERE (hub) | 1 | dashboard | `ielts_ft::C`, `ielts_vocab::` |
| 10. FULL TESTS | 48 + index | C10–21 passage + প্রশ্ন | `ielts_ft::` |
| 07. QUESTION TYPE BANK | 16 guide + ২৯০ (প্রশ্ন + key) | ১৬টা question type, টেস্ট ধরে | — |
| 08. VOCABULARY BANK | 14 | master + book-wise + শেখা শব্দের রিভিশন | `ielts_vocab::` |
| 09. PARAPHRASE BANK | 62 | ধরন অনুযায়ী + book-wise + test-wise | — |
| 11. PARAGRAPH STRUCTURE | 2 | Paragraph Structure Engine (1.3 MB), Skim Lab (1.2 MB) | — |
| ডেটা | — | `data.json` (4.2 MB, ১৩২ passage-এর প্রশ্ন), `text.json`, **`solve_paths.json` (১৬১ প্রশ্নের ধাপে-ধাপে সমাধান, skill + trap + ভুল উত্তরের কারণ)**, `paragraph_structure_data.json` | — |

অন্যান্য Reading app:
- `Understing Long Sentence\` — Sentence Decoder (868 KB), S+V+O Decoder Lab
- `001. Skimming & Scanning Mastery\Skim Lab.html`
- `Recent Questions\Part-01, Part -02` — ১৬৮টা HTML টেস্ট, **বাইরের সাইট থেকে নেওয়া** (Arial/font-awesome টেমপ্লেট)

### 🗣️ Speaking — `04. Speaking\_SITE\` (সবচেয়ে উন্নত কাঠামো)
- SPA: hash router, ১৫টা view, ১৩টা `data/*.js` (~২ MB), ১৭টা engine JS, ৪টা CSS, ৭ theme, search, placement, SRS, service worker, manifest, privacy page
- `_UPLOAD\site` — deploy কপি তৈরি · `_private_reference\` — Cambridge speaking + Makkar cue card JSON (private)
- localStorage: `sg.*`
- আলাদা: `0 Speaking\02_Practice\IELTS Speaking Practice Tool.html`

## গ. যা পাওয়া গেছে: সমস্যা

1. **Duplicate:** Skim Lab ৩ কপি · Paragraph Structure ২ কপি · Vocabulary Vault ৪ কপি (২টা backup) · S+V+O Lab ২ কপি · START HERE (`All HTML File`-এ পুরনো কপি) · `_to_delete`-এ ৫৯টা ফাইল · `_SITE_backup` · Reading `_tools`-এ ৭টা `.bak`।
2. **চারটা আলাদা Skill ID ব্যবস্থা, একটার সাথে আরেকটার মিল নেই:**
   - Skill Map: `R-SK-009`, `L-SK-004`, `W-SK-…`, `S-SK-…`, `X-SK-…`
   - Question Matrix: `R-S14`, `L-S08`, `W1-S…`, `W2-S…`, `S-S…`
   - 53-Skill course: `Skill_10_Paraphrase_Recognition`
   - Reading solve_paths: `S1`–`S12`
   একই "Paraphrase Recognition"-এর এখন চারটা নাম।
3. **পাঁচ রকম design:** Speaking (Anek Bangla + Hind Siliguri, 7 theme) · Reading (Segoe/Nirmala, নীল) · Listening (বেগুনি) · Paragraph Engine (Inter, dark mode) · Skim Lab (Be Vietnam Pro + Noto Sans Bengali, indigo)।
4. **localStorage-এ সংঘর্ষের ঝুঁকি:** এক domain-এ আনলে `navstate`, `shopt`, `smopt`-এর মতো সাধারণ নাম অন্য app-এর সাথে মিলে যেতে পারে।
5. **ভারী ফাইল:** Vocabulary Vault একটা HTML-এই 4.8 MB; mp3 প্রায় ১ GB।
6. **Copyright:** Cambridge passage, transcript, mp3, Makkar cue card আর `Recent Questions`-এর ১৬৮ পাতা public site-এ দেওয়া যাবে না।
7. **Writing-এর কোনো web app নেই।** content আছে শুধু docx/md-তে।
8. **কারিগরি:** `G:\IELTS`-এর মূল ফোল্ডারে একটা পুরনো Word lock ফাইল আছে (`~$LTS Speaking এর জন্য…docx`, 162 bytes)। এটার কারণে Cowork-এর shell মূল ফোল্ডারের তালিকা পড়তে পারে না। Word বন্ধ থাকলে ফাইলটা মুছে ফেলা নিরাপদ।

## ঘ. যা সবচেয়ে মূল্যবান (Unique Website-এর বীজ)

| সম্পদ | কেন গুরুত্বপূর্ণ |
|---|---|
| `solve_paths.json` (১৬১ record) | প্রতিটা প্রশ্নে skill, trap, ভুল উত্তরের কারণ আগে থেকেই আছে। **এটাই Knowledge Graph-এর প্রথম আসল ডেটা** |
| Listening-এর ১,৯২০ answer key + transcript anchor + error type | Error Lab-এর জন্য তৈরি ডেটা |
| Reading Paraphrase Bank + Listening Synonym Map (১,৭২৪) + 258 Paraphrase Trainer + Skill_10 Master Note | **Paraphrase Recognition vertical slice-এর সব উপকরণ এখনই আছে** |
| 53-Skill course-এর ২৬টা Master Note + Exam Card + Example Bank | Skill Library-র Bangla lesson |
| Speaking `_SITE` engine | platform shell (router, search, theme, SRS, offline) |
