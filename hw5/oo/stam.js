OO.declareMethod("Number", "fact", function(_this) {
    var nlrId = nextNlrId++;
    try {
        OO.send(OO.send(_this, "===", 0), "thenElse", OO.instantiate("Block", function() {
            var nlrId = nextNlrId++;
            try {
                throw new NLR(nlrId, 1);
            } catch (e) {
                if (e instanceof NLR && e.id === nlrId) {
                    return e.value;
                } else throw e;
            }
        }), OO.instantiate("Block", function() {
            var nlrId = nextNlrId++;
            try {
                throw new NLR(nlrId, OO.send(_this, "*", OO.send(OO.send(_this, "-", 1), "fact")));
            } catch (e) {
                if (e instanceof NLR && e.id === nlrId) {
                    return e.value;
                } else throw e;
            }
        }));
        throw new NLR(nlrId, null);
    } catch (e) {
        if (e instanceof NLR && e.id === nlrId) {
            return e.value;
        } else throw e;
    }
    return _this;
});