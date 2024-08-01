class DateUtil {
    static DATE_TIME_STRING() {
        const d = new Date();
        return `${d.toDateString()} ${d.toLocaleTimeString()}`;
    }
}

module.exports = { DateUtil }