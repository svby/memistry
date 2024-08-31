function groupQuestion(options) {
    const element = _.sample(options.data.zs);
    const text = _.sample([
        `What group is the element <b>${options.data.elements[element]["Element"]}</b> a member of?`,
        `What group is the element with the symbol <b>${options.data.elements[element]["Symbol"]}</b> a member of?`
    ]);

    return {
        type: "mc",
        element,
        text,
        options: options.data.groups,
        answer: options.data.elements[element]["Group"]
    };
}

function periodQuestion(options) {
    const element = _.sample(options.data.zs);
    const text = _.sample([
        `What period is the element <b>${options.data.elements[element]["Element"]}</b> a member of?`,
        `What period is the element with the symbol <b>${options.data.elements[element]["Symbol"]}</b> a member of?`
    ]);

    return {
        type: "mc",
        element,
        text,
        options: options.data.periods,
        answer: options.data.elements[element]["Period"]
    };
}

function typeQuestion(options) {
    const element = _.sample(options.data.zs.filter(z => options.data.elements[z]["Type"] !== "Metal"));
    const text = _.sample([
        `What series is the element <b>${options.data.elements[element]["Element"]}</b> a member of?`,
        `What series is the element with the symbol <b>${options.data.elements[element]["Symbol"]}</b> a member of?`
    ]);

    return {
        type: "mc",
        element,
        text,
        options: options.data.types.filter(t => t !== "Metal"),
        answer: options.data.elements[element]["Type"]
    };
}

function zQuestion(options) {
    const element = _.sample(options.data.zs);
    const text = _.sample([
        `How many protons are present in an atom of <b>${options.data.elements[element]["Element"]}</b>?`,
        `How many protons are present in an atom of <b>${options.data.elements[element]["Symbol"]}</b>?`,
        `How many electrons are present in an atom of <b>${options.data.elements[element]["Element"]}</b>?`,
        `How many electrons are present in an atom of <b>${options.data.elements[element]["Symbol"]}</b>?`,
        `What is the atomic number of the element <b>${options.data.elements[element]["Element"]}</b>?`,
        `What is the atomic number of the element with the symbol <b>${options.data.elements[element]["Symbol"]}</b>?`
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
