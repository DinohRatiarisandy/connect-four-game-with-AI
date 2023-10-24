const board_game = document.querySelector(".board_game") as HTMLElement;
const disc_on_hover = document.querySelector(".disc_on_hover") as HTMLElement;

let player = "red";

let board_state = [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0]
]

const ROW = board_state.length;
const COL = board_state[0].length;

function make_move(e: Event): void {
    const cell_selected = e.target as HTMLElement;

    const col = cell_selected.classList[1][cell_selected.classList[1].length - 1];
    const disc_active = document.querySelector(`.disc_${col}`);
    
    const valid_row = take_valid_place(parseInt(col));
    
    if (valid_row !== -1) {
        disc_active?.classList.remove(`disc_${player}`);

        const valid_cell = document.querySelector(`#row${valid_row}_col${col}`);
        valid_cell?.classList.add(`disc_${player}`);
        
        board_state[valid_row][parseInt(col)] = player === "red" ? 1 : 2;
                
        player = player === "red" ? "yellow" : "red";
        disc_active?.classList.add(`disc_${player}`);
    }
}

function take_valid_place(col: number): number {
    for (let r = ROW-1; r >= 0; r--) {
        if (board_state[r][col] === 0) {
            return r;
        }
    }
    return -1;
}

function create_discs_hover(): void {
    for (let c = 0; c < COL; c++) {
        const disc_created = document.createElement("div");
        disc_created.classList.add("square", `disc_${c.toString()}`)

        disc_on_hover.appendChild(disc_created);
    }
}

function on_mouse_over(e: Event): void {
    const cell_selected = e.target as HTMLElement;
    const col = cell_selected.classList[1][cell_selected.classList[1].length - 1];

    const disc_active = document.querySelector(`.disc_${col}`);
    disc_active?.classList.add("visible", `disc_${player}`);
}

function on_mouse_out(e: Event): void {
    const cell_selected = e.target as HTMLElement;
    const col = cell_selected.classList[1][cell_selected.classList[1].length - 1];

    const disc_active = document.querySelector(`.disc_${col}`);
    disc_active?.classList.remove("visible", `disc_${player}`);
}

function main(): void {
    create_discs_hover();
    for (let ROW = 0; ROW < 6; ROW++) {
        for (let COL = 0; COL < 7; COL++) {
            const cell_created = document.createElement("div");
            cell_created.classList.add("square", `col_${COL.toString()}`);
            cell_created.id = `row${ROW}_col${COL}`;
            board_game.appendChild(cell_created);

            cell_created.addEventListener("click", make_move);
            cell_created.addEventListener("mouseover", on_mouse_over);
            cell_created.addEventListener("mouseout", on_mouse_out);
        }
    }
}


main();
