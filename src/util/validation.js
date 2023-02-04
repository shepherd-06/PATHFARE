export const validation = (data) => {
    /**
     * general validation function
     * Checks if form-data is number and the value is above or equal to 1. 
     * :returns boolean
     */

    data = parseInt(data);

    if (isNaN(data)) {
        return false;
    }

    if (typeof data !== "number") {
        return false;
    }

    if (data < 0) {
        return false;
    }
    return true;
}