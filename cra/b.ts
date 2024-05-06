

export default(c: Context, a: {crab_count?: number}) => {
    let db = $db.f({SID:"crabbyboi"}).first_and_close();
    if (!db) {
        $db.i({SID:"crabbyboi", crab_count: (c.caller === "gear" && a.crab_count) ? a.crab_count : 0});
        db = $db.f({SID:"crabbyboi"}).first_and_close();
    }
    (db.crab_count as number) += 1;
    const crab = "   __       __\n" + 
    "  / <`     '> \\\n" +
    " (  / @   @ \\  )\n" +
    "  \\(_ _\\_/_ _)/\n" +
    "(\\ `-/     \\-' /):\n" +
    " \"===\\     /===\"\n" +
    "  .==')___(`==.\n" +
    " ' .='     `=.\n";

    $fs.chats.send({channel:"0000", msg:"`L+1 Crab!` cra.b\n" + crab + "Crab Counter: " + db.crab_count});
    $db.u({SID:"crabbyboi"}, {$set:{crab_count: db.crab_count}});
}