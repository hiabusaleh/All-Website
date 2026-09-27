# /apps/ — পুরনো app (Portal ধাপ)

প্রতিটা পুরনো app-এর ফোল্ডার এখানে **কপি** করুন (মূল ফাইল `G:\IELTS`-এই থাকবে)। কোন app কোন ফোল্ডারে যাবে, তা `../data/apps.json`-এর `dir` আর `source`-এ লেখা আছে। উদাহরণ:

| app | `G:\IELTS`-এর উৎস | এখানে রাখুন |
|---|---|---|
| Spelling & Number Drill | `01. Listening\Listening Analysis\20. SPELLING & NUMBER DRILL` | `listening/drill/` |
| Full Tests (Listening) | `01. Listening\Listening Analysis\10. FULL TESTS` | `listening/full-tests/` |
| Skim Lab | `02. Reading\001. Skimming & Scanning Mastery\Skim Lab.html` | `reading/skim-lab/index.html` |

- মূল পাতার নাম `index.html` না হলে, `apps.json`-এ সেই app-এর `entry`-তে আসল নামটা লিখুন।
- `node build.js` চালালে build নিজেই দেখে কোন app আছে, তারপর সেটাকে "চালু" দেখায়। প্রতিটা HTML-এর **কপিতে** উপরের shared top bar বসে; মূল ফাইলে কিছু বদলায় না।
- Cambridge বা তৃতীয় পক্ষের content-ওয়ালা app `private: true`। `PUBLIC_BUILD=1 node build.js` দিলে এগুলো বাদ যায়।
- mp3-এর মতো বড় ফাইল git-এ তোলা যাবে না (প্ল্যান §২: audio থাকবে R2 বা Bunny-তে)। `.gitignore` এই ফোল্ডারের সব কিছু বাদ রাখে, শুধু এই README থাকে।
