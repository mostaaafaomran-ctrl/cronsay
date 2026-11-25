# cronsay

**Cron expression explainer in plain English and Arabic, with the next run times. Free, offline, no signup.**

**[Open live](https://mostaaafaomran-ctrl.github.io/cronsay/)**

## English
Paste a cron expression and get a sentence and the next five run times.
- Supports 5-field cron: lists (`1,15`), ranges (`9-17`), steps (`*/15`), month and weekday names (`jan`, `mon`), and macros (`@daily`, `@weekly`...).
- English and Arabic explanations.
- Shows next runs in your local time or UTC.
- Clear error messages for out-of-range values.
- No dependencies. `cron.js` also works in Node: `require('./cron.js').explain('0 9 * * mon', 'en')`.

When both day-of-month and weekday are set, cron runs when either matches. cronsay follows that rule.

## بالعربي
الصق تعبير cron وهيشرحهولك بالعربي أو الإنجليزي ويورّيك أقرب ٥ مرات هيشتغل فيها. بيدعم القوائم والمدى والخطوات وأسماء الأيام والشهور و`@daily` وأمثالها. بدون أي مكتبات.

## Run locally
Open `index.html`. License: MIT.
