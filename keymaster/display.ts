function sort_k3ys(k3ys) {
    let k3y_indices = {};
    for (let i = 0; i < k3ys.length; ++i) {
        let tokens = k3ys[i].split(" ")[4].split("_");
        if (!k3y_indices[tokens[2]])
            k3y_indices[tokens[2]] = [];
        k3y_indices[tokens[2]].push(i);
    }
    let k3y_keys = Object.keys(k3y_indices).sort();
    let sorted = [];
    for (let i = 0; i < k3y_keys.length; ++i) {
        for (let j = 0; j < k3y_indices[k3y_keys[i]].length; ++j) {
            sorted.push(k3ys[k3y_indices[k3y_keys[i]][j]]);
        }
    }
    return sorted;
}

function create_table(index: number, rarity: number, name: string, k3y: string) {
    const rarity_colors = ["0", "1", "2", "3", "4", "5"];
    return index.toString().padStart(3, "0").padStart(5, " ") + " | `" + rarity_colors[rarity] + name + "_" + k3y + "`";
}

function update_db(k: Upgrade[]): void {
    const current_db = $db.f({SID:"keymaster_k3ys"}).first();
    const db_k3ys = JSON.parse(current_db.k3ys.toString());
    for (const k3y of k) {
        if (!db_k3ys[k3y.k3y as string])
            db_k3ys[k3y.k3y as string] = [];
        if (db_k3ys[k3y.k3y as string].includes(k3y.rarity))
            continue;
        db_k3ys[k3y.k3y as string].push(k3y.rarity);
    }
    $db.u1({SID:"keymaster_k3ys"}, {$set:{k3ys:JSON.stringify(db_k3ys,undefined,0)}});
}

export default(c: Context, a: {u: Scriptor}) => {
    if (c.calling_script || (c as ScriptorContext).is_scriptor)
        return "`DYou cannot call this from another script!`";
    if (!a || !a.u)
        return "`DPlease provide` `Nu`:`V#s.``9sys``V.``Lupgrades`";
    if (a.u.name !== "sys.upgrades")
        return "`DPlease provide` `Nu`:`V#s.``9sys``V.``Lupgrades`";
    const upgrades = a.u.call({full: true, is_script: true});
    if (!upgrades)
        return "`DCommand failed.`";
    let k3ys = [];
    let real_k3ys = [];
    for (const u of upgrades as Upgrade[]) {
        if (u.name.includes("k3y")) {
            k3ys.push(create_table(u.i, u.rarity, u.name, u.k3y as string));
            real_k3ys.push(u);
        }
    }
    if (!(k3ys.length > 0))
        return "`DUser has no k3ys! :(`";
    update_db(real_k3ys);
    k3ys = sort_k3ys(k3ys);
    k3ys.unshift("Index | k3y", "------+--------------");
    return k3ys;
}