class Laptop{
    constructor(id,name,manufact,cpu,hdd,ssd,resolution,ram,gpu,weight) {
        this.id = id;
        this.name = name;
        this.manufact = manufact;
        this.cpu = cpu;
        this.hdd = hdd;
        this.ssd = ssd;
        this.resolution = resolution;
        this.ram = ram;
        this.gpu = gpu;
        this.weight = weight;
    }
}

module.exports = {
    Laptop,
};