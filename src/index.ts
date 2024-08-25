// Selecting DOM elements and defining initial variables
const board_game = document.querySelector(".board_game") as HTMLElement;
const disc_on_hover = document.querySelector(".disc_on_hover") as HTMLElement;
const button_reset = document.querySelector(".reset") as HTMLElement;
const info = document.querySelector(".info") as HTMLElement;

const PLAYER_PIECE = 1
const BOT_PIECE = 2
const WINDOW_LENGTH = 4
const EMPTY = 0
const DEPTH = 4

let player = "red";
let is_cpu_active = true;

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

// -------------- PLAYER TWO --------------

function minimax(
    board: number[][],
    depth: number,
    alpha: number,
    beta: number,
    maximisingPlayer: boolean
): [number | null, number] {

    const valid_locations = find_valid_columns(board);
    const isTerminal = is_terminal_node(board);

    if (depth === 0 || isTerminal) {
        if (isTerminal) {
            if (have_winner(board, BOT_PIECE)) {
                return [null, 10000000];
            } else if (have_winner(board, PLAYER_PIECE)) {
                return [null, -10000000];
            } else {
                return [null, 0];
            }
        } else {
            return [null, score_position(board, BOT_PIECE)];
        }
    }

    if (maximisingPlayer) {
        let value = -Infinity;
        let column = valid_locations[Math.floor(Math.random() * valid_locations.length)][1];
        for (const [row, col] of valid_locations) {
            const bCopy = board.map(row => row.slice());
            bCopy[row][col] = BOT_PIECE
            const newScore = minimax(bCopy, depth - 1, alpha, beta, false)[1];
            if (newScore > value) {
                value = newScore;
                column = col;
            }
            alpha = Math.max(alpha, value);
            if (alpha >= beta) {
                break;
            }
        }
        return [column, value];
    } else { // Minimising player
        let value = Infinity;
        let column = valid_locations[Math.floor(Math.random() * valid_locations.length)][1];
        for (const [row, col] of valid_locations) {
            const bCopy = board.map(row => row.slice());
            bCopy[row][col] = PLAYER_PIECE
            const newScore = minimax(bCopy, depth - 1, alpha, beta, true)[1];
            if (newScore < value) {
                value = newScore;
                column = col;
            }
            beta = Math.min(beta, value);
            if (alpha >= beta) {
                break;
            }
        }
        return [column, value];
    }
}


// Define wining moves or no remaining valid locations as terminal nodes (end points)
function is_terminal_node(board: number[][]): boolean {
    return have_winner(board, PLAYER_PIECE) || have_winner(board, BOT_PIECE) || find_valid_columns(board).length === 0
}

// Set window scores based on contents
function evaluate_window(window: number[], piece: number): number {
    let score = 0;

    // Switch scoring based on turn
    const oppPiece = (piece === PLAYER_PIECE) ? BOT_PIECE : PLAYER_PIECE;

    // Prioritise a winning move
    // Minimax makes this less important
    if (window.filter(cell => cell === piece).length === 4) {
        score += 100;
    }
    // Make connecting 3 second priority
    else if (window.filter(cell => cell === piece).length === 3 && window.filter(cell => cell === EMPTY).length === 1) {
        score += 5;
    }
    // Make connecting 2 third priority
    else if (window.filter(cell => cell === piece).length === 2 && window.filter(cell => cell === EMPTY).length === 2) {
        score += 2;
    }
    // Prioritise blocking an opponent's winning move (but not over bot winning)
    // Minimax makes this less important
    if (window.filter(cell => cell === oppPiece).length === 3 && window.filter(cell => cell === EMPTY).length === 1) {
        score -= 4;
    }

    return score;
}


