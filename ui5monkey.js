window.UI5Monkey = {};

(function (module, $, sap) {
    "use strict";

    class Util {
        static extend() {
            let target = arguments[0];
            const sources = arguments.slice(1);

            function copy(obj1, obj2) {
                if (typeof obj1 !== "object") {
                    obj1 = {};
                }

                for (let key in obj2) {
                    if (obj2.hasOwnProperty(key)) {
                        let value = obj2[key];

                        if (typeof value === "object") {
                            obj1[key] = copy(obj1[key], value);
                        }
                        else {
                            obj1[key] = value;
                        }
                    }
                }

                return obj1;
            }

            for (let element of sources) {
                target = copy(target, element);
            }

            return target;
        }
    }

    class Random {
        static lipsum() {
            return "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt" +
                " ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo" +
                " dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit" +
                " amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor" +
                " invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam" +
                " et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem" +
                " ipsum dolor sit amet.";
        }

        static random() {
            return Math.random();
        }

        static number(low, high) {
            return low + (high - low) * Random.random();
        }

        static integer(low, high) {
            return Math.floor(Random.number(low, high));
        }

        static element(array) {
            return array[Random.index(array)]
        }

        static index(array) {
            return Random.integer(0, array.length);
        }

        static pop(array) {
            const i = Random.index(array);
            const o = array[i];
            array.splice(i, 1);
            return o;
        }

        static shuffle(array) {
            const clone = array.slice();
            const result = [];

            while (clone.length > 0) {
                result.push(Random.pop(clone));
            }

            return result;
        }

        static repeat(min, max, fn) {
            max = Random.integer(min, max);

            for (let i = 1; i <= max; i++) {
                fn();
            }
        }

        static lipsumWords() {
            return Random.lipsum().split(/\s+[.,!?]?/g);
        }

        static word() {
            return Random.element(Random.lipsumWords());
        }

        static sentence(minWords, maxWords) {
            let result = [];

            Random.repeat(minWords, maxWords, function () {
               result.push(Random.word());
            });

            return result.join(" ") + ".";
        }
    }

    class Monkey {
        act(element) {

        }

        get selector() {

        }

        static get name() {

        }
    }

    class StandardFactory {
        static create(name, selector, event) {
            return class extends Monkey {
                act(element) {
                    element.fireEvent(event);
                }

                get selector() {
                    return selector;
                }

                static get name() {
                    return name;
                }
            }
        }
    }

    class InputMonkey extends Monkey {
        act(element) {
            let value = element.getValue();

            switch (element.getType()) {
                case "Text": {
                    value += Random.word() + " ";
                    break;
                }
                case "Number": {
                    value += Random.number(0, 10);
                    break;
                }
                default: {
                    value = Random.sentence(1, 10);
                    break
                }
            }

            element.setValue(value);
        }
    }

    class Horde {
        static Monkeys = [
            StandardFactory.create("Button", ".sapMBtn", "press"),
            StandardFactory.create("Checkbox", ".sapMCb", "select"),
            InputMonkey
        ];

        static createHorde(settings) {
            settings = Util.extend({
                minEach: 0,
                maxEach: 50,
                timeout: 100,
                actions: 5000
            }, settings);

            let monkeys = [];

            for (let monkeyClass of Horde.Monkeys) {
                let min = settings.minEach;
                let max = settings.maxEach;

                if (settings[monkeyClass.name]) {
                    min = settings[monkeyClass.name].min || min;
                    max = settings[monkeyClass.name].max || max;
                }

                Random.repeat(min, max, function () {
                    monkeys.push(new monkeyClass(settings[monkeyClass.name]));
                });
            }

            return new Horde(Random.shuffle(monkeys), settings);
        }

        constructor(monkeys, settings) {
            this.monkeys = monkeys;
            this.settings = settings;
        }

        monkey() {
            return Random.element(this.monkeys);
        }

        unleash() {
            const fnWorker = function (horde) {
                this.counter = this.counter || 0;

                let monkey = horde.monkey();
                let jqElement = $(monkey.selector());

                if (jqElement.size() > 0) {
                    jqElement = Random.element(jqElement);

                    let uiElement = sap.ui.getCore().byId(jqElement.id);
                    if (uiElement) {
                        monkey.act(uiElement);
                    }
                }

                this.counter++;

                if (this.counter < horde.settings.actions) {
                    window.setTimeout(function () {
                        this(horde);
                    }.bind(this), horde.settings.timeout);
                }
            };

            window.setTimeout(function () {
                fnWorker(this);
            }, this.settings.timeout);
        }
    }

})(window.UI5Monkey, jQuery, sap);