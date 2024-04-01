function sort_k3ys(k3ys) {
    let k3y_indices = {};
    for (let i = 2; i < k3ys.length; ++i) {
        let tokens = k3ys[i].split(" ")[4].split("_");
        if (!k3y_indices[tokens[2]])
            k3y_indices[tokens[2]] = [];
        k3y_indices[tokens[2]].push(i);
    }
    let k3y_keys = Object.keys(k3y_indices).sort();
    let sorted = [k3ys[0], k3ys[1]];
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

export default(c,a: {u: Scriptor}) => {
    if (!a || !a.u)
        return "`DPlease provide` `Nu`:`V#s.``9sys``V.``Lupgrades`";
    if (a.u.name !== "sys.upgrades")
        return "`DPlease provide` `Nu`:`V#s.``9sys``V.``Lupgrades`";
    const upgrades = a.u.call({full: true, is_script: true});
    if (!upgrades)
        return "`DCommand failed.`";
    let k3ys = [];
    for (const u of upgrades as Upgrade[]) {
        if (u.name.includes("k3y")) {
            k3ys.push(create_table(u.i, u.rarity, u.name, u.k3y as string));
        }
    }
    k3ys = sort_k3ys(k3ys);
    k3ys.unshift("Index | k3y", "------+--------------");
    return k3ys;
}