// Look at the board using a 4-piece window to evaluate the whole board & choose a move
function score_position(board: number[][], piece: number): number {
    let score = 0

    /* Score centre column */
    const centerColumnIndex = Math.floor(COL / 2);
    // Extract the center column
    const centerArray = board.map(row => row[centerColumnIndex]);
    // Count occurrences of the piece in the center column
    const centerCount = centerArray.filter(value => value === piece).length;
    score += centerCount * 3

    // Score horizontal positions
    for (let r = 0; r < ROW; r++) {
        const rowArray: number[] = board[r].slice();
        for (let c = 0; c < COL - 3; c++) {
            // Create a horizontal window of 4
            const window: number[] = rowArray.slice(c, c + WINDOW_LENGTH);
            score += evaluate_window(window, piece);
        }
    }

    // Score vertical positions
    for (let c = 0; c < COL; c++) {
        const colArray: number[] = board.map(row => row[c]);
        for (let r = 0; r < ROW - 3; r++) {
            // Create a vertical window of 4
            const window: number[] = colArray.slice(r, r + WINDOW_LENGTH);
            score += evaluate_window(window, piece);
        }
    }

    // Score positive diagonals
    for (let r = 0; r < ROW - 3; r++) {
        for (let c = 0; c < COL - 3; c++) {
            // Create a positive diagonal window of 4
            const window: number[] = Array.from({ length: WINDOW_LENGTH }, (_, i) => board[r + i][c + i]);
            score += evaluate_window(window, piece);
        }
    }

    // Score negative diagonals
    for (let r = 0; r < ROW - 3; r++) {
        for (let c = 0; c < COL - 3; c++) {
            // Create a negative diagonal window of 4
            const window: number[] = Array.from({ length: WINDOW_LENGTH }, (_, i) => board[r + 3 - i][c + i]);
            score += evaluate_window(window, piece);
        }
    }

    return score;
}

// Get all locations that could contain a piece
function find_valid_columns(board: number[][]): number[][] {
    let valid_cols = []
    for (let i = 0; i < COL; i++) {
        for (let j = ROW - 1; j >= 0; j--) {
            if (board[j][i] === 0) {
                valid_cols.push([j, i])
                break
            }
        }
    }
    return valid_cols;
}
// -----------------------------------------


// Function to handle making a move when a column is clicked
function make_move(e: Event): void {
    if (player === "yellow" && is_cpu_active) return;

    // Identify the selected column
    const column = e.target as HTMLElement;

    // Extract the column
    const col = column.classList[1];
    const disc_active = document.querySelector(`.disc_${col}`);

    // Determine the valid row for the selected column
    const valid_row = take_valid_place(board_state, parseInt(col));

    if (valid_row !== -1) {
        // Remove the active player's disc from the previous cell
        disc_active?.classList.remove(`disc_${player}`);

        // Update the valid cell with the active player's disc
        const valid_cell = document.querySelector(`#row${valid_row}_col${col}`);
        valid_cell?.classList.add(`disc_${player}`);

        // Update the game state
        board_state[valid_row][parseInt(col)] = PLAYER_PIECE;

        // Check if the current player has won
        if (have_winner(board_state, PLAYER_PIECE)) {
            info.textContent = "Player 1 won!";
            remove_event();
            return
        }

        // Check if the game is a draw
        if (is_tie()) {
            info.textContent = "The game is a draw!";
            remove_event();
            return;
        }
    }

    switch_player(disc_active)
    remove_highlights()

    if (player === "yellow" && is_cpu_active) {
        // TODO: CPU move
        // 1 - find all available columns
        const [best_col, minimax_score] = minimax(board_state, DEPTH, -Infinity, Infinity, true)
        // 2 - get the valid row from the best_col
        if (best_col !== null) {
            const next_row = take_valid_place(board_state, best_col)
            // 3 - place to the board
            const valid_cell = document.querySelector(`#row${next_row}_col${best_col}`);
            valid_cell?.classList.add(`disc_${player}`);
            // 4 - update the board_state
            board_state[next_row][best_col] = BOT_PIECE
        }
        // 5 - check if win or tie 
        if (have_winner(board_state, BOT_PIECE)) {
            info.textContent = "Player 2 won!";
            remove_event();
            return
        }
        if (is_tie()) {
            info.textContent = "The game is a draw!";
            remove_event();
            return
        }
        // 6 - switch player
        switch_player(disc_active)
    }
}

// Switch to the other player's turn
function switch_player(disc_active: Element | null): void {
    // Remove old player "disc" class
    disc_active?.classList.remove(`disc_${player}`);
    player = player === "red" ? "yellow" : "red";
    disc_active?.classList.add(`disc_${player}`);
    info.textContent = `${player}'s turn.`;
}

// Function to find the valid row for a given column
function take_valid_place(board: number[][], col: number): number {
    for (let r = ROW - 1; r >= 0; r--) {
        if (board[r][col] === 0) {
            return r;
        }
    }
    return -1;
}

