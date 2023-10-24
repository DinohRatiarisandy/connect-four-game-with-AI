"use strict";
// Selecting DOM elements and defining initial variables
const board_game = document.querySelector(".board_game");
const disc_on_hover = document.querySelector(".disc_on_hover");
const button_reset = document.querySelector(".reset");
const info = document.querySelector(".info");
let player = "red";
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
// Function to handle making a move when a cell is clicked
function make_move(e) {
    // Identify the selected cell
    const cell_selected = e.target;
    // Extract the column from the cell's class
    const col = cell_selected.classList[1][cell_selected.classList[1].length - 1];
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
        board_state[valid_row][parseInt(col)] = player === "red" ? 1 : 2;
        // Check if the current player has won
        if (check_winner(valid_row, parseInt(col))) {
            return;
        }
        // Check if the game is a draw
        if (is_tie()) {
            remove_event();
            info.textContent = "The game is a draw!";
            return;
        }
        // Switch to the other player's turn
        player = player === "red" ? "yellow" : "red";
        disc_active === null || disc_active === void 0 ? void 0 : disc_active.classList.add(`disc_${player}`);
        info.textContent = `${player}'s turn.`;
    }
}
// Function to check if a player has won the game
function check_winner(row, col) {
    if (check_vertical(row, col) || check_horizontal(row, col) || check_diagonals(row, col)) {
        info.textContent = `Player ${player === "red" ? 1 : 2} won!`;
        remove_event();
        return true;
    }
    return false;
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
// Function to remove event listeners from all cells
function remove_event() {
    for (let ROW = 0; ROW < 6; ROW++) {
        for (let COL = 0; COL < 7; COL++) {
            const cell = document.querySelector(`#row${ROW}_col${COL}`);
            cell === null || cell === void 0 ? void 0 : cell.removeEventListener("click", make_move);
            cell === null || cell === void 0 ? void 0 : cell.removeEventListener("mouseover", on_mouse_over);
            cell === null || cell === void 0 ? void 0 : cell.removeEventListener("mouseout", on_mouse_out);
            remove_child(disc_on_hover);
        }
    }
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
        }
        row = next_row;
    }
    if (count === 4) {
        return true;
    }
    return false;
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
// Function to check for a diagonal win
function check_diagonals(row, col) {
    let count_diag_one = count_aligned_disc_diagonal(row, col, 1, -1) + count_aligned_disc_diagonal(row, col, -1, 1) - 1;
    let count_diag_two = count_aligned_disc_diagonal(row, col, 1, 1) + count_aligned_disc_diagonal(row, col, -1, -1) - 1;
    if (count_diag_one >= 4 || count_diag_two >= 4) {
        return true;
    }
    return false;
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
// Function to create disc hovers for player selection
function create_discs_hover() {
    for (let c = 0; c < COL; c++) {
        const disc_created = document.createElement("div");
        disc_created.classList.add("square", `disc_${c.toString()}`);
        disc_on_hover.appendChild(disc_created);
    }
}
// Function to handle mouseover events on cells
function on_mouse_over(e) {
    const cell_selected = e.target;
    const col = cell_selected.classList[1][cell_selected.classList[1].length - 1];
    const disc_active = document.querySelector(`.disc_${col}`);
    disc_active === null || disc_active === void 0 ? void 0 : disc_active.classList.add("visible", `disc_${player}`);
}
// Function to handle mouseout events on cells
function on_mouse_out(e) {
    const cell_selected = e.target;
    const col = cell_selected.classList[1][cell_selected.classList[1].length - 1];
    const disc_active = document.querySelector(`.disc_${col}`);
    disc_active === null || disc_active === void 0 ? void 0 : disc_active.classList.remove("visible", `disc_${player}`);
}
// Function to remove all child elements from a parent element
function remove_child(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
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
    info.textContent = "Red's turn.";
    // Remove all child elements from the game board and disc hovers
    remove_child(board_game);
    remove_child(disc_on_hover);
    // Start a new game
    main();
}
// Function to initialize the game
function main() {
    // Create disc hovers for player selection
    create_discs_hover();
    // Create the game board and attach event listeners to cells
    for (let ROW = 0; ROW < 6; ROW++) {
        for (let COL = 0; COL < 7; COL++) {
            const cell_created = document.createElement("div");
            cell_created.classList.add("square", `col_${COL.toString()}`);
            cell_created.id = `row${ROW}_col${COL}`;
            board_game.appendChild(cell_created);
            cell_created.addEventListener("click", make_move);
            cell_created.addEventListener("mouseover", on_mouse_over);
            cell_created.addEventListener("mouseout", on_mouse_out);
            button_reset.addEventListener("click", on_reset);
        }
    }
}
// Start the game
main();
