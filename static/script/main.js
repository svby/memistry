const
    pt = document.getElementById("ptable"),
    snc = document.getElementById("stats-session-ncorrect"),
    snt = document.getElementById("stats-session-ntotal"),
    spc = document.getElementById("stats-session-pcorrect"),
    tnc = document.getElementById("stats-total-ncorrect"),
    tnt = document.getElementById("stats-total-ntotal"),
    tpc = document.getElementById("stats-total-pcorrect");

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
    ++index;

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

                    const globalTotal = (parseInt(localStorage.getItem("total")) || 0) + 1;
                    let globalTotalCorrect = (parseInt(localStorage.getItem("totalCorrect")) || 0);

                    const correctIndex = choices.indexOf(content.answer);
                    if (parseInt(button.getAttribute("data-index")) === correctIndex) {
                        ++correct;
                        ++globalTotalCorrect;

                        button.classList.add("correct");
                    } else {
                        button.classList.add("incorrect");
                        document.querySelector(`.qans > a[data-index='${correctIndex}']`).classList.add("correct");
                    }

                    localStorage.setItem("total", globalTotal.toString());
                    localStorage.setItem("totalCorrect", globalTotalCorrect.toString());

                    snc.innerHTML = correct.toString();
                    snt.innerHTML = index.toString();
                    spc.innerHTML = `${((correct / index) * 100).toFixed(2)}%`;

                    tnc.innerHTML = globalTotalCorrect.toString();
                    tnt.innerHTML = globalTotal.toString();
                    tpc.innerHTML = `${((globalTotalCorrect / globalTotal) * 100).toFixed(2)}%`;

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
    const globalTotal = parseInt(localStorage.getItem("total")) || 0;
    const globalTotalCorrect = parseInt(localStorage.getItem("totalCorrect")) || 0;

    tnc.innerHTML = globalTotalCorrect.toString();
    tnt.innerHTML = globalTotal.toString();
    tpc.innerHTML = `${((globalTotalCorrect / globalTotal) * 100).toFixed(2)}%`;

    const data = await loadData();
    console.log(data);

    cells = populateTable(pt, data);

    const lc = document.getElementById("load-container");
    lc.style.opacity = "0";

    lc.addEventListener("transitionend", () => lc.remove());

    await newQuestion(data);
}

main().then(null, console.error);
