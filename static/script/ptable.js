function populateTable(pt, data) {
    const elements = Object.freeze([
        {row: 1, column: [1, 1]},
        {row: 1, column: [18, 18]},
        {row: 2, column: [1, 2]},
        {row: 2, column: [13, 18]},
        {row: 3, column: [1, 2]},
        {row: 3, column: [13, 18]},
        {row: 4, column: [1, 18]},
        {row: 5, column: [1, 18]},
        {row: 6, column: [1, 2]},
        {row: 9, column: [3, 17]},
        {row: 6, column: [4, 18]},
        {row: 7, column: [1, 2]},
        {row: 10, column: [3, 17]},
        {row: 7, column: [4, 18]},
    ])

    let z = 1;
    const cells = [];

    const placeholder = document.createElement("div");
    placeholder.classList.add("la-ac-placeholder");
    pt.appendChild(placeholder);

    for (let group = 1; group <= 18; ++group) {
        const header = document.createElement("div");
        header.classList.add("group-header");
        header.style.gridRow = "1";
        header.style.gridColumn = (group + 1).toString();
        header.innerHTML = group.toString();
        pt.appendChild(header);
    }

    for (let period = 1; period <= 7; ++period) {
        const header = document.createElement("div");
        header.classList.add("period-header");
        header.style.gridColumn = "1";
        header.style.gridRow = (period + 1).toString();
        header.innerHTML = period.toString();
        pt.appendChild(header);
    }

    for (const sequence of elements) {
        for (let column = sequence.column[0]; column <= sequence.column[1]; ++column, ++z) {
            const square = document.createElement("div");
            square.style.gridRow = (sequence.row + 1).toString();
            square.style.gridColumn = (column + 1).toString();
            square.data = data[z];
            square.title = z.toString();
            pt.appendChild(square);
            cells[z] = square;
        }
    }

    return Object.freeze(cells);
}
