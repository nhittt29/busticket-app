import { Seat } from "@/types/seat";

export class SeatLogic {
    /**
     * Sorting helper to match Dart/Flutter logic:
     * Sorts seats by Prefix (A, B, C...) then by Number (1, 2, 10...).
     */
    static sortSeats(seats: Seat[]): Seat[] {
        return [...seats].sort((a, b) => {
            // Extract prefix (letters)
            const aPrefix = a.seatNumber.replace(/[0-9]/g, '');
            const bPrefix = b.seatNumber.replace(/[0-9]/g, '');

            // Extract number
            const aNumStr = a.seatNumber.replace(/[^0-9]/g, '');
            const bNumStr = b.seatNumber.replace(/[^0-9]/g, '');
            const aNum = parseInt(aNumStr) || 0;
            const bNum = parseInt(bNumStr) || 0;

            const prefixCompare = aPrefix.localeCompare(bPrefix);
            if (prefixCompare !== 0) return prefixCompare;

            return aNum - bNum;
        });
    }

    /**
     * Checks if selecting [candidate] would create an orphan seat violation.
     * Returns TRUE if violation (should block selection).
     */
    static wouldCreateOrphan(
        candidate: Seat,
        allSeats: Seat[],
        currentSelectedSeats: Seat[],
        totalSeats = 0,
        seatType = '',
        othersSelecting: Record<number, { userId: string }> = {},
        currentUserId = ''
    ): boolean {
        // Find group
        const group = this.getSeatGroup(candidate, allSeats, totalSeats, seatType);

        // Single seat or empty group -> No violation possible
        if (group.length <= 1) return false;

        // Base states (0 = Available, 1 = Taken by others (DB or SSE Lock))
        const baseStates = group.map(seat => {
            if (!seat.isAvailable) return 1;
            if (othersSelecting[seat.id] && othersSelecting[seat.id].userId !== currentUserId) return 1;
            return 0;
        });

        // Simulated states (0 = Available, 1 = Taken by others OR Selected by ME)
        const simulatedSelection = [...currentSelectedSeats];
        if (!simulatedSelection.some(s => s.id === candidate.id)) {
            simulatedSelection.push(candidate);
        }

        const simStates = group.map(seat => {
            if (!seat.isAvailable) return 1;
            if (othersSelecting[seat.id] && othersSelecting[seat.id].userId !== currentUserId) return 1;
            if (simulatedSelection.some(s => s.id === seat.id)) return 1;
            return 0;
        });

        // Find all '0' blocks (contiguous available seats)
        const simBlocks = this.getZeroBlocks(simStates);
        const baseBlocks = this.getZeroBlocks(baseStates);

        /*
            Orphan Rules:
            - Rule 1 (Edge-Packing): You cannot pick a seat that fragments an existing empty block into smaller parts.
              (i.e. number of empty blocks cannot increase). This forces picking from the edges of a row/mattress.
            - Rule 2 (No Single Orphan): Any gap of exactly 1 empty seat is BLOCKED.
              EXCEPTION: If the original available block had size <= 2, leaving 1 is allowed. 
              (Because it's impossible to book 1 seat from a pair without leaving 1).
        */
        if (simBlocks.length > baseBlocks.length) {
            return true; // Rule 1 Violation
        }

        // Rule 2: No single Inner Orphan (sandwiched gap).
        // Outer orphans (size 1 gap touching the physical boundary) are ALLOWED.
        for (const simBlock of simBlocks) {
            if (simBlock.length === 1) {
                const idx = simBlock[0];
                // Check if it's strictly an INNER gap (not touching 0 or length - 1)
                if (idx > 0 && idx < group.length - 1) {
                    const baseBlock = baseBlocks.find(b => b.includes(idx));
                    // If it was already an inner orphan in base state, we are immune
                    if (baseBlock && baseBlock.length > 1) {
                        return true; // Invalid inner orphan created
                    }
                }
            }
        }

        return false;
    }

    private static getZeroBlocks(states: number[]): number[][] {
        const blocks: number[][] = [];
        let currentBlock: number[] = [];
        for (let i = 0; i < states.length; i++) {
            if (states[i] === 0) {
                currentBlock.push(i);
            } else {
                if (currentBlock.length > 0) {
                    blocks.push(currentBlock);
                    currentBlock = [];
                }
            }
        }
        if (currentBlock.length > 0) blocks.push(currentBlock);
        return blocks;
    }

