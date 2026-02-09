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
        isCoach45 = false,
        isCoach28 = false
    ): boolean {
        // Sort seats by ID first (as per Flutter logic used in specific layouts)
        const sortedById = [...allSeats].sort((a, b) => a.id - b.id);

        let group: Seat[] = [];

        if (isCoach45) {
            // Logic for 45 seats:
            // - First 40 seats (10 rows of 4): No orphan check required (as per Dart logic)
            // - Last 5 seats: Orphan check applied
            const index = sortedById.findIndex(s => s.id === candidate.id);

            if (index < 40) return false; // Allowed freely

            group = sortedById.slice(40, 45); // Last 5 seats
        } else if (isCoach28) {
            // Logic for 28 seats:
            // - First 24 seats: No orphan check
            // - Last 4 seats: Orphan check applied
            const index = sortedById.findIndex(s => s.id === candidate.id);

            if (index < 24) return false; // Allowed freely

            group = sortedById.slice(24, 28); // Last 4 seats
        } else {
            // General Logic (34/41/44/etc)
            group = this.getSeatGroup(candidate, allSeats);
        }

        // Single seat or empty group -> No violation possible
        if (group.length <= 1) return false;

        // Simulate selection
        const simulatedSelection = [...currentSelectedSeats];
        if (!simulatedSelection.some(s => s.id === candidate.id)) {
            simulatedSelection.push(candidate);
        }

        // Map states: 0 = Empty/Available, 1 = Occupied (Selected/Sold)
        const states = group.map(seat => {
            if (!seat.isAvailable) return 1; // Sold/Blocked
            if (simulatedSelection.some(s => s.id === seat.id)) return 1; // Selected
            return 0; // Available
        });

        /*
            Orphan Rules:
            - Inner Hole (gap size 1 between 1s): BLOCKED absolute.
            - Outer Hole (gap size 1 at edge): Max 1 allow.
        */
        /*
            Orphan Rules:
            - Inner Hole (gap size 1 between 1s): BLOCKED absolute.
            - Outer Hole (gap size 1 at edge): Max 1 allow.
        */
        let outerOrphans = 0;
        let currentGapSize = 0;
        let gapStarted = false;
        let hasSeenOccupied = false;

        for (let i = 0; i < states.length; i++) {
            if (states[i] === 0) {
                currentGapSize++;
                gapStarted = true;
            } else {
                // Determine if this is the first occupied seat we've seen
                if (!hasSeenOccupied) {
                    // This means all previous 0s were at the START (Outer Gap)
                    if (gapStarted) {
                        if (currentGapSize === 1) outerOrphans++;
                        // If gap > 1 at start, it's fine (2+ empty seats is not an orphan hole)
                        currentGapSize = 0;
                        gapStarted = false;
                    }
                    hasSeenOccupied = true;
                } else {
                    // We have seen occupied before, so this is an INNER GAP or just a gap
                    if (gapStarted) {
                        if (currentGapSize === 1) {
                            return true; // INNER ORPHAN (gap 1 sandwiched) -> BLOCK
                        }
                        currentGapSize = 0;
                        gapStarted = false;
                    }
                }
            }
        }

        // Check trailing gap (Outer Gap at End)
        if (gapStarted) {
            // If we never saw any occupied seat, scanning whole group of 0s -> Valid
            if (!hasSeenOccupied) return false;

            if (currentGapSize === 1) {
                outerOrphans++;
            }
        }

        // Max 1 outer orphan allowed
        if (outerOrphans > 1) return true;

        return false;
    }

    /**
     * Identifies the row/group of neighbors for a target seat.
     */
    private static getSeatGroup(target: Seat, allSeats: Seat[]): Seat[] {
        // 1. Group by floor
        const floorSeats = allSeats.filter(s => s.floor === target.floor);
        // Sort by Column logic A1, A2...
        const sortedFloorSeats = this.sortSeats(floorSeats);

        // Layout 34 (3 cols: 6-5-6 heuristic from Dart)
        // Layout 34 (3 cols: 6-5-6 heuristic from Dart)
        if (allSeats.length === 34) {
            return this.findRowNeighborsByColumns(target, sortedFloorSeats, [6, 5, 6]);
        }

        // Layout 45 (Coach) - Fallback if isCoach45 was false but length matches
        if (allSeats.length === 45) {
            const sortedAll = [...allSeats].sort((a, b) => a.id - b.id);
            const index = sortedAll.findIndex(s => s.id === target.id);

            // First 40 seats (10 rows of 4) -> Free
            if (index < 40) return [target];

            // Last 5 seats -> Orphan Check Group
            return sortedAll.slice(40, 45);
        }

        // Layout 28 (Limousine) - Fallback
        if (allSeats.length === 28) {
            const sortedAll = [...allSeats].sort((a, b) => a.id - b.id);
            const index = sortedAll.findIndex(s => s.id === target.id);

            // First 24 seats (6 rows of 4) -> Free
            if (index < 24) return [target];

            // Last 4 seats -> Orphan Check Group
            return sortedAll.slice(24, 28);
        }

        // Layout 41 (Special logic)
        if (allSeats.length === 41) {
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
        isCoach45 = false,
        isCoach28 = false
    ): Seat[] {
        const invalid: Seat[] = [];
        for (const seat of currentSelected) {
            // Check if THIS seat causes a violation in the CURRENT set
            if (this.wouldCreateOrphan(seat, allSeats, currentSelected, isCoach45, isCoach28)) {
                invalid.push(seat);
            }
        }
        return invalid;
    }
}
