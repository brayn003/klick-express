require('dotenv').config();

const Umzug = require('umzug');
const mongodb = require('mongodb');

async function initUmzug() {
  const con = await mongodb.connect(process.env.MONGODB_URL, { useNewUrlParser: true });
  const connection = con.db(process.env.MONGODB_DB);

  const umzug = new Umzug({
    storage: 'mongodb',
    storageOptions: {
      connection,
      collectionName: '_migration',
    },
    migrations: {
      path: 'migrate/migrations',
      pattern: /\.js$/,
    },
  });

  umzug.on('migrating', (name) => { console.log(`migrating ${name}`); });
  umzug.on('migrated', (name) => { console.log(`migrated ${name}`); });
  umzug.on('reverting', (name) => { console.log(`reverting ${name}`); });
  umzug.on('reverted', (name) => { console.log(`reverted ${name}`); });

  return umzug;
}

async function cmdList(umzug) {
  const executed = await umzug.executed();
  executed.forEach((e) => { console.log(`Executed - ${e.file}`); });
  const pending = await umzug.pending();
  pending.forEach((p) => { console.log(`Pending - ${p.file}`); });
}

async function executeCmd(umzug) {
  const cmd = process.argv[2] ? process.argv[2].trim() : '';
  let executedCmd;
  switch (cmd) {
    case 'list':
      executedCmd = cmdList(umzug);
      break;

    default:
      console.log(`Invalid cmd: ${cmd}`);
      process.exit(1);
  }

  try {
    await executedCmd;
    console.log('-- Done --');
  } catch (err) {
    console.log('-- Error --');
    console.error(err);
  }
}

async function main() {
  const umzug = await initUmzug();
  await executeCmd(umzug);
  process.exit(0);
}

main();
