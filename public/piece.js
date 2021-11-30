class Piece {
    constructor(color, id, index, image) {
        this.color = color;
        this.id = id;
        this.index = index;
        this.image = image;
        this.hasMoved = false;

        this.setMaterialValue();
    }

    setMaterialValue() {
        this.materialValue = 0;

        switch (this.id) {
            case "rook":
                this.materialValue = 5;

                break;
            
            case "bishop":
                this.materialValue = 3;

                break;

            case "knight":
                this.materialValue = 3;
    
                break;
                
            case "queen":
                this.materialValue = 9;

                break;

            case "pawn":
                this.materialValue = 1;

                break;
        }
    }
}