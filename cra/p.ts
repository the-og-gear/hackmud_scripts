export default(c: Context, a: {crab_count?: number}) => {
    let db = $db.f({SID:"crabbyboi"}).first_and_close();
    if (!db) {
        $db.i({SID:"crabbyboi", crab_count: (c.caller === "gear" && a.crab_count) ? a.crab_count : 0});
        db = $db.f({SID:"crabbyboi"}).first_and_close();
    }
    if ((db.crab_count as number) - 1 < 0) {
        $fs.chats.send({channel:"0000", msg:"`DOh no! We're all out of cra.b :(`\n"});
        return;
    }
    (db.crab_count as number) -= 1;
    const poop = "     ,   \n" +
    "  ___)\\ \n" +
    " (_____) \n" +
    "(_______)\n";

    $fs.chats.send({channel: "0000", msg:"`D-1 Crab :(` cra.p\n" + poop + "Crab Counter: " + db.crab_count});
    $db.u({SID:"crabbyboi"}, {$set:{crab_count: db.crab_count}});
}