Array.prototype.getRandom = function() {
  return this[Math.floor((Math.random() * this.length))];
}

const TASKS = [{
  description: "Soll alle Binär-Zahlen matchen, die durch 4 teilbar sind",
  checks: {
    "100": true,
    "0100": false,
  }
}];


var app = new Vue({
  el: '#app',
  data: {
    ruleEditFrom: "",
    ruleEditTo: "",
    terminalEdit: "",
    nonTerminalEdit: "",
    rules: {
      "A": ["100", "B"],
      "B": ["00"],
    },
    terminals: ["1", "0"],
    nonTerminals: ["A", "B"],
    start: "A", //TODO
    task: TASKS[0],
    checkResults: [],
  },
  mounted() {
    this.updateCheckResults();
  },
  methods: {
    addTerminal() {
      if (this.terminalEdit.length != 1) {
        alert("Muss Länge 1 haben!");
      } else {
        if (!this.terminals.includes(this.terminalEdit.toUpperCase()))
          this.terminals.push(this.terminalEdit.toUpperCase());
      }
      this.terminalEdit = "";
    },
    addNonTerminal() {
      if (this.nonTerminalEdit.length != 1) {
        alert("Muss Länge 1 haben!");
      } else {
        if (!this.nonTerminals.includes(this.nonTerminalEdit.toUpperCase()))
          this.nonTerminals.push(this.nonTerminalEdit.toUpperCase());
      }
      this.nonTerminalEdit = "";
    },
    addRule() {
      if (this.ruleEditFrom.length != 1) {
        alert("Muss Länge 1 haben!");
        return;
      }
      let from = this.ruleEditFrom.toUpperCase();
      let to = this.ruleEditTo.toUpperCase();
      if (this.rules[from]) {
        if (!this.rules[from].includes(to))
          this.rules[from].push(to);
      } else {
        this.rules[from] = [to];
      }
      this.ruleEditFrom = "";
      this.ruleEditTo = "";

      this.updateCheckResults();
    },
    backwardsCheck(check) { //backward-impl.

      let s = check;
      for (let t = 0; t < 100; t++) {
        for (let from in this.rules) {
          let to = this.rules[from];
          if (s.includes(to)) {
            s = s.replace(to, from);

            console.log(s);
            if (s == this.start) return true;
          }
        }
      }
      return false;
    },
    forwardCheck(check) { // forward-impl.
      for (let iter = 0; iter < 1000; iter++) { // ganze Versuche
        let s = this.start;
        for (let t = 0; t < 100; t++) {
          for (let from in this.rules) {
            let to = this.rules[from];
            if (s.includes(from)) {
              s = s.replace(from, to.getRandom());
              // console.log(s);
              if (s == check) return true;
            }
          }
        }
      }
      return false;
    },
    updateCheckResults() {

      // debugger;
      let r = [];
      for (let check in this.task.checks) {

        let result = this.forwardCheck(check);

        r.push({
          check,
          expectedResult: this.task.checks[check],
          result
        });
      }
      // return r;
      this.checkResults = r;
    }
  },
  computed: {
    displayRules() {
      let dr = [];
      for (let from in this.rules) {
        let to = this.rules[from];
        dr.push(from + " → " + to.map(v => (v ? v : 'ɛ')).join(' | '));
      }
      return dr;
    }
  }
});
