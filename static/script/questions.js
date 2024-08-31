const groupMap = {
    "metal": "metal",
    "nonmetal": "nonmetal",
    "noble_gas": "noble gas",
    "alkali": "alkali metal",
    "alkaline_earth": "alkaline earth metal",
    "metalloid": "metalloid",
    "halogen": "halogen",
    "transition": "transition metal",
    "post_transition": "post-transition metal",
    "lanthanide": "lanthanide",
    "actinide": "actinide"
};

const groupMapper = (type) => groupMap[type];

function groupQuestion(options) {
    // TODO: possibly distribute N/A answers randomly so that we don't have to fully ignore lanthanides/actinides
    const element = _(Object.values(options.data)).filter(e => e.group !== null).sample();
    const text = _([
        `What group is the element <b>${element.name}</b> in?`,
        `What group is the element <b>${element.symbol}</b> in?`
    ]).sample();

    return {
        type: "mc",
        element: element.z,
        group:
            Object.values(options.data)
                .filter(e => e.group === element.group)
                .map(e => e.z),
        text,
        options:
            _(Object.values(options.data))
                .map(e => e.group)
                .filter(g => g !== null)
                .uniq()
                .value(),
        answer: element.group
    };
}

function periodQuestion(options) {
    const element = _(Object.values(options.data)).sample();
    const text = _([
        `What period is the element <b>${element.name}</b> in?`,
        `What period is the element <b>${element.symbol}</b> in?`
    ]).sample();

    return {
        type: "mc",
        element: element.z,
        group:
            Object.values(options.data)
                .filter(e => e.period === element.period)
                .map(e => e.z),
        text,
        options: _(Object.values(options.data)).map(e => e.period).uniq().value(),
        answer: element.period
    };
}

function typeQuestion(options) {
    const ignored = ["metal"];

    // Append nonmetal if necessary,
    // and remove metal (prefer the specific subcategory instead.)
    const temp =
        _(Object.values(options.data))
            .filter(element => element.types !== null)
            .map(element => ({
                element: element,
                types: [...element.types]
            }))
            .map(temp => {
                if (!temp.types.includes("metal")) temp.types.push("nonmetal");
                else temp.types.splice(temp.types.indexOf("metal"), 1);
                return temp;
            })
            .filter(temp => !_.isEmpty(temp.types))
            .sample();

    const {element, types} = temp;

    const text = _([
        `Which category applies to the element <b>${element.name}</b>?`,
        `Which category applies to the element <b>${element.symbol}</b>?`
    ]).sample();

    const answer = _(types).sample();

    return {
        type: "mc",
        element: element.z,
        group:
            Object.values(options.data)
                .filter(e => e.types !== null)
                .filter(e => {
                    if (answer === "nonmetal") return !e.types.includes("metal") && !e.types.includes("metalloid");
                    else return e.types.some(t => !ignored.includes(t)) && e.types.includes(answer);
                })
                .map(e => e.z),
        text,
        options:
            _([
                ..._(Object.values(options.data))
                    .filter(e => e.types !== null)
                    .flatMap(e => e.types),
                "nonmetal"
            ])
                .filter(t => !ignored.includes(t) && !types.includes(t))
                .uniq()
                .value(),
        answer,
        mapper: groupMapper
    };
}

function zQuestion(options) {
    const element = _(Object.values(options.data)).sample();
    const text = _.sample([
        `How many protons are present in an atom of <b>${element.name}</b>?`,
        `How many protons are present in an atom of <b>${element.symbol}</b>?`,
        `How many electrons are present in an atom of <b>${element.name}</b>?`,
        `How many electrons are present in an atom of <b>${element.symbol}</b>?`,
        `What is the atomic number of the element <b>${element.name}</b>?`,
        `What is the atomic number of the element <b>${element.symbol}</b>?`
    ]);

    return {
        type: "mc",
        element: element.z,
        text,
        options: _(Object.values(options.data)).map(e => e.z).uniq().value(),
        answer: element.z
    };
}

function symbolQuestion(options) {
    const element = _(Object.values(options.data)).sample();

    return {
        type: "mc",
        element: element.z,
        text: `What is the symbol of the element <b>${element.name}</b>?`,
        options: _(Object.values(options.data)).map(e => e.symbol).uniq().value(),
        answer: element.symbol
    };
}

function elementQuestion(options) {
    const element = _(Object.values(options.data)).sample();

    return {
        type: "mc",
        element: element.z,
        text: `Which element has the symbol <b>${element.symbol}</b>?`,
        options: _(Object.values(options.data)).map(e => e.name).uniq().value(),
        answer: element.name
    };
}
