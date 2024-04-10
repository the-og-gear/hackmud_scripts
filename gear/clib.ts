type ScriptArgs = {
  ignore?: boolean; // Ignore the first_run message
  locks?: string[]; // The lock array
  help?: boolean;
  man?: boolean; // This is the same as help
  reset?: boolean; // Allows a user to reset their entry in the DB
  full_reset?: boolean; // Allows specifically gear to reset the entire DB
};

export default (c: Context, a: ScriptArgs) => {
  /** Output string, standard in my scripts */
  let output = "";

  // Handle a lack of arguments to the program
  if (a == undefined) {
    a = {};
  }

  /** The `first_run` users in the database document for this script */
  let db = $db.f({ SID: "gear_clib" }).first();
  if (!db) {
    $db.i({ SID: "gear_clib", first_runs: [] });
    db = $db.f({ SID: "gear_clib" }).first();
  }
  let first_runs = db.first_runs.toString().split(",");

  if (c.caller == "gear" && a.full_reset) {
    $db.r({ SID: "gear_clib" });
    return "`LTotal reset complete.`";
  }

  if (a.reset) {
    for (let i = 0; i < first_runs.length; ++i) {
        if (first_runs[i] == c.caller) {
            if (i == first_runs.length - 1) {
                delete first_runs[i];
                break;
            }
            for (let j = i + 1; j < first_runs.length; ++j) {
                first_runs[i] = first_runs[j];
            }
            break;
        }
    }
    $db.us({SID:"gear_clib"}, {$set: {first_runs: first_runs.join(",")}});
    return "`LReset successfully.`";
  }

  // Locate the script caller in the first_runs database OR ignore this if they decided to pass ignore as an argument
  if (!(first_runs as string[]).includes(c.caller) && !a.ignore) {
    output +=
      "`1Hello, first time user!`\n\nThis script is intended to be used as a library in your other scripts.\n";
    output +=
      "Calling it from the CLI is supported however, though some outputs may not appear (such as functions in returned objects for example).\n";
    output += "`DYou've been warned!`\n\n";
    // Add the user to the first_runs database item!
    first_runs.push(c.caller);
    $db.us(
      { SID: "gear_clib" },
      { $set: { first_runs: first_runs.join(",") } }
    );
  }
  // Add the user to the database even if ignore was called. This time we'll fall through and continue execution
  else if (!(first_runs as string[]).includes(c.caller) && a.ignore) {
    first_runs.push(c.caller);
    $db.us(
      { SID: "gear_clib" },
      { $set: { first_runs: first_runs.join(",") } }
    );
  }

  // Determine if the user wanted help or not
  if (a.help || a.man || (a.locks && a.locks.length == 0)) {
    output +=
      "This script is for retrieving arrays of possible values for the following locks:\n";
    output +=
      "- `Lez_21`\n- `Lez_35`\n- `Lez_40`\n- `Lc001`\n- `Kc002`\n- `Kc003`\n- `Ll0cket`\n";
    output +=
      "\nYou will receive your chosen `Nlock`(s) in the form of an object, where the `Nkeys` are your chosen locks and the `Vvalues` are the possible answers.\n";
    output +=
      'For example, calling this script with {`Nlock`:`V["ez_21","ez_40"]`} will return an object that looks like the following:\n';
    output +=
      '{ ez_21: {ez_21: ["unlock", "open", "release"]}, ez_40: {ez_40: ["unlock", "open", "release"], ez_prime: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97]} }\n';
    output +=
      "\n\nNote that this script will `DNOT` solve a lock for you, it merely provides you with the tools to solve it.\n";
    output +=
      "Thank you for choosing gear.clib - your one stop shop for T1 lock solutions!";
    return output;
  }

  // Iterate through the lock array and append all of the locks to an object
  if (!a.locks) {
    return "Please provide an array of `Nlock`s to crack! You can call this script with help:true to get help :)";
  }

  let o_obj = {};
  let locks = {
    ez_21: { ez_21: ["unlock", "open", "release"] },
    ez_35: {
      ez_35: ["unlock", "open", "release"],
      digit: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    },
    ez_40: {
      ez_40: ["unlock", "open", "release"],
      ez_prime: [
        2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67,
        71, 73, 79, 83, 89, 97,
      ],
    },
    c001: {
      c001: [
        "red",
        "orange",
        "yellow",
        "lime",
        "green",
        "cyan",
        "blue",
        "purple",
      ],
      color_digit: [3, 6, 6, 4, 5, 4, 4, 6],
    },
    c002: {
      c002: [
        "red",
        "orange",
        "yellow",
        "lime",
        "green",
        "cyan",
        "blue",
        "purple",
      ],
      c002_complement: [
        "red",
        "orange",
        "yellow",
        "lime",
        "green",
        "cyan",
        "blue",
        "purple",
      ],
    },
    c003: {
      c003: [
        "red",
        "orange",
        "yellow",
        "lime",
        "green",
        "cyan",
        "blue",
        "purple",
      ],
      c003_triad_1: [
        "red",
        "orange",
        "yellow",
        "lime",
        "green",
        "cyan",
        "blue",
        "purple",
      ],
      c003_triad_2: [
        "red",
        "orange",
        "yellow",
        "lime",
        "green",
        "cyan",
        "blue",
        "purple",
      ],
    },
    l0cket: {
      l0cket: [
        "6hh8xw",
        "cmppiq",
        "sa23uw",
        "tvfkyq",
        "uphlaw",
        "vc2c7q",
        "xwz7ja",
      ],
    },
  };
  for (let lock of a.locks) {
    lock = lock.toLowerCase();
    if (Object.keys(o_obj).includes(lock))
      return "`DPlease do not specify a lock twice!`";
    if (!Object.keys(locks).includes(lock))
      return "`DLock` " + lock + "`Dis invalid!`";
    o_obj[lock] = locks[lock];
  }
  return o_obj;
};
