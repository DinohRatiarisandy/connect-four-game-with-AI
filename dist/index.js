"use strict";
// Selecting DOM elements and defining initial variables
const board_game = document.querySelector(".board_game");
const disc_on_hover = document.querySelector(".disc_on_hover");
const button_reset = document.querySelector(".reset");
const info = document.querySelector(".info");
let player = "red";
let is_cpu_active = true;
let board_state = [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0]
];
const ROW = board_state.length;
const COL = board_state[0].length;
// -------------- PLAYER TWO --------------
function find_valid_columns() {
    let valid_cols = [];
    for (let i = 0; i < COL; i++) {
        for (let j = ROW - 1; j >= 0; j--) {
            if (board_state[j][i] === 0) {
                valid_cols.push([j, i]);
                break;
            }
        }
    }
    return valid_cols;
}
// -----------------------------------------
// Function to handle making a move when a column is clicked
function make_move(e) {
    if (player === "yellow" && is_cpu_active)
        return;
    // Identify the selected column
    const column = e.target;
    // Extract the column
    const col = column.classList[1];
    const disc_active = document.querySelector(`.disc_${col}`);
    // Determine the valid row for the selected column
    const valid_row = take_valid_place(parseInt(col));
    if (valid_row !== -1) {
        // Remove the active player's disc from the previous cell
        disc_active === null || disc_active === void 0 ? void 0 : disc_active.classList.remove(`disc_${player}`);
        // Update the valid cell with the active player's disc
        const valid_cell = document.querySelector(`#row${valid_row}_col${col}`);
        valid_cell === null || valid_cell === void 0 ? void 0 : valid_cell.classList.add(`disc_${player}`);
        // Update the game state
        board_state[valid_row][parseInt(col)] = 1;
        // Check if the current player has won
        if (have_winner(valid_row, parseInt(col))) {
            info.textContent = "Player 1 won!";
            remove_event();
            return;
        }
        // Check if the game is a draw
        if (is_tie()) {
            info.textContent = "The game is a draw!";
            remove_event();
            return;
        }
    }
    switch_player(disc_active);
    remove_highlights();
    setTimeout(() => {
        if (player === "yellow" && is_cpu_active) {
            // TODO: CPU move
            // 1 - find all available columns
            const valid_cols = find_valid_columns();
            // 2 - get one valid column from it (random)
            const [row, col] = valid_cols[Math.trunc(Math.random() * valid_cols.length)];
            // 3 - place to the board
            const valid_cell = document.querySelector(`#row${row}_col${col}`);
            valid_cell === null || valid_cell === void 0 ? void 0 : valid_cell.classList.add(`disc_${player}`);
            // 4 - update the board_state
            board_state[row][col] = 2;
            // 5 - check if win or tie 
            if (have_winner(row, col)) {
                info.textContent = "Player 2 won!";
                remove_event();
                return;
            }
            if (is_tie()) {
                info.textContent = "The game is a draw!";
                remove_event();
                return;
            }
            // 6 - switch player
            switch_player(disc_active);
        }
    }, 900);
}
// Switch to the other player's turn
function switch_player(disc_active) {
    // Remove old player "disc" class
    disc_active === null || disc_active === void 0 ? void 0 : disc_active.classList.remove(`disc_${player}`);
    player = player === "red" ? "yellow" : "red";
    disc_active === null || disc_active === void 0 ? void 0 : disc_active.classList.add(`disc_${player}`);
    info.textContent = `${player}'s turn.`;
}
// Function to find the valid row for a given column
function take_valid_place(col) {
    for (let r = ROW - 1; r >= 0; r--) {
        if (board_state[r][col] === 0) {
            return r;
        }
    }
    return -1;
}
// Function to check if a player has won the game
function have_winner(row, col) {
    if (check_vertical(row, col) || check_horizontal(row, col) || check_diagonals(row, col)) {
        return true;
    }
    return false;
}
// Function to check for a horizontal win
function check_horizontal(row, col) {
    const count_left = count_aligned_disc_horizontal(row, col, -1);
    const count_right = count_aligned_disc_horizontal(row, col, 1);
    if (count_left + count_right + 1 >= 4) {
        return true;
    }
    return false;
}
// Function to check for a vertical win
function check_vertical(row, col) {
    let count = 1;
    while (row < ROW) {
        let next_row = row + 1;
        if (next_row >= 0 && next_row < ROW) {
            if (board_state[next_row][col] === board_state[row][col]) {
                count += 1;
            }
            else {
                break;
            }
        }
        row = next_row;
    }
    if (count === 4) {
        return true;
    }
    return false;
}
// Function to check for a diagonal win
function check_diagonals(row, col) {
    let count_diag_one = count_aligned_disc_diagonal(row, col, 1, -1) + count_aligned_disc_diagonal(row, col, -1, 1) - 1;
    let count_diag_two = count_aligned_disc_diagonal(row, col, 1, 1) + count_aligned_disc_diagonal(row, col, -1, -1) - 1;
    if (count_diag_one >= 4 || count_diag_two >= 4) {
        return true;
    }
    return false;
}
// Function to count aligned discs in a horizontal direction
function count_aligned_disc_horizontal(row, col, step) {
    let count = 0;
    while (col >= 0 && col < COL) {
        let next_col = col + step;
        if (next_col >= 0 && next_col < COL) {
            if (board_state[row][col] === board_state[row][next_col]) {
                count += 1;
            }
            else {
                break;
            }
        }
        col = next_col;
    }
    return count;
}
// Function to count aligned discs in a diagonal direction
function count_aligned_disc_diagonal(row, col, step1, step2) {
    let count = 1;
    while ((row >= 0 && row < ROW) && (col >= 0 && col < COL)) {
        let next_row = row + step1;
        let next_col = col + step2;
        if ((next_col >= 0 && next_col < COL) && (next_row >= 0 && next_row < ROW)) {
            if (board_state[row][col] === board_state[next_row][next_col]) {
                count += 1;
            }
            else {
                break;
            }
        }
        row = next_row;
        col = next_col;
    }
    return count;
}
// Function to check if the game is a draw
function is_tie() {
    for (let r = 0; r < ROW; r++) {
        for (let c = 0; c < COL; c++) {
            if (!board_state[r][c])
                return false;
        }
    }
    return true;
}
// Function to handle mouseover events on column
function on_mouse_over(e) {
    if (player === "yellow" && is_cpu_active)
        return;
    const col_selected = e.target;
    const col = col_selected.classList[1];
    col_selected.classList.add("active");
    const disc_active = document.querySelector(`.disc_${col}`);
    disc_active === null || disc_active === void 0 ? void 0 : disc_active.classList.add("visible", `disc_${player}`);
}
// Function to handle mouseout events on column
function on_mouse_out(e) {
    const col_selected = e.target;
    const col = col_selected.classList[1];
    col_selected.classList.remove("active");
    const disc_active = document.querySelector(`.disc_${col}`);
    disc_active === null || disc_active === void 0 ? void 0 : disc_active.classList.remove("visible", `disc_${player}`);
}
// Function to reset the game
function on_reset() {
    board_state = [
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0]
    ];
    player = "red";
    info.textContent = "red's turn.";
    // Remove all child elements from the game board and disc hovers
    remove_child(board_game);
    remove_child(disc_on_hover);
    // Start a new game
    main();
}
// Function to remove event listeners from all columns
function remove_event() {
    const columns = document.getElementsByClassName("column");
    for (let i = 0; i < columns.length; i++) {
        const column = columns[i];
        column.classList.remove("active");
        column.removeEventListener("click", make_move);
        column.removeEventListener("mouseover", on_mouse_over);
        column.removeEventListener("mouseout", on_mouse_out);
    }
    remove_child(disc_on_hover);
}
// Function to remove all child elements from a parent element
function remove_child(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}
// Remove all highlights after first player move
function remove_highlights() {
    var _a, _b;
    // Remove the highlighted column
    (_a = document.querySelector(".active")) === null || _a === void 0 ? void 0 : _a.classList.remove("active");
    // Remove the visible disc on top
    (_b = document.querySelector(".visible")) === null || _b === void 0 ? void 0 : _b.classList.remove("visible");
}
// Function to create disc hovers for player selection
function create_discs_hover() {
    for (let c = 0; c < COL; c++) {
        const disc_created = document.createElement("div");
        disc_created.classList.add("square", `disc_${c.toString()}`);
        disc_on_hover.appendChild(disc_created);
    }
}
function create_cols_on_hover() {
    for (let col = 0; col < 7; col++) {
        const col_created = document.createElement("div");
        col_created.classList.add("column", `${col.toString()}`);
        col_created.style.left = `${col * 100}px`;
        board_game.appendChild(col_created);
        col_created.addEventListener("mouseover", on_mouse_over);
        col_created.addEventListener("mouseout", on_mouse_out);
        col_created.addEventListener("click", make_move);
    }
}
// Function to initialize the game
function main() {
    button_reset.addEventListener("click", on_reset);
    // Create disc hovers for player selection
    create_discs_hover();
    create_cols_on_hover();
    // Create the game board and attach event listeners to cells
    for (let ROW = 0; ROW < 6; ROW++) {
        for (let COL = 0; COL < 7; COL++) {
            const cell_created = document.createElement("div");
            cell_created.classList.add("square", `col_${COL.toString()}`);
            cell_created.id = `row${ROW}_col${COL}`;
            board_game.appendChild(cell_created);
        }
    }
}
// Start the game
main();
