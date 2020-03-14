class PriceTransition {
    constructor(id,laptopId,date,price,cash,websiteAdress,websiteAddressCash){
        this.id = id;
        this.laptopId = laptopId;
        this.date = date;
        this.price = price;
        this.cash = cash;
        this.websiteAdress = websiteAdress;
        this.websiteAddressCash = websiteAddressCash;
    }
}

module.exports = {
    PriceTransition,
};