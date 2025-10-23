const ShareDB = require('sharedb');
const ShareDbMongo = require('sharedb-mongo');
const slateOt = require('./slate-ot');

const defaultSlateValue = [{ type: 'paragraph', children: [{ text: '' }] }];

// We know this works from your test script.
const db = new ShareDbMongo(process.env.MONGO_URI);

ShareDB.types.register(slateOt);

const share = new ShareDB({ db }); // Simplified options

// --- The Middleware: Let's make it undeniable ---
share.use('read snapshot', (context, next) => {
  // Check if the snapshot and its data property exist
  if (context.snapshot && context.snapshot.data) {
    const content = context.snapshot.data.content;

    // The condition to fix: content is not a non-empty array
    if (!Array.isArray(content) || content.length === 0) {
      console.log(`Middleware is HEALING doc ${context.id}. OLD content was:`, JSON.stringify(content));
      context.snapshot.data.content = defaultSlateValue;
    }
  }
  // Proceed
  next();
});

module.exports = { share };