// Function to check if a player has won the game
function have_winner(board: number[][], piece: number): boolean {
    // Check valid horizontal locations for win
    for (let c = 0; c < COL - 3; c++) {
        for (let r = 0; r < ROW; r++) {
            if (board[r][c] === piece && board[r][c + 1] === piece && board[r][c + 2] === piece && board[r][c + 3] === piece) {
                return true
            }
        }
    }

    // Check valid vertical locations for win
    for (let c = 0; c < COL; c++) {
        for (let r = 0; r < ROW - 3; r++) {
            if (board[r][c] === piece && board[r + 1][c] === piece && board[r + 2][c] === piece && board[r + 3][c] === piece) {
                return true
            }
        }
    }

    // Check valid positive diagonal locations for win
    for (let c = 0; c < COL - 3; c++) {
        for (let r = 0; r < ROW - 3; r++) {
            if (board[r][c] === piece && board[r + 1][c + 1] === piece && board[r + 2][c + 2] === piece && board[r + 3][c + 3] === piece) {
                return true
            }
        }
    }

    // Check valid negative diagonal locatiosn fow win
    for (let c = 0; c < COL - 3; c++) {
        for (let r = 3; r < ROW; r++) {
            if (board[r][c] === piece && board[r - 1][c + 1] === piece && board[r - 2][c + 2] === piece && board[r - 3][c + 3] === piece) {
                return true
            }
        }
    }

    return false
}

// Function to check if the game is a draw
function is_tie(): boolean {
    for (let r = 0; r < ROW; r++) {
        for (let c = 0; c < COL; c++) {
            if (!board_state[r][c]) return false;
        }
    }
    return true
}

// Function to handle mouseover events on column
function on_mouse_over(e: Event): void {
    if (player === "yellow" && is_cpu_active) return;

    const col_selected = e.target as HTMLElement;
    const col = col_selected.classList[1];

    col_selected.classList.add("active");

    const disc_active = document.querySelector(`.disc_${col}`);
    disc_active?.classList.add("visible", `disc_${player}`);
}

// Function to handle mouseout events on column
function on_mouse_out(e: Event): void {
    const col_selected = e.target as HTMLElement;
    const col = col_selected.classList[1];

    col_selected.classList.remove("active");

    const disc_active = document.querySelector(`.disc_${col}`);
    disc_active?.classList.remove("visible", `disc_${player}`);
}

// Function to reset the game
function on_reset(): void {
    board_state = [
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0]
    ]

    player = "red";
    info.textContent = "red's turn.";

    // Remove all child elements from the game board and disc hovers
    remove_child(board_game);
    remove_child(disc_on_hover);

    // Start a new game
    main();
}

// Function to remove event listeners from all columns
function remove_event(): void {
    const columns = document.getElementsByClassName("column");

    for (let i = 0; i < columns.length; i++) {
        const column = columns[i] as HTMLElement;

        column.classList.remove("active");
        column.removeEventListener("click", make_move);
        column.removeEventListener("mouseover", on_mouse_over);
        column.removeEventListener("mouseout", on_mouse_out);
    }

    remove_child(disc_on_hover);
}

// Function to remove all child elements from a parent element
function remove_child(parent: HTMLElement): void {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

// Remove all highlights after first player move
function remove_highlights() {
    // Remove the highlighted column
    document.querySelector(".active")?.classList.remove("active")

    // Remove the visible disc on top
    document.querySelector(".visible")?.classList.remove("visible")
}

// Function to create disc hovers for player selection
function create_discs_hover(): void {
    for (let c = 0; c < COL; c++) {
        const disc_created = document.createElement("div");
        disc_created.classList.add("square", `disc_${c.toString()}`);

        disc_on_hover.appendChild(disc_created);
    }
}

function create_cols_on_hover(): void {
    const numColumns = 7;
    const spacing = 10;
    const boardWidth = board_game.clientWidth;
    const columnWidth = (boardWidth - (numColumns - 1) * spacing) / numColumns;

    for (let col = 0; col < numColumns; col++) {
        const col_created = document.createElement("div");
        col_created.classList.add("column", `${col.toString()}`);
        col_created.style.width = `${columnWidth}px`;
        col_created.style.left = `${col * (columnWidth + spacing)}px`;

        board_game.appendChild(col_created);

        col_created.addEventListener("mouseover", on_mouse_over);
        col_created.addEventListener("mouseout", on_mouse_out);
        col_created.addEventListener("click", make_move);
    }
}


// Function to initialize the game
function main(): void {
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
