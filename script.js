Array.prototype.getRandom = function() {
  return this[Math.floor((Math.random() * this.length))];
}

const TASKS = [{
    description: "Beliebig lange Folgen von ABC",
    checks: {
      "A": false,
      "ABCABCABC": true,
      "ABC": true,
    }
  },
  {
    description: "Summen mit korrekten Klammern (Ziffern 1-3 genügen)",
    checks: {
      "1": true,
      "2+3": true,
      "(1+1)": true,
      "2+(3+1)": true,
      "2+(3+1": false,
      "()": false,
      "1+": false,
    }
  },
  {
    description: "E-Mail-Adressen wie CAB@ABC.AC (Buchstaben A-C genügen) → Achtung: Check stößt evtl. an seine Grenzen…",
    checks: {
      "@": false,
      "@ABC.CC": false,
      "CAB": false,
      "CAB@ABC": false,
      "CAB@ABC.AC": true,
      "BACCAB@ACAB.CC": true,
    }
  },
  {
    description: "[Probeklausur-Aufgabe] Geben Sie eine Grammatik an, mit der genau die Binärzahlen ohne führende Nullen erzeugt werden können, die durch 4 teilbar sind. \nHinweis: Durch 4 teilbare Binärzahlen sind anhand der letzten beiden Binärziffern erkennbar.",
    checks: {
      "00": false,
      "0100": false,
      "101": false,
      "0": true,
      "100": true,
      "10100": true,
    }
  }
];


var app = new Vue({
  el: '#app',
  data: {
    ruleEditFrom: "",
    ruleEditTo: "",
    terminalEdit: "",
    nonTerminalEdit: "",
    rules: [{
        from: "A",
        to: ["100", "B"]
      },
      {
        from: "B",
        to: ["00"]
      }
    ],
    terminals: ["1", "0"],
    nonTerminals: ["A", "B"],
    start: "A",
    taskIndex: 0,
    checkResults: [],
    allPassed: false,
  },
  mounted() {
    // this.updateCheckResults();
  },
  methods: {
    addTerminal(terminal) {
      let n = terminal.toUpperCase();
      if (terminal.length != 1) {
        terminal.split("").forEach(c => this.addTerminal(c));
      } else if (this.nonTerminals.includes(n)) {
        alert(n + ": Schon als Terminalsymbol festgelegt");
      } else {
        if (!this.terminals.includes(n))
          this.terminals.push(n);
      }
      this.terminalEdit = "";
    },
    addNonTerminal(nonTerminal) {
      let n = nonTerminal.toUpperCase();
      if (nonTerminal.length != 1) {
        nonTerminal.split("").forEach(c => this.addNonTerminal(c));
      } else if (this.terminals.includes(n)) {
        alert(n + ": Schon als Terminalsymbol festgelegt");
      } else {
        if (!this.nonTerminals.includes(n))
          this.nonTerminals.push(n);
      }
      this.nonTerminalEdit = "";
    },
    addRule() {
      if (this.ruleEditFrom.length != 1) {
        alert("Muss Länge 1 haben!");
        return;
      }
      let newFrom = this.ruleEditFrom.toUpperCase();
      let newTo = this.ruleEditTo.toUpperCase();
      if (newFrom == newTo) {
        alert("Selbstzuweisung");
        return;
      }
      if (!this.nonTerminals.includes(newFrom)) {
        alert("\"Von\"-Nichtterminalsymbol existiert nicht");
        return;
      }
      let match = this.rules.find(r => r.from == newFrom);
      if (match) {
        if (!match.to.includes(newTo))
          match.to.push(newTo);
      } else {
        this.rules.push({
          from: newFrom,
          to: [newTo]
        });
      }
      this.ruleEditFrom = "";
      this.ruleEditTo = "";

      // this.updateCheckResults();
    },
    // backwardsCheck(check) {
    //
    //   let s = check;
    //   for (let t = 0; t < 100; t++) {
    //     for (let from in this.rules) {
    //       let to = this.rules[from];
    //       if (s.includes(to)) {
    //         s = s.replace(to, from);
    //
    //         console.log(s);
    //         if (s == this.start) return true;
    //       }
    //     }
    //   }
    //   return false;
    // },
    recBwCheck(check) {
      for (let rule of this.rules) {
        for (let singleTo of rule.to) {
          try {
            if (this.replaceSome(check, rule.from, singleTo)) return true;
          } catch (e) {
            console.warn("StackExc");
          }
        }
      }
      return false;
    },
    replaceSome(c, from, singleTo) {
      console.log(c);
      let s = c.replace(singleTo, from);
      if (c == this.start) return true;
      if (s == c) return false;
      for (let rule of this.rules) {
        for (let to of rule.to) {
          if (this.replaceSome(s, rule.from, to)) return true;
        }
      }
      return false;
    },
    async forwardCheck(check) {
      for (let iter = 0; iter < 1000; iter++) { // ganze Versuche
        let s = this.start;
        for (let t = 0; t < 100; t++) {
          for (let rule of this.rules) {
            if (s.includes(rule.from)) {
              s = s.replace(rule.from, rule.to.getRandom());
              // console.log(s);
              if (s == check) return true;
            }
          }
        }
      }
      return false;
    },
    async updateCheckResults() {
      if (!this.nonTerminals.includes(this.start)) {
        alert("Kein Startsymbol festgelegt!");
        return;
      }

      let r = [];
      for (let check in this.task.checks) {
        // let result = await this.forwardCheck(check);
        let result = await this.recBwCheck(check);
        r.push({
          check,
          expectedResult: this.task.checks[check],
          result
        });
      }

      this.checkResults = r;
      this.allPassed = r.every(c => c.result == c.expectedResult);
    },
    reset() {
      this.rules = [];
      this.terminals = [];
      this.nonTerminals = [];
      this.start = "?";
      this.checkResults = [];
      this.allPassed = false;
    },
    nextTask() {
      this.reset();
      this.taskIndex++;
    },
    remove(type, el) {
      if (type == 'terminal') {
        this.terminals = this.terminals.filter(x => x != el);
      } else if (type == 'nonTerminal') {
        this.nonTerminals = this.nonTerminals.filter(x => x != el);
        this.start = "?";
      } else if (type == 'rule') {
        Vue.set(app, 'rules', this.rules.filter(x => x.from != el)); //update manually
      }
    },
  },
  computed: {
    displayRules() {
      let dr = [];
      for (let rule of this.rules) {
        dr.push(rule.from + " → " + rule.to.map(v => (v ? v : 'ɛ')).join(' | '));
      }
      return dr;
    },
    task() {
      if (!TASKS[this.taskIndex]) alert("Sorry, das waren alle Aufgaben. Gute Arbeit! :)")
      return TASKS[this.taskIndex];
    }
  }
});
