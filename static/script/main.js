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
    return await (await fetch("static/goodman.json")).json();
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
                const text = option === null ? "N/A" : (content.mapper ? content.mapper(option) : option);
                return `
                    <a data-index="${index}">${text}</a>
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
                    spc.innerHTML = `${((correct / index) * 100).toFixed(0)}%`;

                    tnc.innerHTML = globalTotalCorrect.toString();
                    tnt.innerHTML = globalTotal.toString();
                    tpc.innerHTML = `${((globalTotalCorrect / globalTotal) * 100).toFixed(0)}%`;

                    const callbacks = [];
                    if (content.group) {
                        const highlighted = Object.values(data).map(e => e.z).filter(z => content.group.includes(z));
                        for (const element of highlighted) cells[element].classList.add("highlight");
                        callbacks.push(() => {
                            for (const element of highlighted) cells[element].classList.remove("highlight");
                        })
                    }
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
    tpc.innerHTML = `${((globalTotal === 0 ? 1 : (globalTotalCorrect / globalTotal)) * 100).toFixed(0)}%`;

    const data = await loadData();
    console.log(data);

    cells = populateTable(pt, data);

    const lc = document.getElementById("load-container");
    lc.style.opacity = "0";

    lc.addEventListener("transitionend", () => lc.remove());

    await newQuestion(data);
}

main().then(null, console.error);
