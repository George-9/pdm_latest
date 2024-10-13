const ids = db.members
  .find()
  .sort({ _id: 1 })
  .toArray()
  .map(function (el) {
    const id = el._id;
    const date = id.getTimestamp().toDateString();
    return { i: id, d: date, o_id: el.outstation_id, s_i: el.scc_id };
  })
  .forEach(async function (ent) {
    const scc = await db.small_christian_communties.findOne({
      _id: new ObjectId(ent.s_i),
    });

    console.log(scc ? "scc found" : "scc not found");

    const outstation = await db.outstations.findOne({
      _id: new ObjectId(ent.o_id),
    });

    console.log(outstation ? "outstation exists" : "outstation doesn't exist");
  });
