/**
 * Sort the list of k3ys
 * @param k3ys The list of table format k3ys
 * @returns A sorted list of table format k3ys, sorted first by rarity and then by alphabetical
 */
function sort_k3ys(k3ys) {
    let k3y_indices = {};
    // Iterate across k3ys and rip their indices within the array into an object
    for (let i = 0; i < k3ys.length; ++i) {
        // Split out the actual k3y value from each name
        let tokens = k3ys[i].split(" ")[4].split("_");
        // If the k3y value doesn't exist, create an array for it
        if (!k3y_indices[tokens[2]])
            k3y_indices[tokens[2]] = [];
        // Then push it into the array for this k3y value
        k3y_indices[tokens[2]].push(i);
    }
    // Sort the indices! This includes their color code, so we're assuming the
    // higher the rarity, the later it will appear (rarity 0 is color code 0 so
    // it should appear before rarity 1 for example)
    let k3y_keys = Object.keys(k3y_indices).sort();
    let sorted = [];
    for (let i = 0; i < k3y_keys.length; ++i) {
        // Push the whole table formatted string at the given index into the
        // sorted array
        for (let j = 0; j < k3y_indices[k3y_keys[i]].length; ++j) {
            sorted.push(k3ys[k3y_indices[k3y_keys[i]][j]]);
        }
    }
    return sorted;
}

/**
 * Generate a table entry for k3ys
 * @param index Upgrade index
 * @param rarity Upgrade rarity
 * @param name Upgrade name
 * @param k3y Upgrade k3y value
 * @returns A formatted string to insert into a table
 */
function create_table(index: number, rarity: number, name: string, k3y: string) {
    /** The possible colors for rarity, in case they ever change */
    const rarity_colors = ["0", "1", "2", "3", "4", "5"];
    return index.toString().padStart(3, "0").padStart(5, " ") + " | `" + rarity_colors[rarity] + name + "_" + k3y + "`";
}

/**
 * Update the database with any new k3ys we've seen
 * @param k List of k3y upgrades
 */
function update_db(k: Upgrade[]): void {
    // Grab the current k3y database
    const current_db = $db.f({SID:"keymaster_k3ys"}).first();
    // Parse out our needed field
    const db_k3ys = JSON.parse(current_db.k3ys.toString());
    // Iterate the passed in k3ys, order really doesn't matter for this
    for (const k3y of k) {
        // If the k3y doesn't exist in the object, create its entry
        if (!db_k3ys[k3y.k3y as string])
            db_k3ys[k3y.k3y as string] = [];
        // If the rarity of the k3y already exists, continue to the next k3y
        if (db_k3ys[k3y.k3y as string].includes(k3y.rarity))
            continue;
        // Otherwise push the rarity into the k3y
        db_k3ys[k3y.k3y as string].push(k3y.rarity);
    }
    // And finally update the database
    $db.u1({SID:"keymaster_k3ys"}, {$set:{k3ys:JSON.stringify(db_k3ys,undefined,0)}});
}

export default(c: Context, a: {u: Scriptor}) => {
    // Prevent calling this as a Scriptor
    if (c.calling_script || (c as ScriptorContext).is_scriptor)
        return "`DYou cannot call this from another script!`";
    // Ensure the user is passing sys.upgrades as a Scriptor
    if (!a || !a.u)
        return "`DPlease provide` `Nu`:`V#s.``9sys``V.``Lupgrades`";
    if (a.u.name !== "sys.upgrades")
        return "`DPlease provide` `Nu`:`V#s.``9sys``V.``Lupgrades`";
    // Call sys.upgrades to get full info AND as a script for ease of use
    const upgrades = a.u.call({full: true, is_script: true});
    // Make sure we got an output
    if (!upgrades)
        return "`DCommand failed.`";
    // k3ys is a list of formatted strings, real_k3ys are the actual k3ys.
    // I had a reason to use strings, but data collection
    // also needed real k3ys and I didn't want to refactor my entire sorting
    // function to take them.
    let k3ys = [];
    let real_k3ys = [];
    // Iterate through the upgrade list and determine if the upgrade is a k3y
    for (const u of upgrades as Upgrade[]) {
        if (u.name.includes("k3y")) {
            // Push the next table entry into k3ys
            k3ys.push(create_table(u.i, u.rarity, u.name, u.k3y as string));
            // And the k3y itself into real_k3ys
            real_k3ys.push(u);
        }
    }
    // Sanity checking and fancy output <3
    if (!(k3ys.length > 0))
        return "`DUser has no k3ys! :(`";
    // Update the database
    update_db(real_k3ys);
    // Sort the k3y entries!
    k3ys = sort_k3ys(k3ys);
    // Add in the starting two indices of the table for clarity
    k3ys.unshift("Index | k3y", "------+--------------");
    // And output the table
    return k3ys;
}