class Graph {
  adjTable = [];
  size = 0;

  constructor(json) {
    this.size = json.size;
    this.adjTable = [];

    for (let i = 0; i < this.size; i++) {
      this.adjTable.push([]);

      for (let j = 0; j < this.size; j++) {
        this.adjTable[i].push(0);
      }
    }

    json.data.split(';').forEach((edge) => {
      const [from, to] = edge.split(',');
      this.adjTable[from - 1][to - 1] = 1;
      this.adjTable[to - 1][from - 1] = 1;
    });
  }

  isAdjacent(from, to) {
    return this.adjTable[from - 1][to - 1] === 1;
  }

  getAdjucentZones(zones) {
    const result = [];
    zones.forEach((zone) => {
      for (let i = 0; i < this.size; i++) {
        if (this.isAdjacent(zone, i + 1) && !zones.includes(i + 1)) {
          result.push(i + 1);
        }
      }
    });
    return result;
  }
}

export default Graph;


