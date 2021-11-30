class Move {
    constructor (startIndex, endIndex, moveType) {
        this.startIndex = startIndex;
        this.endIndex = endIndex;
        
        // move type should be one of: "normal, white-EP, black-EP, white-SC, black-SC, white-LC, black-LC,
        // promotion-q, promotion-r, promotion-b, promotion-n"
        //
        // EP = En Passant, SC = Short Castle, LC = Long Castle
        this.moveType = moveType;
    }
}