    /**
     * Identifies the row/group of neighbors for a target seat.
     */
    private static getSeatGroup(target: Seat, allSeats: Seat[], totalSeats = 0, seatType = ''): Seat[] {
        const allLen = totalSeats > 0 ? totalSeats : allSeats.length;

        // Layout 45 (Coach)
        if (allLen === 45) {
            const sortedAll = [...allSeats].sort((a, b) => a.id - b.id);
            const index = sortedAll.findIndex(s => s.id === target.id);
            // First 40 seats (10 rows of 4). Group them into pairs of 2.
            if (index < 40) {
                const pairStart = Math.floor(index / 2) * 2;
                return sortedAll.slice(pairStart, pairStart + 2);
            }
            // Last 5 seats -> Orphan Check Group
            return sortedAll.slice(40);
        }

        // Layout 28/29 (Limousine)
        if (allLen === 28 || allLen === 29) {
            const sortedAll = [...allSeats].sort((a, b) => a.id - b.id);
            const index = sortedAll.findIndex(s => s.id === target.id);
            // First 24 seats (6 rows of 4). Group them into pairs of 2.
            if (index < 24) {
                const pairStart = Math.floor(index / 2) * 2;
                return sortedAll.slice(pairStart, pairStart + 2);
            }
            // Last 4 or 5 seats -> Orphan Check Group
            return sortedAll.slice(24);
        }

        // 1. Group by floor
        const floorSeats = allSeats.filter(s => s.floor === target.floor);
        // Sort by Column logic A1, A2...
        const sortedFloorSeats = this.sortSeats(floorSeats);

        // Layout 34 (3 cols: 6-5-6 heuristic from Dart)
        if (allLen === 34) {
            return this.findRowNeighborsByColumns(target, sortedFloorSeats, [6, 5, 6]);
        }

        // Layout 41 (Special logic)
        if ((allLen >= 35 && allLen <= 44 && (seatType === 'SLEEPER' || seatType === 'LIMOUSINE')) || allLen === 41) {
            // Logic port from Dart:
            // Back Row (5 seats) = 2 last upper + 3 last lower
            const sortedAll = [...allSeats].sort((a, b) => a.id - b.id);
            // Ensure we use the sorted IDs for consistent logic with Layout
            const lowerS = sortedAll.filter(s => s.floor === 1);
            const upperS = sortedAll.filter(s => s.floor === 2);

            const movedSeats = lowerS.slice(18, 21); // take 3 skipping 18
            const lastRowUpper = upperS.slice(18, 20); // take 2 skipping 18

            const mainLower = lowerS.slice(0, 18);
            const mainUpper = upperS.slice(0, 18);

            const backRow = [...lastRowUpper, ...movedSeats].sort((a, b) => a.id - b.id);

            if (backRow.some(s => s.id === target.id)) return backRow;
            if (mainLower.some(s => s.id === target.id)) return this.findRowNeighborsByRoundRobin(target, mainLower, 3);
            if (mainUpper.some(s => s.id === target.id)) return this.findRowNeighborsByRoundRobin(target, mainUpper, 3);

            return [target];
        }

        // Default Round Robin (3 cols)
        return this.findRowNeighborsByRoundRobin(target, sortedFloorSeats, 3);
    }

    private static findRowNeighborsByColumns(target: Seat, floorSeats: Seat[], colCounts: number[]): Seat[] {
        const columns: Seat[][] = [];
        let index = 0;

        for (const count of colCounts) {
            if (index + count <= floorSeats.length) {
                columns.push(floorSeats.slice(index, index + count));
                index += count;
            } else {
                columns.push(floorSeats.slice(index));
                index = floorSeats.length;
            }
        }

        let targetColIndex = -1;
        let targetRowIndex = -1;

        for (let c = 0; c < columns.length; c++) {
            const r = columns[c].findIndex(s => s.id === target.id);
            if (r !== -1) {
                targetColIndex = c;
                targetRowIndex = r;
                break;
            }
        }

        if (targetRowIndex === -1) return [target];

        const neighbors: Seat[] = [];
        for (let c = 0; c < columns.length; c++) {
            if (targetRowIndex < columns[c].length) {
                neighbors.push(columns[c][targetRowIndex]);
            }
        }
        return neighbors;
    }

    private static findRowNeighborsByRoundRobin(target: Seat, floorSeats: Seat[], colCount: number): Seat[] {
        const index = floorSeats.findIndex(s => s.id === target.id);
        if (index === -1) return [target];

        const rowIndex = Math.floor(index / colCount);

        return floorSeats.filter((_, i) => Math.floor(i / colCount) === rowIndex);
    }

    /**
     * Finds seats that become invalid (create orphans) in the current selection
     * due to the removal of other seats or existing state.
     * Ported from Flutter `SeatLogic.findInvalidSeats`.
     */
    static findInvalidSeats(
        allSeats: Seat[],
        currentSelected: Seat[],
        totalSeats = 0,
        seatType = '',
        othersSelecting: Record<number, { userId: string }> = {},
        currentUserId = ''
    ): Seat[] {
        const invalid: Seat[] = [];
        for (const seat of currentSelected) {
            // Check if THIS seat causes a violation in the CURRENT set
            if (this.wouldCreateOrphan(seat, allSeats, currentSelected, totalSeats, seatType, othersSelecting, currentUserId)) {
                invalid.push(seat);
            }
        }
        return invalid;
    }
}
