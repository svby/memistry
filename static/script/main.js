const
    pt = document.getElementById("ptable"),
    nc = document.getElementById("stats-ncorrect"),
    nt = document.getElementById("stats-ntotal"),
    pc = document.getElementById("stats-pcorrect");

let cells = [];

function splitRow(row) {
    const trimmed = row.trim();
    if (!trimmed) return [];
    return trimmed.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(e => {
        if (e.startsWith('"') && e.endsWith('"')) return e.substring(0, e.length - 1);
        return e;
    });
}

async function loadData() {
    const response = await fetch("static/goodman.csv");
    const raw = await response.text();

    const lines = raw.split("\n");
    const headers = splitRow(lines.shift());

    const elements = [];
    for (const line of lines) {
        const split = splitRow(line);
        if (split.length === 0) continue;

        const item = {};
        for (let i = 0; i < Math.min(headers.length, split.length); ++i) {
            if (typeof split[i] === "undefined" || split[i] === "") item[headers[i]] = null;
            else item[headers[i]] = split[i];
        }

        elements[parseInt(split[0])] = item;
    }

    return {
        elements: elements,
        zs: [...new Array(118).keys()].map(e => e + 1),
        names: [...new Set(elements.map(e => e["Element"]).filter(e => e !== null))],
        groups: [...new Set(elements.map(e => e["Group"]).filter(e => e !== null))],
        periods: [...new Set(elements.map(e => e["Period"]).filter(e => e !== null))],
        types: [...new Set(elements.map(e => e["Type"]).filter(e => e !== null))],
        symbols: [...new Set(elements.map(e => e["Symbol"]).filter(e => e !== null))]
    };
}

function generateMcChoices(options, answer) {
    let sample = _.sampleSize(options, 5);
    if (!sample.includes(answer)) {
        sample.shift();
        sample.push(answer);
        sample = _.shuffle(sample);
    }
    return sample;
}

function groupQuestion(options) {
    const element = _.sample(options.data.zs);

    return {
        type: "mc",
        element,
        text: `What group is the element <b>${options.data.elements[element]["Element"]}</b> a member of?`,
        options: options.data.groups,
        answer: options.data.elements[element]["Group"]
    };
}

function periodQuestion(options) {
    const element = _.sample(options.data.zs);

    return {
        type: "mc",
        element,
        text: `What period is the element <b>${options.data.elements[element]["Element"]}</b> a member of?`,
        options: options.data.periods,
        answer: options.data.elements[element]["Period"]
    };
}

function typeQuestion(options) {
    const element = _.sample(options.data.zs);

    return {
        type: "mc",
        element,
        text: `What series is the element <b>${options.data.elements[element]["Element"]}</b> a member of?`,
        options: options.data.types,
        answer: options.data.elements[element]["Type"]
    };
}

function zQuestion(options) {
    const element = _.sample(options.data.zs);
    const text = _.sample([
        `How many protons are present in an atom of <b>${options.data.elements[element]["Element"]}</b>?`,
        `How many electrons are present in an atom of <b>${options.data.elements[element]["Element"]}</b>?`,
        `What is the atomic number of the element <b>${options.data.elements[element]["Element"]}</b>?`
    ]);

    return {
        type: "mc",
        element,
        text,
        options: options.data.zs,
        answer: element
    };
}

function symbolQuestion(options) {
    const element = _.sample(options.data.zs);

    return {
        type: "mc",
        element,
        text: `What is the symbol of the element <b>${options.data.elements[element]["Element"]}</b>?`,
        options: options.data.symbols,
        answer: options.data.elements[element]["Symbol"]
    };
}

function elementQuestion(options) {
    const element = _.sample(options.data.zs);

    return {
        type: "mc",
        element,
        text: `Which element has the symbol <b>${options.data.elements[element]["Symbol"]}</b>?`,
        options: options.data.names,
        answer: options.data.elements[element]["Element"]
    };
}

const questionTypes = Object.freeze([
    groupQuestion,
    periodQuestion,
    typeQuestion,
    zQuestion,
    symbolQuestion,
    elementQuestion
]);

let index = 0;
let correct = 0;
let locked = false;

async function newQuestion(data) {
    index++;

    const qn = document.getElementById("qnum");
    const qc = document.getElementById("qcontent");

    const type = _.sample(questionTypes);

    qn.innerHTML = index.toString();
    const content = type(
        {
            data
        },
        qc
    );

    switch (content.type) {
        case "mc": {
            const button = (option, index) => {
                return `
                    <a data-index="${index}">${option === null ? "N/A" : option}</a>
                `;
            };

            const choices = generateMcChoices(content.options, content.answer);

            qc.innerHTML = `
                <p>${content.text}</p>
                <div class="qans">
                    ${choices.map(button).join("")}
                </div>
            `;

            for (const button of qc.querySelectorAll(".qans > a")) {
                button.addEventListener("click", () => {
                    if (locked) return;
                    locked = true;
                    const correctIndex = choices.indexOf(content.answer);
                    if (parseInt(button.getAttribute("data-index")) === correctIndex) {
                        ++correct;
                        button.classList.add("correct");
                    } else {
                        button.classList.add("incorrect");
                        document.querySelector(`.qans > a[data-index='${correctIndex}']`).classList.add("correct");
                    }

                    const percentage = (correct / index) * 100;

                    nc.innerHTML = correct.toString();
                    nt.innerHTML = index.toString();
                    pc.innerHTML = `${percentage.toFixed(2)}%`;

                    const callbacks = [];
                    if (content.element) {
                        cells[content.element].classList.add("indicator");
                        callbacks.push(() => {
                            cells[content.element].classList.remove("indicator")
                        });
                    }
                    setTimeout(() => {
                        for (const callback of callbacks) callback();
                        locked = false;
                        newQuestion(data);
                    }, 2000);
                });
            }
            break;
        }
    }
}

async function main() {
    const data = await loadData();
    console.log(data);

    cells = populateTable(pt, data);

    const lc = document.getElementById("load-container");
    lc.style.opacity = "0";

    lc.addEventListener("transitionend", () => lc.remove());

    await newQuestion(data);
}

main().then(null, console.error);
