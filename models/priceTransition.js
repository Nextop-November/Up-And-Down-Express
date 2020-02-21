class PriceTransition{
    constructor(id,date,price,laptop_id) {
        this.id = id;
        this.date = date;
        this.price = price;
        this.laptop_id = laptop_id;
    }
}

module.exports = {
    PriceTransition,
};